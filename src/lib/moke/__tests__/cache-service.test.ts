import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CachedHeatmapFile, CachedSummaryFile } from '../cache-types.js';
import type { MokeWorkoutListResponse, MokeWorkoutRecord } from '../types.js';

const readWorkoutSummaryCache = vi.fn();
const readWorkoutHeatmapCache = vi.fn();
const readWorkoutIndexCache = vi.fn();
const readWorkoutMonthCache = vi.fn();
const writeWorkoutCache = vi.fn();
const buildWorkoutCacheArtifacts = vi.fn();
const fetchWorkoutList = vi.fn();
const fetchWorkoutTotals = vi.fn();

vi.mock('../cache-store.js', () => ({
  readWorkoutSummaryCache,
  readWorkoutHeatmapCache,
  readWorkoutIndexCache,
  readWorkoutMonthCache,
  writeWorkoutCache,
  buildWorkoutCacheArtifacts,
}));

vi.mock('../service.js', async () => {
  const actual = await vi.importActual<typeof import('../service.js')>('../service.js');
  return {
    ...actual,
    fetchWorkoutList,
    fetchWorkoutTotals,
  };
});

function makeRecord(overrides: Partial<MokeWorkoutRecord> = {}): MokeWorkoutRecord {
  return {
    _id: overrides._id ?? 'sport-1',
    accountId: overrides.accountId ?? 'user-1',
    deviceType: overrides.deviceType ?? '2',
    sumMileage: overrides.sumMileage ?? 2.8,
    sumCalorie: overrides.sumCalorie ?? 200,
    sumDuration: overrides.sumDuration ?? 821,
    startTime: overrides.startTime ?? '2026-04-01 07:00:00',
    turns: overrides.turns ?? '409',
    paceList: overrides.paceList ?? '7.59,13.86,16.8',
    rpmList: overrides.rpmList ?? '23,33,35',
    createTime: overrides.createTime ?? '2026-04-01T07:20:00.000Z',
    day: overrides.day ?? '2026-04-01',
    year: overrides.year ?? '2026',
    month: overrides.month ?? '2026-04',
  };
}

function makeSummary(updatedAt: string, recentDays: string[]): CachedSummaryFile {
  return {
    accountId: 'user-1',
    updatedAt,
    totals: {
      totalDistance: recentDays.length * 2.8,
      totalCalorie: recentDays.length * 200,
      totalDuration: recentDays.length * 821,
      sportCount: recentDays.length,
    },
    recentMonths: [
      {
        month: '2026-04',
        distance: recentDays.length * 2.8,
        calorie: recentDays.length * 200,
        duration: recentDays.length * 821,
        sportCount: recentDays.length,
      },
    ],
    recentRecords: recentDays.map((day, index) => ({
      id: `sport-${index + 1}`,
      day,
      month: '2026-04',
      year: '2026',
      startTime: `${day} 07:00:00`,
      sumMileage: 2.8,
      sumCalorie: 200,
      sumDuration: 821,
      turns: 409,
      paceList: [7.59, 13.86, 16.8],
      rpmList: [23, 33, 35],
      deviceType: '2',
      createTime: `${day}T07:20:00.000Z`,
    })),
  };
}

function makeHeatmap(updatedAt: string, days: string[]): CachedHeatmapFile {
  return {
    accountId: 'user-1',
    updatedAt,
    days: Object.fromEntries(days.map((day) => [day, { distance: 2.8, count: 1 }])),
  };
}

