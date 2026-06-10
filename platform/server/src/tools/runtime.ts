import vm from 'node:vm';
import {db, mapRows} from '../db.js';
import {saveMemory, searchMemories} from '../growth/memory.js';
import type {ToolRow, ToolSpec} from '../types.js';

export interface ToolContext {
  taskId: number;
}

type ToolFn = (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;

interface RuntimeTool {
  spec: ToolSpec;
  fn: ToolFn;
}

// ---------- builtin tools (always available) ----------

const builtinTools: RuntimeTool[] = [
  {
    spec: {
      name: 'memory_search',
      description: '搜尋平台知識庫（過往任務的發現與教訓）。',
      parameters: {
        type: 'object',
        properties: {query: {type: 'string', description: '搜尋關鍵字'}},
        required: ['query'],
      },
    },
    fn: async (args) => {
      const hits = searchMemories(String(args.query ?? ''), 8);
      if (!hits.length) return '（知識庫沒有相關紀錄）';
      return hits
        .map((m) => `[${m.kind}] ${m.title}\n${m.content.slice(0, 400)}`)
        .join('\n---\n');
    },
  },
  {
    spec: {
      name: 'memory_save',
      description: '把重要發現或教訓存入知識庫，供未來任務使用。',
      parameters: {
        type: 'object',
        properties: {
          kind: {type: 'string', enum: ['finding', 'lesson', 'fact']},
          title: {type: 'string'},
          content: {type: 'string'},
          tags: {type: 'array', items: {type: 'string'}},
        },
        required: ['title', 'content'],
      },
    },
    fn: async (args, ctx) => {
      const id = saveMemory({
        kind: (args.kind as 'finding' | 'lesson' | 'fact') ?? 'finding',
        title: String(args.title),
        content: String(args.content),
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        sourceTaskId: ctx.taskId,
      });
      return `已存入知識庫 #${id}`;
    },
  },
  {
    spec: {
      name: 'web_fetch',
      description: '抓取一個網址的文字內容（截斷至 8000 字）。',
      parameters: {
        type: 'object',
        properties: {url: {type: 'string', description: 'http(s) URL'}},
        required: ['url'],
      },
    },
    fn: async (args) => {
      const url = String(args.url ?? '');
      if (!/^https?:\/\//.test(url)) return '錯誤：只接受 http(s) URL';
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(20_000),
          headers: {'user-agent': 'OpenCompanyBot/0.1 (+research)'},
        });
        const text = await res.text();
        const stripped = text
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return `HTTP ${res.status}\n${stripped.slice(0, 8000)}`;
      } catch (e) {
        return `抓取失敗：${String(e)}`;
      }
    },
  },
];

export function ensureBuiltinTools(): void {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO tools (name, description, parameters_json, status, origin)
     VALUES (?, ?, ?, 'builtin', 'builtin')`
  );
  for (const t of builtinTools) {
    insert.run(t.spec.name, t.spec.description, JSON.stringify(t.spec.parameters));
  }
}

// ---------- agent-authored tools (open ecosystem, gated by approval) ----------

/**
 * Agent tools are plain async JS functions compiled in an isolated vm context.
 * They only receive a tiny capability surface (fetch + memory) — no fs, no
 * process, no require. Approval (status='approved') is a human action.
 */
function compileAgentTool(row: ToolRow): RuntimeTool | null {
  if (!row.code) return null;
  try {
    const context = vm.createContext({
      fetch,
      AbortSignal,
      URL,
      JSON,
      Math,
      Date,
      console: {log: () => undefined},
      memory: {
        search: (q: string) => searchMemories(q, 8),
        save: (title: string, content: string) =>
          saveMemory({kind: 'finding', title, content, sourceTaskId: null}),
      },
    });
    const script = new vm.Script(
      `(async (args, ctx) => { ${row.code}\n })`,
      {filename: `tool:${row.name}`}
    );
    const fn = script.runInContext(context, {timeout: 1000}) as ToolFn;
    return {
      spec: {
        name: row.name,
        description: row.description,
        parameters: JSON.parse(row.parametersJson || '{}'),
      },
      fn: async (args, ctx) => {
        const result = await Promise.race([
          fn(args, ctx),
          new Promise<string>((_, rej) =>
            setTimeout(() => rej(new Error('tool timeout (30s)')), 30_000)
          ),
        ]);
        return String(result).slice(0, 8000);
      },
    };
  } catch {
    return null;
  }
}

export function loadTools(): RuntimeTool[] {
  ensureBuiltinTools();
  const approved = mapRows<ToolRow>(
    db.prepare(`SELECT * FROM tools WHERE status = 'approved' AND code IS NOT NULL`).all()
  );
  const agentTools = approved
    .map((row) => compileAgentTool(row))
    .filter((t): t is RuntimeTool => t !== null);
  return [...builtinTools, ...agentTools];
}

export function toolSpecs(): ToolSpec[] {
  return loadTools().map((t) => t.spec);
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<string> {
  const tool = loadTools().find((t) => t.spec.name === name);
  if (!tool) return `錯誤：找不到工具 ${name}`;
  try {
    return await tool.fn(args, ctx);
  } catch (e) {
    return `工具執行失敗：${String(e)}`;
  }
}

/** Self-extension entry point: retro stage proposes a new tool. */
export function proposeTool(input: {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  code: string;
  sourceTaskId: number;
}): void {
  db.prepare(
    `INSERT OR IGNORE INTO tools (name, description, parameters_json, code, status, origin, source_task_id)
     VALUES (?, ?, ?, ?, 'pending', 'agent', ?)`
  ).run(
    input.name.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 48),
    input.description,
    JSON.stringify(input.parameters),
    input.code,
    input.sourceTaskId
  );
}

export function setToolStatus(id: number, status: 'approved' | 'disabled' | 'rejected'): void {
  db.prepare(`UPDATE tools SET status = ? WHERE id = ? AND origin != 'builtin'`).run(status, id);
}

export function listTools(): ToolRow[] {
  ensureBuiltinTools();
  return mapRows<ToolRow>(db.prepare(`SELECT * FROM tools ORDER BY id`).all());
}
