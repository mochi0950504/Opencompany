import type {ChatRequest, ChatResponse, ModelInfo, ProviderKind} from '../types.js';

export interface Provider {
  kind: ProviderKind;
  /** true when the credentials / endpoint needed are configured */
  available(): boolean;
  /** curated or fetched list of models for the picker */
  listModels(): Promise<ModelInfo[]>;
  chat(modelId: string, req: ChatRequest): Promise<ChatResponse>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean
  ) {
    super(message);
  }
}

/** fetch with timeout + bounded exponential backoff on retryable failures */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  {retries = 4, timeoutMs = 120_000}: {retries?: number; timeoutMs?: number} = {}
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {...init, signal: AbortSignal.timeout(timeoutMs)});
      if (res.ok) return res;
      const body = await res.text().catch(() => '');
      const retryable = res.status === 429 || res.status >= 500;
      const err = new ProviderError(`HTTP ${res.status}: ${body.slice(0, 400)}`, retryable);
      if (!retryable || attempt === retries) throw err;
      lastErr = err;
    } catch (e) {
      if (e instanceof ProviderError) {
        lastErr = e;
      } else {
        // network/timeout errors are retryable
        lastErr = new ProviderError(String(e), true);
      }
      if (attempt === retries || !(lastErr as ProviderError).retryable) throw lastErr;
    }
    await new Promise((r) => setTimeout(r, Math.min(30_000, 1500 * 2 ** attempt)));
  }
  throw lastErr;
}
