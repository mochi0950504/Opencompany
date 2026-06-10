import type {RoleName, StepStatus, TaskConfig, TaskStatus, ToolStatus} from './types';

/** 後端時間戳為 UTC 的 "YYYY-MM-DD HH:MM:SS"，轉成 Date。 */
export function parseTs(ts: string | null | undefined): Date | null {
  if (!ts) return null;
  const normalized = /Z|[+-]\d{2}:\d{2}$/.test(ts) ? ts : `${ts.replace(' ', 'T')}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fmtDateTime(ts: string | null | undefined): string {
  const d = parseTs(ts);
  if (!d) return '—';
  return d.toLocaleString('zh-TW', {hour12: false});
}

export function timeAgo(ts: string | null | undefined): string {
  const d = parseTs(ts);
  if (!d) return '—';
  const diff = Math.max(0, Date.now() - d.getTime());
  const s = Math.floor(diff / 1000);
  if (s < 10) return '剛剛';
  if (s < 60) return `${s} 秒前`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分鐘前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小時前`;
  return `${Math.floor(h / 24)} 天前`;
}

export function fmtNum(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString('en-US');
}

export function parseConfig(configJson: string): Partial<TaskConfig> {
  try {
    return JSON.parse(configJson) as TaskConfig;
  } catch {
    return {};
  }
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  queued: '排隊中',
  running: '執行中',
  paused: '已暫停',
  completed: '已完成',
  failed: '失敗',
  cancelled: '已取消',
};

export const STEP_STATUS_LABEL: Record<StepStatus, string> = {
  pending: '待執行',
  running: '執行中',
  done: '完成',
  failed: '失敗',
  skipped: '略過',
};

export const ROLE_LABEL: Record<RoleName, string> = {
  planner: '規劃',
  researcher: '調研',
  critic: '批判',
  synthesizer: '綜合',
  retro: '檢討',
};

export const ALL_ROLES: RoleName[] = ['planner', 'researcher', 'critic', 'synthesizer', 'retro'];

export const STAGES: Array<{key: string; label: string}> = [
  {key: 'plan', label: '規劃'},
  {key: 'research', label: '調研'},
  {key: 'critique', label: '批判'},
  {key: 'synthesize', label: '綜合'},
  {key: 'retro', label: '檢討'},
];

export const TOOL_STATUS_LABEL: Record<ToolStatus, string> = {
  builtin: '內建',
  approved: '已核准',
  pending: '待審核',
  disabled: '已停用',
  rejected: '已拒絕',
};

export const MEMORY_KIND_LABEL: Record<string, string> = {
  finding: '發現',
  lesson: '教訓',
  fact: '事實',
};

export const EVENT_TYPES = [
  'task.created',
  'task.status',
  'task.halted',
  'task.completed',
  'step.created',
  'step.started',
  'step.done',
  'step.failed',
  'tool.call',
  'artifact.created',
  'growth.lesson',
  'growth.playbook',
  'growth.tool_proposed',
  'budget.pressure',
];
