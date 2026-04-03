import { buildDetailMetrics, toDetailChartPoints, toWorkoutListItems } from '../moke/service';
import { formatDistanceKm, formatDuration } from '../moke/formatters';
import type { MokeWorkoutRecord, MokeWorkoutTotals } from '../moke/types';

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatRowDate(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const wd = weekdayNames[date.getDay()];
  return `${m}月${d}日 ${wd}`;
}

function formatRowTime(startTime: string): string {
  const normalized = startTime.includes('T') ? startTime : startTime.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return startTime.slice(11, 16);
  }
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export interface SummaryCardView {
  id: 'duration' | 'calorie' | 'distance';
  label: string;
  value: string;
}

export interface WorkoutHistoryRowView {
  id: string;
  title: string;
  subtitle: string;
  pace: string;
  duration: string;
  distance: string;
  energy: string;
}

export interface DashboardDataView {
  summaryCards: SummaryCardView[];
  historyRows: WorkoutHistoryRowView[];
  selectedWorkoutId: string | null;
}

export function buildDashboardData(records: MokeWorkoutRecord[], totals: MokeWorkoutTotals): DashboardDataView {
  const historyRows = toWorkoutListItems({ data: [{ _id: 'history', dayData: records }] }).map((record) => ({
    id: record._id,
    title: formatRowDate(record.day),
    subtitle: formatRowTime(record.startTime),
    pace: record.averagePace,
    duration: record.formattedDuration,
    distance: record.formattedDistance,
    energy: `${Math.round(record.sumCalorie)} kcal`,
  }));

  return {
    summaryCards: [
      { id: 'duration', label: '总运动时长', value: formatDuration(totals.totalDuration) },
      { id: 'calorie', label: '总消耗', value: `${Math.round(totals.totalCalorie)} kcal` },
      { id: 'distance', label: '总运动距离', value: formatDistanceKm(totals.totalDistance * 1000) },
    ],
    historyRows,
    selectedWorkoutId: records[0]?._id ?? null,
  };
}

export function buildWorkoutDetailPanel(record: MokeWorkoutRecord) {
  const metrics = buildDetailMetrics(record);

  return {
    title: formatRowDate(record.day),
    subtitle: formatRowTime(record.startTime),
    averagePace: metrics.averagePace,
    averageSpeed: `${metrics.averageSpeed.toFixed(2)} km/h`,
    averageRpm: `${metrics.averageRpm.toFixed(2)} spm`,
    totalTurns: String(metrics.totalTurns),
    chartPoints: toDetailChartPoints(record),
  };
}
