import { describe, expect, it } from 'vitest';

import { addMissingWorkoutTotals, mergeWorkoutRecords, summarizeWorkoutTotals } from '../today-data';
import type { MokeWorkoutRecord } from '../../moke/types.js';

function makeRecord(id: string, day: string, mileage: number, startTime = '08:00:00'): MokeWorkoutRecord {
  return {
    _id: id,
    accountId: 'account',
    deviceType: '2',
    sumMileage: mileage,
    sumCalorie: 100,
    sumDuration: 600,
    startTime: `${day} ${startTime}`,
    turns: '300',
    paceList: '12,13,14',
    rpmList: '28,30,32',
    createTime: `${day}T08:10:00.000Z`,
    day,
    year: day.slice(0, 4),
    month: day.slice(0, 7),
  };
}

describe('mergeWorkoutRecords', () => {
  it('dedupes by id and keeps newest records first', () => {
    const existing = [makeRecord('1', '2026-04-06', 2.5), makeRecord('2', '2026-04-05', 2.2)];
    const incoming = [makeRecord('3', '2026-04-06', 3.1, '09:00:00'), makeRecord('1', '2026-04-06', 2.5)];

    expect(mergeWorkoutRecords(existing, incoming).map((record) => record._id)).toEqual(['3', '1', '2']);
  });
});

describe('addMissingWorkoutTotals', () => {
  it('only adds totals for records not already present', () => {
    const existing = [makeRecord('1', '2026-04-06', 2.5)];
    const incoming = [makeRecord('1', '2026-04-06', 2.5), makeRecord('2', '2026-04-06', 3.1)];

    expect(
      addMissingWorkoutTotals(
        { totalDistance: 10, totalCalorie: 500, totalDuration: 3600, sportCount: 4 },
        existing,
        incoming,
      ),
    ).toEqual({
      totalDistance: 13.1,
      totalCalorie: 600,
      totalDuration: 4200,
      sportCount: 5,
    });
  });
});

describe('summarizeWorkoutTotals', () => {
  it('summarizes distance, calories, duration, and count', () => {
    const records = [makeRecord('1', '2026-04-06', 2.5), makeRecord('2', '2026-04-07', 3.1)];

    expect(summarizeWorkoutTotals(records)).toEqual({
      totalDistance: 5.6,
      totalCalorie: 200,
      totalDuration: 1200,
      sportCount: 2,
    });
  });
});
