import { motion } from 'framer-motion';

import { AnimatedNumber, AnimatedProgressBar } from './animated-metrics';
import type { TimeMachineEntry } from '../lib/oarboard/time-machine-data';

interface PosterHeroProps {
  averagePace: string;
  averageRpm: string;
  totalTurns: string;
  duration: string;
  distance: string;
  calories: string;
  hasWorkout: boolean;
  ringData: {
    calorie: { value: number; goal: number };
    duration: { value: number; goal: number };
    distance: { value: number; goal: number };
  };
  timeMachineEntry?: TimeMachineEntry | null;
  children: React.ReactNode;
}

export function PosterHero({
  averagePace,
  averageRpm,
  totalTurns,
  duration,
  distance,
  calories,
  hasWorkout,
  ringData,
  timeMachineEntry,
  children,
}: PosterHeroProps) {
  const paceValue = averagePace.split('/')[0] || '--:--';
  const paceUnit = averagePace.includes('/') ? `/${averagePace.split('/').slice(1).join('/')}` : '';

  return (
    <section className="py-8 lg:py-10">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.035))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[30px] lg:p-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-14 h-36 w-36 rounded-full bg-rose-400/10 blur-3xl" />

        {hasWorkout ? (
          <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <div className="col-span-2 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-sm lg:row-span-2 lg:p-8">
              {children}
            </div>

            <div className="col-span-2 flex flex-col justify-center rounded-3xl border border-white/5 bg-zinc-900/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] transition-all hover:bg-zinc-800/50 lg:p-6">
              <div className="mb-1 text-sm font-medium tracking-[0.05em] text-zinc-500">500m 配速</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-bold tracking-tight text-white lg:text-5xl">{paceValue}</span>
                <span className="font-mono text-sm text-zinc-500 lg:text-base">{paceUnit}</span>
              </div>
            </div>

            <div className="col-span-2 flex flex-col justify-center rounded-3xl border border-white/5 bg-zinc-900/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] transition-all hover:bg-zinc-800/50 lg:p-6">
              <div className="mb-2 text-sm font-medium tracking-[0.05em] text-zinc-500">今日距离</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-bold tracking-tight text-white lg:text-5xl">
                  <AnimatedNumber value={ringData.distance.value / 1000} decimals={2} />
                </span>
                <span className="font-mono text-sm text-zinc-500 lg:text-base">km</span>
              </div>
              <div className="mt-4">
                <AnimatedProgressBar progress={ringData.distance.value / ringData.distance.goal} colorClass="bg-oar-cyan" />
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] transition-all hover:bg-zinc-800/50 lg:p-5">
              <div className="mb-2 text-xs font-medium tracking-[0.05em] text-zinc-500 lg:text-sm">桨频</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  <AnimatedNumber value={parseFloat(averageRpm) || 0} decimals={1} />
                </span>
                <span className="font-mono text-xs text-zinc-500">spm</span>
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:bg-zinc-800/50 lg:p-5">
              <div className="mb-2 text-xs font-medium tracking-[0.05em] text-zinc-500 lg:text-sm">桨次</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  <AnimatedNumber value={parseInt(totalTurns) || 0} decimals={0} />
                </span>
                <span className="font-mono text-xs text-zinc-500">次</span>
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:bg-zinc-800/50 lg:p-5">
              <div className="mb-2 text-xs font-medium tracking-[0.05em] text-zinc-500 lg:text-sm">今日时长</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-bold tracking-tight text-white lg:text-2xl">
                  <AnimatedNumber value={ringData.duration.value} isTime={true} />
                </span>
              </div>
              <div className="mt-3">
                <AnimatedProgressBar progress={ringData.duration.value / ringData.duration.goal} colorClass="bg-oar-lime" />
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:bg-zinc-800/50 lg:p-5">
              <div className="mb-2 text-xs font-medium tracking-[0.05em] text-zinc-500 lg:text-sm">今日消耗</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  <AnimatedNumber value={ringData.calorie.value} decimals={0} />
                </span>
                <span className="font-mono text-xs text-zinc-500">kcal</span>
              </div>
              <div className="mt-3">
                <AnimatedProgressBar progress={ringData.calorie.value / ringData.calorie.goal} colorClass="bg-oar-rose" />
              </div>
            </div>

            {timeMachineEntry ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-full mt-1 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex gap-3">
                  <div className="w-0.5 rounded-full bg-zinc-600/40" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.72rem] tracking-[0.08em] text-zinc-500">{timeMachineEntry.label}</div>
                    <div className="mt-2 font-mono text-sm text-white/80">你划了 {timeMachineEntry.distance} · {timeMachineEntry.duration} · 配速 {timeMachineEntry.pace}</div>
                    {timeMachineEntry.comparison ? (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span className={timeMachineEntry.comparison.distancePositive ? 'text-emerald-400/80' : 'text-amber-400/80'}>
                          距离 {timeMachineEntry.comparison.distanceDelta} {timeMachineEntry.comparison.distancePositive ? '↑' : '↓'}
                        </span>
                        <span className={timeMachineEntry.comparison.pacePositive ? 'text-emerald-400/80' : 'text-amber-400/80'}>
                          配速 {timeMachineEntry.comparison.paceDeltaLabel}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        ) : (
          <div className="relative grid place-items-center py-10">
            <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
              <div className="flex justify-center">{children}</div>
              <div className="text-center lg:text-left">
                <div className="text-[0.72rem] uppercase tracking-[0.16em] text-oar-muted">Today</div>
                <div className="mt-3 text-xl font-semibold text-white/60">暂无运动记录</div>
                <div className="mt-2 text-sm text-oar-muted">完成一次划船运动后，数据将在此展示</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
