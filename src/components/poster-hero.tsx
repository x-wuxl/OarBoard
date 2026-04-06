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
    <section className="py-7 lg:py-9">
      <div className="relative overflow-hidden rounded-[2.05rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,29,0.94),rgba(16,21,30,0.82))] p-[1.15rem] shadow-[0_26px_92px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-[30px] lg:p-6">
        <div className="pointer-events-none absolute inset-x-16 top-0 h-20 rounded-full bg-cyan-300/5 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-[4.5rem] h-28 w-28 rounded-full bg-rose-400/5 blur-3xl" />

        {hasWorkout ? (
          <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[0.9rem]">
            <div className="col-span-2 flex flex-col items-center justify-center rounded-[1.85rem] border border-white/5 bg-zinc-950/46 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_8px_20px_rgba(0,0,0,0.28)] backdrop-blur-sm lg:row-span-2 lg:p-8">
              {children}
            </div>

            <div className="col-span-2 flex flex-col justify-center rounded-[1.72rem] border border-white/9 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_30px_rgba(0,0,0,0.26)] transition-[background-color,border-color,transform] duration-300 hover:border-white/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.045))] lg:p-6">
              <div className="mb-2 text-[0.7rem] font-medium tracking-[0.18em] text-zinc-500/78">500m 配速</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-bold tracking-[-0.04em] text-white lg:text-5xl">{paceValue}</span>
                <span className="font-mono text-sm text-zinc-400/85 lg:text-base">{paceUnit}</span>
              </div>
            </div>

            <div className="col-span-2 flex flex-col justify-center rounded-[1.72rem] border border-white/9 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_30px_rgba(0,0,0,0.26)] transition-[background-color,border-color,transform] duration-300 hover:border-white/12 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.045))] lg:p-6">
              <div className="mb-2 text-[0.7rem] font-medium tracking-[0.18em] text-zinc-500/78">今日距离</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-bold tracking-[-0.04em] text-white lg:text-5xl">
                  <AnimatedNumber value={ringData.distance.value / 1000} decimals={2} />
                </span>
                <span className="font-mono text-sm text-zinc-400/85 lg:text-base">km</span>
              </div>
              <div className="mt-4 opacity-90">
                <AnimatedProgressBar progress={ringData.distance.value / ringData.distance.goal} colorClass="bg-oar-cyan" />
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.38rem] border border-white/[0.035] bg-white/[0.02] px-4 py-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[background-color,border-color] duration-300 hover:border-white/[0.045] hover:bg-white/[0.026] lg:p-[1.05rem]">
              <div className="mb-3 text-[0.66rem] font-medium tracking-[0.16em] text-zinc-500/68 lg:text-[0.7rem]">桨频</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[1.58rem] font-semibold tracking-[-0.03em] text-white/88 lg:text-[1.8rem]">
                  <AnimatedNumber value={parseFloat(averageRpm) || 0} decimals={1} />
                </span>
                <span className="font-mono text-[0.67rem] text-zinc-500/65">spm</span>
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.38rem] border border-white/[0.035] bg-white/[0.02] px-4 py-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[background-color,border-color] duration-300 hover:border-white/[0.045] hover:bg-white/[0.026] lg:p-[1.05rem]">
              <div className="mb-3 text-[0.66rem] font-medium tracking-[0.16em] text-zinc-500/68 lg:text-[0.7rem]">桨次</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[1.58rem] font-semibold tracking-[-0.03em] text-white/88 lg:text-[1.8rem]">
                  <AnimatedNumber value={parseInt(totalTurns) || 0} decimals={0} />
                </span>
                <span className="font-mono text-[0.67rem] text-zinc-500/65">次</span>
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.38rem] border border-white/[0.035] bg-white/[0.02] px-4 py-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[background-color,border-color] duration-300 hover:border-white/[0.045] hover:bg-white/[0.026] lg:p-[1.05rem]">
              <div className="mb-3 text-[0.66rem] font-medium tracking-[0.16em] text-zinc-500/68 lg:text-[0.7rem]">今日时长</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[0.98rem] font-semibold tracking-[-0.03em] text-white/84 lg:text-[1.28rem]">
                  <AnimatedNumber value={ringData.duration.value} isTime={true} />
                </span>
              </div>
              <div className="mt-3 opacity-65">
                <AnimatedProgressBar progress={ringData.duration.value / ringData.duration.goal} colorClass="bg-oar-lime" />
              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-between rounded-[1.38rem] border border-white/[0.035] bg-white/[0.02] px-4 py-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[background-color,border-color] duration-300 hover:border-white/[0.045] hover:bg-white/[0.026] lg:p-[1.05rem]">
              <div className="mb-3 text-[0.66rem] font-medium tracking-[0.16em] text-zinc-500/68 lg:text-[0.7rem]">今日消耗</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[1.58rem] font-semibold tracking-[-0.03em] text-white/88 lg:text-[1.8rem]">
                  <AnimatedNumber value={ringData.calorie.value} decimals={0} />
                </span>
                <span className="font-mono text-[0.67rem] text-zinc-500/65">kcal</span>
              </div>
              <div className="mt-3 opacity-65">
                <AnimatedProgressBar progress={ringData.calorie.value / ringData.calorie.goal} colorClass="bg-oar-rose" />
              </div>
            </div>

            {timeMachineEntry ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-full mt-1 rounded-[1.22rem] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.014))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 w-px rounded-full bg-white/8" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.64rem] uppercase tracking-[0.22em] text-zinc-500/62">{timeMachineEntry.label}</div>
                    <div className="mt-2 font-mono text-[0.84rem] text-white/64 lg:text-[0.9rem]">你划了 {timeMachineEntry.distance} · {timeMachineEntry.duration} · 配速 {timeMachineEntry.pace}</div>
                    {timeMachineEntry.comparison ? (
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] tracking-[0.08em]">
                        <span className={timeMachineEntry.comparison.distancePositive ? 'text-emerald-300/72' : 'text-amber-200/72'}>
                          距离 {timeMachineEntry.comparison.distanceDelta} {timeMachineEntry.comparison.distancePositive ? '↑' : '↓'}
                        </span>
                        <span className={timeMachineEntry.comparison.pacePositive ? 'text-emerald-300/72' : 'text-amber-200/72'}>
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
