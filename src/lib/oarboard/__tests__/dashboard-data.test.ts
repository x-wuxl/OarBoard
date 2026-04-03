import { describe, expect, it } from 'vitest';

import { buildDashboardData } from '../dashboard-data';
import type { MokeWorkoutRecord, MokeWorkoutTotals } from '../../moke/types';

const records: MokeWorkoutRecord[] = [
  {
    _id: '69cb67e0a3ef2b13719ef74c',
    accountId: 'd8f55f82984a45979e7bda2aa1c28172',
    deviceType: '2',
    sumMileage: 2.89,
    sumCalorie: 212,
    sumDuration: 891,
    startTime: '2026-03-31 14:04:09.206117',
    turns: '439',
    paceList: '0.0,14.28,13.02,13.86,14.28',
    rpmList: '0,34,31,33,34',
    createTime: '2026-03-31T14:21:20.592Z',
    day: '2026-03-31',
    year: '2026',
    month: '2026-03',
  },
  {
    _id: '69ca163fa3ef2b13719eedc1',
    accountId: 'd8f55f82984a45979e7bda2aa1c28172',
    deviceType: '2',
    sumMileage: 2.8,
    sumCalorie: 200,
    sumDuration: 821,
    startTime: '2026-03-30 14:03:47.937197',
    turns: '409',
    paceList: '7.59,13.86,16.8',
    rpmList: '23,33,35',
    createTime: '2026-03-30T14:20:47.443Z',
    day: '2026-03-30',
    year: '2026',
    month: '2026-03',
  },
];

const totals: MokeWorkoutTotals = {
  totalCalorie: 412,
  totalDistance: 5.69,
  totalDuration: 1712,
  sportCount: 2,
};

describe('buildDashboardData', () => {
  it('creates summary cards, history rows, and detail props from live workout data', () => {
    const result = buildDashboardData(records, totals);
    expect(result.summaryCards).toEqual([
      { id: 'duration', label: '总运动时长', value: '00:28:32' },
      { id: 'calorie', label: '总消耗', value: '412 kcal' },
      { id: 'distance', label: '总运动距离', value: '5.69 km' },
    ]);
    expect(result.historyRows).toHaveLength(2);
    expect(result.historyRows[0]).toMatchObject({
      id: '69cb67e0a3ef2b13719ef74c',
      duration: '00:14:51',
      distance: '2.89 km',
    });
    expect(result.historyRows[0].title).toMatch(/3月31日/);
    expect(result.historyRows[1]).toMatchObject({
      id: '69ca163fa3ef2b13719eedc1',
      duration: '00:13:41',
      distance: '2.80 km',
    });
    expect(result.historyRows[1].title).toMatch(/3月30日/);
    expect(result.selectedWorkoutId).toBe('69cb67e0a3ef2b13719ef74c');
  });
});
