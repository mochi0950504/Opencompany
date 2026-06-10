import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {api} from '../api';
import type {TaskRow} from '../types';
import {TaskStatusBadge} from '../components/Badges';
import {parseConfig, timeAgo, truncate} from '../utils';

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .listTasks()
        .then((rows) => {
          if (!alive) return;
          setTasks(rows);
          setError(null);
        })
        .catch((e: Error) => alive && setError(e.message));
    load();
    const timer = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>任務總覽</h1>
          <p className="sub">每 5 秒自動刷新</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/new')}>
          ＋ 新任務
        </button>
      </div>

      {error && <div className="alert error">載入失敗：{error}</div>}
      {tasks === null && !error && <div className="empty">載入中…</div>}
      {tasks !== null && tasks.length === 0 && (
        <div className="empty">
          還沒有任務。<Link to="/new">建立第一個調研任務</Link>
        </div>
      )}

      <div className="task-grid">
        {(tasks ?? [])
          .slice()
          .sort((a, b) => b.id - a.id)
          .map((t) => {
            const crew = parseConfig(t.configJson).crew ?? [];
            return (
              <Link key={t.id} to={`/tasks/${t.id}`} className="card task-card">
                <div className="task-card-top">
                  <span className="task-id mono">#{t.id}</span>
                  <TaskStatusBadge status={t.status} />
                </div>
                <h3>{t.title || `任務 #${t.id}`}</h3>
                <p className="goal">{truncate(t.goal, 140)}</p>
                <div className="task-card-meta">
                  <span title={crew.map((m) => m.model).join('、')}>
                    編隊 {crew.length} 模型
                  </span>
                  <span>建立於 {timeAgo(t.createdAt)}</span>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
