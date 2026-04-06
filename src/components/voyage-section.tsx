'use client';

import { motion } from 'framer-motion';

import type { VoyageProgressView } from '../lib/oarboard/voyage-data';

interface VoyageSectionProps {
  voyage: VoyageProgressView;
}

export function VoyageSection({ voyage }: VoyageSectionProps) {
  const completedCount = voyage.completedRoutes.length;
  const progressPercent = Math.round(voyage.routeProgress * 100);
  const displayRemaining = Math.max(0, voyage.remainingInRoute);
  const routeTags = [...voyage.completedRoutes, voyage.currentRoute, ...voyage.lockedRoutes];

  return (
    <section className="mt-8 lg:mt-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-white/50">虚拟远征</div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <motion.div
        className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-zinc-900/30 p-6 lg:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-none absolute inset-x-20 top-6 h-20 rounded-full bg-cyan-300/[0.08] blur-3xl" />

        <div className="relative rounded-[1.6rem] border border-white/5 bg-black/20 p-4 lg:p-5 shadow-inner">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.95rem] font-medium tracking-[0.02em] text-white/88">{voyage.currentRoute.name}</div>
              <div className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-zinc-500/95">{voyage.currentRoute.region} · 第 {completedCount + 1} 段远征</div>
            </div>
            <div className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1 font-mono text-[0.68rem] tracking-[0.18em] text-cyan-200/90 shadow-inner">
              {progressPercent}%
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/5 bg-[linear-gradient(180deg,rgba(8,16,24,0.84),rgba(5,10,16,0.94))] p-4 lg:p-5">
            <svg viewBox="0 0 800 200" className="h-[150px] w-full" aria-label={voyage.currentRoute.name}>
              <path
                d={voyage.currentRoute.path}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1.75"
                strokeDasharray="4 9"
                strokeLinecap="round"
              />
              <motion.path
                d={voyage.currentRoute.path}
                fill="none"
                stroke="rgba(103,232,249,0.92)"
                strokeWidth="3.2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: Math.max(voyage.routeProgress, 0.001) }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.2)) drop-shadow(0 0 14px rgba(34,211,238,0.16))' }}
              />
              <circle cx="40" cy="100" r="4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.25" />
              <circle cx="760" cy="90" r="4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.25" />
              <motion.circle
                cx={40 + 720 * Math.min(voyage.routeProgress, 1)}
                cy={100 - 10 * Math.sin(Math.min(voyage.routeProgress, 1) * Math.PI)}
                r={10}
                fill="rgba(34,211,238,0.14)"
                animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.92, 1.12, 0.92] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx={40 + 720 * Math.min(voyage.routeProgress, 1)}
                cy={100 - 10 * Math.sin(Math.min(voyage.routeProgress, 1) * Math.PI)}
                r={4.5}
                fill="#67e8f9"
                stroke="rgba(224,255,255,0.7)"
                strokeWidth="1.2"
                animate={{ opacity: [0.92, 1, 0.92], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(103,232,249,0.55))' }}
              />
            </svg>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1rem] border border-white/5 bg-black/30 p-3 shadow-inner">
              <div className="text-[0.68rem] uppercase tracking-[0.12em] text-zinc-500">已划行</div>
              <div className="mt-2 font-mono text-lg font-bold text-white/90">{voyage.totalDistance.toFixed(2)} km</div>
            </div>
            <div className="rounded-[1rem] border border-white/5 bg-black/30 p-3 shadow-inner">
              <div className="text-[0.68rem] uppercase tracking-[0.12em] text-zinc-500">当前路线</div>
              <div className="mt-2 font-mono text-lg font-bold text-white/90">{voyage.currentRoute.name}</div>
            </div>
            <div className="rounded-[1rem] border border-white/5 bg-black/30 p-3 shadow-inner">
              <div className="text-[0.68rem] uppercase tracking-[0.12em] text-zinc-500">剩余距离</div>
              <div className="mt-2 font-mono text-lg font-bold text-white/90">{displayRemaining.toFixed(2)} km</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {routeTags.map((route) => {
              const isCompleted = voyage.completedRoutes.some((item) => item.id === route.id);
              const isCurrent = route.id === voyage.currentRoute.id;

              return (
                <div
                  key={route.id}
                  className={`whitespace-nowrap rounded-[0.8rem] border px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors ${
                    isCompleted
                      ? 'border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-100/80'
                      : isCurrent
                        ? 'border-white/12 bg-white/[0.07] text-white/82'
                        : 'border-white/5 bg-white/[0.02] text-zinc-500'
                  }`}
                >
                  {route.name}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
