import type {ChatMessage, ChatRequest, ChatResponse, ModelInfo, ProviderKind, ToolCall} from '../types.js';
import {fetchWithRetry, type Provider} from './base.js';

interface OaiToolCall {
  id: string;
  function: {name: string; arguments: string};
}

interface OaiMessage {
  role: string;
  content: string | null;
  tool_calls?: OaiToolCall[];
  tool_call_id?: string;
  name?: string;
}

function toOai(messages: ChatMessage[]): OaiMessage[] {
  return messages.map((m) => {
    if (m.role === 'assistant' && m.toolCalls?.length) {
      return {
        role: 'assistant',
        content: m.content || null,
        tool_calls: m.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {name: tc.name, arguments: JSON.stringify(tc.arguments)},
        })) as unknown as OaiToolCall[],
      };
    }
    if (m.role === 'tool') {
      return {role: 'tool', content: m.content, tool_call_id: m.toolCallId, name: m.name};
    }
    return {role: m.role, content: m.content};
  });
}

function parseToolCalls(calls: OaiToolCall[] | undefined): ToolCall[] {
  if (!calls) return [];
  return calls.map((c) => {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(c.function.arguments || '{}');
    } catch {
      args = {_raw: c.function.arguments};
    }
    return {id: c.id, name: c.function.name, arguments: args};
  });
}

export interface OpenAICompatOptions {
  kind: ProviderKind;
  baseUrl: string;
  apiKey?: string;
  /** fallback list when the /models endpoint is unavailable or too noisy */
  curatedModels?: string[];
  /** fetch the model list from the endpoint (used by ollama) */
  dynamicModels?: boolean;
}

export class OpenAICompatProvider implements Provider {
  readonly kind: ProviderKind;

  constructor(private readonly opts: OpenAICompatOptions) {
    this.kind = opts.kind;
  }

  available(): boolean {
    if (this.kind === 'ollama') return true; // local endpoint, probed at list time
    return Boolean(this.opts.apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    if (this.opts.dynamicModels) {
      try {
        const res = await fetch(`${this.opts.baseUrl}/models`, {
          headers: this.headers(),
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = (await res.json()) as {data?: {id: string}[]};
          return (data.data ?? []).slice(0, 200).map((m) => this.info(m.id));
        }
      } catch {
        // endpoint not reachable — fall through to curated list
      }
      if (this.kind === 'ollama') return [];
    }
    return (this.opts.curatedModels ?? []).map((id) => this.info(id));
  }

  private info(id: string): ModelInfo {
    return {
      ref: `${this.kind}/${id}`,
      provider: this.kind,
      id,
      label: id,
      available: this.available(),
    };
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {'content-type': 'application/json'};
    if (this.opts.apiKey) h.authorization = `Bearer ${this.opts.apiKey}`;
    if (this.kind === 'openrouter') {
      h['HTTP-Referer'] = 'https://github.com/mochi0950504/Opencompany';
      h['X-Title'] = 'OpenCompany';
    }
    return h;
  }

  async chat(modelId: string, req: ChatRequest): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      model: modelId,
      messages: toOai(req.messages),
      temperature: req.temperature ?? 0.4,
    };
    if (req.maxTokens) body.max_tokens = req.maxTokens;
    if (req.tools?.length) {
      body.tools = req.tools.map((t) => ({
        type: 'function',
        function: {name: t.name, description: t.description, parameters: t.parameters},
      }));
    }
    if (req.json) body.response_format = {type: 'json_object'};

    const res = await fetchWithRetry(`${this.opts.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      choices: {message: OaiMessage}[];
      usage?: {prompt_tokens?: number; completion_tokens?: number};
    };
    const msg = data.choices?.[0]?.message;
    return {
      content: msg?.content ?? '',
      toolCalls: parseToolCalls(msg?.tool_calls),
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }
}
