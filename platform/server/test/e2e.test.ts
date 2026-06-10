process.env.OC_DB_PATH = `/tmp/oc-test-${Date.now()}.db`;
process.env.OC_AUTO_EVOLVE = '0';

import assert from 'node:assert';
import test from 'node:test';

const {db} = await import('../src/db.js');
const {runner} = await import('../src/engine/runner.js');
const {listMemories} = await import('../src/growth/memory.js');
const {listPlaybooks, ensureDefaultPlaybook} = await import('../src/growth/playbook.js');
const {ensureBuiltinTools, listTools} = await import('../src/tools/runtime.js');

test('full pipeline with a 4-model mock crew', async () => {
  ensureDefaultPlaybook();
  ensureBuiltinTools();

  const task = runner.createTask({
    title: '煙霧測試',
    goal: '評估「多模型協調調研平台」這個產品方向的可行性',
    config: {
      crew: [
        {name: 'Planner-A', model: 'mock/alpha', roles: ['planner']},
        {name: 'Scout-B', model: 'mock/beta', roles: ['researcher']},
        {name: 'Critic-C', model: 'mock/gamma', roles: ['critic', 'retro']},
        {name: 'Writer-D', model: 'mock/delta', roles: ['synthesizer']},
      ],
      budget: {maxSteps: 30, maxMinutes: 5, maxTokens: 500_000},
      breadth: 3,
    },
  });

  // wait until the task reaches a terminal state
  const deadline = Date.now() + 60_000;
  let status = '';
  while (Date.now() < deadline) {
    status = runner.get(task.id).status;
    if (['completed', 'failed', 'cancelled'].includes(status)) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  assert.equal(status, 'completed', `task should complete, got ${status}`);

  const steps = db.prepare(`SELECT stage, status FROM steps WHERE task_id = ?`).all(task.id) as {
    stage: string;
    status: string;
  }[];
  const stages = new Set(steps.map((s) => s.stage));
  for (const stage of ['plan', 'research', 'critique', 'synthesize', 'retro']) {
    assert.ok(stages.has(stage), `missing stage ${stage}`);
  }
  assert.ok(steps.every((s) => ['done', 'skipped'].includes(s.status)));

  const artifacts = db
    .prepare(`SELECT name, content FROM artifacts WHERE task_id = ?`)
    .all(task.id) as {name: string; content: string}[];
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].name, 'final-report.md');
  assert.ok(artifacts[0].content.length > 100, 'report should have substance');

  // growth: retro should have produced at least one lesson + a playbook proposal
  const lessons = listMemories().filter((m) => m.kind === 'lesson');
  assert.ok(lessons.length >= 1, 'retro should save lessons to memory');
  const playbooks = listPlaybooks();
  assert.ok(playbooks.length >= 2, 'retro should propose a playbook revision');
  assert.ok(playbooks.some((p) => p.active === 1), 'one playbook stays active');

  // builtin tools registered + agent tool proposal pending approval
  const tools = listTools();
  assert.ok(tools.some((t) => t.name === 'memory_search'));
  assert.ok(tools.some((t) => t.name === 'web_fetch'));
  assert.ok(
    tools.some((t) => t.origin === 'agent' && t.status === 'pending'),
    'retro tool proposal should land as pending'
  );
});

test('crew validation: distinct models, max 4', () => {
  assert.throws(() =>
    runner.createTask({
      title: 'x',
      goal: 'x',
      config: {
        crew: [
          {name: 'a', model: 'mock/alpha', roles: ['planner']},
          {name: 'b', model: 'mock/alpha', roles: ['critic']},
        ],
        budget: {maxSteps: 5, maxMinutes: 1, maxTokens: 1000},
        breadth: 1,
      },
    })
  );
  assert.throws(() =>
    runner.createTask({
      title: 'x',
      goal: 'x',
      config: {
        crew: [
          {name: 'a', model: 'mock/alpha', roles: ['planner']},
          {name: 'b', model: 'mock/beta', roles: ['critic']},
          {name: 'c', model: 'mock/gamma', roles: ['critic']},
          {name: 'd', model: 'mock/delta', roles: ['critic']},
          {name: 'e', model: 'openai/gpt-5.2', roles: ['critic']},
        ],
        budget: {maxSteps: 5, maxMinutes: 1, maxTokens: 1000},
        breadth: 1,
      },
    })
  );
});
