import type { MokeWorkoutRecord } from '../moke/types';

export interface FitnessFatiguePoint {
  date: string;      // "YYYY-MM-DD"
  ctl: number;       // Chronic Training Load (fitness, 42-day EMA)
  atl: number;       // Acute Training Load (fatigue, 7-day EMA)
  tsb: number;       // Training Stress Balance = CTL - ATL
  dailyLoad: number; // raw training load for this day
}

export interface FitnessFatigueStatus {
  label: string;     // "恢复充足" | "状态均衡" | "轻度疲劳" | "过度训练"
  level: 'fresh' | 'neutral' | 'tired' | 'overreached';
  tsb: number;
  suggestion: string; // "可适当加量" | "维持当前节奏" | "建议降低强度" | "建议休息恢复"
}

export interface FitnessFatigueData {
  points: FitnessFatiguePoint[];   // daily points for chart
  status: FitnessFatigueStatus;    // current status summary
}

function padDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return padDateStr(d);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function resolveStatus(tsb: number): FitnessFatigueStatus {
  if (tsb > 10) {
    return { label: '恢复充足', level: 'fresh', tsb: round2(tsb), suggestion: '可适当加量' };
  }
  if (tsb >= 0) {
    return { label: '状态均衡', level: 'neutral', tsb: round2(tsb), suggestion: '维持当前节奏' };
  }
  if (tsb >= -10) {
    return { label: '轻度疲劳', level: 'tired', tsb: round2(tsb), suggestion: '建议降低强度' };
  }
  return { label: '过度训练', level: 'overreached', tsb: round2(tsb), suggestion: '建议休息恢复' };
}

export function buildFitnessFatigueData(
  records: MokeWorkoutRecord[],
  today: string,
): FitnessFatigueData {
  // Empty records
  if (records.length === 0) {
    return {
      points: [],
      status: { label: '暂无数据', level: 'neutral', tsb: 0, suggestion: '开始你的第一次训练' },
    };
  }

  // Step 2: Compute daily training load and group by day
  const dailyLoadMap = new Map<string, number>();
  for (const r of records) {
    const load = (r.sumMileage * r.sumDuration) / 60; // km-minutes
    dailyLoadMap.set(r.day, (dailyLoadMap.get(r.day) ?? 0) + load);
  }

  // Step 3: Determine date range
  const days = Array.from(dailyLoadMap.keys()).sort();
  const minDay = days[0];
  const computeStart = addDays(minDay, -42); // 42 days before earliest record for EMA warm-up
  const computeEnd = today;
  const totalDays = daysBetween(computeStart, computeEnd);

  // Step 4: Compute EMA day by day
  const kCtl = 2 / (42 + 1);
  const kAtl = 2 / (7 + 1);

  let ctl = 0;
  let atl = 0;
  let tsb = 0;

  // We only keep the last 90 days for output
  const displayStart = addDays(today, -89); // 90 days including today
  const allPoints: FitnessFatiguePoint[] = [];

  for (let i = 0; i <= totalDays; i++) {
    const currentDate = addDays(computeStart, i);
    const dailyLoad = dailyLoadMap.get(currentDate) ?? 0;

    ctl = ctl * (1 - kCtl) + dailyLoad * kCtl;
    atl = atl * (1 - kAtl) + dailyLoad * kAtl;
    tsb = ctl - atl;

    // Only collect points within the display window
    if (currentDate >= displayStart && currentDate <= today) {
      allPoints.push({
        date: currentDate,
        ctl: round2(ctl),
        atl: round2(atl),
        tsb: round2(tsb),
        dailyLoad: round2(dailyLoad),
      });
    }
  }

  // Step 6: Determine current status from the final TSB
  const status = resolveStatus(tsb);

  return { points: allPoints, status };
}
