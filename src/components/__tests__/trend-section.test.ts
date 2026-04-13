import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { TrendCardView } from '../../lib/oarboard/calendar-data';

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

vi.mock('framer-motion', () => ({
  motion: {
    div: passthrough('div'),
  },
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

vi.mock('lucide-react', () => {
  function icon(name: string) {
    return function MockIcon(props: Record<string, unknown>) {
      return React.createElement('svg', { 'data-icon': name, ...props });
    };
  }

  return {
    ArrowUp: icon('ArrowUp'),
    ArrowDown: icon('ArrowDown'),
    Minus: icon('Minus'),
  };
});

import { TrendSection } from '../trend-section';

function makeCard(overrides: Partial<TrendCardView> = {}): TrendCardView {
  return {
    id: 'distance',
    label: '周期距离',
    value: '82.40 km',
    rawValue: 82.4,
    comparisonLabel: 'vs 上月',
    trendDisplay: '+8.2%',
    trendState: 'up',
    previousRawValue: 76.2,
    changePercent: 8.2,
    ...overrides,
  };
}

describe('TrendSection', () => {
  it('renders subdued red-up and green-down inline arrows before trend copy', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TrendSection, {
        weekCards: [
          makeCard(),
          makeCard({
            id: 'calorie',
            label: '周期热量',
            value: '1200 kcal',
            rawValue: 1200,
            trendDisplay: '-4.3%',
            trendState: 'down',
            previousRawValue: 1254,
            changePercent: -4.3,
          }),
        ],
        monthCards: [
          makeCard(),
          makeCard({
            id: 'calorie',
            label: '周期热量',
            value: '1200 kcal',
            rawValue: 1200,
            trendDisplay: '-4.3%',
            trendState: 'down',
            previousRawValue: 1254,
            changePercent: -4.3,
          }),
        ],
        yearCards: [
          makeCard(),
          makeCard({
            id: 'calorie',
            label: '周期热量',
            value: '1200 kcal',
            rawValue: 1200,
            trendDisplay: '-4.3%',
            trendState: 'down',
            previousRawValue: 1254,
            changePercent: -4.3,
          }),
        ],
      }),
    );

    expect(markup).toContain('周期趋势');
    expect(markup).toContain('周期距离');
    expect(markup).toContain('+8.2%');
    expect(markup).toContain('-4.3%');
    expect(markup).toContain('vs 上月');
    expect(markup).toContain('data-trend-state="up"');
    expect(markup).toContain('data-trend-state="down"');
    expect(markup).toContain('data-icon="ArrowUp"');
    expect(markup).toContain('data-icon="ArrowDown"');
    expect(markup).toContain('text-rose-300/65');
    expect(markup).toContain('text-emerald-300/70');
    expect(markup).toContain('text-[11px]');
    expect(markup).toContain('font-normal');
    expect(markup).not.toContain('data-trend-arrow=');
  });

  it('renders a neutral minus icon for flat state and no icon for unavailable state', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TrendSection, {
        weekCards: [
          makeCard({
            id: 'duration',
            label: '周期时长',
            value: '02:18:54',
            rawValue: 8334,
            trendDisplay: '持平',
            trendState: 'flat',
            comparisonLabel: 'vs 上月',
          }),
          makeCard({
            id: 'calorie',
            label: '周期热量',
            value: '0 kcal',
            rawValue: 0,
            trendDisplay: '暂无环比',
            trendState: 'na',
            comparisonLabel: 'vs 上月',
            previousRawValue: null,
            changePercent: null,
          }),
        ],
        monthCards: [
          makeCard({
            id: 'duration',
            label: '周期时长',
            value: '02:18:54',
            rawValue: 8334,
            trendDisplay: '持平',
            trendState: 'flat',
            comparisonLabel: 'vs 上月',
          }),
          makeCard({
            id: 'calorie',
            label: '周期热量',
            value: '0 kcal',
            rawValue: 0,
            trendDisplay: '暂无环比',
            trendState: 'na',
            comparisonLabel: 'vs 上月',
            previousRawValue: null,
            changePercent: null,
          }),
        ],
        yearCards: [
          makeCard({
            id: 'duration',
            label: '周期时长',
            value: '02:18:54',
            rawValue: 8334,
            trendDisplay: '持平',
            trendState: 'flat',
            comparisonLabel: 'vs 上月',
          }),
          makeCard({
            id: 'calorie',
            label: '周期热量',
            value: '0 kcal',
            rawValue: 0,
            trendDisplay: '暂无环比',
            trendState: 'na',
            comparisonLabel: 'vs 上月',
            previousRawValue: null,
            changePercent: null,
          }),
        ],
      }),
    );

    expect(markup).toContain('持平');
    expect(markup).toContain('暂无环比');
    expect(markup).toContain('data-trend-state="flat"');
    expect(markup).toContain('data-trend-state="na"');
    expect(markup).toContain('data-icon="Minus"');
    expect(markup).not.toContain('持平</span><span>vs 上月');
    expect(markup).not.toContain('暂无环比</span><span>vs 上月');
  });
});
