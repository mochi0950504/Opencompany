import {EventEmitter} from 'node:events';
import {db, mapRows} from './db.js';
import type {EventRow} from './types.js';

/** In-memory fan-out for SSE subscribers + durable log in SQLite. */
class TaskEventBus extends EventEmitter {
  emitTask(taskId: number, type: string, payload: Record<string, unknown> = {}): void {
    const res = db
      .prepare(`INSERT INTO events (task_id, type, payload_json) VALUES (?, ?, ?)`)
      .run(taskId, type, JSON.stringify(payload));
    const row: EventRow = {
      id: Number(res.lastInsertRowid),
      taskId,
      ts: new Date().toISOString(),
      type,
      payloadJson: JSON.stringify(payload),
    };
    this.emit(`task:${taskId}`, row);
    this.emit('all', row);
  }

  history(taskId: number, afterId = 0, limit = 500): EventRow[] {
    return mapRows<EventRow>(
      db
        .prepare(`SELECT * FROM events WHERE task_id = ? AND id > ? ORDER BY id LIMIT ?`)
        .all(taskId, afterId, limit)
    );
  }
}

export const bus = new TaskEventBus();
bus.setMaxListeners(200);
