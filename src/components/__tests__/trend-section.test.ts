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
  it('renders inline trend copy and an up-state background arrow for metric cards', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TrendSection, {
        weekCards: [makeCard()],
        monthCards: [makeCard()],
        yearCards: [makeCard()],
      }),
    );

    expect(markup).toContain('周期距离');
    expect(markup).toContain('+8.2%');
    expect(markup).toContain('vs 上月');
    expect(markup).toContain('data-trend-state="up"');
    expect(markup).toContain('data-trend-arrow="up"');
  });

  it('renders flat and unavailable states without appending comparison copy', () => {
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
    expect(markup).not.toContain('持平</span><span>vs 上月');
    expect(markup).not.toContain('暂无环比</span><span>vs 上月');
  });
});
