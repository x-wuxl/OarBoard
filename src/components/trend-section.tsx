'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from './animated-metrics';
import type { TrendCardView } from '../lib/oarboard/calendar-data';

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

export function TrendSection({ weekCards, monthCards, yearCards }: TrendSectionProps) {
  const [mode, setMode] = React.useState<FilterMode>('month');
  const cards = mode === 'week' ? weekCards : mode === 'month' ? monthCards : yearCards;

  return (
    <section className="mt-8 lg:mt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-[0.02em] text-white/90">阶段聚焦</h2>
          <p className="mt-1 text-sm text-oar-muted">
            按不同时间跨度追踪训练指标。
          </p>
        </div>

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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-5 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.3)] backdrop-blur-md flex flex-col justify-between min-h-[110px]">
            <div className="text-[0.72rem] tracking-[0.08em] text-zinc-500 font-medium">{card.label}</div>
            
            <motion.div
              layout
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-3 flex-1"
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
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
