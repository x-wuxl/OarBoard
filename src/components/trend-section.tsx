'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
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

const trendAccentClassName: Record<TrendCardView['trendState'], string> = {
  up: 'text-emerald-300/85',
  down: 'text-rose-300/80',
  flat: 'text-zinc-400',
  na: 'text-white/55',
  new: 'text-emerald-300/75',
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

function TrendInlineIcon({ state }: { state: TrendCardView['trendState'] }) {
  const className = `h-3.5 w-3.5 shrink-0 ${trendAccentClassName[state]}`;

  switch (state) {
    case 'up':
    case 'new':
      return <ArrowUp aria-hidden="true" className={className} strokeWidth={2.1} />;
    case 'down':
      return <ArrowDown aria-hidden="true" className={className} strokeWidth={2.1} />;
    case 'flat':
      return <Minus aria-hidden="true" className={className} strokeWidth={2.1} />;
    case 'na':
      return null;
  }
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
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-5 lg:min-h-[132px] lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.3)] backdrop-blur-md flex flex-col justify-between min-h-[124px]"
          >
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
                className="mt-2 flex items-center gap-1 text-[12px] font-medium tracking-[0.01em]"
              >
                <TrendInlineIcon state={card.trendState} />
                <span className={trendAccentClassName[card.trendState]}>{card.trendDisplay}</span>
                {shouldShowComparisonLabel(card.trendState) && card.comparisonLabel ? (
                  <span className="ml-0.5 text-white/42">{card.comparisonLabel}</span>
                ) : null}
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
