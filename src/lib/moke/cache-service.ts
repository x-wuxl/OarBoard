import type { CachedHeatmapFile, CachedSummaryFile } from './cache-types';
import { readWorkoutHeatmapCache, readWorkoutSummaryCache, writeWorkoutCache } from './cache-store';
import { fetchWorkoutList, fetchWorkoutTotals, flattenWorkoutGroups } from './service';
import type { MokeWorkoutRecord } from './types';

function getRecentMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export async function getCachedWorkoutArtifacts(input: {
  accountId: string;
  authorization?: string;
  baseUrl?: string;
}) {
  const summary = await readWorkoutSummaryCache(input.accountId);
  const heatmap = await readWorkoutHeatmapCache(input.accountId);

  if (summary && heatmap) {
    return { summary, heatmap, source: 'cache' as const };
  }

  const requestOptions = {
    authorization: input.authorization,
    baseUrl: input.baseUrl,
  };

  const months = getRecentMonths(12);
  const monthLists = await Promise.all(
    months.map((month) => fetchWorkoutList({
      accountId: input.accountId,
      page: 1,
      type: 3,
      deviceType: 2,
      condition: month,
    }, requestOptions)),
  );

  const records = monthLists.flatMap((response) => flattenWorkoutGroups(response));
  await writeWorkoutCache(input.accountId, dedupeRecords(records));

  const refreshedSummary = await readWorkoutSummaryCache(input.accountId);
  const refreshedHeatmap = await readWorkoutHeatmapCache(input.accountId);

  if (!refreshedSummary || !refreshedHeatmap) {
    throw new Error('Failed to build workout cache artifacts');
  }

  return { summary: refreshedSummary, heatmap: refreshedHeatmap, source: 'upstream' as const };
}

export async function getTodayTotalsFromUpstream(input: {
  accountId: string;
  authorization?: string;
  baseUrl?: string;
  today: string;
}) {
  return fetchWorkoutTotals({
    accountId: input.accountId,
    type: 1,
    deviceType: 2,
    condition: input.today,
  }, {
    authorization: input.authorization,
    baseUrl: input.baseUrl,
  });
}

function dedupeRecords(records: MokeWorkoutRecord[]) {
  return [...new Map(records.map((record) => [record._id, record])).values()]
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export function toHeatmapEntries(heatmap: CachedHeatmapFile) {
  return Object.entries(heatmap.days)
    .map(([date, value]) => ({ _id: date, totalDistance: value.distance }))
    .sort((a, b) => a._id.localeCompare(b._id));
}

export function toRecentHistoryRecords(summary: CachedSummaryFile) {
  return summary.recentRecords.map((record) => ({
    _id: record.id,
    accountId: summary.accountId,
    deviceType: record.deviceType,
    sumMileage: record.sumMileage,
    sumCalorie: record.sumCalorie,
    sumDuration: record.sumDuration,
    startTime: record.startTime,
    turns: String(record.turns),
    paceList: record.paceList.join(','),
    rpmList: record.rpmList.join(','),
    createTime: record.createTime,
    day: record.day,
    year: record.year,
    month: record.month,
  }));
}
