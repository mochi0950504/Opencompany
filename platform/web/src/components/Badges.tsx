import type {StepStatus, TaskStatus, ToolStatus} from '../types';
import {STEP_STATUS_LABEL, TASK_STATUS_LABEL, TOOL_STATUS_LABEL} from '../utils';

export function TaskStatusBadge({status}: {status: TaskStatus}) {
  return <span className={`badge st-${status}`}>{TASK_STATUS_LABEL[status] ?? status}</span>;
}

export function StepStatusBadge({status}: {status: StepStatus}) {
  return <span className={`badge st-${status}`}>{STEP_STATUS_LABEL[status] ?? status}</span>;
}

export function ToolStatusBadge({status}: {status: ToolStatus}) {
  return <span className={`badge tool-${status}`}>{TOOL_STATUS_LABEL[status] ?? status}</span>;
}

const EVENT_TONE: Record<string, string> = {
  'task.status': 'ev-info',
  'task.created': 'ev-info',
  'task.completed': 'ev-ok',
  'task.halted': 'ev-warn',
  'step.created': 'ev-muted',
  'step.started': 'ev-info',
  'step.done': 'ev-ok',
  'step.failed': 'ev-bad',
  'tool.call': 'ev-cyan',
  'artifact.created': 'ev-cyan',
  'growth.lesson': 'ev-amber',
  'growth.playbook': 'ev-amber',
  'growth.tool_proposed': 'ev-amber',
  'budget.pressure': 'ev-warn',
};

export function EventTypeBadge({type}: {type: string}) {
  return <span className={`badge ev ${EVENT_TONE[type] ?? 'ev-muted'}`}>{type}</span>;
}
