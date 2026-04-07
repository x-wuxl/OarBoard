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
  it('summarizes aggregate totals for the selected period', () => {
    expect(
      buildTrendCards({
        totalDistance: 30.23,
        totalCalorie: 2129,
        totalDuration: 8334,
        sportCount: 11,
      }),
    ).toEqual([
      { id: 'sessions', label: '训练次数', value: '11', rawValue: 11 },
      { id: 'distance', label: '周期距离', value: '30.23 km', rawValue: 30.23 },
      { id: 'duration', label: '周期时长', value: '02:18:54', rawValue: 8334 },
      { id: 'calorie', label: '周期热量', value: '2129 kcal', rawValue: 2129 },
    ]);
  });
});
