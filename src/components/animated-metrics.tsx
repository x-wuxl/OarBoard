"use client";

import { animate, motion, useIsomorphicLayoutEffect } from "framer-motion";
import { useRef } from "react";
import { formatDuration } from "../lib/moke/formatters";

export function AnimatedNumber({
  value,
  decimals = 0,
  isTime = false,
}: {
  value: number;
  decimals?: number;
  isTime?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent = isTime ? formatDuration(v) : v.toFixed(decimals);
        }
      },
    });
    return () => controls.stop();
  }, [value, decimals, isTime]);

  // Initial render matches the starting value visually before hydration/animation, or we can just render 0 or the target value.
  // Rendering the target value ensures SSR matches the final text?
  // Wait, if SSR renders target value, then client hydration will suddenly snap it to 0 and animate up. 
  // This is acceptable and often desired so SEO sees the correct number.
  return <span ref={ref}>{isTime ? formatDuration(value) : value.toFixed(decimals)}</span>;
}

export function AnimatedProgressBar({
  progress,
  colorClass,
}: {
  progress: number;
  colorClass: string;
}) {
  const w = Math.min(Math.max(progress * 100, 0), 100);
  
  return (
    <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
      <motion.div
        className={`h-full rounded-full ${colorClass} shadow-[0_0_8px_currentColor]`}
        initial={{ width: 0 }}
        animate={{ width: `${w}%` }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}
