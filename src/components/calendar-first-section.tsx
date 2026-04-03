'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

import {
  buildFullYearHeatmap,
  buildRollingYearHeatmap,
  getAvailableYears,
  type HeatmapCellView,
  type TrendCardView,
} from '../lib/oarboard/calendar-data';

interface CalendarFirstSectionProps {
  heatmap: HeatmapCellView[];
  weekCards: TrendCardView[];
  monthCards: TrendCardView[];
  yearCards: TrendCardView[];
}

type FilterMode = 'week' | 'month' | 'year';
type HeatmapMode = 'rolling' | number;

const palette = [
  'bg-[#0f1f16]',
  'bg-[#143d24]',
  'bg-[#1e5a35]',
  'bg-[#2f7d47]',
  'bg-[#46a85c]',
  'bg-[#56d468]',
] as const;

const filterLabels: Record<FilterMode, string> = {
  week: '本周',
  month: '本月',
  year: '本年',
};

interface HoveredHeatmapCell {
  date: string;
  distance: number;
  rect: DOMRect;
}

function HeatmapTooltip({ cell }: { cell: HoveredHeatmapCell | null }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({ opacity: 0, top: 0, left: 0 });

  React.useLayoutEffect(() => {
    if (!cell || !ref.current) {
      return;
    }

    const tooltipRect = ref.current.getBoundingClientRect();
    const gap = 10;
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = cell.rect.top - tooltipRect.height - gap;
    let left = cell.rect.left + (cell.rect.width / 2) - (tooltipRect.width / 2);

    if (top < padding) {
      top = cell.rect.bottom + gap;
    }

    if (left < padding) {
      left = padding;
    }

    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    if (top + tooltipRect.height > viewportHeight - padding) {
      const sideTop = Math.min(
        Math.max(cell.rect.top + (cell.rect.height / 2) - (tooltipRect.height / 2), padding),
        viewportHeight - tooltipRect.height - padding,
      );
      const rightLeft = cell.rect.right + gap;
      const leftLeft = cell.rect.left - tooltipRect.width - gap;

      if (rightLeft + tooltipRect.width <= viewportWidth - padding) {
        top = sideTop;
        left = rightLeft;
      } else if (leftLeft >= padding) {
        top = sideTop;
        left = leftLeft;
      } else {
        top = viewportHeight - tooltipRect.height - padding;
      }
    }

    setStyle({ opacity: 1, top, left });
  }, [cell]);

  if (!cell || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="pointer-events-none fixed z-[1000] w-max rounded-lg border border-white/8 bg-slate-950/95 px-3 py-2 text-xs text-white shadow-2xl"
    >
      <div>{cell.date}</div>
      <div className="mt-1 text-oar-muted">{cell.distance.toFixed(2)} km</div>
    </div>,
    document.body,
  );
}

export function CalendarFirstSection({ heatmap, weekCards, monthCards, yearCards }: CalendarFirstSectionProps) {
  const [mode, setMode] = React.useState<FilterMode>('month');
  const [hoveredCell, setHoveredCell] = React.useState<HoveredHeatmapCell | null>(null);
  const [heatmapMode, setHeatmapMode] = React.useState<HeatmapMode>('rolling');
  const cards = mode === 'week' ? weekCards : mode === 'month' ? monthCards : yearCards;

  const availableYears = getAvailableYears(heatmap);
  const currentYear = new Date().getFullYear();

  const weekColumns = heatmapMode === 'rolling'
    ? buildRollingYearHeatmap(heatmap)
    : buildFullYearHeatmap(heatmapMode, heatmap);

  const desktopColumns = `repeat(${Math.max(weekColumns.length, 1)}, minmax(0, 1fr))`;

  const heatmapLabel = heatmapMode === 'rolling'
    ? '近一年'
    : `${heatmapMode} 年`;

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

  return (
    <section className="mt-10 grid gap-6 lg:mt-14">
      <motion.div
        className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.04em]">运动热力图</h2>
            <p className="mt-2 text-sm text-oar-muted">
              运动频率与强度一览，趋势卡片可按周/月/年切换。
            </p>
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(['week', 'month', 'year'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${mode === item ? 'bg-white text-slate-950' : 'text-oar-muted hover:text-white'}`}
              >
                {filterLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-medium">训练日历</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={handlePrev}
                  className="rounded-md px-2 py-0.5 text-xs text-oar-muted transition-colors hover:bg-white/8 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-oar-muted"
                >
                  &larr;
                </button>
                <span className="min-w-[3.5rem] text-center text-sm font-semibold">{heatmapLabel}</span>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={handleNext}
                  className="rounded-md px-2 py-0.5 text-xs text-oar-muted transition-colors hover:bg-white/8 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-oar-muted"
                >
                  &rarr;
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-2 md:overflow-visible">
              <div
                className="grid min-w-[680px] gap-[3px] md:min-w-0 md:w-full md:gap-[2px] xl:gap-[3px]"
                style={{ gridTemplateColumns: desktopColumns }}
              >
                {weekColumns.map((column) => (
                  <div key={column.key} className="grid justify-items-center gap-[2px]">
                    <div className="mb-0.5 h-4 text-center text-[0.65rem] tracking-[0.08em] text-oar-muted">
                      {column.monthLabel ? column.monthLabel : ''}
                    </div>
                    {Array.from({ length: 7 }, (_, weekday) => {
                      const cell = column.days.find((item) => item.weekday === weekday);

                      return (
                        <div
                          key={`${column.key}-${weekday}`}
                          className="group relative aspect-square w-full max-w-4"
                          onMouseEnter={cell && cell.distance > 0 ? (event) => setHoveredCell({
                            date: cell.date,
                            distance: cell.distance,
                            rect: event.currentTarget.getBoundingClientRect(),
                          }) : undefined}
                          onMouseLeave={cell && cell.distance > 0 ? () => setHoveredCell(null) : undefined}
                          onFocus={cell && cell.distance > 0 ? (event) => setHoveredCell({
                            date: cell.date,
                            distance: cell.distance,
                            rect: event.currentTarget.getBoundingClientRect(),
                          }) : undefined}
                          onBlur={cell && cell.distance > 0 ? () => setHoveredCell(null) : undefined}
                          tabIndex={cell && cell.distance > 0 ? 0 : -1}
                        >
                          <div className={`h-full w-full rounded-[0.2rem] border ${cell ? 'border-white/5' : 'border-white/[0.03] bg-transparent'} ${cell ? palette[cell.level] : ''}`} />
                        </div>
                      );
                    })}
                  </div>
                ))}
                </div>
              </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-xs text-oar-muted">
                <span>少</span>
                {palette.map((tone, index) => (
                  <span key={index} className={`h-3 w-3 rounded-[0.2rem] ${tone}`} />
                ))}
                <span>多</span>
              </div>

              <div className="text-xs tracking-[0.08em] text-oar-muted">
                {heatmapMode === 'rolling' ? '过去 12 个月训练强度' : `${heatmapMode} 年训练日历`}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {cards.map((card) => (
              <div key={card.id} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">{card.label}</div>
                <div className="mt-2 text-2xl font-bold tracking-[-0.04em]">{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        <HeatmapTooltip cell={hoveredCell} />
      </motion.div>
    </section>
  );
}
