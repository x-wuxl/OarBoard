import { describe, expect, it } from 'vitest';

import {
  buildDetailMetrics,
  flattenWorkoutGroups,
  toDetailChartPoints,
  toWorkoutHistoryItems,
  toWorkoutListItems,
} from '../service.js';
import type {
  MokeWorkoutDetailResponse,
  MokeWorkoutHistoryResponse,
  MokeWorkoutListResponse,
} from '../types.js';

describe('toWorkoutHistoryItems', () => {
  it('formats workout history entries from the history endpoint', () => {
    const payload: MokeWorkoutHistoryResponse = {
      code: '200',
      data: [
        { _id: '2026-03-31', totalDistance: 0 },
        { _id: '2026-03-30/2026-04-05', totalDistance: 2.8 },
      ],
    };

    expect(toWorkoutHistoryItems(payload)).toEqual([
      {
        _id: '2026-03-31',
        totalDistance: 0,
        label: '2026-03-31',
        formattedDistance: '0.00 km',
      },
      {
        _id: '2026-03-30/2026-04-05',
        totalDistance: 2.8,
        label: '2026-03-30 to 2026-04-05',
        formattedDistance: '2.80 km',
      },
    ]);
  });
});

describe('flattenWorkoutGroups', () => {
  it('flattens grouped workout list responses into rows', () => {
    const payload: MokeWorkoutListResponse = {
      code: 200,
      data: [
        {
          _id: '2026-03',
          dayData: [
            {
              _id: 'sport-1',
              accountId: 'user-1',
              deviceType: '2',
              sumMileage: 2.8,
              sumCalorie: 200,
              sumDuration: 821,
              startTime: '2026-03-30 14:03:47.937197',
              turns: '409',
              paceList: '7.59,13.86',
              rpmList: '23,33',
              createTime: '2026-03-30T14:20:47.443Z',
              day: '2026-03-30',
              year: '2026',
              month: '2026-03',
            },
          ],
        },
      ],
    };

    expect(flattenWorkoutGroups(payload)).toHaveLength(1);
    expect(flattenWorkoutGroups(payload)[0]?._id).toBe('sport-1');
  });
});

describe('toWorkoutListItems', () => {
  it('adds formatted presentation fields for workout list rows', () => {
    const payload: MokeWorkoutListResponse = {
      code: 200,
      data: [
        {
          _id: '2026-03',
          dayData: [
            {
              _id: 'sport-1',
              accountId: 'user-1',
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
          ],
        },
      ],
    };

    expect(toWorkoutListItems(payload)).toEqual([
      {
        _id: 'sport-1',
        accountId: 'user-1',
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
        formattedDuration: '00:13:41',
        formattedDistance: '2.80 km',
        formattedStartTime: '2026-03-30 14:03',
        averagePace: '02:21/500m',
      },
    ]);
  });
});

describe('toDetailChartPoints', () => {
  it('builds chart points from pace and rpm series', () => {
    const payload: MokeWorkoutDetailResponse = {
      code: 200,
      data: {
        _id: 'sport-1',
        accountId: 'user-1',
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
    };

    expect(toDetailChartPoints(payload.data)).toEqual([
      { minute: 1, speed: 7.59, rpm: 23, pace: '03:57/500m' },
      { minute: 2, speed: 13.86, rpm: 33, pace: '02:10/500m' },
      { minute: 3, speed: 16.8, rpm: 35, pace: '01:47/500m' },
    ]);
  });
});

describe('buildDetailMetrics', () => {
  it('derives summary metrics from workout detail', () => {
    const payload: MokeWorkoutDetailResponse = {
      code: 200,
      data: {
        _id: 'sport-1',
        accountId: 'user-1',
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
    };

    expect(buildDetailMetrics(payload.data)).toEqual({
      averageSpeed: 12.75,
      averageRpm: 30.33,
      averagePace: '02:21/500m',
      totalTurns: 409,
    });
  });
});
