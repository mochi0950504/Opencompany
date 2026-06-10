import type {ChatMessage, ChatRequest, ChatResponse, ModelInfo, ToolCall} from '../types.js';
import {fetchWithRetry, type Provider} from './base.js';

const CURATED = ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];

type AnthBlock =
  | {type: 'text'; text: string}
  | {type: 'tool_use'; id: string; name: string; input: Record<string, unknown>}
  | {type: 'tool_result'; tool_use_id: string; content: string};

export class AnthropicProvider implements Provider {
  readonly kind = 'anthropic' as const;

  constructor(private readonly apiKey?: string) {}

  available(): boolean {
    return Boolean(this.apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    return CURATED.map((id) => ({
      ref: `anthropic/${id}`,
      provider: 'anthropic',
      id,
      label: id,
      available: this.available(),
    }));
  }

  async chat(modelId: string, req: ChatRequest): Promise<ChatResponse> {
    const system = req.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const messages: {role: 'user' | 'assistant'; content: AnthBlock[] | string}[] = [];
    for (const m of req.messages) {
      if (m.role === 'system') continue;
      if (m.role === 'assistant' && m.toolCalls?.length) {
        const blocks: AnthBlock[] = [];
        if (m.content) blocks.push({type: 'text', text: m.content});
        for (const tc of m.toolCalls) {
          blocks.push({type: 'tool_use', id: tc.id, name: tc.name, input: tc.arguments});
        }
        messages.push({role: 'assistant', content: blocks});
      } else if (m.role === 'tool') {
        messages.push({
          role: 'user',
          content: [{type: 'tool_result', tool_use_id: m.toolCallId ?? '', content: m.content}],
        });
      } else {
        messages.push({role: m.role as 'user' | 'assistant', content: m.content});
      }
    }

    const body: Record<string, unknown> = {
      model: modelId,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.4,
      messages,
    };
    if (system) body.system = system;
    if (req.tools?.length) {
      body.tools = req.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    const res = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      content: AnthBlock[];
      usage?: {input_tokens?: number; output_tokens?: number};
    };
    let content = '';
    const toolCalls: ToolCall[] = [];
    for (const block of data.content ?? []) {
      if (block.type === 'text') content += block.text;
      if (block.type === 'tool_use') {
        toolCalls.push({id: block.id, name: block.name, arguments: block.input});
      }
    }
    return {
      content,
      toolCalls,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    };
  }
}
