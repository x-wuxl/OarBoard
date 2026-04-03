import { CalendarFirstSection } from '../src/components/calendar-first-section';
import { DashboardSection } from '../src/components/dashboard-section';
import { FitnessRings } from '../src/components/fitness-rings';
import { LifetimeStats } from '../src/components/lifetime-stats';
import { PosterHero } from '../src/components/poster-hero';
import { formatDistanceKm, formatDuration } from '../src/lib/moke/formatters';
import { fetchWorkoutHistory, fetchWorkoutList, fetchWorkoutTotals, flattenWorkoutGroups } from '../src/lib/moke/service';
import { buildCalendarHeatmap, buildTrendCards } from '../src/lib/oarboard/calendar-data';
import { buildDashboardData, buildWorkoutDetailPanel } from '../src/lib/oarboard/dashboard-data';
import { buildPosterHeroData } from '../src/lib/oarboard/poster-data';
import type { MokeWorkoutHistoryResponse, MokeWorkoutListResponse, MokeWorkoutTotalsResponse } from '../src/lib/moke/types';

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

function getLifetimeRange(): string {
  return `2020-01-01/${fmtDate(new Date())}`;
}

function getRecentMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

async function fetchDailyHistoryPages(requestOptions: { authorization?: string }, maxPages = 50) {
  const entries: MokeWorkoutHistoryResponse['data'] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchWorkoutHistory({ page, type: 1, deviceType: 2 }, requestOptions);
    const pageData = response.data ?? [];

    if (pageData.length === 0) {
      break;
    }

    entries.push(...pageData);
  }

  return entries;
}

