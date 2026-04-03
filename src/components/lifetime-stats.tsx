'use client';

import { motion } from 'framer-motion';

export interface LifetimeStatsProps {
  totalDuration: string;
  totalCalories: string;
  totalDistance: string;
  sportCount: number;
}

const transition = {
  duration: 0.75,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function LifetimeStats({ totalDuration, totalCalories, totalDistance, sportCount }: LifetimeStatsProps) {
  const stats = [
    { id: 'duration', label: '总运动时长', value: totalDuration, accent: 'text-oar-lime' },
    { id: 'calorie', label: '总消耗', value: totalCalories, accent: 'text-oar-rose' },
    { id: 'distance', label: '总运动距离', value: totalDistance, accent: 'text-oar-cyan' },
    { id: 'sessions', label: '总训练次数', value: `${sportCount} 次`, accent: 'text-white' },
  ];

  return (
    <motion.section
      className="mt-8 lg:mt-10"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={transition}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-oar-muted">累计运动数据</div>
        <div className="h-px flex-1 bg-white/8" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...transition, delay: index * 0.06 }}
          >
            <div className="text-[0.68rem] uppercase tracking-[0.14em] text-oar-muted">{stat.label}</div>
            <div className={`mt-2.5 text-2xl font-bold tracking-[-0.04em] ${stat.accent}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
