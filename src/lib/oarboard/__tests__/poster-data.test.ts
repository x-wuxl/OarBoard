import { describe, expect, it } from 'vitest';

import { buildPosterHeroData } from '../poster-data';
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
