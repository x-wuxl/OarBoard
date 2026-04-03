export interface MokeApiResponse<T> {
  code: number | string;
  data: T;
}

export interface MokeWorkoutRecord {
  _id: string;
  accountId: string;
  deviceType: string;
  sumMileage: number;
  sumCalorie: number;
  sumDuration: number;
  startTime: string;
  turns: string;
  paceList: string;
  rpmList: string;
  createTime: string;
  day: string;
  year: string;
  month: string;
}

export interface MokeWorkoutGroup {
  _id: string;
  dayData: MokeWorkoutRecord[];
}

export interface MokeWorkoutTotals {
  _id?: string;
  totalCalorie: number;
  totalDistance: number;
  totalDuration: number;
  sportCount?: number;
}

export interface MokeWorkoutHistoryEntry {
  _id: string;
  totalDistance: number;
}

export interface MokeHomePageData {
  accountId: string;
  userName: string | null;
  avatar: string | null;
  phone: string | null;
  sumCalorie: number;
  sumDuration: number;
  sumMileage: number;
  _id: string;
}

export interface WorkoutListQuery {
  accountId: string;
  page?: number;
  type: 1 | 2 | 3;
  deviceType?: string | number;
  condition: string | number;
}

export interface WorkoutTotalsQuery {
  accountId: string;
  type: 1 | 2 | 3;
  deviceType?: string | number;
  condition: string | number;
}

export interface WorkoutListItemView extends MokeWorkoutRecord {
  formattedDuration: string;
  formattedDistance: string;
  formattedStartTime: string;
  averagePace: string;
}

export interface WorkoutHistoryItemView extends MokeWorkoutHistoryEntry {
  label: string;
  formattedDistance: string;
}

export interface WorkoutDetailMetricView {
  averageSpeed: number;
  averageRpm: number;
  averagePace: string;
  totalTurns: number;
}

export interface WorkoutDetailChartPoint {
  minute: number;
  speed: number;
  rpm: number;
  pace: string;
}

export type MokeWorkoutListResponse = MokeApiResponse<MokeWorkoutGroup[]>;
export type MokeWorkoutDetailResponse = MokeApiResponse<MokeWorkoutRecord>;
export type MokeWorkoutTotalsResponse = MokeApiResponse<MokeWorkoutTotals>;
export type MokeHomePageResponse = MokeApiResponse<MokeHomePageData>;
export type MokeWorkoutHistoryResponse = MokeApiResponse<MokeWorkoutHistoryEntry[]>;
