import type { MokeWorkoutRecord } from '../moke/types';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  isAtRecord: boolean;
}

export interface MilestoneView {
  id: string;
  label: string;
  achievedDate: string | null;
  achieved: boolean;
  predictedDate: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function padDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Return the Monday (ISO week start) for a given "YYYY-MM-DD" string. */
function getMondayKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - dow);
  return padDate(d);
}

/** Add `days` calendar days to a "YYYY-MM-DD" string and return a new date string. */
function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return padDate(d);
}

/** Check whether mondayA + 7 days === mondayB (consecutive ISO weeks). */
function areConsecutiveWeeks(mondayA: string, mondayB: string): boolean {
  return addDays(mondayA, 7) === mondayB;
}

// ---------------------------------------------------------------------------
// Streak computation
// ---------------------------------------------------------------------------

export function buildStreakData(records: MokeWorkoutRecord[], today: string): StreakData {
  if (records.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isAtRecord: false };
  }

  // Unique training days → week keys
  const trainingDays = new Set(records.map((r) => r.day));
  const activeWeeks = new Set<string>();
  for (const day of trainingDays) {
    activeWeeks.add(getMondayKey(day));
  }

  // --- current streak ---
  const currentMonday = getMondayKey(today);
  const currentWeekActive = activeWeeks.has(currentMonday);

  let currentStreak = 0;
  // If the current week has training, start counting from it; otherwise start
  // from the previous week (the current week is still in progress).
  let checkMonday = currentWeekActive ? currentMonday : addDays(currentMonday, -7);

  while (activeWeeks.has(checkMonday)) {
    currentStreak++;
    checkMonday = addDays(checkMonday, -7);
  }

  // --- longest streak ---
  const sortedWeeks = Array.from(activeWeeks).sort();
  let longestStreak = 0;
  let runLength = 0;

  for (let i = 0; i < sortedWeeks.length; i++) {
    if (i === 0 || !areConsecutiveWeeks(sortedWeeks[i - 1], sortedWeeks[i])) {
      runLength = 1;
    } else {
      runLength++;
    }
    if (runLength > longestStreak) {
      longestStreak = runLength;
    }
  }

  return {
    currentStreak,
    longestStreak,
    isAtRecord: currentStreak >= longestStreak && currentStreak > 0,
  };
}

// ---------------------------------------------------------------------------
// Milestone definitions
// ---------------------------------------------------------------------------

interface MilestoneTemplate {
  id: string;
  label: string;
  type: 'distance' | 'sessions' | 'single' | 'monthly';
  threshold: number;
}

function buildTemplates(): MilestoneTemplate[] {
  const templates: MilestoneTemplate[] = [];

  for (const km of [50, 100, 200, 500, 1000]) {
    templates.push({ id: `distance-${km}`, label: `累计 ${km} km`, type: 'distance', threshold: km });
  }
  for (const n of [25, 50, 100, 200]) {
    templates.push({ id: `sessions-${n}`, label: `第 ${n} 次训练`, type: 'sessions', threshold: n });
  }
  for (const km of [3, 5]) {
    templates.push({ id: `single-${km}`, label: `单次突破 ${km} km`, type: 'single', threshold: km });
  }
  for (const km of [20]) {
    templates.push({ id: `monthly-${km}`, label: `单月累计 ${km} km`, type: 'monthly', threshold: km });
  }

  return templates;
}

// ---------------------------------------------------------------------------
// Milestone computation
// ---------------------------------------------------------------------------

export function buildMilestones(
  records: MokeWorkoutRecord[],
  totalDistance: number,
  today: string,
): MilestoneView[] {
  if (records.length === 0) {
    return [];
  }

  const sorted = [...records].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  const templates = buildTemplates();

  // Pre-compute achievement dates per type
  const distanceAchievements = computeDistanceAchievements(sorted);
  const sessionAchievements = computeSessionAchievements(sorted);
  const singleAchievements = computeSingleSessionAchievements(sorted);
  const monthlyAchievements = computeMonthlyDistanceAchievements(sorted);

  // Daily rate for predictions (last 30 days)
  const dailyRate = computeDailyRate(sorted, today);

  const achieved: MilestoneView[] = [];
  const unachieved: MilestoneView[] = [];

  for (const tpl of templates) {
    let achievedDate: string | null = null;

    if (tpl.type === 'distance') {
      achievedDate = distanceAchievements.get(tpl.threshold) ?? null;
    } else if (tpl.type === 'sessions') {
      achievedDate = sessionAchievements.get(tpl.threshold) ?? null;
    } else if (tpl.type === 'single') {
      achievedDate = singleAchievements.get(tpl.threshold) ?? null;
    } else if (tpl.type === 'monthly') {
      achievedDate = monthlyAchievements.get(tpl.threshold) ?? null;
    }

    if (achievedDate) {
      achieved.push({
        id: tpl.id,
        label: tpl.label,
        achievedDate,
        achieved: true,
        predictedDate: null,
      });
    } else {
      const predictedDate =
        tpl.type === 'distance'
          ? predictDistanceDate(tpl.threshold, totalDistance, dailyRate, today)
          : null;

      unachieved.push({
        id: tpl.id,
        label: tpl.label,
        achievedDate: null,
        achieved: false,
        predictedDate,
      });
    }
  }

  // Achieved: most recent first
  achieved.sort((a, b) => (a.achievedDate! > b.achievedDate! ? -1 : a.achievedDate! < b.achievedDate! ? 1 : 0));

  return [...achieved, ...selectUpcomingMilestones(unachieved)];
}

