import { describe, expect, it } from 'vitest';

import {
  getMockResponseForPath,
  hasMockResponseForPath,
  normalizeProxyPath,
} from '../mock-data.js';

describe('normalizeProxyPath', () => {
  it('normalizes catch-all proxy path values', () => {
    expect(normalizeProxyPath(['obtainSportDetailById'])).toBe('/obtainSportDetailById');
    expect(normalizeProxyPath(['nested', 'path'])).toBe('/nested/path');
    expect(normalizeProxyPath([])).toBe('/');
  });
});

describe('mock lookup', () => {
  it('recognizes supported mock endpoints', () => {
    expect(hasMockResponseForPath('/obtainSportDetailById')).toBe(true);
    expect(hasMockResponseForPath('/unknown')).toBe(false);
  });

  it('returns XML-derived mock payloads for known endpoints', () => {
    const detail = getMockResponseForPath('/obtainSportDetailById');
    const totals = getMockResponseForPath('/obtainUserSporTotalByType');
    const totalsData = totals && !Array.isArray(totals.data) && 'sportCount' in totals.data ? totals.data : null;

    expect(detail?.code).toBe(200);
    expect(detail && !Array.isArray(detail.data) ? detail.data._id : null).toBe('69ca163fa3ef2b13719eedc1');
    expect(totalsData?.sportCount).toBe(1);
  });
});
