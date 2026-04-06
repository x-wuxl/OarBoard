'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Flame, Route, Timer } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AnimatedNumber } from './animated-metrics';
import {
  buildFullYearHeatmap,
  buildRollingYearHeatmap,
  getAvailableYears,
  type HeatmapCellView,
} from '../lib/oarboard/calendar-data';
import type { FitnessFatigueData } from '../lib/oarboard/fitness-fatigue-data';
import type { StreakData } from '../lib/oarboard/milestones-data';

interface LifetimeStatsProps {
  totalDurationRaw: number;
  totalCaloriesRaw: number;
  totalDistanceRaw: number;
  sportCount: number;
}

export interface MacroOverviewProps {
  heatmap: HeatmapCellView[];
  lifetimeRaw: LifetimeStatsProps;
  streak: StreakData;
  fitnessFatigue: FitnessFatigueData;
}

type HeatmapMode = 'rolling' | number;
type PanelMode = 'heatmap' | 'fitness';

type TooltipPlacement = 'top' | 'bottom' | 'right' | 'left';

const palette = [
  'bg-[#0f1f16]',
  'bg-[#143d24]',
  'bg-[#1e5a35]',
  'bg-[#2f7d47]',
  'bg-[#46a85c]',
  'bg-[#56d468]',
] as const;

const metricCardClass = 'flex min-h-[130px] flex-col justify-between rounded-[1.5rem] border border-white/6 bg-[linear-gradient(180deg,rgba(10,14,20,0.86),rgba(7,10,16,0.74))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-18px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-white/8 hover:bg-[linear-gradient(180deg,rgba(12,16,22,0.9),rgba(8,11,18,0.78))] lg:min-h-[145px] lg:p-5';
const metricLabelClass = 'text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500';
const metricValueClass = 'font-mono text-[2.1rem] font-extrabold tracking-[-0.04em] text-white/96 lg:text-[2.6rem]';

