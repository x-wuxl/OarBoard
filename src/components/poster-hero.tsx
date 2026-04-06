import { AnimatedNumber, AnimatedProgressBar } from './animated-metrics';

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
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* 左侧核心 (2x2) */}
            <div className="col-span-2 lg:row-span-2 flex flex-col justify-center items-center rounded-3xl border border-white/5 bg-zinc-900/40 p-6 lg:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-sm">
              {children}
            </div>

            {/* 右侧重点 1: 500m 配速 */}
            <div className="col-span-2 rounded-3xl border border-white/5 bg-zinc-900/50 p-5 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col justify-center transition-all hover:bg-zinc-800/50">
              <div className="text-sm tracking-[0.05em] text-zinc-500 font-medium mb-1">500m 配速</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl lg:text-5xl font-bold tracking-tight text-white">{paceValue}</span>
                <span className="font-mono text-sm lg:text-base text-zinc-500">{paceUnit}</span>
              </div>
            </div>

            {/* 右侧重点 2: 今日距离 */}
            <div className="col-span-2 rounded-3xl border border-white/5 bg-zinc-900/50 p-5 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col justify-center transition-all hover:bg-zinc-800/50">
              <div className="text-sm tracking-[0.05em] text-zinc-500 font-medium mb-2">今日距离</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  <AnimatedNumber value={ringData.distance.value / 1000} decimals={2} />
                </span>
                <span className="font-mono text-sm lg:text-base text-zinc-500">km</span>
              </div>
              <div className="mt-4">
                <AnimatedProgressBar progress={ringData.distance.value / ringData.distance.goal} colorClass="bg-oar-cyan" />
              </div>
            </div>

            {/* 右侧次要 1: 桨频 */}
            <div className="col-span-1 rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 lg:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all hover:bg-zinc-800/50">
              <div className="text-xs lg:text-sm tracking-[0.05em] text-zinc-500 font-medium mb-2">桨频</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-white">
                  <AnimatedNumber value={parseFloat(averageRpm) || 0} decimals={1} />
                </span>
                <span className="font-mono text-xs text-zinc-500">spm</span>
              </div>
            </div>

            {/* 右侧次要 2: 桨次 */}
            <div className="col-span-1 rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 lg:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all hover:bg-zinc-800/50">
              <div className="text-xs lg:text-sm tracking-[0.05em] text-zinc-500 font-medium mb-2">桨次</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-white">
                  <AnimatedNumber value={parseInt(totalTurns) || 0} decimals={0} />
                </span>
                <span className="font-mono text-xs text-zinc-500">次</span>
              </div>
            </div>

            {/* 右侧次要 3: 今日时长 */}
            <div className="col-span-1 rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 lg:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all hover:bg-zinc-800/50">
              <div className="text-xs lg:text-sm tracking-[0.05em] text-zinc-500 font-medium mb-2">今日时长</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg lg:text-2xl font-bold tracking-tight text-white">
                  <AnimatedNumber value={ringData.duration.value} isTime={true} />
                </span>
              </div>
              <div className="mt-3">
                <AnimatedProgressBar progress={ringData.duration.value / ringData.duration.goal} colorClass="bg-oar-lime" />
              </div>
            </div>

            {/* 右侧次要 4: 今日消耗 */}
            <div className="col-span-1 rounded-[1.6rem] border border-white/5 bg-zinc-900/50 p-4 lg:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all hover:bg-zinc-800/50">
              <div className="text-xs lg:text-sm tracking-[0.05em] text-zinc-500 font-medium mb-2">今日消耗</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-white">
                  <AnimatedNumber value={ringData.calorie.value} decimals={0} />
                </span>
                <span className="font-mono text-xs text-zinc-500">kcal</span>
              </div>
              <div className="mt-3">
                <AnimatedProgressBar progress={ringData.calorie.value / ringData.calorie.goal} colorClass="bg-oar-rose" />
              </div>
            </div>
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
