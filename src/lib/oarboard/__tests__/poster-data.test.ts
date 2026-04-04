import { describe, expect, it } from 'vitest';

import { buildPosterHeroData, buildTodayPosterHeroData } from '../poster-data';
import type { MokeWorkoutRecord } from '../../moke/types.js';

const record: MokeWorkoutRecord = {
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
};

describe('buildPosterHeroData', () => {
  it('creates page-ready hero data from a workout record', () => {
    const result = buildPosterHeroData(record);
    expect(result.dateLabel).toBe('2026-03-31');
    expect(result.primaryValue).toBe('00:14:51');
    expect(result.averageRpm).toBe('33.00');
    expect(result.totalTurns).toBe('439');
    expect(result.calorie).toEqual({ value: 212, goal: 200 });
    expect(result.duration).toEqual({ value: 891, goal: 900 });
    expect(result.distance).toEqual({ value: 2890, goal: 3000 });
  });
});

describe('buildTodayPosterHeroData', () => {
  it('aggregates multiple records from the same day for the hero panel', () => {
    const result = buildTodayPosterHeroData([
      {
        ...record,
        _id: 'a',
        day: '2026-04-04',
        month: '2026-04',
        sumMileage: 1.2,
        sumCalorie: 80,
        sumDuration: 300,
        turns: '100',
        paceList: '12,12',
        rpmList: '24,24',
      },
      {
        ...record,
        _id: 'b',
        day: '2026-04-04',
        month: '2026-04',
        sumMileage: 1.8,
        sumCalorie: 134,
        sumDuration: 480,
        turns: '180',
        paceList: '13,13',
        rpmList: '28,28',
      },
    ], '2026-04-04');

    expect(result.dateLabel).toBe('2026-04-04');
    expect(result.primaryValue).toBe('00:13:00');
    expect(result.totalTurns).toBe('280');
    expect(result.calorie).toEqual({ value: 214, goal: 200 });
    expect(result.distance).toEqual({ value: 3000, goal: 3000 });
  });

  it('returns an empty-state hero when there are no records today', () => {
    const result = buildTodayPosterHeroData([], '2026-04-04');

    expect(result.dateLabel).toBe('2026-04-04');
    expect(result.primaryValue).toBe('00:00:00');
    expect(result.totalTurns).toBe('0');
    expect(result.calorie).toEqual({ value: 0, goal: 200 });
  });
});
