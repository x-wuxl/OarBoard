import type { CachedHeatmapFile, CachedIndexFile, CachedMonthFile, CachedSummaryFile } from './cache-types';
import {
  buildWorkoutCacheArtifacts,
  readWorkoutHeatmapCache,
  readWorkoutIndexCache,
  readWorkoutMonthCache,
  readWorkoutSummaryCache,
  writeWorkoutCache,
} from './cache-store';
import { fetchWorkoutList, fetchWorkoutTotals, flattenWorkoutGroups } from './service';
import type { MokeWorkoutRecord } from './types';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REFRESH_LOOKBACK_DAYS = 7;
const FULL_FETCH_MONTHS = 12;

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getRecentMonths(count: number, from = new Date()): string[] {
  const months: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    months.push(fmtMonth(d));
  }
  return months;
}

function isCacheFresh(updatedAt?: string | null): boolean {
  if (!updatedAt) {
    return false;
  }

  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < CACHE_TTL_MS;
}

function monthKeyFromDay(day: string | null): string | null {
  if (!day || day.length < 7) {
    return null;
  }
  return day.slice(0, 7);
}

function getRefreshMonths(latestWorkoutDay: string | null): string[] {
  const now = new Date();
  const lookbackDate = new Date(now);
  lookbackDate.setDate(now.getDate() - REFRESH_LOOKBACK_DAYS);

  const monthSet = new Set<string>();
  monthSet.add(fmtMonth(now));
  monthSet.add(fmtMonth(lookbackDate));

  const latestMonth = monthKeyFromDay(latestWorkoutDay);
  if (latestMonth) {
    monthSet.add(latestMonth);

    const latestDate = new Date(`${latestWorkoutDay}T00:00:00`);
    if (!Number.isNaN(latestDate.getTime())) {
      let cursor = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      while (cursor <= currentMonthStart) {
        monthSet.add(fmtMonth(cursor));
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
    }
  }

  return [...monthSet].sort();
}

async function fetchMonths(accountId: string, months: string[], requestOptions: { authorization?: string; baseUrl?: string }) {
  const monthLists = await Promise.all(
    months.map((month) => fetchWorkoutList({
      accountId,
      page: 1,
      type: 3,
      deviceType: 2,
      condition: month,
    }, requestOptions)),
  );

  return dedupeRecords(monthLists.flatMap((response) => flattenWorkoutGroups(response)));
}

async function readCachedRecordsFromMonths(accountId: string, index: CachedIndexFile | null) {
  if (!index) {
    return [];
  }

  const monthFiles = await Promise.all(
    index.months.map((month) => readWorkoutMonthCache(accountId, month.month)),
  );

  return monthFiles
    .filter((month): month is CachedMonthFile => month !== null)
    .flatMap((month) => month.records)
    .map((record) => ({
      _id: record.id,
      accountId,
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

function mergeRecords(existingRecords: MokeWorkoutRecord[], incomingRecords: MokeWorkoutRecord[]) {
  return dedupeRecords([...existingRecords, ...incomingRecords]);
}

async function refreshCachedWorkoutArtifacts(input: {
  accountId: string;
  authorization?: string;
  baseUrl?: string;
  existingSummary: CachedSummaryFile | null;
  existingHeatmap: CachedHeatmapFile | null;
}) {
  const requestOptions = {
    authorization: input.authorization,
    baseUrl: input.baseUrl,
  };

  const index = await readWorkoutIndexCache(input.accountId);
  const cachedRecords = await readCachedRecordsFromMonths(input.accountId, index);
  const refreshMonths = getRefreshMonths(index?.latestWorkoutDay ?? null);
  const incomingRecords = await fetchMonths(input.accountId, refreshMonths, requestOptions);
  const mergedRecords = mergeRecords(cachedRecords, incomingRecords);

  try {
    const artifacts = await writeWorkoutCache(input.accountId, mergedRecords);
    return { summary: artifacts.summary, heatmap: artifacts.heatmap, source: 'upstream' as const };
  } catch {
    const artifacts = buildWorkoutCacheArtifacts(input.accountId, mergedRecords);
    return { summary: artifacts.summary, heatmap: artifacts.heatmap, source: 'upstream' as const };
  }
}

async function fetchAllWorkoutArtifacts(input: {
  accountId: string;
  authorization?: string;
  baseUrl?: string;
}) {
  const requestOptions = {
    authorization: input.authorization,
    baseUrl: input.baseUrl,
  };

  const months = getRecentMonths(FULL_FETCH_MONTHS);
  const records = await fetchMonths(input.accountId, months, requestOptions);

  try {
    const artifacts = await writeWorkoutCache(input.accountId, records);
    return { summary: artifacts.summary, heatmap: artifacts.heatmap, source: 'upstream' as const };
  } catch {
    const artifacts = buildWorkoutCacheArtifacts(input.accountId, records);
    return { summary: artifacts.summary, heatmap: artifacts.heatmap, source: 'upstream' as const };
  }
}

export async function getCachedWorkoutArtifacts(input: {
  accountId: string;
  authorization?: string;
  baseUrl?: string;
}) {
  const summary = await readWorkoutSummaryCache(input.accountId);
  const heatmap = await readWorkoutHeatmapCache(input.accountId);

  if (summary && heatmap && isCacheFresh(summary.updatedAt) && isCacheFresh(heatmap.updatedAt)) {
    return { summary, heatmap, source: 'cache' as const };
  }

  if (summary && heatmap) {
    try {
      return await refreshCachedWorkoutArtifacts({
        accountId: input.accountId,
        authorization: input.authorization,
        baseUrl: input.baseUrl,
        existingSummary: summary,
        existingHeatmap: heatmap,
      });
    } catch {
      return { summary, heatmap, source: 'cache' as const };
    }
  }

  return fetchAllWorkoutArtifacts(input);
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

export async function getTodayRecordsFromUpstream(input: {
  accountId: string;
  authorization?: string;
  baseUrl?: string;
  today: string;
}) {
  const response = await fetchWorkoutList({
    accountId: input.accountId,
    page: 1,
    type: 3,
    deviceType: 2,
    condition: input.today,
  }, {
    authorization: input.authorization,
    baseUrl: input.baseUrl,
  });

  return dedupeRecords(flattenWorkoutGroups(response).filter((record) => record.day === input.today));
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

function toWorkoutRecord(accountId: string, record: CachedMonthFile['records'][number]): MokeWorkoutRecord {
  return {
    _id: record.id,
    accountId,
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
  };
}

export function toRecentHistoryRecords(summary: CachedSummaryFile) {
  return summary.recentRecords.map((record) => toWorkoutRecord(summary.accountId, record));
}

export async function getAllHistoryRecords(accountId: string): Promise<MokeWorkoutRecord[]> {
  const index = await readWorkoutIndexCache(accountId);
  const monthFiles = await Promise.all((index?.months ?? []).map((month) => readWorkoutMonthCache(accountId, month.month)));

  return monthFiles
    .filter((month): month is CachedMonthFile => month !== null)
    .flatMap((month) => month.records.map((record) => toWorkoutRecord(accountId, record)))
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
}
