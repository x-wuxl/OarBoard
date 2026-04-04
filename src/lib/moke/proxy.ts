import { getMokeRequestPolicy } from './request-policy';

export function buildUpstreamUrl(baseUrl: string, path: string[], searchParams: URLSearchParams): URL {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const pathname = path.join('/');
  const url = new URL(`${normalizedBaseUrl}/mokfitness/new/api/${pathname}`);

  for (const [key, value] of searchParams.entries()) {
    url.searchParams.append(key, value);
  }

  return url;
}

export function buildProxyHeaders(input: { authorization?: string; contentType?: string }): Record<string, string> {
  const headers: Record<string, string> = {};

  if (input.authorization) {
    headers.authorization = input.authorization;
  }

  if (input.contentType) {
    headers['content-type'] = input.contentType;
  }

  return headers;
}

export function shouldUseMockData(authorization?: string): boolean {
  return !authorization;
}

export function buildProxyFetchOptions(
  path: string,
  input: { method: string; headers: Record<string, string>; body?: string },
): {
  method: string;
  headers: Record<string, string>;
  body?: string;
  cache: RequestCache;
  next?: { revalidate: number };
  timeoutMs: number;
} {
  const policy = getMokeRequestPolicy(`/${path}`);

  return {
    method: input.method,
    headers: input.headers,
    body: input.body,
    cache: policy.nextRevalidate ? 'force-cache' : 'no-store',
    next: policy.nextRevalidate ? { revalidate: policy.nextRevalidate } : undefined,
    timeoutMs: policy.timeoutMs,
  };
}

export function buildProxyErrorResponse(error: unknown) {
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      status: 504,
      body: {
        code: 504,
        message: 'Upstream request timed out',
      },
    };
  }

  const message = error instanceof Error ? error.message : 'Upstream request failed';
  const normalized = message.toLowerCase();

  if (normalized.includes('401') || normalized.includes('403')) {
    return {
      status: 401,
      body: {
        code: 401,
        message: 'Authorization token is invalid or expired',
      },
    };
  }

  return {
    status: 502,
    body: {
      code: 502,
      message: 'Upstream service is unavailable',
    },
  };
}
