export interface CachedWorkoutRecord {
  id: string;
  day: string;
  month: string;
  year: string;
  startTime: string;
  sumMileage: number;
  sumCalorie: number;
  sumDuration: number;
  turns: number;
  paceList: number[];
  rpmList: number[];
  deviceType: string;
  createTime: string;
}

export interface CachedDailySummary {
  distance: number;
  calorie: number;
  duration: number;
  count: number;
}

export interface CachedMonthFile {
  accountId: string;
  month: string;
  updatedAt: string;
  records: CachedWorkoutRecord[];
  dailySummary: Record<string, CachedDailySummary>;
  monthlySummary: {
    distance: number;
    calorie: number;
    duration: number;
    sportCount: number;
  };
}

export interface CachedHeatmapFile {
  accountId: string;
  updatedAt: string;
  days: Record<string, { distance: number; count: number }>;
}

export interface CachedSummaryFile {
  accountId: string;
  updatedAt: string;
  totals: {
    totalDistance: number;
    totalCalorie: number;
    totalDuration: number;
    sportCount: number;
  };
  recentMonths: Array<{
    month: string;
    distance: number;
    calorie: number;
    duration: number;
    sportCount: number;
  }>;
  recentRecords: CachedWorkoutRecord[];
}

export interface CachedIndexFile {
  accountId: string;
  updatedAt: string;
  months: Array<{
    month: string;
    recordCount: number;
    updatedAt: string;
  }>;
  latestWorkoutDay: string | null;
}
