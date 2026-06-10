import {db, mapRows} from '../db.js';
import type {ToolSpec} from '../types.js';
import {McpClient, type McpToolDef} from './client.js';

db.exec(`
CREATE TABLE IF NOT EXISTS mcp_servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  command TEXT NOT NULL,
  args_json TEXT NOT NULL DEFAULT '[]',
  env_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_error TEXT,
  tools_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export interface McpServerRow {
  id: number;
  name: string;
  command: string;
  argsJson: string;
  envJson: string;
  enabled: number;
  status: string;
  lastError: string | null;
  toolsJson: string;
  createdAt: string;
}

const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 24);

/** Qualified tool name visible to models: mcp__<server>__<tool> */
export function qualifyName(server: string, tool: string): string {
  return `mcp__${sanitize(server)}__${tool.replace(/[^a-zA-Z0-9_-]/g, '_')}`.slice(0, 64);
}

class McpManager {
  private readonly clients = new Map<number, McpClient>();
  /** qualified name -> {serverId, originalName} */
  private readonly routes = new Map<string, {serverId: number; tool: string}>();
  /** qualified specs cache, rebuilt on connect/disconnect */
  private specs: ToolSpec[] = [];

  list(): (McpServerRow & {tools: McpToolDef[]})[] {
    const rows = mapRows<McpServerRow>(
      db.prepare(`SELECT * FROM mcp_servers ORDER BY id`).all()
    );
    return rows.map((r) => ({...r, tools: JSON.parse(r.toolsJson || '[]') as McpToolDef[]}));
  }

  add(input: {name: string; command: string; args?: string[]; env?: Record<string, string>}): McpServerRow {
    const res = db
      .prepare(
        `INSERT INTO mcp_servers (name, command, args_json, env_json) VALUES (?, ?, ?, ?)`
      )
      .run(
        sanitize(input.name) || `server_${Date.now()}`,
        input.command,
        JSON.stringify(input.args ?? []),
        JSON.stringify(input.env ?? {})
      );
    const id = Number(res.lastInsertRowid);
    void this.connect(id);
    return this.row(id);
  }

  private row(id: number): McpServerRow {
    return mapRows<McpServerRow>(db.prepare(`SELECT * FROM mcp_servers WHERE id = ?`).all(id))[0];
  }

  private setStatus(id: number, status: string, error?: string | null, tools?: McpToolDef[]): void {
    db.prepare(
      `UPDATE mcp_servers SET status = ?, last_error = ?, tools_json = COALESCE(?, tools_json) WHERE id = ?`
    ).run(status, error ?? null, tools ? JSON.stringify(tools) : null, id);
  }

  async connect(id: number): Promise<void> {
    const row = this.row(id);
    if (!row || !row.enabled) return;
    this.disconnect(id);
    const client = new McpClient(
      row.command,
      JSON.parse(row.argsJson) as string[],
      JSON.parse(row.envJson) as Record<string, string>
    );
    client.onExit = () => {
      if (this.clients.get(id) === client) {
        this.clients.delete(id);
        this.setStatus(id, 'disconnected', null);
        this.rebuild();
      }
    };
    try {
      const tools = await client.connect();
      this.clients.set(id, client);
      this.setStatus(id, 'connected', null, tools);
    } catch (e) {
      client.close();
      this.setStatus(id, 'error', String(e).slice(0, 500));
    }
    this.rebuild();
  }

  disconnect(id: number): void {
    this.clients.get(id)?.close();
    this.clients.delete(id);
    this.rebuild();
  }

  async setEnabled(id: number, enabled: boolean): Promise<void> {
    db.prepare(`UPDATE mcp_servers SET enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, id);
    if (enabled) await this.connect(id);
    else {
      this.disconnect(id);
      this.setStatus(id, 'disconnected', null);
    }
  }

  remove(id: number): void {
    this.disconnect(id);
    db.prepare(`DELETE FROM mcp_servers WHERE id = ?`).run(id);
    this.rebuild();
  }

  /** rebuild qualified specs + routes from currently connected clients */
  private rebuild(): void {
    this.routes.clear();
    const specs: ToolSpec[] = [];
    for (const [id] of this.clients) {
      const row = this.row(id);
      if (!row) continue;
      const tools = JSON.parse(row.toolsJson || '[]') as McpToolDef[];
      for (const t of tools) {
        const qualified = qualifyName(row.name, t.name);
        if (this.routes.has(qualified)) continue;
        this.routes.set(qualified, {serverId: id, tool: t.name});
        specs.push({
          name: qualified,
          description: `[MCP:${row.name}] ${t.description ?? t.name}`.slice(0, 1024),
          parameters: t.inputSchema ?? {type: 'object', properties: {}},
        });
      }
    }
    this.specs = specs;
  }

  toolSpecs(): ToolSpec[] {
    return this.specs;
  }

  owns(name: string): boolean {
    return name.startsWith('mcp__');
  }

  async call(qualified: string, args: Record<string, unknown>): Promise<string> {
    const route = this.routes.get(qualified);
    if (!route) return `錯誤：MCP 工具 ${qualified} 不存在或其伺服器未連線`;
    let client = this.clients.get(route.serverId);
    if (!client?.alive) {
      await this.connect(route.serverId); // lazy reconnect after a crash
      client = this.clients.get(route.serverId);
      if (!client) return `錯誤：MCP 伺服器重連失敗`;
    }
    try {
      const out = await client.callTool(route.tool, args);
      return out.slice(0, 8000) || '（工具沒有回傳內容）';
    } catch (e) {
      return `MCP 工具執行失敗：${String(e)}`;
    }
  }

  /** connect all enabled servers (called at boot; failures are recorded, not thrown) */
  async init(): Promise<void> {
    const rows = mapRows<McpServerRow>(
      db.prepare(`SELECT * FROM mcp_servers WHERE enabled = 1`).all()
    );
    await Promise.allSettled(rows.map((r) => this.connect(r.id)));
  }

  shutdown(): void {
    for (const [id] of this.clients) this.disconnect(id);
  }
}

export const mcpManager = new McpManager();