interface HoveredHeatmapCell {
  date: string;
  distance: number;
  rect: DOMRect;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTooltipPosition(rect: DOMRect, tooltipRect: DOMRect, placement: TooltipPlacement, gap: number) {
  const centeredLeft = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  const centeredTop = rect.top + (rect.height / 2) - (tooltipRect.height / 2);

  switch (placement) {
    case 'top':
      return {
        top: rect.top - tooltipRect.height - gap,
        left: centeredLeft,
      };
    case 'bottom':
      return {
        top: rect.bottom + gap,
        left: centeredLeft,
      };
    case 'right':
      return {
        top: centeredTop,
        left: rect.right + gap,
      };
    case 'left':
      return {
        top: centeredTop,
        left: rect.left - tooltipRect.width - gap,
      };
  }
}

function HeatmapTooltip({ cell }: { cell: HoveredHeatmapCell | null }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({ opacity: 0, top: 0, left: 0 });

  React.useLayoutEffect(() => {
    if (!cell || !ref.current) return;

    const tooltipRect = ref.current.getBoundingClientRect();
    const gap = 10;
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const placements: TooltipPlacement[] = ['top', 'bottom', 'right', 'left'];

    const positionedCandidates = placements.map((placement) => {
      const position = getTooltipPosition(cell.rect, tooltipRect, placement, gap);
      const fitsHorizontally = position.left >= padding && position.left + tooltipRect.width <= viewportWidth - padding;
      const fitsVertically = position.top >= padding && position.top + tooltipRect.height <= viewportHeight - padding;

      return {
        ...position,
        placement,
        fits: fitsHorizontally && fitsVertically,
      };
    });

    const preferredPosition = positionedCandidates.find((candidate) => candidate.fits) ?? positionedCandidates[0];
    const top = clamp(preferredPosition.top, padding, viewportHeight - tooltipRect.height - padding);
    const left = clamp(preferredPosition.left, padding, viewportWidth - tooltipRect.width - padding);

    setStyle({ opacity: 1, top, left });
  }, [cell]);

  if (!cell || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="pointer-events-none fixed z-[1000] w-max rounded-[0.8rem] border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur-md"
    >
      <div className="font-medium tracking-wide">{cell.date}</div>
      <div className="mt-1 font-mono text-cyan-300/80">{cell.distance.toFixed(2)} km</div>
    </div>,
    document.body,
  );
}

function StreakCard({ sportCount, streak }: { sportCount: number; streak: StreakData }) {
  return (
    <div className="flex min-h-[130px] flex-col rounded-[1.5rem] border border-white/6 bg-[linear-gradient(180deg,rgba(12,17,24,0.92),rgba(8,11,18,0.82))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-20px_40px_rgba(0,0,0,0.22)] transition-all duration-300 hover:border-white/8 lg:min-h-[145px] lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className={metricLabelClass}>总训练次数</span>
        <Activity className="h-3.5 w-3.5 stroke-[1.8] text-white/55" />
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        <span className={metricValueClass}>
          <AnimatedNumber value={sportCount} decimals={0} />
        </span>
        <span className="mb-1 font-mono text-[0.72rem] tracking-[0.18em] text-zinc-500">次</span>
      </div>
      <div className="mt-auto rounded-[1.1rem] border border-white/6 bg-black/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-end justify-between gap-3 border-b border-white/6 pb-2.5">
          <div>
            <div className="text-[0.62rem] font-medium tracking-[0.16em] text-zinc-600">当前连续</div>
            <div className="mt-1 flex items-end gap-1 font-mono text-cyan-200/92">
              <span className={`text-xl font-extrabold tracking-[-0.04em] ${streak.isAtRecord ? 'animate-pulse' : ''}`}>{streak.currentStreak}</span>
              <span className="mb-0.5 text-[0.7rem] tracking-[0.16em] text-cyan-200/60">周</span>
            </div>
          </div>
          <div className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-2 py-0.5 text-[0.58rem] font-medium tracking-[0.18em] text-cyan-100/60">
            STREAK
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[0.68rem] tracking-[0.12em] text-zinc-600">
          <span>历史最长</span>
          <span className="font-mono text-zinc-400">{streak.longestStreak} 周</span>
        </div>
      </div>
    </div>
  );
}

function FitnessPanel({ fitnessFatigue, statusTone }: { fitnessFatigue: FitnessFatigueData; statusTone: string }) {
  return (
    <motion.div key="fitness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col rounded-[1.45rem] border border-white/5 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="h-[250px] rounded-[1.3rem] border border-white/6 bg-[linear-gradient(180deg,rgba(9,18,25,0.88),rgba(6,12,18,0.94))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-18px_32px_rgba(0,0,0,0.28)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fitnessFatigue.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ctlFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="atlFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.025)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'rgba(161,161,170,0.68)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis tick={{ fill: 'rgba(161,161,170,0.52)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{
                background: 'rgba(9, 9, 11, 0.95)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: 'rgba(161,161,170,0.9)', fontSize: '0.8rem', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="ctl" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#ctlFill)" />
            <Area type="monotone" dataKey="atl" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#atlFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-3 rounded-[1.15rem] border border-white/6 bg-[linear-gradient(180deg,rgba(8,12,18,0.72),rgba(5,8,13,0.88))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.12)] ${statusTone}`} />
          <span className="text-[0.72rem] font-medium tracking-[0.16em] text-zinc-500">TSB STATUS</span>
        </div>
        <div className="flex items-baseline gap-2 text-white/88">
          <span className="text-sm font-medium tracking-[0.06em]">{fitnessFatigue.status.label}</span>
          <span className="font-mono text-[0.78rem] tracking-[0.14em] text-zinc-400">TSB {fitnessFatigue.status.tsb >= 0 ? '+' : ''}{fitnessFatigue.status.tsb}</span>
        </div>
        <div className="text-[0.72rem] tracking-[0.08em] text-zinc-500 sm:text-right">建议: {fitnessFatigue.status.suggestion}</div>
      </div>
    </motion.div>
  );
}

export function MacroOverviewSection({ heatmap, lifetimeRaw, streak, fitnessFatigue }: MacroOverviewProps) {
  const [heatmapMode, setHeatmapMode] = React.useState<HeatmapMode>('rolling');
  const [panelMode, setPanelMode] = React.useState<PanelMode>('heatmap');
  const [hoveredCell, setHoveredCell] = React.useState<HoveredHeatmapCell | null>(null);

  const availableYears = getAvailableYears(heatmap);
  const currentYear = new Date().getFullYear();

  const weekColumns = heatmapMode === 'rolling'
    ? buildRollingYearHeatmap(heatmap)
    : buildFullYearHeatmap(heatmapMode, heatmap);

  const desktopColumns = `repeat(${Math.max(weekColumns.length, 1)}, minmax(0, 1fr))`;
  const heatmapLabel = heatmapMode === 'rolling' ? '近一年' : `${heatmapMode} 年`;

  const canGoPrev = heatmapMode === 'rolling'
    ? availableYears.length > 0 && availableYears[0] < currentYear
    : typeof heatmapMode === 'number' && availableYears.length > 0 && heatmapMode > availableYears[0];
  const canGoNext = typeof heatmapMode === 'number' && heatmapMode < currentYear;

  function handlePrev() {
    if (heatmapMode === 'rolling') {
      setHeatmapMode(currentYear - 1);
    } else {
      setHeatmapMode(heatmapMode - 1);
    }
  }

  function handleNext() {
    if (typeof heatmapMode === 'number') {
      if (heatmapMode + 1 >= currentYear) {
        setHeatmapMode('rolling');
      } else {
        setHeatmapMode(heatmapMode + 1);
      }
    }
  }

  const statusTone = {
    fresh: 'bg-emerald-400',
    neutral: 'bg-yellow-400',
    tired: 'bg-amber-500',
    overreached: 'bg-red-500',
  }[fitnessFatigue.status.level];

  return (
    <section className="mt-8 lg:mt-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-white/50">宏观概览</div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <motion.div
        className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-zinc-900/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:p-8"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-lime-400/10 blur-[80px]" />

        <div className="relative grid items-stretch gap-6 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)] xl:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.2fr)]">
          <div className="grid min-w-0 grid-cols-2 gap-3 lg:gap-4">
            <div className={metricCardClass}>
              <div className="flex items-center justify-between gap-3">
                <span className={metricLabelClass}>总运动距离</span>
                <Route className="h-3.5 w-3.5 stroke-[1.8] text-cyan-300/60" />
              </div>
              <div className="mt-auto flex items-end gap-1.5 pt-3">
                <span className={metricValueClass}>
                  <AnimatedNumber value={lifetimeRaw.totalDistanceRaw} decimals={0} />
                </span>
                <span className="mb-1 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-zinc-500">km</span>
              </div>
            </div>

            <div className={metricCardClass}>
              <div className="flex items-center justify-between gap-3">
                <span className={metricLabelClass}>总运动时长</span>
                <Timer className="h-3.5 w-3.5 stroke-[1.8] text-lime-300/60" />
              </div>
              <div className="mt-auto flex items-baseline pt-3 leading-none">
                <span className="break-all font-mono text-[1.45rem] font-extrabold tracking-[-0.04em] text-white/96 lg:text-[1.8rem]">
                  <AnimatedNumber value={lifetimeRaw.totalDurationRaw} isTime={true} />
                </span>
              </div>
            </div>

            <div className={metricCardClass}>
              <div className="flex items-center justify-between gap-3">
                <span className={metricLabelClass}>总消耗</span>
                <Flame className="h-3.5 w-3.5 stroke-[1.8] text-rose-300/60" />
              </div>
              <div className="mt-auto flex items-end gap-1.5 pt-3">
                <span className={metricValueClass}>
                  <AnimatedNumber value={lifetimeRaw.totalCaloriesRaw} decimals={0} />
                </span>
                <span className="mb-1 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-zinc-500">kcal</span>
              </div>
            </div>

            <StreakCard sportCount={lifetimeRaw.sportCount} streak={streak} />
          </div>

          <div className="flex flex-col rounded-[1.7rem] border border-white/6 bg-[linear-gradient(180deg,rgba(8,12,18,0.9),rgba(6,9,14,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-22px_48px_rgba(0,0,0,0.24)] lg:p-6">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-full border border-white/6 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
                {([
                  ['heatmap', '运动热力图'],
                  ['fitness', '体能状态'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPanelMode(mode)}
                    className={`rounded-full px-4 py-1.5 text-[0.78rem] font-medium tracking-[0.12em] transition-all duration-300 ${
                      panelMode === mode
                        ? 'border border-white/10 bg-white/[0.08] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]'
                        : 'border border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {panelMode === 'heatmap' ? (
                <div className="flex items-center gap-1 rounded-full border border-white/6 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={handlePrev}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[0.72rem] text-zinc-500 transition-all duration-300 hover:bg-white/[0.05] hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                  >
                    &larr;
                  </button>
                  <span className="min-w-[4.75rem] text-center text-[0.68rem] font-semibold tracking-[0.16em] text-zinc-400">{heatmapLabel}</span>
                  <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={handleNext}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[0.72rem] text-zinc-500 transition-all duration-300 hover:bg-white/[0.05] hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                  >
                    &rarr;
                  </button>
                </div>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              {panelMode === 'heatmap' ? (
                <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col rounded-[1.45rem] border border-white/5 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex flex-1 items-center overflow-x-auto pb-3 md:overflow-visible">
                    <div className="grid min-w-[680px] w-full gap-[4px]" style={{ gridTemplateColumns: desktopColumns }}>
                      {weekColumns.map((column) => (
                        <div key={column.key} className="grid justify-items-center gap-[4px]">
                          <div className="mb-2 flex h-3 items-end text-center text-[0.58rem] font-medium tracking-[0.12em] text-zinc-600/90">
                            {column.monthLabel ? column.monthLabel : ''}
                          </div>
                          {Array.from({ length: 7 }, (_, weekday) => {
                            const cell = column.days.find((item) => item.weekday === weekday);
                            return (
                              <div
                                key={`${column.key}-${weekday}`}
                                className="group relative aspect-square w-full max-w-[14px]"
                                onMouseEnter={cell && cell.distance > 0 ? (event) => setHoveredCell({ date: cell.date, distance: cell.distance, rect: event.currentTarget.getBoundingClientRect() }) : undefined}
                                onMouseLeave={cell && cell.distance > 0 ? () => setHoveredCell(null) : undefined}
                              >
                                <div className={`h-full w-full rounded-[0.3rem] border transition-colors duration-300 ${cell ? 'border-white/[0.04]' : 'border-white/[0.015] bg-zinc-800/8'} ${cell ? palette[cell.level] : ''} ${cell && cell.distance > 0 ? 'hover:border-white/20' : ''}`} />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[0.62rem] font-medium tracking-[0.12em] text-zinc-600">
                      <span>少</span>
                      {palette.map((tone, index) => (
                        <span key={index} className={`h-2.5 w-2.5 rounded-[0.28rem] border border-white/[0.04] shadow-inner ${tone}`} />
                      ))}
                      <span>多</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <FitnessPanel fitnessFatigue={fitnessFatigue} statusTone={statusTone} />
              )}
            </AnimatePresence>
          </div>
        </div>

        <HeatmapTooltip cell={hoveredCell} />
      </motion.div>
    </section>
  );
}
