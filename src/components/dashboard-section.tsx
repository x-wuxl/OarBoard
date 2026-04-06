'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { WorkoutHistoryRowView } from '../lib/oarboard/dashboard-data';

interface DashboardSectionProps {
  historyRows: WorkoutHistoryRowView[];
  detailsById: Record<string, {
    title: string;
    subtitle: string;
    averagePace: string;
    averageSpeed: string;
    averageRpm: string;
    totalTurns: string;
    chartPoints: Array<{ minute: number; speed: number; rpm: number; pace: string }>;
  }>;
  defaultSelectedId: string | null;
}

const PAGE_SIZE = 10;

const transition = {
  duration: 0.75,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function DashboardSection({ historyRows, detailsById, defaultSelectedId }: DashboardSectionProps) {
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId);
  const [page, setPage] = React.useState(0);
  const detail = (selectedId && detailsById[selectedId]) || (defaultSelectedId ? detailsById[defaultSelectedId] : undefined);

  const totalPages = Math.max(1, Math.ceil(historyRows.length / PAGE_SIZE));
  const visibleRows = historyRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="mt-8 lg:mt-12 mb-16">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.9fr)]">
        <motion.section
          className="rounded-[2.2rem] border border-white/5 bg-zinc-900/30 p-6 lg:p-8 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ ...transition }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[0.02em] text-white/90">历史记录</h2>
              <p className="mt-1 text-sm text-oar-muted">浏览所有训练日志与配速细节</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-widest text-zinc-400 shadow-inner">
              共 {historyRows.length} 条
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {visibleRows.map((row) => {
              const isSelected = selectedId === row.id;
              return (
                <button
                  type="button"
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  className={`relative grid gap-3 overflow-hidden rounded-[1.3rem] pl-6 pr-4 py-4 text-left transition-all duration-300 md:grid-cols-[1.2fr_repeat(3,minmax(0,0.7fr))] md:items-center ${
                    isSelected
                      ? 'border border-cyan-400/20 bg-cyan-400/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.2)]'
                      : 'border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Highlight bar on the left edge if selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectionIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      initial={false}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  )}
                  
                  <div>
                    <div className="text-[0.95rem] font-semibold text-white/90">{row.title}</div>
                    <div className="mt-1 font-mono text-[0.8rem] text-zinc-500">{row.subtitle} 开始</div>
                  </div>
                  <div>
                    <div className="text-[0.68rem] uppercase tracking-[0.12em] text-zinc-500 mb-1">配速</div>
                    <div className="font-mono text-sm font-semibold text-white/90">{row.pace}</div>
                  </div>
                  <div>
                    <div className="text-[0.68rem] uppercase tracking-[0.12em] text-zinc-500 mb-1">时长</div>
                    <div className="font-mono text-sm font-semibold text-oar-lime">{row.duration}</div>
                  </div>
                  <div>
                    <div className="text-[0.68rem] uppercase tracking-[0.12em] text-zinc-500 mb-1">里程</div>
                    <div className="font-mono text-sm font-semibold text-cyan-400">{row.distance}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30 backdrop-blur-md"
              >
                &larr; Prev
              </button>
              <span className="font-mono text-sm text-zinc-500">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30 backdrop-blur-md"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </motion.section>

        <motion.aside
          className="rounded-[2.2rem] border border-white/5 bg-zinc-900/30 p-6 lg:p-8 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.3)] flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ ...transition, delay: 0.1 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[0.02em] text-white/90">微观细节</h2>
              <p className="mt-1 text-sm text-oar-muted">当前选中运动的数据解剖</p>
            </div>
            {detail && (
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1 font-mono text-[0.68rem] tracking-wider text-cyan-300 shadow-inner">
                {detail.title}
              </div>
            )}
          </div>

          <div className="mt-6 flex-1 flex flex-col rounded-[1.6rem] border border-white/5 bg-black/20 p-5 shadow-inner">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/5 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors hover:bg-black/40">
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-zinc-500">平均配速</div>
                <div className="mt-2 text-xl font-bold font-mono text-white/90">{detail?.averagePace}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/5 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors hover:bg-black/40">
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-zinc-500">平均速度</div>
                <div className="mt-2 text-xl font-bold font-mono text-white/90">{detail?.averageSpeed}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/5 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors hover:bg-black/40">
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-zinc-500">平均桨频</div>
                <div className="mt-2 text-xl font-bold font-mono text-white/90">{detail?.averageRpm}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/5 bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors hover:bg-black/40">
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-zinc-500">总桨次</div>
                <div className="mt-2 text-xl font-bold font-mono text-white/90">{detail?.totalTurns}</div>
              </div>
            </div>

            <div className="mt-5 h-[220px] rounded-[1.4rem] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(12,26,36,0.6),rgba(7,18,26,0.8))] p-4 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] flex flex-col">
              <div className="text-[0.68rem] uppercase tracking-[0.12em] text-cyan-300/60 font-medium">速度与桨频趋势图</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedId ?? 'empty'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex-1 w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={detail?.chartPoints ?? []} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="glowAreaSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="glowAreaRpm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a3e635" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="minute" tick={{ fill: 'rgba(161,161,170,0.8)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="speed" tick={{ fill: 'rgba(34,211,238,0.8)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={38} />
                      <YAxis yAxisId="rpm" orientation="right" tick={{ fill: 'rgba(163,230,53,0.8)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={36} />
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
                      <Area yAxisId="speed" type="monotone" dataKey="speed" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#glowAreaSpeed)" activeDot={{ r: 5, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }} />
                      <Area yAxisId="rpm" type="monotone" dataKey="rpm" stroke="#a3e635" strokeWidth={2} fillOpacity={1} fill="url(#glowAreaRpm)" activeDot={{ r: 5, fill: '#a3e635', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
