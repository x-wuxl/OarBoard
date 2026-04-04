import path from 'node:path';
import { promises as fs } from 'node:fs';

import { parseNumberSeries } from './formatters';
import type { CachedHeatmapFile, CachedIndexFile, CachedMonthFile, CachedSummaryFile, CachedWorkoutRecord } from './cache-types';
import type { MokeWorkoutRecord } from './types';

const CACHE_ROOT = path.join(process.cwd(), '.cache', 'moke');

function getAccountCacheDir(accountId: string) {
  return path.join(CACHE_ROOT, accountId);
}

function getMonthPath(accountId: string, month: string) {
  return path.join(getAccountCacheDir(accountId), 'months', `${month}.json`);
}

function getSummaryPath(accountId: string) {
  return path.join(getAccountCacheDir(accountId), 'summary.json');
}

function getHeatmapPath(accountId: string) {
  return path.join(getAccountCacheDir(accountId), 'heatmap.json');
}

function getIndexPath(accountId: string) {
  return path.join(getAccountCacheDir(accountId), 'index.json');
}

async function ensureAccountCacheDir(accountId: string) {
  await fs.mkdir(path.join(getAccountCacheDir(accountId), 'months'), { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function normalizeRecord(record: MokeWorkoutRecord): CachedWorkoutRecord {
  return {
    id: record._id,
    day: record.day,
    month: record.month,
    year: record.year,
    startTime: record.startTime,
    sumMileage: record.sumMileage,
    sumCalorie: record.sumCalorie,
    sumDuration: record.sumDuration,
    turns: Number(record.turns) || 0,
    paceList: parseNumberSeries(record.paceList),
    rpmList: parseNumberSeries(record.rpmList),
    deviceType: record.deviceType,
    createTime: record.createTime,
  };
}

function buildMonthFile(accountId: string, month: string, records: MokeWorkoutRecord[]): CachedMonthFile {
  const normalized = records
    .map(normalizeRecord)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));

  const dailySummary = normalized.reduce<Record<string, { distance: number; calorie: number; duration: number; count: number }>>((acc, record) => {
    const existing = acc[record.day] ?? { distance: 0, calorie: 0, duration: 0, count: 0 };
    existing.distance += record.sumMileage;
    existing.calorie += record.sumCalorie;
    existing.duration += record.sumDuration;
    existing.count += 1;
    acc[record.day] = existing;
    return acc;
  }, {});

  const monthlySummary = normalized.reduce(
    (acc, record) => {
      acc.distance += record.sumMileage;
      acc.calorie += record.sumCalorie;
      acc.duration += record.sumDuration;
      acc.sportCount += 1;
      return acc;
    },
    { distance: 0, calorie: 0, duration: 0, sportCount: 0 },
  );

  return {
    accountId,
    month,
    updatedAt: new Date().toISOString(),
    records: normalized,
    dailySummary,
    monthlySummary,
  };
}

function buildHeatmapFile(accountId: string, months: CachedMonthFile[]): CachedHeatmapFile {
  const days = months.reduce<Record<string, { distance: number; count: number }>>((acc, month) => {
    for (const [day, summary] of Object.entries(month.dailySummary)) {
      acc[day] = {
        distance: summary.distance,
        count: summary.count,
      };
    }
    return acc;
  }, {});

  return {
    accountId,
    updatedAt: new Date().toISOString(),
    days,
  };
}

function buildSummaryFile(accountId: string, months: CachedMonthFile[]): CachedSummaryFile {
  const sortedMonths = [...months].sort((a, b) => b.month.localeCompare(a.month));
  const totals = sortedMonths.reduce(
    (acc, month) => {
      acc.totalDistance += month.monthlySummary.distance;
      acc.totalCalorie += month.monthlySummary.calorie;
      acc.totalDuration += month.monthlySummary.duration;
      acc.sportCount += month.monthlySummary.sportCount;
      return acc;
    },
    { totalDistance: 0, totalCalorie: 0, totalDuration: 0, sportCount: 0 },
  );

  const recentRecords = sortedMonths
    .flatMap((month) => month.records)
    .sort((a, b) => b.startTime.localeCompare(a.startTime))
    .slice(0, 20);

  return {
    accountId,
    updatedAt: new Date().toISOString(),
    totals,
    recentMonths: sortedMonths.slice(0, 12).map((month) => ({
      month: month.month,
      distance: month.monthlySummary.distance,
      calorie: month.monthlySummary.calorie,
      duration: month.monthlySummary.duration,
      sportCount: month.monthlySummary.sportCount,
    })),
    recentRecords,
  };
}

function buildIndexFile(accountId: string, months: CachedMonthFile[]): CachedIndexFile {
  const sortedMonths = [...months].sort((a, b) => b.month.localeCompare(a.month));
  const latestWorkoutDay = sortedMonths
    .flatMap((month) => month.records)
    .sort((a, b) => b.startTime.localeCompare(a.startTime))[0]?.day ?? null;

  return {
    accountId,
    updatedAt: new Date().toISOString(),
    months: sortedMonths.map((month) => ({
      month: month.month,
      recordCount: month.records.length,
      updatedAt: month.updatedAt,
    })),
    latestWorkoutDay,
  };
}

export function buildWorkoutCacheArtifacts(accountId: string, records: MokeWorkoutRecord[]) {
  const byMonth = records.reduce<Record<string, MokeWorkoutRecord[]>>((acc, record) => {
    const key = record.month;
    acc[key] ??= [];
    acc[key].push(record);
    return acc;
  }, {});

  const monthFiles = Object.entries(byMonth)
    .map(([month, monthRecords]) => buildMonthFile(accountId, month, monthRecords))
    .sort((a, b) => b.month.localeCompare(a.month));

  return {
    monthFiles,
    summary: buildSummaryFile(accountId, monthFiles),
    heatmap: buildHeatmapFile(accountId, monthFiles),
    index: buildIndexFile(accountId, monthFiles),
  };
}

export async function writeWorkoutCache(accountId: string, records: MokeWorkoutRecord[]) {
  const artifacts = buildWorkoutCacheArtifacts(accountId, records);
  await ensureAccountCacheDir(accountId);

  for (const monthFile of artifacts.monthFiles) {
    await writeJsonFile(getMonthPath(accountId, monthFile.month), monthFile);
  }

  await writeJsonFile(getSummaryPath(accountId), artifacts.summary);
  await writeJsonFile(getHeatmapPath(accountId), artifacts.heatmap);
  await writeJsonFile(getIndexPath(accountId), artifacts.index);

  return artifacts;
}

export async function readWorkoutSummaryCache(accountId: string) {
  return readJsonFile<CachedSummaryFile>(getSummaryPath(accountId));
}

export async function readWorkoutHeatmapCache(accountId: string) {
  return readJsonFile<CachedHeatmapFile>(getHeatmapPath(accountId));
}

export async function readWorkoutIndexCache(accountId: string) {
  return readJsonFile<CachedIndexFile>(getIndexPath(accountId));
}

export async function readWorkoutMonthCache(accountId: string, month: string) {
  return readJsonFile<CachedMonthFile>(getMonthPath(accountId, month));
}
