import { describeRingProgress } from '../lib/oarboard/rings';

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
  const progressItems = [
    { id: 'calorie', label: '热量目标', progress: ringData.calorie.value / ringData.calorie.goal, tone: 'bg-oar-rose' },
    { id: 'duration', label: '时长目标', progress: ringData.duration.value / ringData.duration.goal, tone: 'bg-oar-lime' },
    { id: 'distance', label: '距离目标', progress: ringData.distance.value / ringData.distance.goal, tone: 'bg-oar-cyan' },
  ];

  return (
    <section className="py-8 lg:py-10">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.035))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[30px] lg:p-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-14 h-36 w-36 rounded-full bg-rose-400/10 blur-3xl" />

        {hasWorkout ? (
          <>
            <div className="relative grid items-center gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
              <div className="flex justify-center">
                {children}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-oar-cyan shadow-[0_0_8px_rgba(78,216,255,0.5)]" />
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cyan-300/90">今日运动</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-[1.1rem] border border-white/6 bg-white/[0.04] p-3.5">
                    <div className="text-[0.66rem] tracking-[0.08em] text-oar-muted">500m 配速</div>
                    <div className="mt-1.5 text-lg font-bold tracking-tight">{averagePace}</div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/6 bg-white/[0.04] p-3.5">
                    <div className="text-[0.66rem] tracking-[0.08em] text-oar-muted">桨频</div>
                    <div className="mt-1.5 text-lg font-bold tracking-tight">{averageRpm}</div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/6 bg-white/[0.04] p-3.5">
                    <div className="text-[0.66rem] tracking-[0.08em] text-oar-muted">桨次</div>
                    <div className="mt-1.5 text-lg font-bold tracking-tight">{totalTurns}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="rounded-[1rem] border border-white/5 bg-white/[0.02] px-3.5 py-2.5">
                    <div className="text-lg font-bold">{duration}</div>
                    <div className="text-[0.66rem] text-oar-muted">今日时长</div>
                  </div>
                  <div className="rounded-[1rem] border border-white/5 bg-white/[0.02] px-3.5 py-2.5">
                    <div className="text-lg font-bold">{distance}</div>
                    <div className="text-[0.66rem] text-oar-muted">今日距离</div>
                  </div>
                  <div className="rounded-[1rem] border border-white/5 bg-white/[0.02] px-3.5 py-2.5">
                    <div className="text-lg font-bold">{calories}</div>
                    <div className="text-[0.66rem] text-oar-muted">今日消耗</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-3">
              {progressItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                  <div className="flex-1 text-[0.72rem] text-oar-muted">{item.label}</div>
                  <span className="text-[0.72rem] font-medium text-oar-muted">{describeRingProgress(item.progress)}</span>
                </div>
              ))}
            </div>
          </>
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
