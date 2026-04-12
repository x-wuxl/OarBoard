import { DashboardSection } from '../src/components/dashboard-section';
import { FitnessRings } from '../src/components/fitness-rings';
import { MacroOverviewSection } from '../src/components/macro-overview';
import { PosterHero } from '../src/components/poster-hero';
import { TrendSection } from '../src/components/trend-section';
import {
  getAllHistoryRecords,
  getCachedWorkoutArtifacts,
  getTodayRecordsFromUpstream,
  getTodayTotalsFromUpstream,
  toHeatmapEntries,
  toRecentHistoryRecords,
} from '../src/lib/moke/cache-service';
import { formatDistanceKm, formatDuration } from '../src/lib/moke/formatters';
import { buildCalendarHeatmap, buildTrendCards } from '../src/lib/oarboard/calendar-data';
import { buildDashboardData, buildWorkoutDetailPanel } from '../src/lib/oarboard/dashboard-data';
import { buildDnaMap } from '../src/lib/oarboard/dna-data';
import { buildFitnessFatigueData } from '../src/lib/oarboard/fitness-fatigue-data';
import { buildMilestones } from '../src/lib/oarboard/milestones-data';
import { buildTodayPosterHeroData } from '../src/lib/oarboard/poster-data';
import { addMissingWorkoutTotals, mergeWorkoutRecords, summarizeWorkoutTotals } from '../src/lib/oarboard/today-data';
import { buildTimeMachineEntry } from '../src/lib/oarboard/time-machine-data';
import type { DnaFingerprint } from '../src/lib/oarboard/dna-data';
import type { MokeWorkoutRecord, MokeWorkoutTotals, MokeWorkoutTotalsResponse } from '../src/lib/moke/types';

function mapById<T extends { _id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item._id, item]));
}

function serializeDnaMap(records: MokeWorkoutRecord[]): Record<string, DnaFingerprint> {
  return Object.fromEntries(buildDnaMap(records).entries());
}

export const dynamic = 'force-dynamic';

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getToday(): string {
  return fmtDate(new Date());
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: fmtDate(start), end: fmtDate(end) };
}

