process.env.OC_DB_PATH = `/tmp/oc-growth-${Date.now()}.db`;
process.env.OC_MOCK_DELAY_MS = '700';

import assert from 'node:assert';
import test from 'node:test';

const {db} = await import('../src/db.js');
const {runner} = await import('../src/engine/runner.js');
const {ensureBuiltinTools, executeTool, listTools, proposeTool, setToolStatus, toolSpecs} =
  await import('../src/tools/runtime.js');

const CREW = [
  {name: 'P', model: 'mock/alpha', roles: ['planner' as const]},
  {name: 'R', model: 'mock/beta', roles: ['researcher' as const]},
  {name: 'C', model: 'mock/gamma', roles: ['critic' as const, 'retro' as const]},
  {name: 'S', model: 'mock/delta', roles: ['synthesizer' as const]},
];

test('pause halts the loop, resume finishes the task', async () => {
  const task = runner.createTask({
    title: 'pause-test',
    goal: '暫停與恢復',
    config: {crew: CREW, budget: {maxSteps: 30, maxMinutes: 5, maxTokens: 500_000}, breadth: 2},
  });

  await new Promise((r) => setTimeout(r, 1200));
  runner.pause(task.id);
  // wait for the loop to observe the pause between steps
  await new Promise((r) => setTimeout(r, 1600));
  const paused = runner.get(task.id);
  assert.equal(paused.status, 'paused');
  const stepsAtPause = db
    .prepare(`SELECT COUNT(*) AS c FROM steps WHERE task_id = ? AND status = 'done'`)
    .get(task.id) as {c: number};

  // no progress while paused
  await new Promise((r) => setTimeout(r, 1500));
  const stepsStillPaused = db
    .prepare(`SELECT COUNT(*) AS c FROM steps WHERE task_id = ? AND status = 'done'`)
    .get(task.id) as {c: number};
  assert.equal(stepsStillPaused.c, stepsAtPause.c, 'paused task must not advance');

  runner.resume(task.id);
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (runner.get(task.id).status === 'completed') break;
    await new Promise((r) => setTimeout(r, 400));
  }
  assert.equal(runner.get(task.id).status, 'completed');
});

test('agent-proposed tool: pending -> approved -> sandboxed execution', async () => {
  ensureBuiltinTools();
  proposeTool({
    name: 'char_count',
    description: '數字元',
    parameters: {type: 'object', properties: {text: {type: 'string'}}, required: ['text']},
    code: "const t = String(args.text ?? ''); return `chars=${t.length}`;",
    sourceTaskId: 0,
  });

  // pending tools are not loaded into the agent toolset
  assert.ok(!toolSpecs().some((t) => t.name === 'char_count'));

  const row = db.prepare(`SELECT id FROM tools WHERE name = 'char_count'`).get() as {id: number};
  setToolStatus(row.id, 'approved');
  assert.ok(toolSpecs().some((t) => t.name === 'char_count'), 'approved tool joins the toolset');

  const out = await executeTool('char_count', {text: 'hello 世界'}, {taskId: 0});
  assert.equal(out, 'chars=8');

  // sandbox: no fs / process escape
  proposeTool({
    name: 'evil_tool',
    description: 'escape attempt',
    parameters: {type: 'object', properties: {}},
    code: "return typeof process === 'undefined' && typeof require === 'undefined' ? 'SANDBOXED' : 'ESCAPED';",
    sourceTaskId: 0,
  });
  const evil = db.prepare(`SELECT id FROM tools WHERE name = 'evil_tool'`).get() as {id: number};
  setToolStatus(evil.id, 'approved');
  assert.equal(await executeTool('evil_tool', {}, {taskId: 0}), 'SANDBOXED');

  // builtin memory tools round-trip
  await executeTool('memory_save', {title: '測試發現', content: '平台沙箱運作正常'}, {taskId: 0});
  const hits = await executeTool('memory_search', {query: '沙箱'}, {taskId: 0});
  assert.ok(hits.includes('測試發現'));

  // builtins cannot be disabled through the status API
  const builtin = db.prepare(`SELECT id FROM tools WHERE name = 'memory_search'`).get() as {id: number};
  setToolStatus(builtin.id, 'disabled');
  assert.ok(listTools().find((t) => t.id === builtin.id)?.status === 'builtin');
});
