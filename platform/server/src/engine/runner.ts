import {db, mapRow, mapRows} from '../db.js';
import {bus} from '../events.js';
import type {TaskConfig, TaskRow} from '../types.js';
import {runTask} from './orchestrator.js';

const MAX_CONCURRENT = Number(process.env.OC_MAX_CONCURRENT ?? 3);

/** Keeps at most N task loops alive; everything else stays queued in SQLite. */
class Runner {
  private readonly active = new Map<number, Promise<void>>();

  createTask(input: {title: string; goal: string; config: TaskConfig}): TaskRow {
    if (!input.config.crew?.length) throw new Error('crew 至少要有 1 個模型');
    if (input.config.crew.length > 4) throw new Error('crew 上限為 4 個模型');
    const names = new Set(input.config.crew.map((m) => m.model));
    if (names.size !== input.config.crew.length) {
      throw new Error('crew 中的模型必須互不相同');
    }
    const res = db
      .prepare(`INSERT INTO tasks (title, goal, status, config_json) VALUES (?, ?, 'queued', ?)`)
      .run(input.title, input.goal, JSON.stringify(input.config));
    const task = this.get(Number(res.lastInsertRowid));
    bus.emitTask(task.id, 'task.created', {title: task.title});
    this.pump();
    return task;
  }

  get(id: number): TaskRow {
    const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id);
    if (!row) throw new Error(`task ${id} not found`);
    return mapRow<TaskRow>(row);
  }

  list(): TaskRow[] {
    return mapRows<TaskRow>(db.prepare(`SELECT * FROM tasks ORDER BY id DESC LIMIT 200`).all());
  }

  pause(id: number): void {
    db.prepare(`UPDATE tasks SET status = 'paused', updated_at = datetime('now') WHERE id = ? AND status IN ('running','queued')`).run(id);
    bus.emitTask(id, 'task.status', {status: 'paused'});
  }

  resume(id: number): void {
    db.prepare(`UPDATE tasks SET status = 'queued', updated_at = datetime('now') WHERE id = ? AND status = 'paused'`).run(id);
    bus.emitTask(id, 'task.status', {status: 'queued'});
    this.pump();
  }

  cancel(id: number): void {
    db.prepare(`UPDATE tasks SET status = 'cancelled', updated_at = datetime('now'), finished_at = datetime('now') WHERE id = ? AND status IN ('running','queued','paused')`).run(id);
    bus.emitTask(id, 'task.status', {status: 'cancelled'});
  }

  /** start queued tasks up to the concurrency limit */
  pump(): void {
    if (this.active.size >= MAX_CONCURRENT) return;
    const queued = mapRows<TaskRow>(
      db.prepare(`SELECT * FROM tasks WHERE status = 'queued' ORDER BY id LIMIT ?`).all(MAX_CONCURRENT - this.active.size)
    );
    for (const task of queued) {
      if (this.active.has(task.id)) continue;
      db.prepare(`UPDATE tasks SET status = 'running', updated_at = datetime('now'), started_at = COALESCE(started_at, datetime('now')) WHERE id = ?`).run(task.id);
      bus.emitTask(task.id, 'task.status', {status: 'running'});
      const p = runTask(task.id)
        .catch((e) => {
          db.prepare(`UPDATE tasks SET status = 'failed', error = ?, finished_at = datetime('now') WHERE id = ?`).run(String(e).slice(0, 1000), task.id);
          bus.emitTask(task.id, 'task.status', {status: 'failed', error: String(e).slice(0, 400)});
        })
        .finally(() => {
          this.active.delete(task.id);
          this.pump();
        });
      this.active.set(task.id, p);
    }
  }

  /** Crash/restart recovery: tasks left 'running' go back to the queue. */
  recover(): void {
    const stuck = db
      .prepare(`UPDATE tasks SET status = 'queued' WHERE status = 'running'`)
      .run();
    if (stuck.changes > 0) {
      console.log(`[runner] re-queued ${stuck.changes} interrupted task(s)`);
    }
    this.pump();
  }
}

export const runner = new Runner();
