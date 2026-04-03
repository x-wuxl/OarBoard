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
