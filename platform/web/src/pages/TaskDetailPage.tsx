import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {api} from '../api';
import type {ArtifactRow, EventRow, StepRow, TaskDetail} from '../types';
import {EventTypeBadge, StepStatusBadge, TaskStatusBadge} from '../components/Badges';
import {Markdown} from '../markdown';
import {EVENT_TYPES, STAGES, fmtDateTime, fmtNum, timeAgo, truncate} from '../utils';

const MAX_EVENTS = 200;
const OUTPUT_PREVIEW_CHARS = 2000;

function stepOutputContent(step: StepRow): string {
  if (!step.outputJson) return '';
  try {
    const parsed = JSON.parse(step.outputJson) as {content?: unknown};
    if (typeof parsed?.content === 'string') return parsed.content;
    return step.outputJson;
  } catch {
    return step.outputJson;
  }
}

function StepCard({step}: {step: StepRow}) {
  const [open, setOpen] = useState(false);
  const content = stepOutputContent(step);
  return (
    <div className={`step-card s-${step.status}`}>
      <div className="step-card-head">
        <div className="step-title">{step.title}</div>
        <StepStatusBadge status={step.status} />
      </div>
      <div className="step-meta">
        <span>{step.member}</span>
        <span className="mono dim" title={step.model}>
          {step.model.split('/').slice(-1)[0]}
        </span>
      </div>
      <div className="step-meta">
        <span className="mono dim">
          {fmtNum(step.inputTokens)} in / {fmtNum(step.outputTokens)} out tokens
        </span>
      </div>
      {step.error && <div className="step-error">{truncate(step.error, 300)}</div>}
      {content && (
        <>
          <button className="btn ghost tiny" onClick={() => setOpen(!open)}>
            {open ? '收合輸出' : '展開輸出'}
          </button>
          {open && <pre className="step-output">{content.slice(0, OUTPUT_PREVIEW_CHARS)}{content.length > OUTPUT_PREVIEW_CHARS ? '\n…（已截斷）' : ''}</pre>}
        </>
      )}
    </div>
  );
}

function ArtifactItem({artifact}: {artifact: ArtifactRow}) {
  const [open, setOpen] = useState(artifact.name === 'final-report.md');
  const isMarkdown = artifact.mime.includes('markdown') || artifact.name.endsWith('.md');
  return (
    <div className="card artifact">
      <div className="artifact-head" onClick={() => setOpen(!open)}>
        <span className="artifact-name">{artifact.name}</span>
        <span className="mono dim">{artifact.mime}</span>
        <span className="dim">{timeAgo(artifact.createdAt)}</span>
        <button className="btn ghost tiny">{open ? '收合' : '展開'}</button>
      </div>
      {open &&
        (isMarkdown ? (
          <Markdown source={artifact.content} />
        ) : (
          <pre className="artifact-raw">{artifact.content}</pre>
        ))}
    </div>
  );
}

