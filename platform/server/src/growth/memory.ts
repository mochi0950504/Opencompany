import {db, mapRows} from '../db.js';
import type {MemoryRow} from '../types.js';

export interface MemoryInput {
  kind: 'finding' | 'lesson' | 'fact';
  title: string;
  content: string;
  tags?: string[];
  sourceTaskId?: number | null;
}

export function saveMemory(m: MemoryInput): number {
  const res = db
    .prepare(
      `INSERT INTO memories (kind, title, content, tags, source_task_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(m.kind, m.title, m.content, (m.tags ?? []).join(','), m.sourceTaskId ?? null);
  return Number(res.lastInsertRowid);
}

/** FTS5 search; falls back to recency when the query is empty or unparsable. */
export function searchMemories(query: string, limit = 8): MemoryRow[] {
  const q = query.trim();
  if (q) {
    // quote each term to keep FTS5 syntax errors away from user input
    const ftsQuery = q
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 12)
      .map((t) => `"${t.replaceAll('"', '')}"`)
      .join(' OR ');
    try {
      const rows = db
        .prepare(
          `SELECT m.* FROM memories_fts f
           JOIN memories m ON m.id = f.rowid
           WHERE memories_fts MATCH ?
           ORDER BY rank LIMIT ?`
        )
        .all(ftsQuery, limit);
      if (rows.length) return mapRows<MemoryRow>(rows);
    } catch {
      // fall through to recency
    }
  }
  return mapRows<MemoryRow>(
    db.prepare(`SELECT * FROM memories ORDER BY id DESC LIMIT ?`).all(limit)
  );
}

export function listMemories(limit = 100): MemoryRow[] {
  return mapRows<MemoryRow>(
    db.prepare(`SELECT * FROM memories ORDER BY id DESC LIMIT ?`).all(limit)
  );
}

/** Compact context block injected into prompts so past work compounds. */
export function memoryContext(query: string, limit = 6): string {
  const hits = searchMemories(query, limit);
  if (!hits.length) return '';
  const lines = hits.map(
    (m) => `- [${m.kind}] ${m.title}: ${m.content.slice(0, 280)}${m.content.length > 280 ? '…' : ''}`
  );
  return `## 知識庫（過往任務累積，僅供參考，須自行覆核）\n${lines.join('\n')}`;
}
