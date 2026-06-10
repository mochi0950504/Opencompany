import {useCallback, useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {api} from '../api';
import type {McpServer, MemoryRow, PlaybookRow, ToolRow} from '../types';
import {ToolStatusBadge} from '../components/Badges';
import {MEMORY_KIND_LABEL, fmtDateTime, timeAgo, truncate} from '../utils';

type Tab = 'memories' | 'playbooks' | 'tools' | 'mcp';

const TABS: Array<{key: Tab; label: string}> = [
  {key: 'memories', label: '記憶庫'},
  {key: 'playbooks', label: 'Playbooks'},
  {key: 'tools', label: '工具生態'},
  {key: 'mcp', label: 'MCP 連接器'},
];

function MemoriesTab() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<MemoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .memories(q.trim())
        .then((r) => {
          setRows(r);
          setError(null);
        })
        .catch((e: Error) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div>
      <input
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜尋記憶（標題、內容、標籤）…"
      />
      {error && <div className="alert error">{error}</div>}
      {rows === null && !error && <div className="empty">載入中…</div>}
      {rows !== null && rows.length === 0 && <div className="empty">沒有符合的記憶。</div>}
      <div className="stack">
        {(rows ?? []).map((m) => (
          <div key={m.id} className="card grow-card">
            <div className="grow-head">
              <span className={`badge kind-${m.kind}`}>{MEMORY_KIND_LABEL[m.kind] ?? m.kind}</span>
              <strong>{m.title}</strong>
              <span className="dim push">{timeAgo(m.createdAt)}</span>
            </div>
            <p className="grow-content">{m.content}</p>
            <div className="grow-meta dim">
              {m.tags && <span>標籤：{m.tags}</span>}
              {m.sourceTaskId !== null && (
                <Link to={`/tasks/${m.sourceTaskId}`}>來源任務 #{m.sourceTaskId}</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaybooksTab() {
  const [rows, setRows] = useState<PlaybookRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(() => {
    api
      .playbooks()
      .then((r) => {
        setRows(r);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function activate(id: number) {
    try {
      await api.activatePlaybook(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      {error && <div className="alert error">{error}</div>}
      {rows === null && !error && <div className="empty">載入中…</div>}
      {rows !== null && rows.length === 0 && <div className="empty">尚無 playbook 版本。</div>}
      <div className="stack">
        {(rows ?? [])
          .slice()
          .sort((a, b) => b.version - a.version)
          .map((p) => (
            <div key={p.id} className="card grow-card">
              <div className="grow-head">
                <strong>{p.name}</strong>
                <span className="mono dim">v{p.version}</span>
                {p.active === 1 ? (
                  <span className="badge st-running">使用中</span>
                ) : (
                  <button className="btn ghost small" onClick={() => activate(p.id)}>
                    啟用此版本
                  </button>
                )}
                <span className="dim push">{fmtDateTime(p.createdAt)}</span>
              </div>
              {p.rationale && <p className="grow-content dim">演進理由：{p.rationale}</p>}
              <button
                className="btn ghost tiny"
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
              >
                {openId === p.id ? '收合內容' : '預覽內容'}
              </button>
              <pre className="code-preview">
                {openId === p.id ? p.content : truncate(p.content, 160)}
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
}

function ToolsTab() {
  const [rows, setRows] = useState<ToolRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .tools()
      .then((r) => {
        setRows(r);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function setStatus(id: number, status: 'approved' | 'disabled' | 'rejected') {
    try {
      await api.setToolStatus(id, status);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      {error && <div className="alert error">{error}</div>}
      {rows === null && !error && <div className="empty">載入中…</div>}
      {rows !== null && rows.length === 0 && <div className="empty">尚無工具。</div>}
      <div className="stack">
        {(rows ?? []).map((t) => (
          <div key={t.id} className="card grow-card">
            <div className="grow-head">
              <strong className="mono">{t.name}</strong>
              <span className={`badge origin-${t.origin}`}>
                {t.origin === 'builtin' ? '內建' : t.origin === 'agent' ? 'Agent 自建' : '使用者'}
              </span>
              {t.status !== 'builtin' && <ToolStatusBadge status={t.status} />}
              <span className="dim push">{timeAgo(t.createdAt)}</span>
            </div>
            <p className="grow-content">{t.description}</p>
            {t.sourceTaskId !== null && (
              <div className="grow-meta dim">
                <Link to={`/tasks/${t.sourceTaskId}`}>來源任務 #{t.sourceTaskId}</Link>
              </div>
            )}
            {t.status === 'pending' && t.origin === 'agent' && (
              <>
                {t.code && <pre className="code-preview tall">{t.code}</pre>}
                <div className="action-row">
                  <button className="btn primary small" onClick={() => setStatus(t.id, 'approved')}>
                    核准
                  </button>
                  <button className="btn danger small" onClick={() => setStatus(t.id, 'rejected')}>
                    拒絕
                  </button>
                </div>
              </>
            )}
            {t.status === 'approved' && (
              <div className="action-row">
                <button className="btn small" onClick={() => setStatus(t.id, 'disabled')}>
                  停用
                </button>
              </div>
            )}
            {t.status === 'disabled' && (
              <div className="action-row">
                <button className="btn ghost small" onClick={() => setStatus(t.id, 'approved')}>
                  重新啟用
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const MCP_STATUS: Record<string, {label: string; color: string}> = {
  connected: {label: '已連線', color: '#34D399'},
  disconnected: {label: '未連線', color: '#94A3B8'},
  error: {label: '錯誤', color: '#EF4444'},
};

function McpTab() {
  const [rows, setRows] = useState<McpServer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    api
      .mcpServers()
      .then((r) => {
        setRows(r);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  async function add() {
    if (!name.trim() || !command.trim() || adding) return;
    setAdding(true);
    try {
      await api.addMcpServer({
        name: name.trim(),
        command: command.trim(),
        args: args.trim() ? args.trim().split(/\s+/) : [],
      });
      setName('');
      setCommand('');
      setArgs('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  }

  async function act(id: number, action: 'enable' | 'disable' | 'refresh') {
    try {
      await api.mcpAction(id, action);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function remove(id: number) {
    if (!window.confirm('移除這個 MCP server？')) return;
    try {
      await api.removeMcpServer(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      <div className="card grow-card">
        <div className="grow-head">
          <strong>新增 MCP server</strong>
        </div>
        <p className="grow-content dim">
          掛載任何 stdio MCP server，其工具會自動加入調研編隊的工具箱（命名為
          mcp__名稱__工具）。新增等同於在本機執行該指令——只加入你信任的來源。
        </p>
        <div className="field-row">
          <label className="field">
            <span>名稱（小寫英數）</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如 fetcher" />
          </label>
          <label className="field">
            <span>指令</span>
            <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="例如 npx" />
          </label>
          <label className="field">
            <span>參數（空白分隔）</span>
            <input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="例如 -y @modelcontextprotocol/server-filesystem /data" />
          </label>
        </div>
        <div className="action-row">
          <button className="btn primary" disabled={!name.trim() || !command.trim() || adding} onClick={add}>
            {adding ? '連線中…' : '新增並連線'}
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {rows !== null && rows.length === 0 && <div className="empty">尚未掛載任何 MCP server。</div>}
      <div className="stack">
        {(rows ?? []).map((s) => {
          const st = MCP_STATUS[s.status] ?? {label: s.status, color: '#94A3B8'};
          return (
            <div key={s.id} className="card grow-card">
              <div className="grow-head">
                <strong className="mono">{s.name}</strong>
                <span className="badge" style={{borderColor: st.color, color: st.color}}>
                  {st.label}
                </span>
                {!s.enabled && (
                  <span className="badge" style={{borderColor: '#94A3B8', color: '#94A3B8'}}>
                    已停用
                  </span>
                )}
                <span className="dim push">{timeAgo(s.createdAt)}</span>
              </div>
              <p className="grow-content mono dim">
                {s.command} {(JSON.parse(s.argsJson) as string[]).join(' ')}
              </p>
              {s.lastError && <div className="alert error">{s.lastError}</div>}
              {s.tools.length > 0 && (
                <div className="grow-meta">
                  {s.tools.map((t) => (
                    <span key={t.name} className="badge" title={t.description ?? ''} style={{borderColor: '#2DD4BF', color: '#2DD4BF'}}>
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="action-row">
                {s.enabled ? (
                  <button className="btn ghost small" onClick={() => act(s.id, 'disable')}>
                    停用
                  </button>
                ) : (
                  <button className="btn ghost small" onClick={() => act(s.id, 'enable')}>
                    啟用
                  </button>
                )}
                <button className="btn ghost small" onClick={() => act(s.id, 'refresh')}>
                  重新連線
                </button>
                <button className="btn danger small" onClick={() => remove(s.id)}>
                  移除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GrowthPage() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab') as Tab | null;
  const tab: Tab = TABS.some((t) => t.key === tabParam) ? (tabParam as Tab) : 'memories';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>成長中心</h1>
          <p className="sub">平台跑任務時累積的記憶、playbook 演進與自建工具</p>
        </div>
      </div>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' on' : ''}`}
            onClick={() => setParams({tab: t.key})}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'memories' && <MemoriesTab />}
      {tab === 'playbooks' && <PlaybooksTab />}
      {tab === 'tools' && <ToolsTab />}
      {tab === 'mcp' && <McpTab />}
    </div>
  );
}
