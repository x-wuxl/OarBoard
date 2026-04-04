import { CalendarFirstSection } from '../src/components/calendar-first-section';
import { DashboardSection } from '../src/components/dashboard-section';
import { FitnessRings } from '../src/components/fitness-rings';
import { LifetimeStats } from '../src/components/lifetime-stats';
import { PosterHero } from '../src/components/poster-hero';
import { getCachedWorkoutArtifacts, getTodayTotalsFromUpstream, toHeatmapEntries, toRecentHistoryRecords } from '../src/lib/moke/cache-service';
import { formatDistanceKm, formatDuration } from '../src/lib/moke/formatters';
import { buildCalendarHeatmap, buildTrendCards } from '../src/lib/oarboard/calendar-data';
import { buildDashboardData, buildWorkoutDetailPanel } from '../src/lib/oarboard/dashboard-data';
import { buildTodayPosterHeroData } from '../src/lib/oarboard/poster-data';
import type { MokeWorkoutTotalsResponse } from '../src/lib/moke/types';

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

function getCurrentWeekRange(): string {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${fmtDate(start)}/${fmtDate(end)}`;
}

export default async function HomePage() {
  const accountId = process.env.MOKE_ACCOUNT_ID;
  const authorization = process.env.MOKE_AUTHORIZATION;
  const baseUrl = process.env.MOKE_BASE_URL;

  const today = getToday();
  const currentMonth = getCurrentMonth();
  const currentWeekRange = getCurrentWeekRange();

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
  let cacheSource: 'cache' | 'upstream' | 'empty' = 'empty';

  if (accountId) {
    try {
      const cached = await getCachedWorkoutArtifacts({ accountId, authorization, baseUrl });
      summary = cached.summary;
      heatmapArtifact = cached.heatmap;
      cacheSource = cached.source;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      authError = message.includes('401') ? 'MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.' : message;
    }
  }

  const summaryTotals = summary?.totals ?? {
    totalDistance: 0,
    totalCalorie: 0,
    totalDuration: 0,
    sportCount: 0,
  };
  const historyRecords = summary ? toRecentHistoryRecords(summary) : [];
  const todayRecords = historyRecords.filter((record) => record.day === today);

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

  const hero = buildTodayPosterHeroData(todayRecords, today);
  const hasWorkoutToday = (todayTotals.data.sportCount ?? 0) > 0 || todayRecords.length > 0;

  const dashboard = buildDashboardData(historyRecords, summaryTotals);
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
    historyRecords.map((record) => [record._id, buildWorkoutDetailPanel(record)]),
  );

  if (Object.keys(detailsById).length === 0) {
    detailsById.fallback = fallbackDetail;
  }

  const heatmap = buildCalendarHeatmap(heatmapArtifact ? toHeatmapEntries(heatmapArtifact) : []);
  const recentMonths = summary?.recentMonths ?? [];
  const currentMonthSummary = recentMonths.find((month) => month.month === currentMonth);
  const currentYearSummary = recentMonths
    .filter((month) => month.month.startsWith(`${new Date().getFullYear()}-`))
    .reduce(
      (acc, month) => {
        acc.totalDistance += month.distance;
        acc.totalCalorie += month.calorie;
        acc.totalDuration += month.duration;
        acc.sportCount += month.sportCount;
        return acc;
      },
      { totalDistance: 0, totalCalorie: 0, totalDuration: 0, sportCount: 0 },
    );

  const weekCards = buildTrendCards(todayTotals.data);
  const monthCards = buildTrendCards(currentMonthSummary
    ? {
        totalDistance: currentMonthSummary.distance,
        totalCalorie: currentMonthSummary.calorie,
        totalDuration: currentMonthSummary.duration,
        sportCount: currentMonthSummary.sportCount,
      }
    : emptyTotals.data);
  const yearCards = buildTrendCards(currentYearSummary);

  const lifetimeDuration = formatDuration(summaryTotals.totalDuration);
  const lifetimeCalories = `${Math.round(summaryTotals.totalCalorie)} kcal`;
  const lifetimeDistance = formatDistanceKm(summaryTotals.totalDistance * 1000);
  const lifetimeSportCount = summaryTotals.sportCount ?? 0;

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

          {cacheSource !== 'empty' ? (
            <div className="mt-4 text-xs tracking-[0.08em] text-oar-muted">
              数据来源: {cacheSource === 'cache' ? '本地缓存' : '上游同步'}
              <span className="ml-3">周期: {currentWeekRange}</span>
            </div>
          ) : null}

          <LifetimeStats
            totalDuration={lifetimeDuration}
            totalCalories={lifetimeCalories}
            totalDistance={lifetimeDistance}
            sportCount={lifetimeSportCount}
          />

          <CalendarFirstSection
            heatmap={heatmap}
            weekCards={weekCards}
            monthCards={monthCards}
            yearCards={yearCards}
          />

          <DashboardSection
            historyRows={dashboard.historyRows}
            detailsById={detailsById}
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

