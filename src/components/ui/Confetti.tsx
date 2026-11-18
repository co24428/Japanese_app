"use client";
/**
 * A short burst of confetti over the whole screen, drawn on a <canvas>.
 * Used on the lesson-complete screen. No library needed; it removes itself
 * after a few seconds and is skipped entirely with "reduce motion".
 */
import { useEffect, useRef } from "react";

const COLORS = ["#3f51d6", "#238a53", "#f2b23e", "#cf3f36", "#8794ff", "#4cc98a"];
const PIECES = 110;
const DURATION_MS = 3200;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);

    // Two bursts, from the lower left and lower right corners, aimed upwards.
    const pieces: Piece[] = Array.from({ length: PIECES }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const angle = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.7;
      const speed = 9 + Math.random() * 8;
      return {
        x: fromLeft ? width * 0.1 : width * 0.9,
        y: height * 0.75,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length]!,
      };
    });

    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      // Fade everything out over the last second.
      ctx.globalAlpha = Math.max(0, Math.min(1, (DURATION_MS - elapsed) / 1000));
      for (const p of pieces) {
        p.vy += 0.32; // gravity
        p.vx *= 0.99; // air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (elapsed < DURATION_MS) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 size-full" />;
}
