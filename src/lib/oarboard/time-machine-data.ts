import { formatDistanceKm, formatDuration, formatPacePer500m } from '../moke/formatters';
import { buildDetailMetrics } from '../moke/service';
import type { MokeWorkoutRecord } from '../moke/types';

export interface TimeMachineEntry {
  label: string;          // e.g. "一年前的今天 · 2025-04-06"
  distance: string;       // e.g. "2.86 km"
  duration: string;       // e.g. "00:12:36"
  pace: string;           // e.g. "04:24/500m"
  comparison: TimeMachineComparison | null;
}

export interface TimeMachineComparison {
  distanceDelta: string;    // e.g. "+0.40 km" or "-0.40 km"
  distancePositive: boolean;
  paceDeltaLabel: string;   // e.g. "快了 12 秒" or "慢了 8 秒"
  pacePositive: boolean;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function aggregateRecords(records: MokeWorkoutRecord[]): {
  totalDistance: number;
  totalDuration: number;
  avgSpeed: number;
} {
  let totalDistance = 0;
  let totalDuration = 0;
  const speeds: number[] = [];

  for (const record of records) {
    totalDistance += record.sumMileage;
    totalDuration += record.sumDuration;
    const metrics = buildDetailMetrics(record);
    if (metrics.averageSpeed > 0) {
      speeds.push(metrics.averageSpeed);
    }
  }

  const avgSpeed = speeds.length > 0
    ? speeds.reduce((sum, v) => sum + v, 0) / speeds.length
    : 0;

  return { totalDistance, totalDuration, avgSpeed };
}

function buildComparison(
  todayDistance: number,
  todayAvgSpeed: number,
  histDistance: number,
  histAvgSpeed: number,
): TimeMachineComparison | null {
  if (todayAvgSpeed === 0 || histAvgSpeed === 0) {
    return null;
  }

  const distDelta = todayDistance - histDistance;
  const sign = distDelta >= 0 ? '+' : '-';
  const distanceDelta = `${sign}${Math.abs(distDelta).toFixed(2)} km`;
  const distancePositive = distDelta >= 0;

  const todayPaceSec = Number.isFinite(1800 / todayAvgSpeed)
    ? Math.round(1800 / todayAvgSpeed)
    : 0;
  const histPaceSec = Number.isFinite(1800 / histAvgSpeed)
    ? Math.round(1800 / histAvgSpeed)
    : 0;

  // Positive delta means today is faster (lower pace seconds)
  const paceDelta = histPaceSec - todayPaceSec;

  let paceDeltaLabel: string;
  let pacePositive: boolean;

  if (paceDelta > 0) {
    paceDeltaLabel = `快了 ${paceDelta} 秒`;
    pacePositive = true;
  } else if (paceDelta < 0) {
    paceDeltaLabel = `慢了 ${Math.abs(paceDelta)} 秒`;
    pacePositive = false;
  } else {
    paceDeltaLabel = '持平';
    pacePositive = true;
  }

  return { distanceDelta, distancePositive, paceDeltaLabel, pacePositive };
}

export function buildTimeMachineEntry(
  allRecords: MokeWorkoutRecord[],
  todayRecords: MokeWorkoutRecord[],
  today: string,
): TimeMachineEntry | null {
  if (allRecords.length === 0) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = today.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  // Try last year same day
  let lastYearDay: string;
  if (month === 2 && day === 29 && !isLeapYear(year - 1)) {
    lastYearDay = `${year - 1}-02-28`;
  } else {
    lastYearDay = `${year - 1}-${monthStr}-${dayStr}`;
  }

  let matchedRecords = allRecords.filter((r) => r.day === lastYearDay);
  let label: string;

  if (matchedRecords.length > 0) {
    label = `一年前的今天 · ${lastYearDay}`;
  } else {
    // Try 30 days ago
    const todayDate = new Date(year, month - 1, day);
    todayDate.setDate(todayDate.getDate() - 30);
    const thirtyDaysAgo = formatDate(todayDate);

    matchedRecords = allRecords.filter((r) => r.day === thirtyDaysAgo);
    if (matchedRecords.length === 0) {
      return null;
    }
    label = `30天前 · ${thirtyDaysAgo}`;
  }

  const { totalDistance, totalDuration, avgSpeed } = aggregateRecords(matchedRecords);

  const distance = formatDistanceKm(totalDistance * 1000);
  const duration = formatDuration(totalDuration);
  const pace = formatPacePer500m(avgSpeed);

  let comparison: TimeMachineComparison | null = null;

  if (todayRecords.length > 0) {
    const todayAgg = aggregateRecords(todayRecords);
    comparison = buildComparison(
      todayAgg.totalDistance,
      todayAgg.avgSpeed,
      totalDistance,
      avgSpeed,
    );
  }

  return { label, distance, duration, pace, comparison };
}
