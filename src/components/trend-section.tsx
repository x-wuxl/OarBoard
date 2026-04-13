'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './animated-metrics';
import { SectionIntro } from './section-intro';
import type { TrendCardView } from '../lib/oarboard/calendar-data';
import { formatDistanceKm, formatDuration } from '../lib/moke/formatters';

interface TrendSectionProps {
  weekCards: TrendCardView[];
  monthCards: TrendCardView[];
  yearCards: TrendCardView[];
}

type FilterMode = 'week' | 'month' | 'year';

const filterLabels: Record<FilterMode, string> = {
  week: '本周',
  month: '本月',
  year: '本年',
};

const trendTextClassName: Record<TrendCardView['trendState'], string> = {
  up: 'text-[rgba(210,225,255,0.86)]',
  down: 'text-[rgba(220,224,232,0.76)]',
  flat: 'text-[rgba(210,210,210,0.68)]',
  na: 'text-white/55',
  new: 'text-[rgba(210,225,255,0.78)]',
};

const trendArrowStrokeByState: Record<TrendCardView['trendState'], string> = {
  up: 'rgba(140,180,255,0.38)',
  down: 'rgba(170,180,195,0.34)',
  flat: 'rgba(150,156,168,0.3)',
  na: 'rgba(0,0,0,0)',
  new: 'rgba(140,180,255,0.32)',
};

function shouldShowComparisonLabel(state: TrendCardView['trendState']) {
  return state === 'up' || state === 'down';
}

function formatTrendTooltipValue(card: TrendCardView): string {
  if (card.rawValue === null || card.rawValue === undefined) {
    return '--';
  }

  switch (card.id) {
    case 'distance':
      return formatDistanceKm(card.rawValue * 1000);
    case 'duration':
      return formatDuration(card.rawValue);
    case 'calorie':
      return `${Math.round(card.rawValue)} kcal`;
    case 'sessions':
      return `${Math.round(card.rawValue)} 次`;
  }
}

function formatPreviousTooltipValue(card: TrendCardView): string {
  if (card.previousRawValue === null) {
    return '--';
  }

  switch (card.id) {
    case 'distance':
      return formatDistanceKm(card.previousRawValue * 1000);
    case 'duration':
      return formatDuration(card.previousRawValue);
    case 'calorie':
      return `${Math.round(card.previousRawValue)} kcal`;
    case 'sessions':
      return `${Math.round(card.previousRawValue)} 次`;
  }
}

function buildTrendTooltip(card: TrendCardView): string | undefined {
  if (card.trendState === 'na') {
    return '缺少上周期数据，无法计算环比';
  }

  const details = [`当前：${formatTrendTooltipValue(card)}`];

  if (card.previousRawValue !== null && card.comparisonLabel) {
    details.push(`${card.comparisonLabel.replace('vs ', '')}：${formatPreviousTooltipValue(card)}`);
  }

  if (card.changePercent !== null && (card.trendState === 'up' || card.trendState === 'down')) {
    details.push(`环比：${card.trendDisplay}`);
  }

  if (card.trendState === 'flat') {
    details.push('环比：持平');
  }

  if (card.trendState === 'new') {
    details.push('环比：新增');
  }

  return details.join('\n');
}

function TrendArrowBackground({ state }: { state: TrendCardView['trendState'] }) {
  if (state === 'na') {
    return null;
  }

  const stroke = trendArrowStrokeByState[state];

  if (state === 'down') {
    return (
      <div
        aria-hidden="true"
        data-trend-arrow="down"
        className="pointer-events-none absolute bottom-3 right-3 h-[34%] w-[44%] opacity-70"
      >
        <svg viewBox="0 0 160 88" className="h-full w-full">
          <path d="M10 20 C58 20 96 22 120 35 C134 43 145 53 150 64" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M141 56 L150 64 L139 67" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (state === 'flat') {
    return (
      <div
        aria-hidden="true"
        data-trend-arrow="flat"
        className="pointer-events-none absolute bottom-3 right-3 h-[34%] w-[44%] opacity-60"
      >
        <svg viewBox="0 0 160 88" className="h-full w-full">
          <path d="M10 44 C56 44 102 44 150 44" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M141 39 L150 44 L141 49" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      data-trend-arrow={state}
      className="pointer-events-none absolute bottom-3 right-3 h-[34%] w-[44%] opacity-70"
    >
      <svg viewBox="0 0 160 88" className="h-full w-full">
        <path d="M10 62 C58 62 96 63 118 50 C132 41 143 28 150 16" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M141 16 L150 16 L147 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function TrendSection({ weekCards, monthCards, yearCards }: TrendSectionProps) {
  const [mode, setMode] = React.useState<FilterMode>('month');
  const cards = mode === 'week' ? weekCards : mode === 'month' ? monthCards : yearCards;

  return (
    <section className="mt-6 lg:mt-8">
      <SectionIntro
        title="阶段聚焦"
        description="按不同时间跨度追踪训练指标。"
        trailing={(
          <div className="inline-flex rounded-full border border-white/5 bg-zinc-900/40 p-1 shadow-inner backdrop-blur-md">
            {(['week', 'month', 'year'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full px-4 py-1.5 text-sm transition-all duration-300 ${
                  mode === item
                    ? 'bg-zinc-700/60 text-white shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {filterLabels[item]}
              </button>
            ))}
          </div>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-5 lg:min-h-[144px] lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.3)] backdrop-blur-md flex flex-col justify-between min-h-[132px]"
          >
            <TrendArrowBackground state={card.trendState} />
            <div className="relative z-10 text-[0.72rem] tracking-[0.08em] text-zinc-500 font-medium">{card.label}</div>
            
            <motion.div
              layout
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative z-10 mt-3 flex-1"
            >
              <div className="text-2xl lg:text-3xl font-bold tracking-tight font-mono text-white/90">
                {card.id === 'distance' && (
                  <><AnimatedNumber value={card.rawValue} decimals={2} /> <span className="font-mono text-base text-zinc-500 ml-0.5">km</span></>
                )}
                {card.id === 'duration' && (
                  <AnimatedNumber value={card.rawValue} isTime={true} />
                )}
                {card.id === 'calorie' && (
                  <><AnimatedNumber value={card.rawValue} decimals={0} /> <span className="font-mono text-base text-zinc-500 ml-0.5">kcal</span></>
                )}
                {card.id === 'sessions' && (
                  <><AnimatedNumber value={card.rawValue} decimals={0} /> <span className="font-mono text-base text-zinc-500 ml-0.5">次</span></>
                )}
              </div>

              <motion.div
                data-trend-state={card.trendState}
                title={buildTrendTooltip(card)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut', delay: 0.05 }}
                className="mt-2 flex items-center gap-1.5 text-[12px] font-medium tracking-[0.01em]"
              >
                <span className={trendTextClassName[card.trendState]}>{card.trendDisplay}</span>
                {shouldShowComparisonLabel(card.trendState) && card.comparisonLabel ? (
                  <span className="text-white/42">{card.comparisonLabel}</span>
                ) : null}
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
