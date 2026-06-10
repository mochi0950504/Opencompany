import {db, mapRow, mapRows} from '../db.js';
import {bus} from '../events.js';
import {memoryContext, saveMemory} from '../growth/memory.js';
import {activePlaybook, proposePlaybook} from '../growth/playbook.js';
import {registry} from '../providers/registry.js';
import {executeTool, proposeTool, toolSpecs} from '../tools/runtime.js';
import type {
  ChatMessage,
  CrewMember,
  RoleName,
  StepRow,
  TaskConfig,
  TaskRow,
} from '../types.js';
import {
  basePreamble,
  criticPrompt,
  plannerPrompt,
  researcherPrompt,
  retroPrompt,
  synthesizerPrompt,
} from './prompts.js';

// ---------- helpers ----------

function getTask(taskId: number): TaskRow {
  return mapRow<TaskRow>(db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId));
}

function getSteps(taskId: number): StepRow[] {
  return mapRows<StepRow>(
    db.prepare(`SELECT * FROM steps WHERE task_id = ? ORDER BY idx`).all(taskId)
  );
}

function setTaskStatus(taskId: number, status: string, error?: string): void {
  const finished = ['completed', 'failed', 'cancelled'].includes(status);
  db.prepare(
    `UPDATE tasks SET status = ?, error = COALESCE(?, error),
       updated_at = datetime('now'),
       started_at = CASE WHEN started_at IS NULL AND ? = 'running' THEN datetime('now') ELSE started_at END,
       finished_at = CASE WHEN ? THEN datetime('now') ELSE finished_at END
     WHERE id = ?`
  ).run(status, error ?? null, status, finished ? 1 : 0, taskId);
  bus.emitTask(taskId, 'task.status', {status, error: error ?? null});
}

function memberForRole(crew: CrewMember[], role: RoleName, salt = 0): CrewMember {
  const candidates = crew.filter((m) => m.roles.includes(role));
  if (candidates.length) return candidates[salt % candidates.length];
  // sensible fallbacks keep small crews working
  const fallback: Record<RoleName, RoleName[]> = {
    planner: ['synthesizer', 'critic', 'researcher', 'retro'],
    researcher: ['planner', 'synthesizer', 'critic', 'retro'],
    critic: ['planner', 'synthesizer', 'researcher', 'retro'],
    synthesizer: ['planner', 'critic', 'researcher', 'retro'],
    retro: ['critic', 'planner', 'synthesizer', 'researcher'],
  };
  for (const alt of fallback[role]) {
    const found = crew.filter((m) => m.roles.includes(alt));
    if (found.length) return found[salt % found.length];
  }
  return crew[salt % crew.length];
}