function formatMonthDay(day: string): string {
  const date = new Date(`${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return day;
  }

  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function getNextDistanceMilestone(totalDistanceKm: number, milestones: Array<{ id: string; label: string; achieved: boolean }>) {
  const distanceMilestone = milestones.find((milestone) => !milestone.achieved && milestone.id.startsWith('distance-'));
  const targetKm = distanceMilestone ? Number(distanceMilestone.id.replace('distance-', '')) : Math.ceil(totalDistanceKm / 100) * 100 || 50;

  return {
    label: `${targetKm} km`,
    targetKm,
  };
}

function zeroTotals(): MokeWorkoutTotals {
  return {
    totalDistance: 0,
    totalCalorie: 0,
    totalDuration: 0,
    sportCount: 0,
  };
}

export default async function HomePage() {
  const accountId = process.env.MOKE_ACCOUNT_ID;
  const authorization = process.env.MOKE_AUTHORIZATION;
  const baseUrl = process.env.MOKE_BASE_URL;

  const today = getToday();
  const currentMonth = getCurrentMonth();

  let authError: string | null = null;

  if (authorization && !accountId) {
    authError = 'MOKE_ACCOUNT_ID is missing. Add it to your environment variables before deploying.';
  }

  const emptyTotals: MokeWorkoutTotalsResponse = {
    code: 200,
    data: { totalDistance: 0, totalCalorie: 0, totalDuration: 0, sportCount: 0 },
  };

  let summary = null;
  let heatmapArtifact = null;

  if (accountId) {
    try {
      const cached = await getCachedWorkoutArtifacts({ accountId, authorization, baseUrl });
      summary = cached.summary;
      heatmapArtifact = cached.heatmap;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      authError = message.includes('401') ? 'MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.' : message;
    }
  }

  const summaryTotals = summary?.totals ?? zeroTotals();
  const cachedHistoryRecords = summary ? toRecentHistoryRecords(summary) : [];
  const cachedAllHistoryRecords = accountId ? await getAllHistoryRecords(accountId).catch(() => cachedHistoryRecords) : cachedHistoryRecords;
  const cachedRecordsForAnalysis = cachedAllHistoryRecords.length > 0 ? cachedAllHistoryRecords : cachedHistoryRecords;
  const cachedTodayRecords = cachedRecordsForAnalysis.filter((record) => record.day === today);

  let todayTotals = emptyTotals;

  if (accountId) {
    try {
      todayTotals = await getTodayTotalsFromUpstream({ accountId, authorization, baseUrl, today });
    } catch (error) {
      if (!authError) {
        const message = error instanceof Error ? error.message : String(error);
        authError = message.includes('401') ? 'MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.' : message;
      }
    }
  }

  let liveTodayRecords: MokeWorkoutRecord[] = [];
  const expectedTodaySessions = todayTotals.data.sportCount ?? 0;

  if (accountId && expectedTodaySessions > cachedTodayRecords.length) {
    try {
      liveTodayRecords = await getTodayRecordsFromUpstream({ accountId, authorization, baseUrl, today });
    } catch (error) {
      if (!authError) {
        const message = error instanceof Error ? error.message : String(error);
        authError = message.includes('401') ? 'MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.' : message;
      }
    }
  }

  const historyRecords = mergeWorkoutRecords(cachedHistoryRecords, liveTodayRecords);
  const recordsForAnalysis = mergeWorkoutRecords(cachedRecordsForAnalysis, liveTodayRecords);
  const todayRecords = recordsForAnalysis.filter((record) => record.day === today);
  const effectiveSummaryTotals = addMissingWorkoutTotals(summaryTotals, cachedRecordsForAnalysis, liveTodayRecords);
  const dnaById = serializeDnaMap(historyRecords);
  const milestones = buildMilestones(recordsForAnalysis, effectiveSummaryTotals.totalDistance, today);
  const fitnessFatigue = buildFitnessFatigueData(recordsForAnalysis, today);
  const timeMachineEntry = buildTimeMachineEntry(recordsForAnalysis, todayRecords, today);
  const historyById = mapById(recordsForAnalysis);
  const latestRecord = recordsForAnalysis[0] ?? null;

  const hero = buildTodayPosterHeroData(todayRecords, today);
  const hasWorkoutToday = expectedTodaySessions > 0 || todayRecords.length > 0;
  const nextMilestone = getNextDistanceMilestone(effectiveSummaryTotals.totalDistance, milestones);
  const emptyStateHero = latestRecord ? {
    title: '今天还没开始运动',
    subtitle: `下一个里程碑：${nextMilestone.label}`,
    recentWorkout: `上次训练在 ${formatMonthDay(latestRecord.day)}，完成 ${formatDistanceKm(latestRecord.sumMileage * 1000)}，用时 ${formatDuration(latestRecord.sumDuration)}，消耗 ${Math.round(latestRecord.sumCalorie)} kcal`,
    milestone: {
      currentKm: effectiveSummaryTotals.totalDistance,
      targetKm: nextMilestone.targetKm,
      targetLabel: nextMilestone.label,
    },
  } : null;

  const dashboard = buildDashboardData(historyRecords, effectiveSummaryTotals);
  const fallbackDetail = {
    title: today,
    subtitle: 'No workout data',
    averagePace: '--:--/500m',
    averageSpeed: '0.00 km/h',
    averageRpm: '0.00 spm',
    totalTurns: '0',
    chartPoints: [],
  };
  const detailsById = Object.fromEntries(
    historyRecords.map((record) => [record._id, buildWorkoutDetailPanel(historyById[record._id] ?? record)]),
  );

  if (Object.keys(detailsById).length === 0) {
    detailsById.fallback = fallbackDetail;
  }

  const heatmap = buildCalendarHeatmap(heatmapArtifact ? toHeatmapEntries(heatmapArtifact) : []);
  const currentMonthSummary = summarizeWorkoutTotals(
    recordsForAnalysis.filter((record) => record.month === currentMonth),
  );
  const currentYearSummary = summarizeWorkoutTotals(
    recordsForAnalysis.filter((record) => record.year === String(new Date().getFullYear())),
  );

  const { start: weekStart, end: weekEnd } = getWeekRange();
  const thisWeekRecords = historyRecords.filter((r) => r.day >= weekStart && r.day <= weekEnd);
  
  const currentWeekSummary = thisWeekRecords.reduce(
    (acc, record) => {
      acc.totalDistance += record.sumMileage;
      acc.totalCalorie += record.sumCalorie;
      acc.totalDuration += record.sumDuration;
      acc.sportCount += 1;
      return acc;
    },
    { totalDistance: 0, totalCalorie: 0, totalDuration: 0, sportCount: 0 }
  );

  const weekCards = buildTrendCards(currentWeekSummary);
  const monthCards = buildTrendCards(currentMonthSummary);
  const yearCards = buildTrendCards(currentYearSummary);

  const lifetimeRaw = {
    totalDurationRaw: effectiveSummaryTotals.totalDuration,
    totalCaloriesRaw: effectiveSummaryTotals.totalCalorie,
    totalDistanceRaw: effectiveSummaryTotals.totalDistance,
    sportCount: effectiveSummaryTotals.sportCount ?? 0,
  };

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute -right-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[72px]" />
      <div className="pointer-events-none absolute -left-20 bottom-16 h-80 w-80 rounded-full bg-rose-400/15 blur-[72px]" />

      <div className="relative z-10 px-6 py-6 lg:px-10 lg:py-8">
        <header className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="inline-flex items-center gap-3 tracking-[0.08em] uppercase">
            <span className="inline-flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full border border-white/18 bg-white/6 shadow-[inset_0_0_24px_rgba(255,255,255,0.06)]">OB</span>
            <span className="text-[0.92rem] font-bold">OarBoard</span>
          </div>
          <div className="text-[0.82rem] tracking-[0.05em] text-oar-muted">个人划船数据面板</div>
        </header>

        <div>
          <PosterHero
            averagePace={hero.averagePace}
            averageRpm={hero.averageRpm}
            totalTurns={hero.totalTurns}
            duration={hero.primaryValue}
            distance={formatDistanceKm(hero.distance.value)}
            calories={`${Math.round(hero.calorie.value)} kcal`}
            hasWorkout={hasWorkoutToday}
            ringData={{ calorie: hero.calorie, duration: hero.duration, distance: hero.distance }}
            timeMachineEntry={timeMachineEntry}
            emptyState={emptyStateHero}
          >
            <FitnessRings
              calorie={hero.calorie}
              duration={hero.duration}
              distance={hero.distance}
              dateLabel={hero.dateLabel}
            />
          </PosterHero>

          {authError ? (
            <div className="mt-4 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/[0.08] px-5 py-4 text-sm leading-7 text-amber-100">
              <strong className="font-semibold">Token 状态异常:</strong> {authError}
            </div>
          ) : null}

          <MacroOverviewSection heatmap={heatmap} lifetimeRaw={lifetimeRaw} fitnessFatigue={fitnessFatigue} />

          <TrendSection weekCards={weekCards} monthCards={monthCards} yearCards={yearCards} />

          <DashboardSection
            historyRows={dashboard.historyRows}
            detailsById={detailsById}
            dnaById={dnaById}
            milestones={milestones}
            defaultSelectedId={dashboard.selectedWorkoutId ?? Object.keys(detailsById)[0] ?? null}
          />
        </div>

        <footer className="mt-10 flex flex-col items-start justify-between gap-4 py-4 lg:flex-row lg:items-center">
          <div className="text-[0.82rem] tracking-[0.05em] text-oar-muted">专注每一桨，记录每一程。</div>
          <div className="text-[0.82rem] tracking-[0.05em] text-oar-muted">OarBoard &copy; {new Date().getFullYear()}</div>
        </footer>
      </div>
    </main>
  );
}
