import { describe, expect, it } from 'vitest';

import { buildTimeMachineEntry } from '../time-machine-data';
import type { MokeWorkoutRecord } from '../../moke/types.js';

const baseRecord: MokeWorkoutRecord = {
  _id: 'rec-1',
  accountId: 'account',
  deviceType: '2',
  sumMileage: 2.86,
  sumCalorie: 200,
  sumDuration: 756,
  startTime: '2025-04-06 12:05:30.754371',
  turns: '404',
  paceList: '13.6,13.8,14.0',
  rpmList: '30,31,32',
  createTime: '2025-04-06T12:23:16.223Z',
  day: '2025-04-06',
  year: '2025',
  month: '2025-04',
};

describe('buildTimeMachineEntry', () => {
  it('builds a same-day-last-year entry and compares it to today', () => {
    const result = buildTimeMachineEntry(
      [baseRecord],
      [{ ...baseRecord, _id: 'today-1', day: '2026-04-06', year: '2026', month: '2026-04', sumMileage: 3.26, sumDuration: 780, paceList: '14.2,14.4,14.6' }],
      '2026-04-06',
    );

    expect(result?.label).toBe('一年前的今天 · 2025-04-06');
    expect(result?.distance).toBe('2.86 km');
    expect(result?.duration).toBe('00:12:36');
    expect(result?.pace).toBe('02:10/500m');
    expect(result?.comparison).toMatchObject({
      distanceDelta: '+0.40 km',
      distancePositive: true,
      pacePositive: true,
    });
  });

  it('falls back to 30 days ago when last year has no match', () => {
    const result = buildTimeMachineEntry(
      [{ ...baseRecord, _id: 'fallback', day: '2026-03-07', year: '2026', month: '2026-03' }],
      [],
      '2026-04-06',
    );

    expect(result?.label).toBe('30天前 · 2026-03-07');
    expect(result?.comparison).toBeNull();
  });

  it('returns null when no historical match exists', () => {
    const result = buildTimeMachineEntry([], [], '2026-04-06');

    expect(result).toBeNull();
  });
});
