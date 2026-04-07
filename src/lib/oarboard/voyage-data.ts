export interface VoyageRoute {
  id: string;
  name: string;
  distance: number; // km
  region: string;
  path: string; // simplified SVG path data
}

export interface VoyageProgressView {
  currentRoute: VoyageRoute;
  completedRoutes: VoyageRoute[];
  lockedRoutes: VoyageRoute[];
  totalDistance: number; // km
  routeProgress: number; // 0-1, progress within current route
  distanceInRoute: number; // km completed within current route
  remainingInRoute: number; // km remaining in current route
}

export const VOYAGE_ROUTES: VoyageRoute[] = [
  {
    id: 'westlake',
    name: '西湖环湖',
    distance: 10.4,
    region: '杭州',
    path: 'M 40 100 C 120 40, 200 40, 280 80 C 360 120, 440 130, 520 90 C 600 50, 680 60, 760 100',
  },
  {
    id: 'english-channel',
    name: '英吉利海峡横渡',
    distance: 33.8,
    region: '英法之间',
    path: 'M 40 120 C 100 80, 180 60, 260 70 C 340 80, 400 110, 480 100 C 560 90, 640 60, 760 80',
  },
  {
    id: 'bosphorus',
    name: '博斯普鲁斯海峡',
    distance: 64,
    region: '伊斯坦布尔',
    path: 'M 40 90 C 100 130, 160 140, 240 110 C 320 80, 380 60, 460 80 C 540 100, 620 130, 700 100 L 760 90',
  },
  {
    id: 'three-gorges',
    name: '长江三峡段',
    distance: 193,
    region: '中国',
    path: 'M 40 100 C 100 60, 160 50, 220 80 C 280 110, 340 130, 400 100 C 460 70, 520 50, 580 70 C 640 90, 700 110, 760 90',
  },
  {
    id: 'biwa-lake',
    name: '琵琶湖环湖',
    distance: 235,
    region: '日本',
    path: 'M 40 110 C 120 50, 200 40, 300 70 C 400 100, 460 130, 520 110 C 580 90, 660 50, 760 80',
  },
  {
    id: 'thames',
    name: '泰晤士河全程',
    distance: 346,
    region: '英国',
    path: 'M 40 100 C 80 70, 140 50, 200 70 C 260 90, 300 120, 360 110 C 420 100, 460 70, 520 60 C 580 50, 640 80, 700 100 L 760 90',
  },
  {
    id: 'danube-vienna',
    name: '多瑙河维也纳段',
    distance: 500,
    region: '奥地利',
    path: 'M 40 80 C 120 60, 200 90, 280 110 C 360 130, 420 120, 480 90 C 540 60, 620 50, 700 80 L 760 100',
  },
  {
    id: 'rhine',
    name: '莱茵河全程',
    distance: 1230,
    region: '欧洲',
    path: 'M 40 90 C 100 50, 180 40, 260 70 C 340 100, 400 120, 460 100 C 520 80, 580 60, 640 50 C 700 40, 740 60, 760 80',
  },
];

export function buildVoyageProgress(totalDistance: number): VoyageProgressView {
  // Edge case: no distance rowed
  if (totalDistance <= 0) {
    return {
      currentRoute: VOYAGE_ROUTES[0],
      completedRoutes: [],
      lockedRoutes: VOYAGE_ROUTES.slice(1),
      totalDistance: 0,
      routeProgress: 0,
      distanceInRoute: 0,
      remainingInRoute: VOYAGE_ROUTES[0].distance,
    };
  }

  let cumulativeDistance = 0;
  let currentIndex = -1;

  for (let i = 0; i < VOYAGE_ROUTES.length; i++) {
    cumulativeDistance += VOYAGE_ROUTES[i].distance;
    if (totalDistance < cumulativeDistance) {
      currentIndex = i;
      break;
    }
  }

  // All routes completed
  if (currentIndex === -1) {
    const lastRoute = VOYAGE_ROUTES[VOYAGE_ROUTES.length - 1];
    return {
      currentRoute: lastRoute,
      completedRoutes: VOYAGE_ROUTES.slice(0, -1),
      lockedRoutes: [],
      totalDistance,
      routeProgress: 1,
      distanceInRoute: lastRoute.distance,
      remainingInRoute: 0,
    };
  }

  const completedRoutes = VOYAGE_ROUTES.slice(0, currentIndex);
  const currentRoute = VOYAGE_ROUTES[currentIndex];
  const lockedRoutes = VOYAGE_ROUTES.slice(currentIndex + 1);

  const completedDistance = completedRoutes.reduce((sum, r) => sum + r.distance, 0);
  const distanceInRoute = totalDistance - completedDistance;
  const remainingInRoute = currentRoute.distance - distanceInRoute;
  const routeProgress = Math.min(1, Math.max(0, distanceInRoute / currentRoute.distance));

  return {
    currentRoute,
    completedRoutes,
    lockedRoutes,
    totalDistance,
    routeProgress,
    distanceInRoute,
    remainingInRoute,
  };
}
