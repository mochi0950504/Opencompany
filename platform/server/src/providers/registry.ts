import type {ChatRequest, ChatResponse, ModelInfo} from '../types.js';
import type {Provider} from './base.js';
import {AnthropicProvider} from './anthropic.js';
import {GoogleProvider} from './google.js';
import {MockProvider} from './mock.js';
import {OpenAICompatProvider} from './openai_compat.js';

const OPENROUTER_CURATED = [
  'anthropic/claude-sonnet-4.6',
  'anthropic/claude-opus-4.8',
  'openai/gpt-5.2',
  'openai/gpt-5-mini',
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'x-ai/grok-4',
  'deepseek/deepseek-chat-v3.1',
  'qwen/qwen3-235b-a22b',
  'meta-llama/llama-4-maverick',
];

export class ProviderRegistry {
  private readonly providers = new Map<string, Provider>();

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.register(
      new OpenAICompatProvider({
        kind: 'openrouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: env.OPENROUTER_API_KEY,
        curatedModels: OPENROUTER_CURATED,
      })
    );
    this.register(new AnthropicProvider(env.ANTHROPIC_API_KEY));
    this.register(
      new OpenAICompatProvider({
        kind: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: env.OPENAI_API_KEY,
        curatedModels: ['gpt-5.2', 'gpt-5-mini', 'gpt-5-nano'],
      })
    );
    this.register(new GoogleProvider(env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY));
    this.register(
      new OpenAICompatProvider({
        kind: 'ollama',
        baseUrl: (env.OLLAMA_BASE_URL ?? 'http://localhost:11434') + '/v1',
        dynamicModels: true,
      })
    );
    this.register(new MockProvider());
  }

  private register(p: Provider): void {
    this.providers.set(p.kind, p);
  }

  /** "provider/rest-of-model-id" → provider + modelId */
  resolve(ref: string): {provider: Provider; modelId: string} {
    const slash = ref.indexOf('/');
    if (slash < 0) throw new Error(`invalid model ref: ${ref}`);
    const kind = ref.slice(0, slash);
    const modelId = ref.slice(slash + 1);
    const provider = this.providers.get(kind);
    if (!provider) throw new Error(`unknown provider: ${kind}`);
    return {provider, modelId};
  }

  async chat(ref: string, req: ChatRequest): Promise<ChatResponse> {
    const {provider, modelId} = this.resolve(ref);
    return provider.chat(modelId, req);
  }

  async listAllModels(): Promise<ModelInfo[]> {
    const lists = await Promise.all(
      [...this.providers.values()].map((p) => p.listModels().catch(() => []))
    );
    return lists.flat();
  }

  providerStatus(): {kind: string; available: boolean}[] {
    return [...this.providers.values()].map((p) => ({kind: p.kind, available: p.available()}));
  }
}

export const registry = new ProviderRegistry();
