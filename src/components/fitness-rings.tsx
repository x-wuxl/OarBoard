'use client';

import { motion } from 'framer-motion';

import { buildRingMetrics, getRingStroke } from '../lib/oarboard/rings';

interface FitnessRingsProps {
  calorie: { value: number; goal: number };
  duration: { value: number; goal: number };
  distance: { value: number; goal: number };
  dateLabel: string;
}

const radii = [108, 84, 60] as const;
const strokes = [18, 16, 14] as const;

export function FitnessRings(props: FitnessRingsProps) {
  const metrics = buildRingMetrics({
    calorie: props.calorie,
    duration: props.duration,
    distance: props.distance,
  });

  const avgProgress = Math.round(
    metrics.reduce((sum, m) => sum + m.progress, 0) / metrics.length * 100,
  );
  const shortDate = props.dateLabel.slice(5).replace('-', '.');

  return (
    <div className="ring-poster">
      <svg viewBox="0 0 280 280" className="ring-svg" aria-label="Fitness rings">
        <defs>
          <linearGradient id="ring-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9ab1" />
            <stop offset="100%" stopColor="#ff4f71" />
          </linearGradient>
          <linearGradient id="ring-lime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1ff8a" />
            <stop offset="100%" stopColor="#76f051" />
          </linearGradient>
          <linearGradient id="ring-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b3f3ff" />
            <stop offset="100%" stopColor="#42cfff" />
          </linearGradient>
        </defs>

        {metrics.map((metric, index) => {
          const radius = radii[index];
          const strokeWidth = strokes[index];
          const stroke = getRingStroke(radius, metric.progress);

          return (
            <g key={metric.id} transform="translate(140 140)">
              <circle className="ring-track" r={radius} strokeWidth={strokeWidth} />
              <motion.circle
                className={`ring-progress ${metric.tone}`}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={stroke.dashArray}
                initial={{ strokeDashoffset: stroke.circumference }}
                animate={{ strokeDashoffset: stroke.dashOffset }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 + 0.18 }}
              />
            </g>
          );
        })}
      </svg>

      <motion.div
        className="ring-core"
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <div className="ring-core-label">{shortDate}</div>
        <div className="ring-core-value">{avgProgress}%</div>
        <div className="ring-core-subtitle">今日完成</div>
      </motion.div>
    </div>
  );
}
