import { formatDuration } from '../moke/formatters';
import { buildDetailMetrics } from '../moke/service';
import type { MokeWorkoutRecord } from '../moke/types';

export interface PosterHeroData {
  dateLabel: string;
  primaryValue: string;
  averagePace: string;
  averageRpm: string;
  totalTurns: string;
  calorie: { value: number; goal: number };
  duration: { value: number; goal: number };
  distance: { value: number; goal: number };
}

export function buildPosterHeroData(record: MokeWorkoutRecord): PosterHeroData {
  const metrics = buildDetailMetrics(record);

  return {
    dateLabel: record.day,
    primaryValue: formatDuration(record.sumDuration),
    averagePace: metrics.averagePace,
    averageRpm: metrics.averageRpm.toFixed(2),
    totalTurns: String(metrics.totalTurns),
    calorie: { value: record.sumCalorie, goal: 200 },
    duration: { value: record.sumDuration, goal: 900 },
    distance: { value: Math.round(record.sumMileage * 1000), goal: 3000 },
  };
}
