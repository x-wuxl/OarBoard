import { formatDistanceKm, formatDuration } from '../moke/formatters';

export interface RingStroke {
  circumference: number;
  dashArray: number;
  dashOffset: number;
}

export interface RingMetricInput {
  value: number;
  goal: number;
}

export interface RingMetricSummaryInput {
  calorie: RingMetricInput;
  duration: RingMetricInput;
  distance: RingMetricInput;
}

export interface RingMetricView {
  id: 'calorie' | 'duration' | 'distance';
  label: string;
  value: string;
  progress: number;
  tone: 'rose' | 'lime' | 'cyan';
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress) || progress < 0) {
    return 0;
  }

  return progress;
}

export function getRingStroke(radius: number, progress: number): RingStroke {
  const circumference = 2 * Math.PI * radius;
  const safeProgress = clampProgress(progress);

  return {
    circumference,
    dashArray: circumference,
    dashOffset: circumference * Math.max(0, 1 - safeProgress),
  };
}

export function describeRingProgress(progress: number): string {
  return `${Math.round(clampProgress(progress) * 100)}%`;
}

export function buildRingMetrics(input: RingMetricSummaryInput): RingMetricView[] {
  return [
    {
      id: 'calorie',
      label: '热量',
      value: `${Math.round(input.calorie.value)} kcal`,
      progress: Number((input.calorie.value / input.calorie.goal).toFixed(2)),
      tone: 'rose',
    },
    {
      id: 'duration',
      label: '时长',
      value: formatDuration(input.duration.value),
      progress: Number((input.duration.value / input.duration.goal).toFixed(2)),
      tone: 'lime',
    },
    {
      id: 'distance',
      label: '距离',
      value: formatDistanceKm(input.distance.value),
      progress: Number((input.distance.value / input.distance.goal).toFixed(2)),
      tone: 'cyan',
    },
  ];
}
