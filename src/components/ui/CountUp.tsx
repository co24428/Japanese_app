"use client";
/**
 * A number that counts up from 0 when it first appears (XP, streaks ...).
 * Screen readers get the final value straight away through aria-label.
 */
import { useEffect, useState } from "react";

interface Props {
  value: number;
  /** Milliseconds the count takes. */
  duration?: number;
  prefix?: string;
  className?: string;
}

export function CountUp({ value, duration = 800, prefix = "", className }: Props) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Skip the animation for people who asked for less motion.
    if (value <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // fast at first, then settles
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className={className} aria-label={`${prefix}${value}`}>
      <span aria-hidden="true">
        {prefix}
        {shown}
      </span>
    </span>
  );
}
