import { formatDuration, formatPacePer500m } from '../moke/formatters';
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

export function buildTodayPosterHeroData(records: MokeWorkoutRecord[], today: string): PosterHeroData {
  if (records.length === 0) {
    return {
      dateLabel: today,
      primaryValue: '00:00:00',
      averagePace: '--:--/500m',
      averageRpm: '0.00',
      totalTurns: '0',
      calorie: { value: 0, goal: 200 },
      duration: { value: 0, goal: 900 },
      distance: { value: 0, goal: 3000 },
    };
  }

  const totalDuration = records.reduce((sum, record) => sum + record.sumDuration, 0);
  const totalCalorie = records.reduce((sum, record) => sum + record.sumCalorie, 0);
  const totalDistanceMeters = records.reduce((sum, record) => sum + Math.round(record.sumMileage * 1000), 0);
  const totalTurns = records.reduce((sum, record) => sum + (Number(record.turns) || 0), 0);

  const speedValues = records.flatMap((record) => buildDetailMetrics(record).averageSpeed > 0 ? [buildDetailMetrics(record).averageSpeed] : []);
  const rpmValues = records.flatMap((record) => buildDetailMetrics(record).averageRpm > 0 ? [buildDetailMetrics(record).averageRpm] : []);
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
    calorie: { value: totalCalorie, goal: 200 },
    duration: { value: totalDuration, goal: 900 },
    distance: { value: totalDistanceMeters, goal: 3000 },
  };
}
