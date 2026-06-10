import type {ChatMessage, ChatRequest, ChatResponse, ModelInfo, ToolCall} from '../types.js';
import {fetchWithRetry, type Provider} from './base.js';

const CURATED = ['gemini-2.5-pro', 'gemini-2.5-flash'];

interface GPart {
  text?: string;
  functionCall?: {name: string; args: Record<string, unknown>};
  functionResponse?: {name: string; response: Record<string, unknown>};
}

export class GoogleProvider implements Provider {
  readonly kind = 'google' as const;

  constructor(private readonly apiKey?: string) {}

  available(): boolean {
    return Boolean(this.apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    return CURATED.map((id) => ({
      ref: `google/${id}`,
      provider: 'google',
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
    const contents: {role: 'user' | 'model'; parts: GPart[]}[] = [];
    for (const m of req.messages) {
      if (m.role === 'system') continue;
      if (m.role === 'assistant') {
        const parts: GPart[] = [];
        if (m.content) parts.push({text: m.content});
        for (const tc of m.toolCalls ?? []) {
          parts.push({functionCall: {name: tc.name, args: tc.arguments}});
        }
        contents.push({role: 'model', parts});
      } else if (m.role === 'tool') {
        contents.push({
          role: 'user',
          parts: [{functionResponse: {name: m.name ?? 'tool', response: {result: m.content}}}],
        });
      } else {
        contents.push({role: 'user', parts: [{text: m.content}]});
      }
    }

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.4,
        maxOutputTokens: req.maxTokens ?? 8192,
        ...(req.json ? {responseMimeType: 'application/json'} : {}),
      },
    };
    if (system) body.systemInstruction = {parts: [{text: system}]};
    if (req.tools?.length) {
      body.tools = [
        {
          functionDeclarations: req.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    const res = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${this.apiKey}`,
      {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)}
    );
    const data = (await res.json()) as {
      candidates?: {content?: {parts?: GPart[]}}[];
      usageMetadata?: {promptTokenCount?: number; candidatesTokenCount?: number};
    };
    let content = '';
    const toolCalls: ToolCall[] = [];
    let i = 0;
    for (const part of data.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) content += part.text;
      if (part.functionCall) {
        toolCalls.push({
          id: `g_${Date.now()}_${i++}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args ?? {},
        });
      }
    }
    return {
      content,
      toolCalls,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }
}
