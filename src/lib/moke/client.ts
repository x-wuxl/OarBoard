const DEFAULT_BASE_URL = process.env.MOKE_BASE_URL ?? 'http://data.mokfitness.cn';
const API_PREFIX = '/mokfitness/new/api';

import { getMokeRequestPolicy } from './request-policy';

export interface MokeClientOptions {
  baseUrl?: string;
  authorization?: string;
  fetchImpl?: typeof fetch;
}

export class MokeApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly payload?: unknown,
    public readonly code?: 'timeout' | 'unauthorized' | 'upstream',
  ) {
    super(message);
    this.name = 'MokeApiError';
  }
}

export class MokeClient {
  private readonly baseUrl: string;
  private readonly authorization?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: MokeClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.authorization = options.authorization;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${API_PREFIX}${path}`);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const policy = getMokeRequestPolicy(path);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), policy.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          ...(this.authorization ? { authorization: this.authorization } : {}),
        },
        cache: policy.nextRevalidate ? 'force-cache' : 'no-store',
        ...(policy.nextRevalidate ? { next: { revalidate: policy.nextRevalidate } } : {}),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new MokeApiError(
          `Moke API request failed with status ${response.status}`,
          response.status,
          payload,
          response.status === 401 || response.status === 403 ? 'unauthorized' : 'upstream',
        );
      }

      return payload as T;
    } catch (error) {
      if (error instanceof MokeApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new MokeApiError('Moke API request timed out', 504, null, 'timeout');
      }

      throw new MokeApiError('Moke API request failed', 502, error, 'upstream');
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createMokeClient(options?: MokeClientOptions): MokeClient {
  return new MokeClient(options);
}
