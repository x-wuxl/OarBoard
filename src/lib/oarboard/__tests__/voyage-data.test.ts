import { describe, expect, it } from 'vitest';

import { VOYAGE_ROUTES, buildVoyageProgress } from '../voyage-data';

describe('buildVoyageProgress', () => {
  it('uses the first route when distance is zero', () => {
    const result = buildVoyageProgress(0);

    expect(result.currentRoute.id).toBe('westlake');
    expect(result.routeProgress).toBe(0);
    expect(result.completedRoutes).toEqual([]);
    expect(result.lockedRoutes[0]?.id).toBe('english-channel');
    expect(result.remainingInRoute).toBe(VOYAGE_ROUTES[0].distance);
  });

  it('moves to the next route exactly on a route boundary', () => {
    const result = buildVoyageProgress(10.4);

    expect(result.currentRoute.id).toBe('english-channel');
    expect(result.completedRoutes.map((route) => route.id)).toEqual(['westlake']);
    expect(result.routeProgress).toBe(0);
    expect(result.distanceInRoute).toBe(0);
  });

  it('computes in-route progress for a partially completed route', () => {
    const result = buildVoyageProgress(190.99);

    expect(result.currentRoute.id).toBe('three-gorges');
    expect(result.completedRoutes.map((route) => route.id)).toEqual(['westlake', 'english-channel', 'bosphorus']);
    expect(result.distanceInRoute).toBeCloseTo(82.79, 2);
    expect(result.remainingInRoute).toBeCloseTo(110.21, 2);
    expect(result.routeProgress).toBeCloseTo(82.79 / 193, 4);
  });

  it('caps progress on the final route when all routes are completed', () => {
    const totalDistance = VOYAGE_ROUTES.reduce((sum, route) => sum + route.distance, 0) + 100;
    const result = buildVoyageProgress(totalDistance);

    expect(result.currentRoute.id).toBe('rhine');
    expect(result.routeProgress).toBe(1);
    expect(result.remainingInRoute).toBe(0);
    expect(result.lockedRoutes).toEqual([]);
  });
});
