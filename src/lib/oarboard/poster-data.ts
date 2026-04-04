import { formatDuration, formatPacePer500m } from '../moke/formatters';
import { buildDetailMetrics } from '../moke/service';
import type { MokeWorkoutRecord } from '../moke/types';

const HERO_GOALS = {
  calorie: 200,
  duration: 720,
  distance: 3000,
} as const;

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
    calorie: { value: record.sumCalorie, goal: HERO_GOALS.calorie },
    duration: { value: record.sumDuration, goal: HERO_GOALS.duration },
    distance: { value: Math.round(record.sumMileage * 1000), goal: HERO_GOALS.distance },
  };
}

export function buildTodayPosterHeroData(records: MokeWorkoutRecord[], today: string): PosterHeroData {
  if (records.length === 0) {
    return {
      dateLabel: today,
      primaryValue: '00:00:00',
      averagePace: '--:--/500m',
      averageRpm: '0.00',
      totalTurns: '0',
      calorie: { value: 0, goal: HERO_GOALS.calorie },
      duration: { value: 0, goal: HERO_GOALS.duration },
      distance: { value: 0, goal: HERO_GOALS.distance },
    };
  }

  const totalDuration = records.reduce((sum, record) => sum + record.sumDuration, 0);
  const totalCalorie = records.reduce((sum, record) => sum + record.sumCalorie, 0);
  const totalDistanceMeters = records.reduce((sum, record) => sum + Math.round(record.sumMileage * 1000), 0);
  const totalTurns = records.reduce((sum, record) => sum + (Number(record.turns) || 0), 0);

  const detailMetrics = records.map((record) => buildDetailMetrics(record));
  const speedValues = detailMetrics.flatMap((metrics) => (metrics.averageSpeed > 0 ? [metrics.averageSpeed] : []));
  const rpmValues = detailMetrics.flatMap((metrics) => (metrics.averageRpm > 0 ? [metrics.averageRpm] : []));
  const averageSpeed = speedValues.length > 0
    ? speedValues.reduce((sum, value) => sum + value, 0) / speedValues.length
    : 0;
  const averageRpm = rpmValues.length > 0
    ? rpmValues.reduce((sum, value) => sum + value, 0) / rpmValues.length
    : 0;

  return {
    dateLabel: today,
    primaryValue: formatDuration(totalDuration),
    averagePace: averageSpeed > 0 ? formatPacePer500m(averageSpeed) : '--:--/500m',
    averageRpm: averageRpm.toFixed(2),
    totalTurns: String(totalTurns),
    calorie: { value: totalCalorie, goal: HERO_GOALS.calorie },
    duration: { value: totalDuration, goal: HERO_GOALS.duration },
    distance: { value: totalDistanceMeters, goal: HERO_GOALS.distance },
  };
}
