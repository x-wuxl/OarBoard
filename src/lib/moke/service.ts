import { MokeApiError, createMokeClient, type MokeClientOptions } from './client';
import {
  formatDistanceKm,
  formatDuration,
  formatPacePer500m,
  formatTimestamp,
  parseNumberSeries,
} from './formatters';
import type {
  MokeHomePageResponse,
  MokeWorkoutDetailResponse,
  MokeWorkoutGroup,
  MokeWorkoutHistoryResponse,
  MokeWorkoutListResponse,
  MokeWorkoutRecord,
  MokeWorkoutTotalsResponse,
  WorkoutDetailChartPoint,
  WorkoutDetailMetricView,
  WorkoutHistoryItemView,
  WorkoutListItemView,
  WorkoutListQuery,
  WorkoutTotalsQuery,
} from './types';

function formatHistoryLabel(raw: string): string {
  return raw.replace('/', ' to ');
}

function hasWorkoutTotalsData(value: unknown): value is MokeWorkoutTotalsResponse['data'] {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.totalDistance === 'number'
    && typeof candidate.totalCalorie === 'number'
    && typeof candidate.totalDuration === 'number'
    && (candidate.sportCount === undefined || typeof candidate.sportCount === 'number');
}

export function toWorkoutHistoryItems(response: MokeWorkoutHistoryResponse): WorkoutHistoryItemView[] {
  return response.data.map((item) => ({
    ...item,
    label: formatHistoryLabel(item._id),
    formattedDistance: formatDistanceKm(item.totalDistance * 1000),
  }));
}

export function flattenWorkoutGroups(response: MokeWorkoutListResponse | { data: MokeWorkoutGroup[] }): MokeWorkoutRecord[] {
  return response.data.flatMap((group) => group.dayData ?? []);
}

export function toWorkoutListItems(response: MokeWorkoutListResponse | { data: MokeWorkoutGroup[] }): WorkoutListItemView[] {
  return flattenWorkoutGroups(response).map((record) => {
    const speedSeries = parseNumberSeries(record.paceList).filter((value) => value > 0);
    const averageSpeed = speedSeries.length > 0
      ? speedSeries.reduce((sum, value) => sum + value, 0) / speedSeries.length
      : 0;

    return {
      ...record,
      formattedDuration: formatDuration(record.sumDuration),
      formattedDistance: formatDistanceKm(record.sumMileage * 1000),
      formattedStartTime: formatTimestamp(record.startTime),
      averagePace: formatPacePer500m(averageSpeed),
    };
  });
}

export function toDetailChartPoints(detail: MokeWorkoutRecord): WorkoutDetailChartPoint[] {
  const speeds = parseNumberSeries(detail.paceList);
  const rpms = parseNumberSeries(detail.rpmList);
  const length = Math.max(speeds.length, rpms.length);

  return Array.from({ length }, (_, index) => {
    const speed = speeds[index] ?? 0;
    const rpm = rpms[index] ?? 0;

    return {
      minute: index + 1,
      speed,
      rpm,
      pace: formatPacePer500m(speed),
    };
  });
}

export function buildDetailMetrics(detail: MokeWorkoutRecord): WorkoutDetailMetricView {
  const speeds = parseNumberSeries(detail.paceList).filter((value) => value > 0);
  const rpms = parseNumberSeries(detail.rpmList).filter((value) => value > 0);
  const averageSpeed = speeds.length > 0
    ? Number((speeds.reduce((sum, value) => sum + value, 0) / speeds.length).toFixed(2))
    : 0;
  const averageRpm = rpms.length > 0
    ? Number((rpms.reduce((sum, value) => sum + value, 0) / rpms.length).toFixed(2))
    : 0;

  return {
    averageSpeed,
    averageRpm,
    averagePace: formatPacePer500m(averageSpeed),
    totalTurns: Number(detail.turns) || 0,
  };
}

export async function fetchWorkoutList(query: WorkoutListQuery, options?: MokeClientOptions): Promise<MokeWorkoutListResponse> {
  const client = createMokeClient(options);
  return client.get('/obtainSportDataByDay', {
    accountId: query.accountId,
    page: query.page ?? 1,
    type: query.type,
    deviceType: query.deviceType ?? 2,
    condition: query.condition,
  });
}

export async function fetchWorkoutHistory(
  params: { page?: number; type: 1 | 2 | 3; deviceType?: string | number },
  options?: MokeClientOptions,
): Promise<MokeWorkoutHistoryResponse> {
  const client = createMokeClient(options);
  return client.get('/obtainUserSporTotalListByDeviceType', {
    page: params.page ?? 1,
    type: params.type,
    deviceType: params.deviceType ?? 2,
  });
}

export async function fetchWorkoutDetail(sportId: string, options?: MokeClientOptions): Promise<MokeWorkoutDetailResponse> {
  const client = createMokeClient(options);
  return client.get('/obtainSportDetailById', { sportId });
}

export async function fetchWorkoutTotals(query: WorkoutTotalsQuery, options?: MokeClientOptions): Promise<MokeWorkoutTotalsResponse> {
  const client = createMokeClient(options);
  const response = await client.get<MokeWorkoutTotalsResponse>('/obtainUserSporTotalByType', {
    accountId: query.accountId,
    type: query.type,
    deviceType: query.deviceType ?? 2,
    condition: query.condition,
  });

  if (!hasWorkoutTotalsData(response.data)) {
    throw new MokeApiError('Moke totals response is missing required data fields', 502, response, 'upstream');
  }

  return response;
}

export async function fetchHomePageData(accountId: string, deviceType = 2, options?: MokeClientOptions): Promise<MokeHomePageResponse> {
  const client = createMokeClient(options);
  return client.get('/obtainHomePageData', {
    accountId,
    deviceType,
  });
}
