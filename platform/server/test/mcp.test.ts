process.env.OC_DB_PATH = `/tmp/oc-mcp-${Date.now()}.db`;

import assert from 'node:assert';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const {mcpManager, qualifyName} = await import('../src/mcp/manager.js');
const {executeTool, toolSpecs} = await import('../src/tools/runtime.js');

const FIXTURE = fileURLToPath(new URL('./fixtures/echo_mcp.cjs', import.meta.url));

test('MCP connector: add server -> tools join the toolset -> call routes through', async (t) => {
  t.after(() => mcpManager.shutdown());

  const row = mcpManager.add({name: 'fixture', command: process.execPath, args: [FIXTURE]});
  // add() kicks off an async connect; poll until it lands
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (mcpManager.list().find((s) => s.id === row.id)?.status === 'connected') break;
    await new Promise((r) => setTimeout(r, 100));
  }
  const server = mcpManager.list().find((s) => s.id === row.id);
  assert.equal(server?.status, 'connected');
  assert.equal(server?.tools.length, 2);

  const qualifiedAdd = qualifyName('fixture', 'add');
  assert.ok(
    toolSpecs().some((s) => s.name === qualifiedAdd),
    'MCP tools must appear in the agent toolset'
  );

  assert.equal(await executeTool(qualifiedAdd, {a: 2, b: 3}, {taskId: 0}), '5');
  assert.equal(
    await executeTool(qualifyName('fixture', 'echo'), {text: '生態'}, {taskId: 0}),
    'echo:生態'
  );

  // disable removes the tools from the toolset
  await mcpManager.setEnabled(row.id, false);
  assert.ok(!toolSpecs().some((s) => s.name === qualifiedAdd));

  // re-enable reconnects and restores routing
  await mcpManager.setEnabled(row.id, true);
  assert.equal(await executeTool(qualifiedAdd, {a: 40, b: 2}, {taskId: 0}), '42');

  mcpManager.remove(row.id);
  assert.equal(mcpManager.list().length, 0);
});

test('MCP connector: broken command lands in error status, not a crash', async () => {
  const row = mcpManager.add({name: 'broken', command: '/nonexistent/binary'});
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    const s = mcpManager.list().find((x) => x.id === row.id);
    if (s?.status === 'error') break;
    await new Promise((r) => setTimeout(r, 100));
  }
  const server = mcpManager.list().find((x) => x.id === row.id);
  assert.equal(server?.status, 'error');
  assert.ok(server?.lastError);
  mcpManager.remove(row.id);
});
