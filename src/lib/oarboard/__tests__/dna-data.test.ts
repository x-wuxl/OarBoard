import { describe, expect, it } from 'vitest';

import { buildDnaFingerprint, buildDnaMap, valueToColor } from '../dna-data';
import type { MokeWorkoutRecord } from '../../moke/types.js';

const baseRecord: MokeWorkoutRecord = {
  _id: 'rec-1',
  accountId: 'account',
  deviceType: '2',
  sumMileage: 2.8,
  sumCalorie: 200,
  sumDuration: 821,
  startTime: '2026-03-30 14:03:47.937197',
  turns: '409',
  paceList: '12,12.5,13,13.5',
  rpmList: '23,33,35,32',
  createTime: '2026-03-30T14:20:47.443Z',
  day: '2026-03-30',
  year: '2026',
  month: '2026-03',
};

describe('valueToColor', () => {
  it('maps normalized values into the OarBoard palette', () => {
    expect(valueToColor(0)).toBe('#0c1929');
    expect(valueToColor(0.6)).toBe('#22d3ee');
    expect(valueToColor(1)).toBe('#ecfccb');
  });
});

describe('buildDnaFingerprint', () => {
  it('builds normalized segments and classifies an improving workout', () => {
    const result = buildDnaFingerprint(baseRecord);

    expect(result.segments).toHaveLength(4);
    expect(result.segments[0]).toMatchObject({ index: 0, value: 0, color: '#0c1929' });
    expect(result.segments[3]).toMatchObject({ index: 3, value: 1, color: '#ecfccb' });
    expect(result.rhythmType).toBe('negative-split');
    expect(result.rhythmLabel).toBe('渐入佳境');
  });

  it('returns unknown when there is no usable pace data', () => {
    const result = buildDnaFingerprint({ ...baseRecord, _id: 'rec-2', paceList: '0,0,0' });

    expect(result.segments).toEqual([]);
    expect(result.rhythmType).toBe('unknown');
    expect(result.rhythmLabel).toBe('数据不足');
  });

  it('marks short series as unknown while still returning segments', () => {
    const result = buildDnaFingerprint({ ...baseRecord, _id: 'rec-3', paceList: '12,13' });

    expect(result.segments).toHaveLength(2);
    expect(result.rhythmType).toBe('unknown');
  });
});

describe('buildDnaMap', () => {
  it('includes only workouts that have usable segments', () => {
    const map = buildDnaMap([
      baseRecord,
      { ...baseRecord, _id: 'rec-2', paceList: '0,0' },
      { ...baseRecord, _id: 'rec-3', paceList: '13,13,13' },
    ]);

    expect([...map.keys()]).toEqual(['rec-1', 'rec-3']);
    expect(map.get('rec-3')?.segments).toHaveLength(3);
  });
});