export default async function HomePage() {
  const accountId = process.env.MOKE_ACCOUNT_ID;
  const requestOptions = {
    authorization: process.env.MOKE_AUTHORIZATION,
    baseUrl: process.env.MOKE_BASE_URL,
  };

  const today = getToday();
  const currentMonth = getCurrentMonth();
  const currentWeekRange = getCurrentWeekRange();
  const lifetimeRange = getLifetimeRange();
  const recentMonths = getRecentMonths(12);

  let authError: string | null = null;
  const emptyList: MokeWorkoutListResponse = { code: 200, data: [] };
  const emptyTotals: MokeWorkoutTotalsResponse = {
    code: 200,
    data: { totalDistance: 0, totalCalorie: 0, totalDuration: 0, sportCount: 0 },
  };
  const emptyHistory: MokeWorkoutHistoryResponse = { code: 200, data: [] };

  if (requestOptions.authorization && !accountId) {
    authError = 'MOKE_ACCOUNT_ID is missing. Add it to your environment variables before deploying.';
  }

  const settled = accountId
    ? await Promise.allSettled([
        fetchWorkoutList({
          accountId,
          page: 1,
          type: 1,
          deviceType: 2,
          condition: today,
        }, requestOptions),
        fetchWorkoutTotals({
          accountId,
          type: 1,
          deviceType: 2,
          condition: today,
        }, requestOptions),
        ...recentMonths.map((month) =>
          fetchWorkoutList({
            accountId,
            page: 1,
            type: 3,
            deviceType: 2,
            condition: month,
          }, requestOptions),
        ),
        fetchDailyHistoryPages(requestOptions),
        fetchWorkoutTotals({
          accountId,
          type: 2,
          deviceType: 2,
          condition: currentWeekRange,
        }, requestOptions),
        fetchWorkoutTotals({
          accountId,
          type: 3,
          deviceType: 2,
          condition: currentMonth,
        }, requestOptions),
        fetchWorkoutTotals({
          accountId,
          type: 3,
          deviceType: 2,
          condition: `${new Date().getFullYear()}-01`,
        }, requestOptions),
        fetchWorkoutTotals({
          accountId,
          type: 2,
          deviceType: 2,
          condition: lifetimeRange,
        }, requestOptions),
      ])
    : await Promise.allSettled([
        Promise.resolve(emptyList),
        Promise.resolve(emptyTotals),
        ...recentMonths.map(() => Promise.resolve(emptyList)),
        Promise.resolve(emptyHistory.data),
        Promise.resolve(emptyTotals),
        Promise.resolve(emptyTotals),
        Promise.resolve(emptyTotals),
        Promise.resolve(emptyTotals),
      ]);

  const firstFailure = settled.find((result) => result.status === 'rejected');
  if (firstFailure?.status === 'rejected') {
    const message = firstFailure.reason instanceof Error ? firstFailure.reason.message : String(firstFailure.reason);
    authError = message.includes('401') ? 'MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.' : message;
  }

  const workoutList = settled[0].status === 'fulfilled' ? settled[0].value : emptyList;
  const workoutTotals = settled[1].status === 'fulfilled' ? settled[1].value : emptyTotals;

  const historyLists = recentMonths.map((_, i) => {
    const idx = 2 + i;
    return settled[idx].status === 'fulfilled' ? settled[idx].value as MokeWorkoutListResponse : emptyList;
  });

  const baseIdx = 2 + recentMonths.length;
  const val = <T,>(idx: number, fallback: T): T => {
    const r = settled[idx];
    return r.status === 'fulfilled' ? r.value as T : fallback;
  };
  const dayHistory = val<MokeWorkoutHistoryResponse['data']>(baseIdx, emptyHistory.data);
  const weekTotals = val<MokeWorkoutTotalsResponse>(baseIdx + 1, emptyTotals);
  const monthTotals = val<MokeWorkoutTotalsResponse>(baseIdx + 2, emptyTotals);
  const yearTotals = val<MokeWorkoutTotalsResponse>(baseIdx + 3, emptyTotals);
  const lifetimeTotals = val<MokeWorkoutTotalsResponse>(baseIdx + 4, emptyTotals);

  const records = flattenWorkoutGroups(workoutList);
  const historyRecords = historyLists.flatMap((list) => flattenWorkoutGroups(list));
  const uniqueHistory = [...new Map(historyRecords.map((r) => [r._id, r])).values()]
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
  const [latestRecord] = records;
  const hero = latestRecord
    ? buildPosterHeroData(latestRecord)
    : {
        dateLabel: today,
        primaryValue: '00:00:00',
        averagePace: '--:--/500m',
        averageRpm: '0.00',
        totalTurns: '0',
        calorie: { value: 0, goal: 200 },
        duration: { value: 0, goal: 900 },
        distance: { value: 0, goal: 3000 },
      };

  const dashboard = buildDashboardData(uniqueHistory, workoutTotals.data);
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
    uniqueHistory.map((record) => [record._id, buildWorkoutDetailPanel(record)]),
  );

  if (latestRecord && !detailsById[latestRecord._id]) {
    detailsById[latestRecord._id] = buildWorkoutDetailPanel(latestRecord);
  }

  if (Object.keys(detailsById).length === 0) {
    detailsById['fallback'] = fallbackDetail;
  }

  const heatmap = buildCalendarHeatmap(dayHistory ?? []);
  const weekCards = buildTrendCards(weekTotals.data);
  const monthCards = buildTrendCards(monthTotals.data);
  const yearCards = buildTrendCards(yearTotals.data);

  const lt = lifetimeTotals.data;
  const lifetimeDuration = formatDuration(lt.totalDuration);
  const lifetimeCalories = `${Math.round(lt.totalCalorie)} kcal`;
  const lifetimeDistance = formatDistanceKm(lt.totalDistance * 1000);
  const lifetimeSportCount = lt.sportCount ?? 0;

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
            distance={latestRecord ? formatDistanceKm(latestRecord.sumMileage * 1000) : '0.00 km'}
            calories={latestRecord ? `${Math.round(latestRecord.sumCalorie)} kcal` : '0 kcal'}
            hasWorkout={!!latestRecord}
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