// ---------------------------------------------------------------------------
// Achievement scanners
// ---------------------------------------------------------------------------

function computeDistanceAchievements(sorted: MokeWorkoutRecord[]): Map<number, string> {
  const thresholds = [50, 100, 200, 500, 1000];
  const achievements = new Map<number, string>();
  let cumulative = 0;
  let ti = 0; // index into thresholds

  for (const record of sorted) {
    cumulative += record.sumMileage;
    while (ti < thresholds.length && cumulative >= thresholds[ti]) {
      achievements.set(thresholds[ti], record.day);
      ti++;
    }
    if (ti >= thresholds.length) break;
  }

  return achievements;
}

function computeSessionAchievements(sorted: MokeWorkoutRecord[]): Map<number, string> {
  const thresholds = [25, 50, 100, 200];
  const achievements = new Map<number, string>();
  let ti = 0;

  for (let i = 0; i < sorted.length; i++) {
    const sessionNumber = i + 1;
    while (ti < thresholds.length && sessionNumber >= thresholds[ti]) {
      achievements.set(thresholds[ti], sorted[i].day);
      ti++;
    }
    if (ti >= thresholds.length) break;
  }

  return achievements;
}

function computeSingleSessionAchievements(sorted: MokeWorkoutRecord[]): Map<number, string> {
  const thresholds = [3, 5];
  const achievements = new Map<number, string>();

  for (const record of sorted) {
    for (const km of thresholds) {
      if (!achievements.has(km) && record.sumMileage >= km) {
        achievements.set(km, record.day);
      }
    }
    if (achievements.size >= thresholds.length) break;
  }

  return achievements;
}

function computeMonthlyDistanceAchievements(sorted: MokeWorkoutRecord[]): Map<number, string> {
  const thresholds = [20];
  const achievements = new Map<number, string>();
  const runningDistanceByMonth = new Map<string, number>();

  for (const record of sorted) {
    const monthDistance = (runningDistanceByMonth.get(record.month) ?? 0) + record.sumMileage;
    runningDistanceByMonth.set(record.month, monthDistance);

    for (const km of thresholds) {
      if (!achievements.has(km) && monthDistance >= km) {
        achievements.set(km, record.day);
      }
    }

    if (achievements.size >= thresholds.length) {
      break;
    }
  }

  return achievements;
}

function selectUpcomingMilestones(unachieved: MilestoneView[]): MilestoneView[] {
  const upcomingByType = new Map<string, MilestoneView>();

  for (const milestone of unachieved) {
    const type = milestone.id.split('-')[0];
    if (!upcomingByType.has(type)) {
      upcomingByType.set(type, milestone);
    }
  }

  return ['single', 'monthly', 'distance', 'sessions']
    .map((type) => upcomingByType.get(type))
    .filter((milestone): milestone is MilestoneView => milestone !== undefined);
}

// ---------------------------------------------------------------------------
// Prediction helpers
// ---------------------------------------------------------------------------

function computeDailyRate(sorted: MokeWorkoutRecord[], today: string): number {
  const cutoff = addDays(today, -30);
  const recentRecords = sorted.filter((r) => r.day >= cutoff);

  if (recentRecords.length === 0) return 0;

  const recentDistance = recentRecords.reduce((sum, r) => sum + r.sumMileage, 0);
  return recentDistance / 30;
}

function predictDistanceDate(
  threshold: number,
  totalDistance: number,
  dailyRate: number,
  today: string,
): string | null {
  const remaining = threshold - totalDistance;
  if (remaining <= 0) return null; // should already be marked achieved
  if (dailyRate <= 0) return null;

  const estimatedDays = Math.ceil(remaining / dailyRate);
  return addDays(today, estimatedDays);
}
