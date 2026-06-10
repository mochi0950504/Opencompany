import Database from 'better-sqlite3';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

const DB_PATH = process.env.OC_DB_PATH ?? new URL('../../data/opencompany.db', import.meta.url).pathname;

mkdirSync(dirname(DB_PATH), {recursive: true});

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  error TEXT
);

CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  stage TEXT NOT NULL,
  role TEXT NOT NULL,
  member TEXT NOT NULL,
  model TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_json TEXT,
  output_json TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  finished_at TEXT,
  error TEXT
);
CREATE INDEX IF NOT EXISTS idx_steps_task ON steps(task_id, idx);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_events_task ON events(task_id, id);

CREATE TABLE IF NOT EXISTS artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT 'text/markdown',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL DEFAULT 'finding',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  source_task_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
  title, content, tags, content=memories, content_rowid=id
);
CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
  INSERT INTO memories_fts(rowid, title, content, tags)
  VALUES (new.id, new.title, new.content, new.tags);
END;
CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
  INSERT INTO memories_fts(memories_fts, rowid, title, content, tags)
  VALUES ('delete', old.id, old.title, old.content, old.tags);
END;

CREATE TABLE IF NOT EXISTS playbooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  rationale TEXT,
  active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  parameters_json TEXT NOT NULL DEFAULT '{}',
  code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  origin TEXT NOT NULL DEFAULT 'agent',
  source_task_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// camelCase row mappers ------------------------------------------------------

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function mapRow<T>(row: unknown): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    out[toCamel(k)] = v;
  }
  return out as T;
}

export function mapRows<T>(rows: unknown[]): T[] {
  return rows.map((r) => mapRow<T>(r));
}

export function nowIso(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}