function addStep(
  taskId: number,
  idx: number,
  stage: string,
  role: RoleName,
  member: CrewMember,
  title: string,
  input: unknown
): number {
  const res = db
    .prepare(
      `INSERT INTO steps (task_id, idx, stage, role, member, model, title, status, input_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    )
    .run(taskId, idx, stage, role, member.name, member.model, title, JSON.stringify(input ?? null));
  bus.emitTask(taskId, 'step.created', {stepId: Number(res.lastInsertRowid), stage, title, member: member.name, model: member.model});
  return Number(res.lastInsertRowid);
}

function tryParseJson(text: string): Record<string, unknown> | null {
  const candidates = [text];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) candidates.unshift(fenced[1]);
  const braces = text.match(/\{[\s\S]*\}/);
  if (braces) candidates.push(braces[0]);
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c.trim());
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function totalTokens(taskId: number): number {
  const row = db
    .prepare(`SELECT COALESCE(SUM(input_tokens + output_tokens), 0) AS t FROM steps WHERE task_id = ?`)
    .get(taskId) as {t: number};
  return row.t;
}

// ---------- agentic call with tool loop ----------

async function callWithTools(opts: {
  taskId: number;
  model: string;
  system: string;
  user: string;
  json?: boolean;
  allowTools: boolean;
}): Promise<{content: string; inputTokens: number; outputTokens: number}> {
  const messages: ChatMessage[] = [
    {role: 'system', content: opts.system},
    {role: 'user', content: opts.user},
  ];
  let inputTokens = 0;
  let outputTokens = 0;
  const tools = opts.allowTools ? toolSpecs() : undefined;

  for (let turn = 0; turn < 6; turn++) {
    const res = await registry.chat(opts.model, {
      messages,
      tools,
      json: opts.json,
      maxTokens: 4096,
    });
    inputTokens += res.usage.inputTokens;
    outputTokens += res.usage.outputTokens;

    if (!res.toolCalls.length) {
      return {content: res.content, inputTokens, outputTokens};
    }
    messages.push({role: 'assistant', content: res.content, toolCalls: res.toolCalls});
    for (const tc of res.toolCalls) {
      bus.emitTask(opts.taskId, 'tool.call', {name: tc.name, arguments: tc.arguments});
      const result = await executeTool(tc.name, tc.arguments, {taskId: opts.taskId});
      messages.push({role: 'tool', content: result, toolCallId: tc.id, name: tc.name});
    }
  }
  // tool budget exhausted — ask for the final answer without tools
  messages.push({role: 'user', content: '請直接給出最終答覆，不要再呼叫工具。'});
  const final = await registry.chat(opts.model, {messages, json: opts.json, maxTokens: 4096});
  return {
    content: final.content,
    inputTokens: inputTokens + final.usage.inputTokens,
    outputTokens: outputTokens + final.usage.outputTokens,
  };
}

// ---------- stage execution ----------

interface Subtopic {
  title: string;
  question: string;
}

async function executeStep(task: TaskRow, step: StepRow, config: TaskConfig): Promise<void> {
  db.prepare(
    `UPDATE steps SET status = 'running', started_at = datetime('now'), error = NULL WHERE id = ?`
  ).run(step.id);
  bus.emitTask(task.id, 'step.started', {stepId: step.id, stage: step.stage, title: step.title, member: step.member, model: step.model});

  const playbook = activePlaybook();
  const system = basePreamble({
    memberName: step.member,
    role: step.role,
    playbook: playbook.content,
    memoryBlock: memoryContext(task.goal),
    config,
  });
  const input = step.inputJson ? JSON.parse(step.inputJson) : null;

  let user: string;
  let json = false;
  let allowTools = false;
  switch (step.stage) {
    case 'plan':
      user = plannerPrompt(task.goal, config.breadth);
      json = true;
      break;
    case 'research':
      user = researcherPrompt(task.goal, input as Subtopic);
      allowTools = true;
      break;
    case 'critique':
      user = criticPrompt(task.goal, input as {title: string; content: string}[]);
      json = true;
      break;
    case 'synthesize': {
      const {research, critique} = input as {
        research: {title: string; content: string}[];
        critique: string;
      };
      user = synthesizerPrompt(task.goal, research, critique);
      break;
    }
    case 'retro':
      user = retroPrompt(task.goal, (input as {report: string}).report);
      json = true;
      break;
    default:
      throw new Error(`unknown stage: ${step.stage}`);
  }

  const result = await callWithTools({
    taskId: task.id,
    model: step.model,
    system,
    user,
    json,
    allowTools,
  });

  db.prepare(
    `UPDATE steps SET status = 'done', output_json = ?, input_tokens = ?, output_tokens = ?,
       finished_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify({content: result.content}), result.inputTokens, result.outputTokens, step.id);
  bus.emitTask(task.id, 'step.done', {
    stepId: step.id,
    stage: step.stage,
    title: step.title,
    tokens: result.inputTokens + result.outputTokens,
    preview: result.content.slice(0, 400),
  });
}

// ---------- stage planning (state machine over persisted steps) ----------

function stepOutput(step: StepRow): string {
  if (!step.outputJson) return '';
  try {
    return String((JSON.parse(step.outputJson) as {content: string}).content ?? '');
  } catch {
    return step.outputJson;
  }
}

