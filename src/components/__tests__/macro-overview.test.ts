import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

function stripMotionProps(props: Record<string, unknown>) {
  const {
    initial,
    whileInView,
    viewport,
    transition,
    animate,
    exit,
    whileHover,
    whileTap,
    layout,
    ...rest
  } = props;

  return rest;
}

function passthrough(tag: keyof React.JSX.IntrinsicElements) {
  return function MockMotionComponent({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) {
    return React.createElement(tag, stripMotionProps(props), children);
  };
}

function chartWrapper(name: string, tag: keyof React.JSX.IntrinsicElements = 'div') {
  return function MockChartComponent({
    children,
  }: React.PropsWithChildren<Record<string, unknown>>) {
    return React.createElement(tag, { 'data-chart': name }, children);
  };
}

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: React.PropsWithChildren) => React.createElement(React.Fragment, null, children),
  motion: {
    div: passthrough('div'),
  },
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: chartWrapper('responsive'),
  AreaChart: chartWrapper('area-chart', 'svg'),
  CartesianGrid: chartWrapper('grid', 'g'),
  Tooltip: chartWrapper('tooltip', 'g'),
  XAxis: chartWrapper('x-axis', 'g'),
  YAxis: chartWrapper('y-axis', 'g'),
  Area: chartWrapper('area', 'g'),
}));

vi.mock('../animated-metrics', () => ({
  AnimatedNumber: ({
    value,
    decimals = 0,
    isTime = false,
  }: {
    value: number;
    decimals?: number;
    isTime?: boolean;
  }) => React.createElement('span', null, isTime ? '02:18:54' : value.toFixed(decimals)),
}));

import { MacroOverviewSection } from '../macro-overview';

describe('MacroOverviewSection', () => {
  it('uses the updated overall overview section title', () => {
    const markup = renderToStaticMarkup(
      React.createElement(MacroOverviewSection, {
        heatmap: [],
        lifetimeRaw: {
          totalDurationRaw: 8334,
          totalCaloriesRaw: 2129,
          totalDistanceRaw: 30.23,
          sportCount: 11,
        },
        fitnessFatigue: {
          points: [
            { date: '04-01', ctl: 32, atl: 28, tsb: 4, dailyLoad: 18 },
            { date: '04-02', ctl: 33, atl: 29, tsb: 4, dailyLoad: 20 },
          ],
          status: {
            level: 'neutral',
            label: '平衡',
            suggestion: '保持节奏',
            tsb: 4,
          },
        },
      }),
    );

    expect(markup).toContain('总体概览');
  });
});
