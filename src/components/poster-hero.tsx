import { AnimatedNumber, AnimatedProgressBar } from './animated-metrics';
import type { TimeMachineEntry } from '../lib/oarboard/time-machine-data';

interface EmptyStateMilestone {
  currentKm: number;
  targetKm: number;
  targetLabel: string;
}

interface EmptyStateContent {
  title: string;
  subtitle: string;
  recentWorkout: string;
  milestone: EmptyStateMilestone;
}

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
  emptyState?: EmptyStateContent | null;
  children: React.ReactNode;
}

function MilestoneRing({ milestone }: { milestone: EmptyStateMilestone }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const progress = milestone.targetKm > 0 ? Math.min(milestone.currentKm / milestone.targetKm, 1) : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex h-[14.75rem] w-[14.75rem] items-center justify-center lg:h-[16rem] lg:w-[16rem]">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#4ed8ff"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ filter: 'drop-shadow(0 0 16px rgba(78,216,255,0.35))', transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[0.68rem] tracking-[0.18em] text-zinc-500/80">下个里程碑</div>
        <div className="mt-3 flex items-baseline gap-1 font-mono text-white">
          <span className="text-4xl font-bold tracking-tight lg:text-[2.7rem]">
            <AnimatedNumber value={milestone.currentKm} decimals={1} />
          </span>
          <span className="text-sm text-zinc-500/80">km</span>
        </div>
        <div className="mt-2 text-sm font-medium text-white/74">目标 {milestone.targetLabel}</div>
      </div>
    </div>
  );
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
  emptyState,
  children,
}: PosterHeroProps) {
  const paceValue = averagePace.split('/')[0] || '--:--';
  const paceUnit = averagePace.includes('/') ? `/${averagePace.split('/').slice(1).join('/')}` : '';
  const heroPanelClass =
    'rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_26px_rgba(0,0,0,0.28)] transition-colors duration-300 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] lg:p-6';
  const heroStatCardClass =
    'rounded-[1.4rem] border border-white/5 bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-300 hover:bg-white/[0.03] lg:p-4.5';

  return (
    <section className="pt-7 pb-2 lg:pt-9 lg:pb-3">
      <div className="relative overflow-hidden rounded-[2.1rem] border border-white/12 bg-[linear-gradient(180deg,rgba(18,24,34,0.9),rgba(18,24,34,0.72))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[30px] lg:p-7">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-24 rounded-full bg-cyan-300/7 blur-3xl" />
        <div className="pointer-events-none absolute right-2 top-16 h-32 w-32 rounded-full bg-rose-400/7 blur-3xl" />

        {hasWorkout ? (
          <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <div className="col-span-2 flex flex-col items-center justify-center rounded-[1.9rem] border border-white/5 bg-zinc-950/42 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_22px_rgba(0,0,0,0.3)] backdrop-blur-sm lg:row-span-2 lg:p-8">
              {children}
            </div>

            <div className={`col-span-2 flex flex-col justify-center ${heroPanelClass}`}>
              <div className="mb-2 text-[0.72rem] font-medium tracking-[0.14em] text-zinc-500/90">500m 配速</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-bold tracking-tight text-white lg:text-5xl">{paceValue}</span>
                <span className="font-mono text-sm text-zinc-500/90 lg:text-base">{paceUnit}</span>
              </div>
            </div>

            <div className={`col-span-2 flex flex-col justify-center ${heroPanelClass}`}>
              <div className="mb-2 text-[0.72rem] font-medium tracking-[0.14em] text-zinc-500/90">今日距离</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-bold tracking-tight text-white lg:text-5xl">
                  <AnimatedNumber value={ringData.distance.value / 1000} decimals={2} />
                </span>
                <span className="font-mono text-sm text-zinc-500/90 lg:text-base">km</span>
              </div>
              <div className="mt-4">
                <AnimatedProgressBar progress={ringData.distance.value / ringData.distance.goal} colorClass="bg-oar-cyan" />
              </div>
            </div>

            <div className={`col-span-1 flex flex-col justify-between ${heroStatCardClass}`}>
              <div className="mb-3 text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500/80">桨频</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[1.65rem] font-bold tracking-tight text-white/92 lg:text-[1.9rem]">
                  <AnimatedNumber value={parseFloat(averageRpm) || 0} decimals={1} />
                </span>
                <span className="font-mono text-[0.68rem] text-zinc-500/75">spm</span>
              </div>
            </div>

            <div className={`col-span-1 flex flex-col justify-between ${heroStatCardClass}`}>
              <div className="mb-3 text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500/80">桨次</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[1.65rem] font-bold tracking-tight text-white/92 lg:text-[1.9rem]">
                  <AnimatedNumber value={parseInt(totalTurns) || 0} decimals={0} />
                </span>
                <span className="font-mono text-[0.68rem] text-zinc-500/75">次</span>
              </div>
            </div>

            <div className={`col-span-1 flex flex-col justify-between ${heroStatCardClass}`}>
              <div className="mb-3 text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500/80">今日时长</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-base font-bold tracking-tight text-white/90 lg:text-[1.35rem]">
                  <AnimatedNumber value={ringData.duration.value} isTime={true} />
                </span>
              </div>
              <div className="mt-3 opacity-80">
                <AnimatedProgressBar progress={ringData.duration.value / ringData.duration.goal} colorClass="bg-oar-lime" />
              </div>
            </div>

            <div className={`col-span-1 flex flex-col justify-between ${heroStatCardClass}`}>
              <div className="mb-3 text-[0.68rem] font-medium tracking-[0.12em] text-zinc-500/80">今日消耗</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[1.65rem] font-bold tracking-tight text-white/92 lg:text-[1.9rem]">
                  <AnimatedNumber value={ringData.calorie.value} decimals={0} />
                </span>
                <span className="font-mono text-[0.68rem] text-zinc-500/75">kcal</span>
              </div>
              <div className="mt-3 opacity-80">
                <AnimatedProgressBar progress={ringData.calorie.value / ringData.calorie.goal} colorClass="bg-oar-rose" />
              </div>
            </div>

            {timeMachineEntry ? (
              <div className="col-span-full mt-1 rounded-[1.35rem] border border-white/5 bg-white/[0.02] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex gap-3">
                  <div className="mt-0.5 w-px rounded-full bg-white/10" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.68rem] uppercase tracking-[0.18em] text-zinc-500/80">{timeMachineEntry.label}</div>
                    <div className="mt-2 font-mono text-sm text-white/72 lg:text-[0.92rem]">你划了 {timeMachineEntry.distance} · {timeMachineEntry.duration} · 配速 {timeMachineEntry.pace}</div>
                    {timeMachineEntry.comparison ? (
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] tracking-[0.06em]">
                        <span className={timeMachineEntry.comparison.distancePositive ? 'text-emerald-400/75' : 'text-amber-300/75'}>
                          距离 {timeMachineEntry.comparison.distanceDelta} {timeMachineEntry.comparison.distancePositive ? '↑' : '↓'}
                        </span>
                        <span className={timeMachineEntry.comparison.pacePositive ? 'text-emerald-400/75' : 'text-amber-300/75'}>
                          配速 {timeMachineEntry.comparison.paceDeltaLabel}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : emptyState ? (
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_auto] lg:items-center lg:gap-6">
            <div className="p-1 lg:pr-1">
              <div className="text-[0.72rem] uppercase tracking-[0.16em] text-oar-muted">Today</div>
              <div className="mt-3 text-[1.9rem] font-semibold tracking-[0.01em] text-white lg:text-[2.35rem]">{emptyState.title}</div>
              <div className="mt-3 inline-flex max-w-fit items-center rounded-full border border-cyan-300/14 bg-cyan-300/[0.08] px-4 py-2 text-[0.92rem] font-medium text-cyan-100/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:text-base">
                {emptyState.subtitle}
              </div>
              <div className="mt-4 max-w-[34rem] text-sm leading-7 text-white/68 lg:text-[0.98rem]">
                {emptyState.recentWorkout}
              </div>
            </div>

            <div className="flex justify-center px-1 py-1 lg:justify-end lg:px-0">
              <MilestoneRing milestone={emptyState.milestone} />
            </div>
          </div>
        ) : (
          <div className="relative grid place-items-center py-10">
            <div className="text-center">
              <div className="text-[0.72rem] uppercase tracking-[0.16em] text-oar-muted">Today</div>
              <div className="mt-3 text-xl font-semibold text-white/60">今天还没有训练记录</div>
              <div className="mt-2 text-sm text-oar-muted">完成一次运动后，这里会展示你的今日进度与里程碑。</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
