import { describe, expect, it } from 'vitest';

import { buildCalendarHeatmap, buildTrendCards, groupHeatmapIntoWeeks } from '../calendar-data';
import type { MokeWorkoutHistoryEntry } from '../../moke/types';

const daily: MokeWorkoutHistoryEntry[] = [
  { _id: '2026-03-31', totalDistance: 2.89 },
  { _id: '2026-03-30', totalDistance: 2.8 },
  { _id: '2026-03-29', totalDistance: 0 },
  { _id: '2026-03-28', totalDistance: 0 },
  { _id: '2026-03-27', totalDistance: 2.86 },
];

describe('buildCalendarHeatmap', () => {
  it('maps daily history entries into heatmap cells with intensity buckets', () => {
    const cells = buildCalendarHeatmap(daily).slice(0, 3);
    expect(cells.map(({ date, distance, level }) => ({ date, distance, level }))).toEqual([
      { date: '2026-03-31', distance: 2.89, level: 4 },
      { date: '2026-03-30', distance: 2.8, level: 4 },
      { date: '2026-03-29', distance: 0, level: 0 },
    ]);
    expect(cells.every((c) => typeof c.weekday === 'number')).toBe(true);
  });
});

describe('groupHeatmapIntoWeeks', () => {
  it('groups daily cells into week columns for a contribution-wall layout', () => {
    const grouped = groupHeatmapIntoWeeks(buildCalendarHeatmap(daily));

    expect(grouped.length).toBeGreaterThan(0);
    expect(grouped[0]?.days.length).toBeLessThanOrEqual(7);
  });
});

describe('buildTrendCards', () => {
  it('summarizes aggregate totals with comparison metadata for the selected period', () => {
    const cards = buildTrendCards(
      {
        totalDistance: 30.23,
        totalCalorie: 2129,
        totalDuration: 8334,
        sportCount: 11,
      },
      {
        previousTotals: {
          totalDistance: 28,
          totalCalorie: 2000,
          totalDuration: 8000,
          sportCount: 10,
        },
        comparisonLabel: 'vs 上周',
      },
    );

    expect(cards).toMatchObject([
      {
        id: 'sessions',
        label: '训练次数',
        value: '11',
        rawValue: 11,
        trendState: 'up',
        trendDisplay: '+10.0%',
        comparisonLabel: 'vs 上周',
        previousRawValue: 10,
      },
      {
        id: 'distance',
        label: '周期距离',
        value: '30.23 km',
        rawValue: 30.23,
        trendState: 'up',
        trendDisplay: '+8.0%',
        comparisonLabel: 'vs 上周',
        previousRawValue: 28,
      },
      {
        id: 'duration',
        label: '周期时长',
        value: '02:18:54',
        rawValue: 8334,
        trendState: 'up',
        trendDisplay: '+4.2%',
        comparisonLabel: 'vs 上周',
        previousRawValue: 8000,
      },
      {
        id: 'calorie',
        label: '周期热量',
        value: '2129 kcal',
        rawValue: 2129,
        trendState: 'up',
        trendDisplay: '+6.5%',
        comparisonLabel: 'vs 上周',
        previousRawValue: 2000,
      },
    ]);
    expect(cards[0]?.changePercent).toBeCloseTo(10, 5);
    expect(cards[1]?.changePercent).toBeCloseTo(7.964285714285714, 5);
    expect(cards[2]?.changePercent).toBeCloseTo(4.175, 5);
    expect(cards[3]?.changePercent).toBeCloseTo(6.45, 5);
  });

  it('marks near-zero changes as flat and missing comparisons as unavailable', () => {
    const [sessions, distance] = buildTrendCards(
      {
        totalDistance: 100.3,
        totalCalorie: 2129,
        totalDuration: 8334,
        sportCount: 0,
      },
      {
        previousTotals: {
          totalDistance: 100,
          totalCalorie: 2000,
          totalDuration: 8000,
          sportCount: 0,
        },
        comparisonLabel: 'vs 上月',
      },
    );

    const [missingSessions] = buildTrendCards(
      {
        totalDistance: 0,
        totalCalorie: 0,
        totalDuration: 0,
        sportCount: 3,
      },
      {
        previousTotals: null,
        comparisonLabel: 'vs 上年',
      },
    );

    expect(sessions).toMatchObject({
      trendState: 'flat',
      trendDisplay: '持平',
      comparisonLabel: 'vs 上月',
    });
    expect(distance).toMatchObject({
      trendState: 'flat',
      trendDisplay: '持平',
      comparisonLabel: 'vs 上月',
    });
    expect(missingSessions).toMatchObject({
      trendState: 'na',
      trendDisplay: '暂无环比',
      comparisonLabel: 'vs 上年',
    });
  });

  it('treats a positive current value over a zero previous value as new', () => {
    const [sessions, distance] = buildTrendCards(
      {
        totalDistance: 30.23,
        totalCalorie: 0,
        totalDuration: 0,
        sportCount: 5,
      },
      {
        previousTotals: {
          totalDistance: 0,
          totalCalorie: 0,
          totalDuration: 0,
          sportCount: 0,
        },
        comparisonLabel: 'vs 上周',
      },
    );

    expect(sessions).toMatchObject({
      trendState: 'new',
      trendDisplay: '新增',
      previousRawValue: 0,
    });
    expect(distance).toMatchObject({
      trendState: 'new',
      trendDisplay: '新增',
      previousRawValue: 0,
    });
  });
});
