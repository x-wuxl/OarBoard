import { describe, expect, it } from 'vitest';

import {
  formatDistanceKm,
  formatDuration,
  formatPacePer500m,
  formatTimestamp,
  parseNumberSeries,
} from '../formatters.js';

describe('formatDuration', () => {
  it('formats seconds into HH:mm:ss', () => {
    expect(formatDuration(821)).toBe('00:13:41');
    expect(formatDuration(64761)).toBe('17:59:21');
  });

  it('handles missing and negative values as zero duration', () => {
    expect(formatDuration(undefined)).toBe('00:00:00');
    expect(formatDuration(-10)).toBe('00:00:00');
  });
});

describe('formatDistanceKm', () => {
  it('formats meters to kilometers with two decimals', () => {
    expect(formatDistanceKm(2800)).toBe('2.80 km');
    expect(formatDistanceKm(190990)).toBe('190.99 km');
  });
});

describe('formatPacePer500m', () => {
  it('converts km/h speed into rowing pace per 500m', () => {
    expect(formatPacePer500m(13.86)).toBe('02:10/500m');
    expect(formatPacePer500m(7.59)).toBe('03:57/500m');
  });

  it('returns placeholder for invalid speed', () => {
    expect(formatPacePer500m(0)).toBe('--:--/500m');
    expect(formatPacePer500m(undefined)).toBe('--:--/500m');
  });
});

describe('formatTimestamp', () => {
  it('formats timestamps to YYYY-MM-DD HH:mm', () => {
    expect(formatTimestamp('2026-03-30T14:20:47.443Z')).toBe('2026-03-30 22:20');
    expect(formatTimestamp('2026-03-30 14:03:47.937197')).toBe('2026-03-30 14:03');
  });
});

describe('parseNumberSeries', () => {
  it('parses comma separated numeric series', () => {
    expect(parseNumberSeries('7.59,13.86,16.8')).toEqual([7.59, 13.86, 16.8]);
    expect(parseNumberSeries('0')).toEqual([0]);
  });

  it('filters empty and invalid values', () => {
    expect(parseNumberSeries('1,,abc,2')).toEqual([1, 0, 2]);
    expect(parseNumberSeries(undefined)).toEqual([]);
  });
});
