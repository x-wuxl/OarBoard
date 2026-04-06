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

const palette = [
  'bg-[#0f1f16]',
  'bg-[#143d24]',
  'bg-[#1e5a35]',
  'bg-[#2f7d47]',
  'bg-[#46a85c]',
  'bg-[#56d468]',
] as const;

interface HoveredHeatmapCell {
  date: string;
  distance: number;
  rect: DOMRect;
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

    let top = cell.rect.top - tooltipRect.height - gap;
    let left = cell.rect.left + (cell.rect.width / 2) - (tooltipRect.width / 2);

    if (top < padding) top = cell.rect.bottom + gap;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

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
            <div className="flex min-h-[130px] flex-col justify-between rounded-[1.4rem] border border-white/5 bg-black/30 p-4 shadow-inner transition-colors hover:bg-black/40 lg:min-h-[145px] lg:p-5">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 stroke-2 text-cyan-400" />
                <span className="text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500">总运动距离</span>
              </div>
              <div className="mt-auto flex items-baseline gap-1.5 pt-2">
                <span className="font-mono text-3xl font-extrabold tracking-tight text-white/95 lg:text-4xl">
                  <AnimatedNumber value={lifetimeRaw.totalDistanceRaw} decimals={0} />
                </span>
                <span className="mb-0.5 font-mono text-sm text-zinc-500">km</span>
              </div>
            </div>

            <div className="flex min-h-[130px] flex-col justify-between rounded-[1.4rem] border border-white/5 bg-black/30 p-4 shadow-inner transition-colors hover:bg-black/40 lg:min-h-[145px] lg:p-5">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 stroke-2 text-lime-400" />
                <span className="text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500">总运动时长</span>
              </div>
              <div className="mt-auto flex items-baseline pt-2 leading-none">
                <span className="break-all font-mono text-[1.35rem] font-extrabold tracking-tight text-white/95 lg:text-[1.65rem]">
                  <AnimatedNumber value={lifetimeRaw.totalDurationRaw} isTime={true} />
                </span>
              </div>
            </div>

            <div className="flex min-h-[130px] flex-col justify-between rounded-[1.4rem] border border-white/5 bg-black/30 p-4 shadow-inner transition-colors hover:bg-black/40 lg:min-h-[145px] lg:p-5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 stroke-2 text-rose-500" />
                <span className="text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500">总消耗</span>
              </div>
              <div className="mt-auto flex items-baseline gap-1.5 pt-2">
                <span className="font-mono text-3xl font-extrabold tracking-tight text-white/95 lg:text-4xl">
                  <AnimatedNumber value={lifetimeRaw.totalCaloriesRaw} decimals={0} />
                </span>
                <span className="mb-0.5 font-mono text-sm text-zinc-500">kcal</span>
              </div>
            </div>

            <div className="flex min-h-[130px] flex-col justify-between rounded-[1.4rem] border border-white/5 bg-black/30 p-4 shadow-inner transition-colors hover:bg-black/40 lg:min-h-[145px] lg:p-5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 stroke-2 text-white/90" />
                <span className="text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500">总训练次数</span>
              </div>
              <div className="mt-auto flex items-baseline gap-1.5 pt-2">
                <span className="font-mono text-3xl font-extrabold tracking-tight text-white/95 lg:text-4xl">
                  <AnimatedNumber value={lifetimeRaw.sportCount} decimals={0} />
                </span>
                <span className="mb-0.5 font-mono text-sm text-zinc-500">次</span>
              </div>
              <div className="my-3 h-px bg-white/5" />
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>当前连续</span>
                  <div className="flex items-center gap-1 font-mono text-cyan-300">
                    <span className={streak.isAtRecord ? 'animate-pulse' : ''}>{streak.currentStreak}</span>
                    <span>周</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>历史最长</span>
                  <div className="font-mono">
                    {streak.longestStreak} 周
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-[1.6rem] border border-white/5 bg-black/30 p-5 shadow-inner">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-full border border-white/5 bg-zinc-900/40 p-1 shadow-inner backdrop-blur-md">
                {([
                  ['heatmap', '运动热力图'],
                  ['fitness', '体能状态'],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPanelMode(mode)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-all duration-300 ${
                      panelMode === mode
                        ? 'bg-zinc-700/60 text-white shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
                        : 'text-zinc-500 hover:bg-white/[0.02] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {panelMode === 'heatmap' ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 p-1 shadow-inner">
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={handlePrev}
                    className="flex h-6 w-6 items-center justify-center rounded-[0.3rem] text-xs text-oar-muted transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-oar-muted"
                  >
                    &larr;
                  </button>
                  <span className="min-w-[4rem] text-center text-xs font-semibold tracking-wider text-white/80">{heatmapLabel}</span>
                  <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={handleNext}
                    className="flex h-6 w-6 items-center justify-center rounded-[0.3rem] text-xs text-oar-muted transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-oar-muted"
                  >
                    &rarr;
                  </button>
                </div>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              {panelMode === 'heatmap' ? (
                <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col">
                  <div className="flex flex-1 items-center overflow-x-auto pb-2 md:overflow-visible">
                    <div className="grid min-w-[680px] w-full gap-[3px]" style={{ gridTemplateColumns: desktopColumns }}>
                      {weekColumns.map((column) => (
                        <div key={column.key} className="grid justify-items-center gap-[3px]">
                          <div className="mb-1 flex h-3 items-end text-center text-[0.6rem] tracking-[0.05em] text-zinc-600">
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
                                <div className={`h-full w-full rounded-[0.25rem] border transition-colors duration-300 ${cell ? 'border-white/5' : 'border-white/[0.02] bg-zinc-800/10'} ${cell ? palette[cell.level] : ''} ${cell && cell.distance > 0 ? 'hover:border-white/40' : ''}`} />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[0.65rem] text-zinc-500">
                      <span>少</span>
                      {palette.map((tone, index) => (
                        <span key={index} className={`h-2.5 w-2.5 rounded-sm shadow-inner ${tone}`} />
                      ))}
                      <span>多</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="fitness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col">
                  <div className="h-[250px] rounded-[1.4rem] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(12,26,36,0.6),rgba(7,18,26,0.8))] p-4 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fitnessFatigue.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="ctlFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="atlFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: 'rgba(161,161,170,0.8)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} minTickGap={28} />
                        <YAxis tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={40} />
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

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusTone}`} />
                      <span className="text-white/85">当前状态: {fitnessFatigue.status.label}</span>
                    </div>
                    <div className="font-mono text-zinc-300">TSB {fitnessFatigue.status.tsb >= 0 ? '+' : ''}{fitnessFatigue.status.tsb}</div>
                    <div className="hidden text-xs text-zinc-500 sm:block">建议: {fitnessFatigue.status.suggestion}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <HeatmapTooltip cell={hoveredCell} />
      </motion.div>
    </section>
  );
}