describe('getCachedWorkoutArtifacts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T12:00:00.000Z'));
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('refreshes stale cache with recent incremental records and writes merged artifacts', async () => {
    const staleAt = '2026-04-01T00:00:00.000Z';
    const summary = makeSummary(staleAt, ['2026-04-01']);
    const heatmap = makeHeatmap(staleAt, ['2026-04-01']);

    readWorkoutSummaryCache.mockResolvedValue(summary);
    readWorkoutHeatmapCache.mockResolvedValue(heatmap);
    readWorkoutIndexCache.mockResolvedValue({
      accountId: 'user-1',
      updatedAt: staleAt,
      months: [{ month: '2026-04', recordCount: 1, updatedAt: staleAt }],
      latestWorkoutDay: '2026-04-01',
    });
    readWorkoutMonthCache.mockResolvedValue({
      accountId: 'user-1',
      month: '2026-04',
      updatedAt: staleAt,
      records: [
        {
          id: 'sport-1',
          day: '2026-04-01',
          month: '2026-04',
          year: '2026',
          startTime: '2026-04-01 07:00:00',
          sumMileage: 2.8,
          sumCalorie: 200,
          sumDuration: 821,
          turns: 409,
          paceList: [7.59, 13.86, 16.8],
          rpmList: [23, 33, 35],
          deviceType: '2',
          createTime: '2026-04-01T07:20:00.000Z',
        },
      ],
      dailySummary: {
        '2026-04-01': { distance: 2.8, calorie: 200, duration: 821, count: 1 },
      },
      monthlySummary: { distance: 2.8, calorie: 200, duration: 821, sportCount: 1 },
    });

    const newRecord = makeRecord({
      _id: 'sport-2',
      day: '2026-04-05',
      startTime: '2026-04-05 08:00:00',
      createTime: '2026-04-05T08:20:00.000Z',
    });
    const fetchResponse: MokeWorkoutListResponse = {
      code: 200,
      data: [{ _id: '2026-04-05', dayData: [newRecord] }],
    };
    fetchWorkoutList.mockResolvedValue(fetchResponse);

    const refreshedSummary = makeSummary('2026-04-06T12:00:00.000Z', ['2026-04-05', '2026-04-01']);
    const refreshedHeatmap = makeHeatmap('2026-04-06T12:00:00.000Z', ['2026-04-01', '2026-04-05']);
    writeWorkoutCache.mockResolvedValue({ summary: refreshedSummary, heatmap: refreshedHeatmap });

    const { getCachedWorkoutArtifacts } = await import('../cache-service.js');
    const result = await getCachedWorkoutArtifacts({ accountId: 'user-1' });

    expect(fetchWorkoutList).toHaveBeenCalled();
    expect(writeWorkoutCache).toHaveBeenCalledWith(
      'user-1',
      expect.arrayContaining([
        expect.objectContaining({ _id: 'sport-1', day: '2026-04-01' }),
        expect.objectContaining({ _id: 'sport-2', day: '2026-04-05' }),
      ]),
    );
    expect(result).toEqual({
      summary: refreshedSummary,
      heatmap: refreshedHeatmap,
      source: 'upstream',
    });
  });

  it('falls back to stale cache when incremental refresh fails', async () => {
    const staleAt = '2026-04-01T00:00:00.000Z';
    const summary = makeSummary(staleAt, ['2026-04-01']);
    const heatmap = makeHeatmap(staleAt, ['2026-04-01']);

    readWorkoutSummaryCache.mockResolvedValue(summary);
    readWorkoutHeatmapCache.mockResolvedValue(heatmap);
    readWorkoutIndexCache.mockResolvedValue({
      accountId: 'user-1',
      updatedAt: staleAt,
      months: [{ month: '2026-04', recordCount: 1, updatedAt: staleAt }],
      latestWorkoutDay: '2026-04-01',
    });
    readWorkoutMonthCache.mockResolvedValue(null);
    fetchWorkoutList.mockRejectedValue(new Error('network down'));

    const { getCachedWorkoutArtifacts } = await import('../cache-service.js');
    const result = await getCachedWorkoutArtifacts({ accountId: 'user-1' });

    expect(result).toEqual({
      summary,
      heatmap,
      source: 'cache',
    });
    expect(writeWorkoutCache).not.toHaveBeenCalled();
  });
});
