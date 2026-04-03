import type {
  MokeHomePageResponse,
  MokeWorkoutDetailResponse,
  MokeWorkoutHistoryResponse,
  MokeWorkoutListResponse,
  MokeWorkoutTotalsResponse,
} from './types.js';

type MockPayload =
  | MokeWorkoutHistoryResponse
  | MokeWorkoutListResponse
  | MokeWorkoutDetailResponse
  | MokeWorkoutTotalsResponse
  | MokeHomePageResponse;

const mockResponses: Record<string, MockPayload> = {
  '/obtainUserSporTotalListByDeviceType': {
    code: '200',
    data: [
      { _id: '2026-03-31', totalDistance: 0 },
      { _id: '2026-03-30', totalDistance: 2.8 },
      { _id: '2026-03-27', totalDistance: 2.86 },
      { _id: '2026-03-26', totalDistance: 2.82 },
      { _id: '2026-03-25', totalDistance: 3.2 },
    ],
  },
  '/obtainSportDataByDay': {
    code: 200,
    data: [
      {
        _id: '2026-03',
        dayData: [
          {
            _id: '69ca163fa3ef2b13719eedc1',
            accountId: 'd8f55f82984a45979e7bda2aa1c28172',
            deviceType: '2',
            sumMileage: 2.8,
            sumCalorie: 200,
            sumDuration: 821,
            startTime: '2026-03-30 14:03:47.937197',
            turns: '409',
            paceList: '7.59,13.86,16.8',
            rpmList: '23,33,35',
            createTime: '2026-03-30T14:20:47.443Z',
            day: '2026-03-30',
            year: '2026',
            month: '2026-03',
          },
        ],
      },
    ],
  },
  '/obtainSportDetailById': {
    code: 200,
    data: {
      _id: '69ca163fa3ef2b13719eedc1',
      accountId: 'd8f55f82984a45979e7bda2aa1c28172',
      deviceType: '2',
      sumMileage: 2.8,
      sumCalorie: 200,
      sumDuration: 821,
      startTime: '2026-03-30 14:03:47.937197',
      turns: '409',
      paceList: '7.59,13.86,16.8,17.76,13.86',
      rpmList: '23,33,35,37,33',
      createTime: '2026-03-30T14:20:47.443Z',
      day: '2026-03-30',
      year: '2026',
      month: '2026-03',
    },
  },
  '/obtainUserSporTotalByType': {
    code: 200,
    data: {
      _id: '2026-03-30/2026-04-05',
      totalDistance: 2.8,
      totalCalorie: 200,
      totalDuration: 821,
      sportCount: 1,
    },
  },
  '/obtainHomePageData': {
    code: '200',
    data: {
      accountId: 'd8f55f82984a45979e7bda2aa1c28172',
      userName: 'Mock User',
      avatar: 'ld/avatar/mock',
      phone: '17777777777',
      sumCalorie: 0,
      sumDuration: 0,
      sumMileage: 0,
      _id: 'd8f55f82984a45979e7bda2aa1c28172',
    },
  },
};

export function normalizeProxyPath(path: string[] | string): string {
  if (Array.isArray(path)) {
    return path.length === 0 ? '/' : `/${path.join('/')}`;
  }

  return path.startsWith('/') ? path : `/${path}`;
}

export function hasMockResponseForPath(path: string): boolean {
  return path in mockResponses;
}

export function getMockResponseForPath(path: string): MockPayload | null {
  return mockResponses[path] ?? null;
}
