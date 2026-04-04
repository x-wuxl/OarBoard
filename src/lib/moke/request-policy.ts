export interface MokeRequestPolicy {
  nextRevalidate?: number;
  timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 8000;

export function getMokeRequestPolicy(path: string): MokeRequestPolicy {
  if (path.includes('/obtainSportDetailById')) {
    return {
      timeoutMs: 8000,
    };
  }

  if (path.includes('/obtainSportDataByDay')) {
    return {
      nextRevalidate: 300,
      timeoutMs: 8000,
    };
  }

  if (path.includes('/obtainUserSporTotalByType') || path.includes('/obtainHomePageData')) {
    return {
      nextRevalidate: 600,
      timeoutMs: 6000,
    };
  }

  if (path.includes('/obtainUserSporTotalListByDeviceType')) {
    return {
      nextRevalidate: 900,
      timeoutMs: 8000,
    };
  }

  return {
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
}
