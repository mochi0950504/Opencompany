import type {FastifyInstance} from 'fastify';
import {db, mapRows} from './db.js';
import {bus} from './events.js';
import {runner} from './engine/runner.js';
import {listMemories, searchMemories} from './growth/memory.js';
import {activatePlaybook, activePlaybook, listPlaybooks} from './growth/playbook.js';
import {registry} from './providers/registry.js';
import {listTools, setToolStatus} from './tools/runtime.js';
import type {ArtifactRow, EventRow, StepRow, TaskBudget, TaskConfig} from './types.js';

const DEFAULT_BUDGET: TaskBudget = {maxSteps: 40, maxMinutes: 60 * 24, maxTokens: 2_000_000};

export function registerApi(app: FastifyInstance): void {
  app.get('/api/health', async () => ({ok: true, version: '0.1.0'}));

  app.get('/api/providers', async () => ({
    providers: registry.providerStatus(),
    models: await registry.listAllModels(),
  }));

  // ---------- tasks ----------

  app.post('/api/tasks', async (req, reply) => {
    const body = req.body as {
      title?: string;
      goal?: string;
      crew?: TaskConfig['crew'];
      budget?: Partial<TaskBudget>;
      breadth?: number;
      instructions?: string;
    };
    if (!body?.goal?.trim()) return reply.code(400).send({error: 'goal is required'});
    if (!body?.crew?.length) return reply.code(400).send({error: 'crew is required'});
    try {
      const task = runner.createTask({
        title: body.title?.trim() || body.goal.trim().slice(0, 60),
        goal: body.goal.trim(),
        config: {
          crew: body.crew,
          budget: {...DEFAULT_BUDGET, ...(body.budget ?? {})},
          breadth: Math.min(6, Math.max(1, body.breadth ?? 3)),
          instructions: body.instructions,
          playbookId: activePlaybook().id,
        },
      });
      return task;
    } catch (e) {
      return reply.code(400).send({error: String(e instanceof Error ? e.message : e)});
    }
  });

  app.get('/api/tasks', async () => runner.list());

  app.get('/api/tasks/:id', async (req, reply) => {
    const id = Number((req.params as {id: string}).id);
    try {
      const task = runner.get(id);
      const steps = mapRows<StepRow>(
        db.prepare(`SELECT * FROM steps WHERE task_id = ? ORDER BY idx`).all(id)
      );
      const artifacts = mapRows<ArtifactRow>(
        db.prepare(`SELECT id, task_id, name, mime, created_at, content FROM artifacts WHERE task_id = ? ORDER BY id`).all(id)
      );
      return {task, steps, artifacts};
    } catch {
      return reply.code(404).send({error: 'not found'});
    }
  });

  app.post('/api/tasks/:id/pause', async (req) => {
    runner.pause(Number((req.params as {id: string}).id));
    return {ok: true};
  });
  app.post('/api/tasks/:id/resume', async (req) => {
    runner.resume(Number((req.params as {id: string}).id));
    return {ok: true};
  });
  app.post('/api/tasks/:id/cancel', async (req) => {
    runner.cancel(Number((req.params as {id: string}).id));
    return {ok: true};
  });

  // ---------- live events (SSE with replay) ----------

  app.get('/api/tasks/:id/events', (req, reply) => {
    const id = Number((req.params as {id: string}).id);
    const after = Number((req.query as {after?: string}).after ?? 0);
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
    });
    const send = (e: EventRow) => {
      reply.raw.write(`id: ${e.id}\nevent: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
    };
    for (const e of bus.history(id, after)) send(e);
    const listener = (e: EventRow) => send(e);
    bus.on(`task:${id}`, listener);
    const heartbeat = setInterval(() => reply.raw.write(': hb\n\n'), 25_000);
    req.raw.on('close', () => {
      clearInterval(heartbeat);
      bus.off(`task:${id}`, listener);
    });
  });

  // ---------- growth surfaces ----------

  app.get('/api/memories', async (req) => {
    const q = (req.query as {q?: string}).q;
    return q ? searchMemories(q, 50) : listMemories(100);
  });

  app.get('/api/playbooks', async () => listPlaybooks());
  app.post('/api/playbooks/:id/activate', async (req) => {
    activatePlaybook(Number((req.params as {id: string}).id));
    return {ok: true};
  });

  app.get('/api/tools', async () => listTools());
  app.post('/api/tools/:id/status', async (req, reply) => {
    const status = (req.body as {status?: string})?.status;
    if (!['approved', 'disabled', 'rejected'].includes(status ?? '')) {
      return reply.code(400).send({error: 'status must be approved|disabled|rejected'});
    }
    setToolStatus(Number((req.params as {id: string}).id), status as 'approved' | 'disabled' | 'rejected');
    return {ok: true};
  });
}
