import type {
  McpServer,
  MemoryRow,
  PlaybookRow,
  ProvidersResponse,
  TaskDetail,
  TaskRow,
  ToolRow,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: init?.body ? {'content-type': 'application/json'} : undefined,
    ...init,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as {error?: string};
      if (data?.error) message = data.error;
    } catch {
      // 保留預設訊息
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export const api = {
  providers: () => request<ProvidersResponse>('/api/providers'),
  listTasks: () => request<TaskRow[]>('/api/tasks'),
  getTask: (id: number | string) => request<TaskDetail>(`/api/tasks/${id}`),
  createTask: (body: unknown) =>
    request<TaskRow>('/api/tasks', {method: 'POST', body: JSON.stringify(body)}),
  taskAction: (id: number | string, action: 'pause' | 'resume' | 'cancel') =>
    request<{ok: boolean}>(`/api/tasks/${id}/${action}`, {method: 'POST'}),
  memories: (q: string) =>
    request<MemoryRow[]>(`/api/memories${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  playbooks: () => request<PlaybookRow[]>('/api/playbooks'),
  activatePlaybook: (id: number) =>
    request<{ok: boolean}>(`/api/playbooks/${id}/activate`, {method: 'POST'}),
  tools: () => request<ToolRow[]>('/api/tools'),
  setToolStatus: (id: number, status: 'approved' | 'disabled' | 'rejected') =>
    request<{ok: boolean}>(`/api/tools/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({status}),
    }),
  mcpServers: () => request<McpServer[]>('/api/mcp'),
  addMcpServer: (body: {name: string; command: string; args?: string[]}) =>
    request<McpServer>('/api/mcp', {method: 'POST', body: JSON.stringify(body)}),
  mcpAction: (id: number, action: 'enable' | 'disable' | 'refresh') =>
    request<{ok: boolean}>(`/api/mcp/${id}/${action}`, {method: 'POST'}),
  removeMcpServer: (id: number) =>
    request<{ok: boolean}>(`/api/mcp/${id}`, {method: 'DELETE'}),
};
