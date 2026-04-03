import { describe, expect, it } from 'vitest';

import {
  buildRingMetrics,
  describeRingProgress,
  getRingStroke,
} from '../rings.js';

describe('getRingStroke', () => {
  it('calculates svg circle stroke values from progress', () => {
    const stroke = getRingStroke(54, 0.75);

    expect(stroke.circumference).toBeCloseTo(339.29, 2);
    expect(stroke.dashOffset).toBeCloseTo(84.82, 2);
  });
});

describe('describeRingProgress', () => {
  it('caps progress at 100 percent for labels', () => {
    expect(describeRingProgress(1.12)).toBe('112%');
    expect(describeRingProgress(0.68)).toBe('68%');
  });
});

describe('buildRingMetrics', () => {
  it('creates the three poster metrics for the hero rings', () => {
    const metrics = buildRingMetrics({
      calorie: { value: 212, goal: 300 },
      duration: { value: 891, goal: 1800 },
      distance: { value: 2890, goal: 5000 },
    });

    expect(metrics).toHaveLength(3);
    expect(metrics[0]).toMatchObject({ id: 'calorie', label: '热量', value: '212 kcal', tone: 'rose' });
    expect(metrics[0].progress).toBeCloseTo(0.71, 1);
    expect(metrics[1]).toMatchObject({ id: 'duration', label: '时长', value: '00:14:51', tone: 'lime' });
    expect(metrics[1].progress).toBeCloseTo(0.50, 1);
    expect(metrics[2]).toMatchObject({ id: 'distance', label: '距离', value: '2.89 km', tone: 'cyan' });
    expect(metrics[2].progress).toBeCloseTo(0.58, 1);
  });
});