/**
 * Creates the next stage's steps once the previous stage is complete.
 * Returns false when there is nothing left to create (task is finished).
 */
function planNextStage(task: TaskRow, config: TaskConfig, budgetExceeded: boolean): boolean {
  const steps = getSteps(task.id);
  const byStage = (s: string) => steps.filter((x) => x.stage === s);
  const done = (s: string) => byStage(s).length > 0 && byStage(s).every((x) => x.status === 'done' || x.status === 'skipped');
  const nextIdx = steps.length ? Math.max(...steps.map((s) => s.idx)) + 1 : 0;

  if (!byStage('plan').length) {
    addStep(task.id, 0, 'plan', 'planner', memberForRole(config.crew, 'planner'), '拆解目標、規劃子題', null);
    return true;
  }
  if (!done('plan')) return true; // plan step pending/failed — will be retried by caller

  if (!byStage('research').length) {
    const planOut = tryParseJson(stepOutput(byStage('plan')[0]));
    const subtopics = ((planOut?.subtopics as Subtopic[] | undefined) ?? [])
      .filter((s) => s && s.title)
      .slice(0, Math.max(1, config.breadth));
    const list = subtopics.length
      ? subtopics
      : [{title: '主題調研', question: task.goal}];
    list.forEach((sub, i) => {
      addStep(
        task.id,
        nextIdx + i,
        'research',
        'researcher',
        memberForRole(config.crew, 'researcher', i),
        `調研：${sub.title}`,
        sub
      );
    });
    return true;
  }

  // budget pressure: skip remaining pending research, go synthesize with what we have
  if (budgetExceeded) {
    db.prepare(
      `UPDATE steps SET status = 'skipped' WHERE task_id = ? AND status = 'pending' AND stage IN ('research','critique')`
    ).run(task.id);
  }

  if (!done('research') && !budgetExceeded) return true;

  const researchDone = byStage('research').filter((s) => s.status === 'done');
  const researchPayload = researchDone.map((s) => ({
    title: s.title.replace(/^調研：/, ''),
    content: stepOutput(s),
  }));

  if (!byStage('critique').length && researchPayload.length && !budgetExceeded) {
    addStep(
      task.id,
      nextIdx,
      'critique',
      'critic',
      memberForRole(config.crew, 'critic'),
      '交叉批判調研產出',
      researchPayload
    );
    return true;
  }
  if (byStage('critique').length && !done('critique') && !budgetExceeded) return true;

  if (!byStage('synthesize').length) {
    const critiqueStep = byStage('critique').find((s) => s.status === 'done');
    addStep(
      task.id,
      nextIdx,
      'synthesize',
      'synthesizer',
      memberForRole(config.crew, 'synthesizer'),
      '綜合最終報告',
      {research: researchPayload, critique: critiqueStep ? stepOutput(critiqueStep) : '（批判階段因預算限制略過）'}
    );
    return true;
  }
  if (!done('synthesize')) return true;

  if (!byStage('retro').length) {
    const report = stepOutput(byStage('synthesize')[0]);
    db.prepare(`INSERT INTO artifacts (task_id, name, mime, content) VALUES (?, ?, ?, ?)`).run(
      task.id,
      'final-report.md',
      'text/markdown',
      report
    );
    bus.emitTask(task.id, 'artifact.created', {name: 'final-report.md'});
    addStep(task.id, nextIdx, 'retro', 'retro', memberForRole(config.crew, 'retro'), '任務檢討與自我成長', {report});
    return true;
  }
  if (!done('retro')) return true;

  return false; // everything finished
}