export function TaskDetailPage() {
  const {id} = useParams<{id: string}>();
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [acting, setActing] = useState(false);
  const seenIds = useRef(new Set<number>());
  const refetchTimer = useRef<number | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;
    api
      .getTask(id)
      .then((d) => {
        setDetail(d);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // SSE 即時事件流
  useEffect(() => {
    if (!id) return;
    seenIds.current = new Set();
    setEvents([]);
    const es = new EventSource(`/api/tasks/${id}/events?after=0`);
    const onEvent = (raw: MessageEvent) => {
      try {
        const ev = JSON.parse(raw.data as string) as EventRow;
        if (seenIds.current.has(ev.id)) return;
        seenIds.current.add(ev.id);
        setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS));
        if (/^(step|task|artifact)\./.test(ev.type)) {
          // 集中在 300ms 內的事件只重抓一次
          if (refetchTimer.current === null) {
            refetchTimer.current = window.setTimeout(() => {
              refetchTimer.current = null;
              refetch();
            }, 300);
          }
        }
      } catch {
        // 忽略無法解析的事件
      }
    };
    for (const t of EVENT_TYPES) es.addEventListener(t, onEvent);
    return () => {
      es.close();
      if (refetchTimer.current !== null) {
        clearTimeout(refetchTimer.current);
        refetchTimer.current = null;
      }
    };
  }, [id, refetch]);

  const tokens = useMemo(() => {
    let input = 0;
    let output = 0;
    for (const s of detail?.steps ?? []) {
      input += s.inputTokens || 0;
      output += s.outputTokens || 0;
    }
    return {input, output, total: input + output};
  }, [detail]);

  const stepsByStage = useMemo(() => {
    const map = new Map<string, StepRow[]>();
    for (const s of detail?.steps ?? []) {
      const list = map.get(s.stage) ?? [];
      list.push(s);
      map.set(s.stage, list);
    }
    return map;
  }, [detail]);

  const [showTemplate, setShowTemplate] = useState(false);
  const [copied, setCopied] = useState(false);

  function templateJson(): string {
    if (!detail) return '{}';
    try {
      const cfg = JSON.parse(detail.task.configJson) as Record<string, unknown>;
      return JSON.stringify(
        {
          title: detail.task.title,
          goal: detail.task.goal,
          instructions: cfg.instructions,
          breadth: cfg.breadth,
          budget: cfg.budget,
          crew: cfg.crew,
        },
        null,
        2
      );
    } catch {
      return '{}';
    }
  }

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(templateJson());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 非安全來源無剪貼簿權限——使用者可在文字框內全選複製
    }
  }

  async function action(kind: 'pause' | 'resume' | 'cancel') {
    if (!id || acting) return;
    setActing(true);
    try {
      await api.taskAction(id, kind);
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(false);
    }
  }

  if (error && !detail) return <div className="page"><div className="alert error">載入失敗：{error}</div></div>;
  if (!detail) return <div className="page"><div className="empty">載入中…</div></div>;

  const {task, artifacts} = detail;
  const running = task.status === 'running' || task.status === 'queued';

  return (
    <div className="page wide">
      <div className="page-head">
        <div>
          <div className="head-line">
            <h1>{task.title || `任務 #${task.id}`}</h1>
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="sub">{task.goal}</p>
          <p className="sub dim">
            建立 {fmtDateTime(task.createdAt)}
            {task.finishedAt ? ` ・ 結束 ${fmtDateTime(task.finishedAt)}` : ''}
          </p>
          {task.error && <div className="alert error">{task.error}</div>}
        </div>
        <div className="head-actions">
          <div className="token-box mono">
            <div className="token-total">{fmtNum(tokens.total)}</div>
            <div className="dim">
              tokens（{fmtNum(tokens.input)} in / {fmtNum(tokens.output)} out）
            </div>
          </div>
          <div className="action-row">
            {running && (
              <button className="btn" disabled={acting} onClick={() => action('pause')}>
                暫停
              </button>
            )}
            {task.status === 'paused' && (
              <button className="btn primary" disabled={acting} onClick={() => action('resume')}>
                恢復
              </button>
            )}
            {(running || task.status === 'paused') && (
              <button className="btn danger" disabled={acting} onClick={() => action('cancel')}>
                取消
              </button>
            )}
            <button className="btn ghost" onClick={() => setShowTemplate((v) => !v)}>
              {showTemplate ? '隱藏範本' : '匯出範本'}
            </button>
          </div>
        </div>
      </div>

      {showTemplate && (
        <section className="card template-card">
          <div className="grow-head">
            <strong>任務範本（JSON）</strong>
            <span className="dim push">貼到「建立任務 → 匯入範本」即可重用這個編隊與預算配置</span>
          </div>
          <label className="field">
            <textarea
              className="mono"
              readOnly
              rows={12}
              value={templateJson()}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>
          <div className="action-row">
            <button className="btn ghost small" onClick={copyTemplate}>
              {copied ? '已複製 ✓' : '複製到剪貼簿'}
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">管線進度</h2>
        <div className="pipeline">
          {STAGES.map((stage, i) => {
            const steps = stepsByStage.get(stage.key) ?? [];
            const done = steps.length > 0 && steps.every((s) => ['done', 'skipped'].includes(s.status));
            const active = steps.some((s) => s.status === 'running');
            const failed = steps.some((s) => s.status === 'failed');
            const state = failed ? 'failed' : active ? 'active' : done ? 'done' : steps.length ? 'partial' : 'idle';
            return (
              <div key={stage.key} className={`stage stage-${state}`}>
                <div className="stage-head">
                  <span className="stage-dot" />
                  <span className="stage-name">{stage.label}</span>
                  <span className="mono dim">{steps.length}</span>
                  {i < STAGES.length - 1 && <span className="stage-arrow">→</span>}
                </div>
                <div className="stage-steps">
                  {steps.length === 0 && <div className="dim small-text">尚無步驟</div>}
                  {steps.map((s) => (
                    <StepCard key={s.id} step={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="detail-cols">
        <section className="detail-col">
          <h2 className="section-title">即時事件流</h2>
          <div className="card event-stream">
            {events.length === 0 && <div className="empty small">等待事件中…</div>}
            {events.map((ev) => {
              let payload: Record<string, unknown> = {};
              try {
                payload = JSON.parse(ev.payloadJson) as Record<string, unknown>;
              } catch {
                payload = {raw: ev.payloadJson};
              }
              const summary =
                (payload.title as string) ??
                (payload.name as string) ??
                (payload.status as string) ??
                (payload.message as string) ??
                (payload.reason as string) ??
                '';
              return (
                <div key={ev.id} className="event-row">
                  <EventTypeBadge type={ev.type} />
                  <span className="event-summary">
                    {summary || truncate(ev.payloadJson, 80)}
                    {typeof payload.member === 'string' ? ` ・ ${payload.member}` : ''}
                  </span>
                  <span className="dim mono event-time" title={fmtDateTime(ev.ts)}>
                    {timeAgo(ev.ts)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="detail-col">
          <h2 className="section-title">成果（{artifacts.length}）</h2>
          {artifacts.length === 0 && <div className="empty small">任務完成後，最終報告等成果會出現在這裡。</div>}
          {artifacts.map((a) => (
            <ArtifactItem key={a.id} artifact={a} />
          ))}
        </section>
      </div>
    </div>
  );
}
