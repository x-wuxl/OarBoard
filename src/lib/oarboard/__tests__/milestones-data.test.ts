import { describe, expect, it } from 'vitest';

import { buildMilestones, buildStreakData } from '../milestones-data';
import type { MokeWorkoutRecord } from '../../moke/types.js';

const makeRecord = (id: string, day: string, mileage: number): MokeWorkoutRecord => ({
  _id: id,
  accountId: 'account',
  deviceType: '2',
  sumMileage: mileage,
  sumCalorie: 100,
  sumDuration: 600,
  startTime: `${day} 08:00:00`,
  turns: '300',
  paceList: '12,13,14',
  rpmList: '28,30,32',
  createTime: `${day}T08:10:00.000Z`,
  day,
  year: day.slice(0, 4),
  month: day.slice(0, 7),
});

describe('buildStreakData', () => {
  it('counts consecutive ISO weeks including the current active week', () => {
    const records = [
      makeRecord('1', '2026-03-23', 2),
      makeRecord('2', '2026-03-30', 2),
      makeRecord('3', '2026-04-06', 2),
      makeRecord('4', '2026-02-23', 2),
      makeRecord('5', '2026-03-02', 2),
    ];

    const result = buildStreakData(records, '2026-04-06');

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.isAtRecord).toBe(true);
  });

  it('skips the current week when it has no training yet', () => {
    const records = [
      makeRecord('1', '2026-03-23', 2),
      makeRecord('2', '2026-03-30', 2),
    ];

    const result = buildStreakData(records, '2026-04-08');

    expect(result.currentStreak).toBe(2);
  });
});

describe('buildMilestones', () => {
  it('returns recent achievements followed by upcoming predictions', () => {
    const records = [
      makeRecord('1', '2026-03-01', 2.5),
      makeRecord('2', '2026-03-05', 3.2),
      makeRecord('3', '2026-03-10', 5.4),
      makeRecord('4', '2026-03-15', 10),
      makeRecord('5', '2026-03-20', 15),
      makeRecord('6', '2026-03-25', 20),
    ];

    const result = buildMilestones(records, 56.1, '2026-04-06');

    expect(result.some((item) => item.id === 'distance-50' && item.achieved)).toBe(true);
    expect(result.some((item) => item.id === 'single-5' && item.achieved)).toBe(true);
    expect(result.some((item) => item.id === 'distance-100' && !item.achieved && item.predictedDate)).toBe(true);
  });

  it('returns an empty list when there are no records', () => {
    expect(buildMilestones([], 0, '2026-04-06')).toEqual([]);
  });
});