/** Growth side-effects after the retro step completes. */
function applyRetro(task: TaskRow): void {
  const retro = getSteps(task.id).find((s) => s.stage === 'retro' && s.status === 'done');
  if (!retro) return;
  const parsed = tryParseJson(stepOutput(retro));
  if (!parsed) return;

  const lessons = (parsed.lessons as {title?: string; content?: string}[] | undefined) ?? [];
  for (const l of lessons) {
    if (!l?.title || !l?.content) continue;
    saveMemory({kind: 'lesson', title: l.title, content: l.content, sourceTaskId: task.id});
    bus.emitTask(task.id, 'growth.lesson', {title: l.title});
  }

  const suggestion = parsed.playbook_suggestion;
  if (typeof suggestion === 'string' && suggestion.trim() && suggestion.trim() !== 'null') {
    const current = activePlaybook();
    const amended = `${current.content}\n\n## 修訂（任務 #${task.id} 提案）\n- ${suggestion.trim()}`;
    const pb = proposePlaybook(amended, `任務 #${task.id} retro 提案：${suggestion.trim().slice(0, 200)}`);
    bus.emitTask(task.id, 'growth.playbook', {version: pb.version, active: Boolean(pb.active)});
  }

  const tool = parsed.tool_proposal as
    | {name?: string; description?: string; parameters?: Record<string, unknown>; code?: string}
    | null
    | undefined;
  if (tool && tool.name && tool.code) {
    proposeTool({
      name: tool.name,
      description: tool.description ?? '',
      parameters: tool.parameters ?? {type: 'object', properties: {}},
      code: tool.code,
      sourceTaskId: task.id,
    });
    bus.emitTask(task.id, 'growth.tool_proposed', {name: tool.name});
  }
}

// ---------- main task loop (re-entrant, checkpointed) ----------

export async function runTask(taskId: number): Promise<void> {
  // steps stuck in 'running' from a crash are retried
  db.prepare(`UPDATE steps SET status = 'pending' WHERE task_id = ? AND status = 'running'`).run(taskId);

  for (;;) {
    const task = getTask(taskId);
    if (!task) return;
    if (task.status === 'paused' || task.status === 'cancelled') {
      bus.emitTask(taskId, 'task.halted', {status: task.status});
      return;
    }
    const config = JSON.parse(task.configJson) as TaskConfig;

    const steps = getSteps(taskId);
    const elapsedMin = task.startedAt
      ? (Date.now() - new Date(task.startedAt + 'Z').getTime()) / 60_000
      : 0;
    const budgetExceeded =
      steps.filter((s) => s.status === 'done').length >= config.budget.maxSteps ||
      elapsedMin > config.budget.maxMinutes ||
      totalTokens(taskId) > config.budget.maxTokens;
    if (budgetExceeded) bus.emitTask(taskId, 'budget.pressure', {elapsedMin: Math.round(elapsedMin)});

    const failed = steps.filter((s) => s.status === 'failed');
    if (failed.length >= 3) {
      setTaskStatus(taskId, 'failed', `連續失敗步驟過多（${failed.length}）`);
      return;
    }

    const next = steps.find((s) => s.status === 'pending') ?? null;
    if (next) {
      try {
        await executeStep(task, next, config);
      } catch (e) {
        db.prepare(
          `UPDATE steps SET status = 'failed', error = ?, finished_at = datetime('now') WHERE id = ?`
        ).run(String(e).slice(0, 1000), next.id);
        bus.emitTask(taskId, 'step.failed', {stepId: next.id, error: String(e).slice(0, 400)});
        // a fresh pending copy lets the loop retry once with the same member
        const retries = steps.filter((s) => s.title === next.title && s.status === 'failed').length;
        if (retries < 2) {
          const member = config.crew.find((m) => m.name === next.member) ?? config.crew[0];
          addStep(taskId, Math.max(...steps.map((s) => s.idx)) + 1, next.stage, next.role, member, next.title, next.inputJson ? JSON.parse(next.inputJson) : null);
        }
      }
      continue;
    }

    const hasMore = planNextStage(task, config, budgetExceeded);
    if (!hasMore) {
      applyRetro(task);
      setTaskStatus(taskId, 'completed');
      bus.emitTask(taskId, 'task.completed', {});
      return;
    }
    // planNextStage 沒有產生新的 pending 步驟時避免空轉
    const after = getSteps(taskId);
    if (!after.some((s) => s.status === 'pending')) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
