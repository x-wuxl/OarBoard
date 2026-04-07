import { parseNumberSeries } from '../moke/formatters';
import type { MokeWorkoutRecord } from '../moke/types';

export interface DnaSegment {
  index: number;
  value: number;
  color: string;
}

export type RhythmType = 'steady' | 'interval' | 'negative-split' | 'positive-split' | 'unknown';

export interface DnaFingerprint {
  segments: DnaSegment[];
  rhythmType: RhythmType;
  rhythmLabel: string;
  tags: string[];
}

export function valueToColor(t: number): string {
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [12, 25, 41]],
    [0.3, [22, 78, 99]],
    [0.6, [34, 211, 238]],
    [0.8, [163, 230, 53]],
    [1.0, [236, 252, 203]],
  ];

  const clamped = Math.max(0, Math.min(1, t));

  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i][0] && clamped <= stops[i + 1][0]) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper[0] - lower[0];
  const factor = range > 0 ? (clamped - lower[0]) / range : 0;

  const r = Math.round(lower[1][0] + (upper[1][0] - lower[1][0]) * factor);
  const g = Math.round(lower[1][1] + (upper[1][1] - lower[1][1]) * factor);
  const b = Math.round(lower[1][2] + (upper[1][2] - lower[1][2]) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function classifyRhythm(values: number[]): { type: RhythmType; label: string } {
  if (values.length < 3) return { type: 'unknown', label: '数据不足' };

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) * (i - xMean);
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;

  const variance = values.reduce((sum, v) => sum + (v - yMean) ** 2, 0) / n;
  const cv = yMean !== 0 ? Math.sqrt(variance) / yMean : 0;

  const normalizedSlope = yMean !== 0 ? slope / yMean : 0;

  if (Math.abs(normalizedSlope) < 0.005) {
    return cv > 0.15
      ? { type: 'interval', label: '间歇型' }
      : { type: 'steady', label: '匀速型' };
  }

  if (normalizedSlope > 0) {
    return { type: 'negative-split', label: '渐入佳境' };
  }

  return { type: 'positive-split', label: '前快后慢' };
}

function buildDnaTags(values: number[], rhythmLabel: string): string[] {
  if (values.length === 0) return [];

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  const cv = average !== 0 ? Math.sqrt(variance) / average : 0;

  const tags = [rhythmLabel];
  tags.push(cv <= 0.15 ? '节奏稳定' : '节奏起伏明显');
  tags.push(average >= 26 ? '高桨频推进' : average >= 22 ? '巡航耐力' : '低桨频发力');

  if (values.length >= 4) {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstHalfMean = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
    const secondHalfMean = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;

    if (secondHalfMean - firstHalfMean > 1) {
      tags.push('后程发力');
    } else if (firstHalfMean - secondHalfMean > 1) {
      tags.push('前程领先');
    }
  }

  return tags.slice(0, 4);
}

function buildWorkoutTags(record: MokeWorkoutRecord, rhythmLabel: string): string[] {
  const rpmValues = parseNumberSeries(record.rpmList).filter((v) => v > 0);
  if (rpmValues.length === 0) {
    return rhythmLabel === '数据不足' ? [] : [rhythmLabel];
  }

  return buildDnaTags(rpmValues, rhythmLabel);
}

export function buildDnaFingerprint(record: MokeWorkoutRecord): DnaFingerprint {
  const speeds = parseNumberSeries(record.paceList).filter((v) => v > 0);

  if (speeds.length === 0) {
    return { segments: [], rhythmType: 'unknown', rhythmLabel: '数据不足', tags: [] };
  }

  const min = Math.min(...speeds);
  const max = Math.max(...speeds);
  const allSame = max === min;

  const normalized = speeds.map((v) => (allSame ? 0.5 : (v - min) / (max - min)));

  const segments: DnaSegment[] = normalized.map((value, i) => ({
    index: i,
    value,
    color: valueToColor(value),
  }));

  const { type: rhythmType, label: rhythmLabel } = classifyRhythm(speeds);
  const tags = buildWorkoutTags(record, rhythmLabel);

  return { segments, rhythmType, rhythmLabel, tags };
}

export function buildDnaMap(records: MokeWorkoutRecord[]): Map<string, DnaFingerprint> {
  const map = new Map<string, DnaFingerprint>();

  for (const record of records) {
    const fingerprint = buildDnaFingerprint(record);
    if (fingerprint.segments.length > 0) {
      map.set(record._id, fingerprint);
    }
  }

  return map;
}
