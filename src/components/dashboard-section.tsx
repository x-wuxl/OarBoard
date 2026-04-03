'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    <section className="mt-10 grid gap-6 lg:mt-14">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.9fr)]">
        <motion.section
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...transition, delay: 0.06 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.04em]">训练记录</h2>
              <p className="mt-1 text-sm text-oar-muted">点击查看配速、桨频曲线等详情</p>
            </div>
            <span className="text-xs tracking-[0.08em] text-oar-muted">共 {historyRows.length} 条</span>
          </div>

          <div className="mt-5 grid gap-3">
            {visibleRows.map((row) => (
              <button
                type="button"
                key={row.id}
                onClick={() => setSelectedId(row.id)}
                className={`grid gap-3 rounded-[1.35rem] px-4 py-4 text-left transition-all duration-200 md:grid-cols-[1.2fr_repeat(3,minmax(0,0.7fr))] md:items-center ${selectedId === row.id ? 'border border-cyan-300/25 bg-cyan-300/[0.08] shadow-[0_10px_30px_rgba(78,216,255,0.08)]' : 'border border-white/6 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]'}`}
              >
                <div>
                  <div className="text-base font-semibold">{row.title}</div>
                  <div className="mt-1 text-sm text-oar-muted">{row.subtitle} 开始</div>
                </div>
                <div>
                  <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">配速</div>
                  <div className="mt-1 font-semibold">{row.pace}</div>
                </div>
                <div>
                  <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">时长</div>
                  <div className="mt-1 font-semibold">{row.duration}</div>
                </div>
                <div>
                  <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">里程</div>
                  <div className="mt-1 font-semibold">{row.distance}</div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-oar-muted transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
              >
                上一页
              </button>
              <span className="text-sm text-oar-muted">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-oar-muted transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
              >
                下一页
              </button>
            </div>
          )}
        </motion.section>

        <motion.aside
          className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...transition, delay: 0.12 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.04em]">运动详情</h2>
              <p className="mt-1 text-sm text-oar-muted">选择左侧记录查看数据</p>
            </div>
            {detail && (
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-[0.68rem] tracking-[0.08em] text-cyan-200">
                {detail.title}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/6 bg-black/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">平均配速</div>
                <div className="mt-2 text-lg font-semibold">{detail?.averagePace}</div>
              </div>
              <div className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">平均速度</div>
                <div className="mt-2 text-lg font-semibold">{detail?.averageSpeed}</div>
              </div>
              <div className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">平均桨频</div>
                <div className="mt-2 text-lg font-semibold">{detail?.averageRpm}</div>
              </div>
              <div className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-4">
                <div className="text-[0.72rem] tracking-[0.08em] text-oar-muted">总桨次</div>
                <div className="mt-2 text-lg font-semibold">{detail?.totalTurns}</div>
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(12,26,36,0.85),rgba(7,18,26,0.92))] p-4">
              <div className="text-[0.72rem] tracking-[0.08em] text-cyan-300/80">速度与桨频</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedId ?? 'empty'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 h-56 rounded-[1rem] bg-[radial-gradient(circle_at_top,rgba(78,216,255,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-2"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detail?.chartPoints ?? []} margin={{ top: 8, right: 10, left: 6, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="minute" tick={{ fill: 'rgba(226,241,248,0.62)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="speed" tick={{ fill: 'rgba(78,216,255,0.78)', fontSize: 11 }} axisLine={false} tickLine={false} width={46} />
                      <YAxis yAxisId="rpm" orientation="right" tick={{ fill: 'rgba(141,252,97,0.72)', fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(3, 16, 25, 0.9)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '14px',
                          color: '#f4fbff',
                        }}
                        labelStyle={{ color: 'rgba(226,241,248,0.7)' }}
                      />
                      <Line yAxisId="speed" type="monotone" dataKey="speed" stroke="#4ed8ff" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      <Line yAxisId="rpm" type="monotone" dataKey="rpm" stroke="#8dfc61" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
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
