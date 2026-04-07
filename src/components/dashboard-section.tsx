'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { WorkoutHistoryRowView } from '../lib/oarboard/dashboard-data';
import type { DnaFingerprint } from '../lib/oarboard/dna-data';
import type { MilestoneView } from '../lib/oarboard/milestones-data';

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
  dnaById: Record<string, DnaFingerprint>;
  milestones: MilestoneView[];
  defaultSelectedId: string | null;
}

const PAGE_SIZE = 10;
const transition = {
  duration: 0.75,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function DashboardSection({ historyRows, detailsById, dnaById, milestones, defaultSelectedId }: DashboardSectionProps) {
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId);
  const [page, setPage] = React.useState(0);
  const [expandedMilestones, setExpandedMilestones] = React.useState(false);

  React.useEffect(() => {
    setSelectedId(defaultSelectedId);
  }, [defaultSelectedId]);

  const detail = (selectedId && detailsById[selectedId]) || (defaultSelectedId ? detailsById[defaultSelectedId] : undefined);

  const totalPages = Math.max(1, Math.ceil(historyRows.length / PAGE_SIZE));
  const visibleRows = historyRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const visibleMilestones = expandedMilestones ? milestones : milestones.slice(0, 4);

  return (
    <section className="mb-16 mt-8 lg:mt-12">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.9fr)]">
        <motion.section
          className="rounded-[2.2rem] border border-white/5 bg-zinc-900/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:p-8"
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

          <div className="mt-6 grid gap-2.5">
            {visibleRows.map((row) => {
              const isSelected = selectedId === row.id;
              const dna = dnaById[row.id];

              return (
                <button
                  type="button"
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  className={`group relative overflow-hidden rounded-[1.2rem] border pl-5 pr-4 py-3.5 text-left transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan-400/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.085),rgba(12,18,24,0.72))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_18px_rgba(0,0,0,0.18)]'
                      : 'border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.015))] hover:border-white/10 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]'
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-y-3 left-2.5 w-px rounded-full transition-all duration-200 ${
                      isSelected
                        ? 'bg-cyan-300/95 shadow-[0_0_10px_rgba(34,211,238,0.65)] opacity-100'
                        : 'bg-transparent opacity-0'
                    }`}
                  />

                  <div className="grid gap-3 md:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(5.2rem,0.72fr))] md:items-center md:gap-4">
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-[0.95rem] font-semibold tracking-[0.01em] text-white/90">{row.title}</div>
                      <div className="mt-1 font-mono text-[0.76rem] tracking-[0.08em] text-zinc-500">{row.subtitle} 开始</div>
                    </div>
                    <div className="md:border-l md:border-white/5 md:pl-4">
                      <div className="mb-1 text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">配速</div>
                      <div className="font-mono text-sm font-semibold tabular-nums text-white/90">{row.pace}</div>
                    </div>
                    <div className="md:border-l md:border-white/5 md:pl-4">
                      <div className="mb-1 text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">时长</div>
                      <div className="font-mono text-sm font-semibold tabular-nums text-oar-lime">{row.duration}</div>
                    </div>
                    <div className="md:border-l md:border-white/5 md:pl-4">
                      <div className="mb-1 text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">里程</div>
                      <div className="font-mono text-sm font-semibold tabular-nums text-cyan-400">{row.distance}</div>
                    </div>
                  </div>

                  {dna ? (
                    <div className="mt-3.5 rounded-[0.95rem] border border-white/5 bg-black/15 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[0.63rem] uppercase tracking-[0.18em] text-zinc-600">训练标签</span>
                        <span className={`text-[0.64rem] tracking-[0.12em] ${isSelected ? 'text-cyan-200/70' : 'text-zinc-500'}`}>{dna.rhythmLabel}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dna.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full border px-2.5 py-1 text-[0.66rem] tracking-[0.08em] ${
                              isSelected
                                ? 'border-cyan-400/18 bg-cyan-400/[0.1] text-cyan-100/88'
                                : 'border-white/6 bg-white/[0.03] text-zinc-300'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
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
          className="flex flex-col rounded-[2.2rem] border border-white/5 bg-zinc-900/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:p-8"
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

          <div className="mt-6 flex flex-1 flex-col rounded-[1.6rem] border border-white/5 bg-[linear-gradient(180deg,rgba(6,8,12,0.78),rgba(4,5,8,0.88))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-[1.15rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                <div className="text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">平均配速</div>
                <div className="mt-2 font-mono text-xl font-bold tabular-nums text-white/90">{detail?.averagePace}</div>
              </div>
              <div className="rounded-[1.15rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                <div className="text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">平均速度</div>
                <div className="mt-2 font-mono text-xl font-bold tabular-nums text-white/90">{detail?.averageSpeed}</div>
              </div>
              <div className="rounded-[1.15rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                <div className="text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">平均桨频</div>
                <div className="mt-2 font-mono text-xl font-bold tabular-nums text-white/90">{detail?.averageRpm}</div>
              </div>
              <div className="rounded-[1.15rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-colors hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                <div className="text-[0.66rem] uppercase tracking-[0.16em] text-zinc-500">总桨次</div>
                <div className="mt-2 font-mono text-xl font-bold tabular-nums text-white/90">{detail?.totalTurns}</div>
              </div>
            </div>

            <div className="mt-5 flex h-[238px] flex-col rounded-[1.45rem] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(7,16,23,0.92),rgba(3,8,13,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-18px_28px_rgba(0,0,0,0.45),0_10px_24px_rgba(0,0,0,0.18)]">
              <div className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-cyan-300/55">速度与桨频趋势图</div>
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

            {milestones.length > 0 ? (
              <div className="mt-6 rounded-[1.35rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="mb-3 flex items-center gap-3">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/48">里程碑</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                </div>
                <div className="overflow-hidden rounded-[1rem] border border-white/5 bg-black/15">
                  {visibleMilestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 ${
                        index !== visibleMilestones.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <div className={`h-2.5 w-2.5 rounded-[3px] ${milestone.achieved ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.35)]' : 'border border-zinc-600/80 bg-transparent'}`} />
                      </div>
                      <div className={`min-w-0 text-sm ${milestone.achieved ? 'text-white/82' : 'text-zinc-500'}`}>{milestone.label}</div>
                      <div className={`justify-self-end font-mono text-[0.72rem] tracking-[0.12em] ${milestone.achieved ? 'text-zinc-500' : 'text-zinc-600 italic'}`}>
                        {milestone.achieved ? milestone.achievedDate : milestone.predictedDate ? `预计 ${milestone.predictedDate}` : '待解锁'}
                      </div>
                    </div>
                  ))}
                </div>
                {milestones.length > 4 ? (
                  <button
                    type="button"
                    onClick={() => setExpandedMilestones((value) => !value)}
                    className="mt-3 text-xs tracking-[0.12em] text-zinc-500 transition-colors hover:text-white"
                  >
                    {expandedMilestones ? '收起' : '展开全部'}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
