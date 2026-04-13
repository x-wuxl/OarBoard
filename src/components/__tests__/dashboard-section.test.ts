import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { MokeWorkoutRecord } from '../../lib/moke/types';
import type { WorkoutHistoryRowView } from '../../lib/oarboard/dashboard-data';

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
    section: passthrough('section'),
    aside: passthrough('aside'),
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

import { DashboardSection } from '../dashboard-section';

function makeRecord(index: number): MokeWorkoutRecord {
  const day = `2026-04-${String(index + 1).padStart(2, '0')}`;
  return {
    _id: `workout-${index + 1}`,
    accountId: 'user-1',
    deviceType: '2',
    sumMileage: 2 + index * 0.1,
    sumCalorie: 100 + index,
    sumDuration: 600 + index,
    startTime: `${day} 10:${String(index).padStart(2, '0')}:00.000000`,
    turns: String(200 + index),
    paceList: '12.0,12.5,12.8',
    rpmList: '28,29,30',
    createTime: `${day}T10:15:00.000Z`,
    day,
    year: '2026',
    month: '2026-04',
  };
}

function makeHistoryRow(index: number): WorkoutHistoryRowView {
  const id = `workout-${index + 1}`;
  return {
    id,
    title: `Workout ${index + 1}`,
    subtitle: `10:${String(index).padStart(2, '0')}`,
    pace: '2:30 /500m',
    duration: '00:10:00',
    distance: '2.00 km',
    energy: '100 kcal',
    rawRecord: makeRecord(index),
  };
}

describe('DashboardSection', () => {
  it('shows five history rows per page so the detail panel stays in view', () => {
    const historyRows = Array.from({ length: 6 }, (_, index) => makeHistoryRow(index));
    const detailsById = Object.fromEntries(
      historyRows.map((row) => [
        row.id,
        {
          title: row.title,
          subtitle: row.subtitle,
          averagePace: row.pace,
          averageSpeed: '12.00 km/h',
          averageRpm: '28.00 spm',
          totalTurns: '200',
          chartPoints: [{ minute: 0, speed: 12, rpm: 28, pace: '2:30' }],
        },
      ]),
    );

    const markup = renderToStaticMarkup(
      React.createElement(DashboardSection, {
        historyRows,
        detailsById,
        dnaById: {},
        milestones: [],
        defaultSelectedId: historyRows[0]?.id ?? null,
      }),
    );

    expect(markup).toContain('训练记录');
    expect(markup).toContain('训练细节');
    expect(markup).toContain('Workout 1');
    expect(markup).toContain('Workout 5');
    expect(markup).not.toContain('Workout 6');
    expect(markup).toContain('1 / 2');
  });
});
