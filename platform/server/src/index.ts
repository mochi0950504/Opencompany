import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import {existsSync} from 'node:fs';
import {registerApi} from './api.js';
import {runner} from './engine/runner.js';
import {ensureDefaultPlaybook} from './growth/playbook.js';
import {mcpManager} from './mcp/manager.js';
import {ensureBuiltinTools} from './tools/runtime.js';

const PORT = Number(process.env.OC_PORT ?? 4400);
const HOST = process.env.OC_HOST ?? '0.0.0.0';

async function main(): Promise<void> {
  ensureDefaultPlaybook();
  ensureBuiltinTools();

  const app = Fastify({logger: {level: 'warn'}});
  await app.register(cors, {origin: true});
  registerApi(app);

  // serve the built dashboard when present (platform/web/dist)
  const webDist = new URL('../../web/dist', import.meta.url).pathname;
  if (existsSync(webDist)) {
    await app.register(fastifyStatic, {root: webDist, prefix: '/'});
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) return reply.code(404).send({error: 'not found'});
      return reply.sendFile('index.html');
    });
  }

  await app.listen({port: PORT, host: HOST});
  console.log(`[opencompany] server on http://${HOST}:${PORT}`);

  runner.recover(); // resume interrupted tasks after restart
  void mcpManager.init(); // connect enabled MCP servers in the background

  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.on(sig, () => {
      mcpManager.shutdown();
      process.exit(0);
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
