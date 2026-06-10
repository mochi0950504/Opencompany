import {spawn, type ChildProcess} from 'node:child_process';

/**
 * Minimal MCP (Model Context Protocol) client over stdio transport.
 * Speaks JSON-RPC 2.0, one message per line. No SDK dependency.
 */

export interface McpToolDef {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface Pending {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
  timer: NodeJS.Timeout;
}

export class McpClient {
  private proc: ChildProcess | null = null;
  private buffer = '';
  private seq = 0;
  private readonly pending = new Map<number, Pending>();
  private closed = false;
  onExit: (() => void) | null = null;

  constructor(
    private readonly command: string,
    private readonly args: string[],
    private readonly env: Record<string, string>
  ) {}

  async connect(): Promise<McpToolDef[]> {
    this.proc = spawn(this.command, this.args, {
      env: {...process.env, ...this.env},
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.proc.on('exit', () => {
      this.closed = true;
      for (const [, p] of this.pending) {
        clearTimeout(p.timer);
        p.reject(new Error('MCP server exited'));
      }
      this.pending.clear();
      this.onExit?.();
    });
    this.proc.on('error', (e) => {
      this.closed = true;
      for (const [, p] of this.pending) {
        clearTimeout(p.timer);
        p.reject(e);
      }
      this.pending.clear();
      this.onExit?.();
    });
    this.proc.stdout?.on('data', (chunk: Buffer) => this.onData(chunk));
    // keep stderr from filling the pipe buffer
    this.proc.stderr?.on('data', () => undefined);

    await this.request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: {name: 'opencompany', version: '0.1.0'},
    });
    this.notify('notifications/initialized', {});
    return this.listTools();
  }

  private onData(chunk: Buffer): void {
    this.buffer += chunk.toString('utf8');
    let nl: number;
    while ((nl = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, nl).trim();
      this.buffer = this.buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line) as {id?: number; result?: unknown; error?: {message?: string}};
        if (typeof msg.id === 'number' && this.pending.has(msg.id)) {
          const p = this.pending.get(msg.id)!;
          this.pending.delete(msg.id);
          clearTimeout(p.timer);
          if (msg.error) p.reject(new Error(msg.error.message ?? 'MCP error'));
          else p.resolve(msg.result);
        }
        // requests/notifications from the server are ignored in this minimal client
      } catch {
        // non-JSON line on stdout (some servers log there) — skip
      }
    }
  }

  private write(msg: Record<string, unknown>): void {
    if (this.closed || !this.proc?.stdin?.writable) throw new Error('MCP client not connected');
    this.proc.stdin.write(JSON.stringify(msg) + '\n');
  }

  private notify(method: string, params: Record<string, unknown>): void {
    this.write({jsonrpc: '2.0', method, params});
  }

  request(method: string, params: Record<string, unknown>, timeoutMs = 20_000): Promise<unknown> {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`MCP request ${method} timed out (${timeoutMs}ms)`));
      }, timeoutMs);
      this.pending.set(id, {resolve, reject, timer});
      try {
        this.write({jsonrpc: '2.0', id, method, params});
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(e as Error);
      }
    });
  }

  async listTools(): Promise<McpToolDef[]> {
    const tools: McpToolDef[] = [];
    let cursor: string | undefined;
    do {
      const res = (await this.request('tools/list', cursor ? {cursor} : {})) as {
        tools?: McpToolDef[];
        nextCursor?: string;
      };
      tools.push(...(res.tools ?? []));
      cursor = res.nextCursor;
    } while (cursor && tools.length < 500);
    return tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const res = (await this.request('tools/call', {name, arguments: args}, 60_000)) as {
      content?: {type: string; text?: string}[];
      isError?: boolean;
    };
    const text = (res.content ?? [])
      .map((c) => (c.type === 'text' ? (c.text ?? '') : `[${c.type}]`))
      .join('\n');
    return res.isError ? `工具回報錯誤：${text}` : text;
  }

  get alive(): boolean {
    return !this.closed && this.proc !== null;
  }

  close(): void {
    this.closed = true;
    this.proc?.kill('SIGTERM');
    setTimeout(() => this.proc?.kill('SIGKILL'), 2000).unref();
  }
}
