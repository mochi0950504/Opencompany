/** Mirror of the backend API contract (camelCase rows). */

export type RoleName = 'planner' | 'researcher' | 'critic' | 'synthesizer' | 'retro';

export interface CrewMember {
  name: string;
  model: string;
  roles: RoleName[];
}

export interface TaskBudget {
  maxSteps: number;
  maxMinutes: number;
  maxTokens: number;
}

export interface TaskConfig {
  crew: CrewMember[];
  budget: TaskBudget;
  breadth: number;
  instructions?: string;
  playbookId?: number;
}

export type TaskStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export interface TaskRow {
  id: number;
  title: string;
  goal: string;
  status: TaskStatus;
  configJson: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface StepRow {
  id: number;
  taskId: number;
  idx: number;
  stage: string;
  role: RoleName;
  member: string;
  model: string;
  title: string;
  status: StepStatus;
  inputJson: string | null;
  outputJson: string | null;
  inputTokens: number;
  outputTokens: number;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface ArtifactRow {
  id: number;
  taskId: number;
  name: string;
  mime: string;
  content: string;
  createdAt: string;
}

export interface EventRow {
  id: number;
  taskId: number;
  ts: string;
  type: string;
  payloadJson: string;
}

export interface MemoryRow {
  id: number;
  kind: 'finding' | 'lesson' | 'fact';
  title: string;
  content: string;
  tags: string;
  sourceTaskId: number | null;
  createdAt: string;
}

export interface PlaybookRow {
  id: number;
  name: string;
  version: number;
  content: string;
  rationale: string | null;
  active: number;
  createdAt: string;
}

export type ToolStatus = 'builtin' | 'approved' | 'pending' | 'disabled' | 'rejected';

export interface ToolRow {
  id: number;
  name: string;
  description: string;
  parametersJson: string;
  code: string | null;
  status: ToolStatus;
  origin: 'builtin' | 'agent' | 'user';
  sourceTaskId: number | null;
  createdAt: string;
}

export interface ModelInfo {
  ref: string;
  provider: string;
  id: string;
  label: string;
  available: boolean;
}

export interface ProviderStatus {
  kind: string;
  available: boolean;
}

export interface ProvidersResponse {
  providers: ProviderStatus[];
  models: ModelInfo[];
}

export interface TaskDetail {
  task: TaskRow;
  steps: StepRow[];
  artifacts: ArtifactRow[];
}
