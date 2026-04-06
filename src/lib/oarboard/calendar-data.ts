import { formatDistanceKm, formatDuration } from '../moke/formatters';
import type { MokeWorkoutHistoryEntry, MokeWorkoutTotals } from '../moke/types';

export interface HeatmapCellView {
  date: string;
  distance: number;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  weekday: number;
}

export interface HeatmapWeekColumnView {
  key: string;
  monthLabel: string | null;
  days: HeatmapCellView[];
}

export interface TrendCardView {
  id: 'sessions' | 'distance' | 'duration' | 'calorie';
  label: string;
  value: string;
  rawValue: number;
}

function getLevel(distance: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (distance <= 0) return 0;
  if (distance < 0.8) return 1;
  if (distance < 1.5) return 2;
  if (distance < 2.5) return 3;
  if (distance < 3.5) return 4;
  return 5;
}

export function buildCalendarHeatmap(entries: MokeWorkoutHistoryEntry[]): HeatmapCellView[] {
  return entries.map((entry) => ({
    date: entry._id,
    distance: entry.totalDistance,
    level: getLevel(entry.totalDistance),
    weekday: new Date(`${entry._id}T00:00:00`).getDay(),
  }));
}

export function groupHeatmapIntoWeeks(entries: HeatmapCellView[]): HeatmapWeekColumnView[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weeks: HeatmapWeekColumnView[] = [];

  sorted.forEach((entry) => {
    const date = new Date(`${entry.date}T00:00:00`);
    const day = entry.weekday;
    const weekKeyDate = new Date(date);
    weekKeyDate.setDate(date.getDate() - day);
    const key = weekKeyDate.toISOString().slice(0, 10);
    const monthLabel = date.getDate() <= 7 ? entry.date.slice(5, 7) : null;
    const existing = weeks.find((week) => week.key === key);

    if (existing) {
      existing.days.push(entry);
      if (!existing.monthLabel && monthLabel) {
        existing.monthLabel = monthLabel;
      }
      return;
    }

    weeks.push({
      key,
      monthLabel,
      days: [entry],
    });
  });

  return weeks;
}

export function buildTrendCards(totals: MokeWorkoutTotals): TrendCardView[] {
  return [
    { id: 'sessions', label: '训练次数', value: String(totals.sportCount ?? 0), rawValue: totals.sportCount ?? 0 },
    { id: 'distance', label: '周期距离', value: formatDistanceKm(totals.totalDistance * 1000), rawValue: totals.totalDistance },
    { id: 'duration', label: '周期时长', value: formatDuration(totals.totalDuration), rawValue: totals.totalDuration },
    { id: 'calorie', label: '周期热量', value: `${Math.round(totals.totalCalorie)} kcal`, rawValue: totals.totalCalorie },
  ];
}

function padDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildFullYearHeatmap(year: number, entries: HeatmapCellView[]): HeatmapWeekColumnView[] {
  const cellMap = new Map(
    entries.filter((c) => c.date.startsWith(String(year))).map((c) => [c.date, c]),
  );

  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());

  const weeks: HeatmapWeekColumnView[] = [];
  const cursor = new Date(start);

  while (cursor <= dec31) {
    const weekKey = padDateStr(cursor);
    const days: HeatmapCellView[] = [];
    let monthLabel: string | null = null;

    for (let d = 0; d < 7; d++) {
      if (cursor.getFullYear() === year) {
        const dateStr = padDateStr(cursor);
        const existing = cellMap.get(dateStr);
        days.push(existing ?? { date: dateStr, distance: 0, level: 0 as const, weekday: cursor.getDay() });
        if (cursor.getDate() <= 7 && !monthLabel) {
          monthLabel = dateStr.slice(5, 7);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (days.length > 0) {
      weeks.push({ key: weekKey, monthLabel, days });
    }
  }

  return weeks;
}

export function buildRollingYearHeatmap(entries: HeatmapCellView[]): HeatmapWeekColumnView[] {
  const today = new Date();
  const cellMap = new Map(entries.map((c) => [c.date, c]));

  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1);

  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() - startDate.getDay());

  const weeks: HeatmapWeekColumnView[] = [];
  const cursor = new Date(weekStart);

  while (cursor <= endDate) {
    const weekKey = padDateStr(cursor);
    const days: HeatmapCellView[] = [];
    let monthLabel: string | null = null;

    for (let d = 0; d < 7; d++) {
      const dateStr = padDateStr(cursor);
      if (cursor >= startDate && cursor <= endDate) {
        const existing = cellMap.get(dateStr);
        days.push(existing ?? { date: dateStr, distance: 0, level: 0 as const, weekday: cursor.getDay() });
        if (cursor.getDate() <= 7 && !monthLabel) {
          monthLabel = dateStr.slice(5, 7);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (days.length > 0) {
      weeks.push({ key: weekKey, monthLabel, days });
    }
  }

  return weeks;
}

export function getAvailableYears(entries: HeatmapCellView[]): number[] {
  const years = [...new Set(entries.map((c) => parseInt(c.date.slice(0, 4))))].sort();
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) {
    years.push(currentYear);
  }
  return years.sort();
}
