/**
 * Shared domain types for the OpenCompany platform.
 */

// ---------- models & providers ----------

export type ProviderKind =
  | 'openrouter'
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'ollama'
  | 'mock';

/** A model reference: "<provider>/<model-id>", e.g. "openrouter/anthropic/claude-sonnet-4.5" */
export type ModelRef = string;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** present on assistant messages that request tool calls */
  toolCalls?: ToolCall[];
  /** present on tool result messages */
  toolCallId?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolSpec {
  name: string;
  description: string;
  /** JSON schema for the arguments object */
  parameters: Record<string, unknown>;
}

export interface ChatRequest {
  messages: ChatMessage[];
  tools?: ToolSpec[];
  temperature?: number;
  maxTokens?: number;
  /** ask the model for a JSON object response */
  json?: boolean;
}

export interface ChatUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ChatResponse {
  content: string;
  toolCalls: ToolCall[];
  usage: ChatUsage;
  raw?: unknown;
}

export interface ModelInfo {
  ref: ModelRef;
  provider: ProviderKind;
  id: string;
  label: string;
  available: boolean;
}

// ---------- pipeline & tasks ----------

export type RoleName = 'planner' | 'researcher' | 'critic' | 'synthesizer' | 'retro';

/** Up to 4 distinct models, each assigned one or more roles. */
export interface CrewMember {
  /** display name chosen by the user, e.g. "Scout" */
  name: string;
  model: ModelRef;
  roles: RoleName[];
}

export interface TaskBudget {
  maxSteps: number;
  maxMinutes: number;
  /** stop when estimated total tokens exceed this */
  maxTokens: number;
}

export interface TaskConfig {
  crew: CrewMember[];
  budget: TaskBudget;
  /** id of the playbook version steering this task */
  playbookId?: number;
  /** how many parallel research subtopics the planner should aim for */
  breadth: number;
  /** extra standing instructions from the user */
  instructions?: string;
}

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export interface StepRow {
  id: number;
  taskId: number;
  idx: number;
  stage: string;
  role: RoleName;
  member: string;
  model: ModelRef;
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

export interface EventRow {
  id: number;
  taskId: number;
  ts: string;
  type: string;
  payloadJson: string;
}

export interface ArtifactRow {
  id: number;
  taskId: number;
  name: string;
  mime: string;
  content: string;
  createdAt: string;
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
