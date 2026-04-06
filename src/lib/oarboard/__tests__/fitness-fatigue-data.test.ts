import { describe, expect, it } from 'vitest';

import { buildFitnessFatigueData } from '../fitness-fatigue-data';
import type { MokeWorkoutRecord } from '../../moke/types.js';

const makeRecord = (day: string, mileage: number, duration: number): MokeWorkoutRecord => ({
  _id: day,
  accountId: 'account',
  deviceType: '2',
  sumMileage: mileage,
  sumCalorie: 100,
  sumDuration: duration,
  startTime: `${day} 07:00:00`,
  turns: '300',
  paceList: '12,13,14',
  rpmList: '28,30,32',
  createTime: `${day}T07:10:00.000Z`,
  day,
  year: day.slice(0, 4),
  month: day.slice(0, 7),
});

describe('buildFitnessFatigueData', () => {
  it('returns an empty-state status when there are no records', () => {
    const result = buildFitnessFatigueData([], '2026-04-06');

    expect(result.points).toEqual([]);
    expect(result.status.label).toBe('暂无数据');
  });

  it('builds daily CTL/ATL/TSB points for the last 90 days', () => {
    const result = buildFitnessFatigueData([
      makeRecord('2026-03-28', 2.5, 700),
      makeRecord('2026-03-30', 2.8, 821),
      makeRecord('2026-04-02', 3.1, 840),
      makeRecord('2026-04-05', 2.2, 660),
    ], '2026-04-06');

    expect(result.points.length).toBeGreaterThan(0);
    expect(result.points.at(-1)?.date).toBe('2026-04-06');
    expect(result.points.some((point) => point.dailyLoad > 0)).toBe(true);
    expect(result.points.at(-1)?.ctl).toBeGreaterThanOrEqual(0);
    expect(result.points.at(-1)?.atl).toBeGreaterThanOrEqual(0);
    expect(typeof result.status.tsb).toBe('number');
  });

  it('marks a recent training block followed by rest as recovered', () => {
    const result = buildFitnessFatigueData([
      makeRecord('2026-03-20', 4, 1200),
      makeRecord('2026-03-21', 4, 1200),
      makeRecord('2026-03-22', 4, 1200),
      makeRecord('2026-03-23', 4, 1200),
      makeRecord('2026-03-24', 4, 1200),
      makeRecord('2026-03-25', 4, 1200),
      makeRecord('2026-03-26', 4, 1200),
    ], '2026-04-06');

    expect(result.status.level).toBe('fresh');
    expect(result.status.label).toBe('恢复充足');
  });
});
