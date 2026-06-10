import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';
import type {CrewMember, ModelInfo, ProvidersResponse, RoleName} from '../types';
import {ALL_ROLES, ROLE_LABEL} from '../utils';

const MAX_CREW = 4;

const DEMO_CREW: CrewMember[] = [
  {name: 'Alpha 領航', model: 'mock/alpha', roles: ['planner']},
  {name: 'Beta 斥候', model: 'mock/beta', roles: ['researcher']},
  {name: 'Gamma 鐵面', model: 'mock/gamma', roles: ['critic', 'retro']},
  {name: 'Delta 主筆', model: 'mock/delta', roles: ['synthesizer']},
];

function defaultName(m: ModelInfo): string {
  const tail = m.id.split('/').pop() ?? m.id;
  return tail.length > 24 ? tail.slice(0, 24) : tail;
}

export function NewTaskPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProvidersResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [goal, setGoal] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [breadth, setBreadth] = useState(3);
  const [maxSteps, setMaxSteps] = useState(40);
  const [maxMinutes, setMaxMinutes] = useState(1440);
  const [maxTokens, setMaxTokens] = useState(2_000_000);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);

  function applyImport() {
    try {
      const t = JSON.parse(importText) as Record<string, unknown>;
      if (typeof t.goal === 'string') setGoal(t.goal);
      if (typeof t.title === 'string') setTitle(t.title);
      if (typeof t.instructions === 'string') setInstructions(t.instructions);
      if (typeof t.breadth === 'number') setBreadth(Math.min(6, Math.max(1, t.breadth)));
      const b = (t.budget ?? {}) as Record<string, unknown>;
      if (typeof b.maxSteps === 'number') setMaxSteps(b.maxSteps);
      if (typeof b.maxMinutes === 'number') setMaxMinutes(b.maxMinutes);
      if (typeof b.maxTokens === 'number') setMaxTokens(b.maxTokens);
      if (Array.isArray(t.crew)) {
        setCrew(
          (t.crew as Array<Record<string, unknown>>)
            .filter((m) => typeof m?.model === 'string')
            .slice(0, MAX_CREW)
            .map((m) => ({
              name: typeof m.name === 'string' && m.name ? m.name : String(m.model),
              model: String(m.model),
              roles: Array.isArray(m.roles)
                ? (m.roles.filter((r): r is RoleName =>
                    (ALL_ROLES as readonly string[]).includes(String(r))
                  ) as RoleName[])
                : [],
            }))
        );
      }
      setImportMsg('已套用範本——請確認模型在本機可用後再送出。');
      setShowImport(false);
    } catch {
      setImportMsg('JSON 解析失敗，請確認貼上的是「匯出範本」產生的內容。');
    }
  }

  useEffect(() => {
    api.providers().then(setData).catch((e: Error) => setLoadError(e.message));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, ModelInfo[]>();
    for (const m of data?.models ?? []) {
      const list = map.get(m.provider) ?? [];
      list.push(m);
      map.set(m.provider, list);
    }
    return map;
  }, [data]);

  const providerAvailable = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const p of data?.providers ?? []) map.set(p.kind, p.available);
    return map;
  }, [data]);

  const selectedModels = new Set(crew.map((m) => m.model));

  function addModel(m: ModelInfo) {
    setSubmitError(null);
    if (selectedModels.has(m.ref)) {
      setSubmitError(`模型 ${m.ref} 已在編隊中，每個模型只能加入一次`);
      return;
    }
    if (crew.length >= MAX_CREW) {
      setSubmitError(`編隊上限為 ${MAX_CREW} 位成員`);
      return;
    }
    setCrew([...crew, {name: defaultName(m), model: m.ref, roles: ['researcher']}]);
  }

  function removeMember(i: number) {
    setCrew(crew.filter((_, idx) => idx !== i));
  }

  function renameMember(i: number, name: string) {
    setCrew(crew.map((m, idx) => (idx === i ? {...m, name} : m)));
  }

  function toggleRole(i: number, role: RoleName) {
    setCrew(
      crew.map((m, idx) =>
        idx === i
          ? {
              ...m,
              roles: m.roles.includes(role)
                ? m.roles.filter((r) => r !== role)
                : [...m.roles, role],
            }
          : m
      )
    );
  }

  const coveredRoles = new Set(crew.flatMap((m) => m.roles));
  const canSubmit = goal.trim().length > 0 && crew.length > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const task = await api.createTask({
        title: title.trim() || undefined,
        goal: goal.trim(),
        instructions: instructions.trim() || undefined,
        breadth,
        budget: {maxSteps, maxMinutes, maxTokens},
        crew: crew.map((m) => ({...m, name: m.name.trim() || m.model})),
      });
      navigate(`/tasks/${task.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>建立任務</h1>
          <p className="sub">設定目標、預算與最多 {MAX_CREW} 個模型的編隊</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" onClick={() => setShowImport((v) => !v)}>
            {showImport ? '收合匯入' : '匯入範本'}
          </button>
        </div>
      </div>

      {importMsg && <div className="alert">{importMsg}</div>}
      {showImport && (
        <section className="card">
          <h2>匯入任務範本</h2>
          <p className="sub dim">貼上任務詳情頁「匯出範本」產生的 JSON，會自動填入下方表單。</p>
          <label className="field">
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"goal":"…","crew":[…],"budget":{…}}'
            />
          </label>
          <div className="action-row">
            <button className="btn primary" disabled={!importText.trim()} onClick={applyImport}>
              套用範本
            </button>
          </div>
        </section>
      )}

      <div className="wizard">
        <section className="card">
          <h2>1. 任務目標</h2>
          <label className="field">
            <span>
              目標 <em className="req">必填</em>
            </span>
            <textarea
              rows={4}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例如：調查 2026 年開源向量資料庫的生態系，比較效能、授權與社群活躍度，產出選型建議報告"
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span>標題（選填，預設取目標前 60 字）</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="任務標題" />
            </label>
          </div>
          <label className="field">
            <span>額外指示（選填）</span>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="給編隊的常設指示，例如輸出語言、引用格式、要避開的來源…"
            />
          </label>
        </section>

        <section className="card">
          <h2>2. 廣度與預算</h2>
          <div className="field-row">
            <label className="field">
              <span>
                調研廣度（並行子題數）：<strong className="mono">{breadth}</strong>
              </span>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={breadth}
                onChange={(e) => setBreadth(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="field-row three">
            <label className="field">
              <span>最大步數</span>
              <input
                type="number"
                min={1}
                value={maxSteps}
                onChange={(e) => setMaxSteps(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label className="field">
              <span>最長時間（分鐘）</span>
              <input
                type="number"
                min={1}
                value={maxMinutes}
                onChange={(e) => setMaxMinutes(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label className="field">
              <span>Token 上限</span>
              <input
                type="number"
                min={1000}
                step={1000}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Math.max(1000, Number(e.target.value) || 1000))}
              />
            </label>
          </div>
        </section>

        <section className="card">
          <div className="crew-head">
            <h2>
              3. 編隊組建 <span className="mono crew-count">{crew.length}/{MAX_CREW}</span>
            </h2>
            <button className="btn ghost" onClick={() => setCrew(DEMO_CREW.map((m) => ({...m, roles: [...m.roles]})))}>
              一鍵示範編隊
            </button>
          </div>

          {loadError && <div className="alert error">模型清單載入失敗：{loadError}</div>}
          {!data && !loadError && <div className="empty">載入模型清單中…</div>}

          <div className="provider-groups">
            {[...grouped.entries()].map(([provider, models]) => {
              const available = providerAvailable.get(provider) ?? false;
              return (
                <div key={provider} className={`provider-group${available ? '' : ' unavailable'}`}>
                  <div className="provider-name">
                    <span className="mono">{provider}</span>
                    {!available && <span className="badge ev-warn">未設金鑰</span>}
                  </div>
                  <div className="model-list">
                    {models.map((m) => {
                      const picked = selectedModels.has(m.ref);
                      const disabled = !available || !m.available || picked || crew.length >= MAX_CREW;
                      return (
                        <button
                          key={m.ref}
                          className={`model-chip${picked ? ' picked' : ''}`}
                          disabled={disabled && !picked}
                          title={m.ref}
                          onClick={() => addModel(m)}
                        >
                          {picked ? '✓ ' : '＋ '}
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {crew.length === 0 ? (
            <div className="empty small">尚未加入任何成員——點上方模型加入編隊，或按「一鍵示範編隊」。</div>
          ) : (
            <div className="crew-list">
              {crew.map((m, i) => (
                <div key={m.model} className="crew-member">
                  <div className="crew-member-top">
                    <input
                      className="member-name"
                      value={m.name}
                      onChange={(e) => renameMember(i, e.target.value)}
                      placeholder="顯示名稱"
                    />
                    <span className="mono model-ref" title={m.model}>
                      {m.model}
                    </span>
                    <button className="btn danger small" onClick={() => removeMember(i)}>
                      移除
                    </button>
                  </div>
                  <div className="role-picks">
                    {ALL_ROLES.map((role) => (
                      <label key={role} className={`role-pick${m.roles.includes(role) ? ' on' : ''}`}>
                        <input
                          type="checkbox"
                          checked={m.roles.includes(role)}
                          onChange={() => toggleRole(i, role)}
                        />
                        {ROLE_LABEL[role]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {crew.length > 0 && coveredRoles.size < ALL_ROLES.length && (
            <p className="hint">
              提示：尚未指派的角色（
              {ALL_ROLES.filter((r) => !coveredRoles.has(r))
                .map((r) => ROLE_LABEL[r])
                .join('、')}
              ）將由系統自動派給最合適的成員。
            </p>
          )}
        </section>

        {submitError && <div className="alert error">{submitError}</div>}

        <div className="wizard-actions">
          <button className="btn primary big" disabled={!canSubmit} onClick={submit}>
            {submitting ? '建立中…' : '啟動任務'}
          </button>
          {!goal.trim() && <span className="hint">請先填寫任務目標</span>}
          {goal.trim() && crew.length === 0 && <span className="hint">至少需要一位編隊成員</span>}
        </div>
      </div>
    </div>
  );
}
