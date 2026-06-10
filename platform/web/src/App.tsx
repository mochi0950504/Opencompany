import {Link, NavLink, Route, Routes} from 'react-router-dom';
import {TasksPage} from './pages/TasksPage';
import {NewTaskPage} from './pages/NewTaskPage';
import {TaskDetailPage} from './pages/TaskDetailPage';
import {GrowthPage} from './pages/GrowthPage';

export function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">
          Open<span className="logo-accent">Company</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            任務總覽
          </NavLink>
          <NavLink to="/new">建立任務</NavLink>
          <NavLink to="/growth">成長中心</NavLink>
        </nav>
        <div className="topbar-right">多模型自主調研平台</div>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<TasksPage />} />
          <Route path="/new" element={<NewTaskPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/growth" element={<GrowthPage />} />
          <Route
            path="*"
            element={
              <div className="empty">
                找不到頁面。<Link to="/">回任務總覽</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
