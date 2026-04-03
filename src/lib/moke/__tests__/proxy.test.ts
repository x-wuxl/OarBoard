import { describe, expect, it } from 'vitest';

import {
  buildProxyHeaders,
  buildUpstreamUrl,
  shouldUseMockData,
} from '../proxy.js';

describe('buildUpstreamUrl', () => {
  it('builds the upstream URL with query string', () => {
    const url = buildUpstreamUrl('http://data.mokfitness.cn', ['obtainSportDetailById'], new URLSearchParams({ sportId: 'abc' }));
    expect(url.toString()).toBe('http://data.mokfitness.cn/mokfitness/new/api/obtainSportDetailById?sportId=abc');
  });
});

describe('buildProxyHeaders', () => {
  it('injects authorization token and preserves content-type when present', () => {
    const headers = buildProxyHeaders({
      authorization: 'Bearer test-token',
      contentType: 'application/json',
    });

    expect(headers.authorization).toBe('Bearer test-token');
    expect(headers['content-type']).toBe('application/json');
  });
});

describe('shouldUseMockData', () => {
  it('uses mock data when authorization is missing', () => {
    expect(shouldUseMockData(undefined)).toBe(true);
    expect(shouldUseMockData('')).toBe(true);
    expect(shouldUseMockData('Bearer real-token')).toBe(false);
  });
});
