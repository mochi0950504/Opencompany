#!/usr/bin/env node
// Minimal MCP server over stdio (JSON-RPC 2.0, newline-delimited) used by tests.
const TOOLS = [
  {
    name: 'add',
    description: 'Add two numbers',
    inputSchema: {
      type: 'object',
      properties: {a: {type: 'number'}, b: {type: 'number'}},
      required: ['a', 'b'],
    },
  },
  {
    name: 'echo',
    description: 'Echo a string back',
    inputSchema: {type: 'object', properties: {text: {type: 'string'}}, required: ['text']},
  },
];

let buf = '';
process.stdin.on('data', (chunk) => {
  buf += chunk.toString('utf8');
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id === undefined) continue; // notification
    const reply = (result) =>
      process.stdout.write(JSON.stringify({jsonrpc: '2.0', id: msg.id, result}) + '\n');
    if (msg.method === 'initialize') {
      reply({
        protocolVersion: '2025-06-18',
        capabilities: {tools: {}},
        serverInfo: {name: 'echo-fixture', version: '1.0.0'},
      });
    } else if (msg.method === 'tools/list') {
      reply({tools: TOOLS});
    } else if (msg.method === 'tools/call') {
      const {name, arguments: args = {}} = msg.params ?? {};
      if (name === 'add') {
        reply({content: [{type: 'text', text: String(Number(args.a) + Number(args.b))}]});
      } else if (name === 'echo') {
        reply({content: [{type: 'text', text: `echo:${args.text}`}]});
      } else {
        reply({content: [{type: 'text', text: `unknown tool ${name}`}], isError: true});
      }
    } else {
      process.stdout.write(
        JSON.stringify({jsonrpc: '2.0', id: msg.id, error: {code: -32601, message: 'not found'}}) + '\n'
      );
    }
  }
});
