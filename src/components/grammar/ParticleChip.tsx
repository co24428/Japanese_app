/**
 * A particle drawn as a small coloured chip, with its Korean equivalent
 * underneath: e.g. [を / 을/를]. Each particle has its own colour
 * (PARTICLES in src/lib/grammar.ts) so patterns are easy to spot.
 */
import type { ParticleInfo } from "@/lib/grammar";

interface Props {
  info: ParticleInfo;
  /** Show the Korean equivalent under the particle. */
  showKorean?: boolean;
  size?: "sm" | "md" | "lg";
  /** Draw attention to this chip (e.g. the particle a lesson is about). */
  highlight?: boolean;
}

const SIZES = {
  sm: "px-1.5 py-0.5 text-base",
  md: "px-2 py-1 text-lg",
  lg: "px-3 py-1.5 text-3xl",
};

export function ParticleChip({ info, showKorean = true, size = "sm", highlight }: Props) {
  // Sentence endings (か, ね, よ) are drawn in a neutral grey: they do not build structure.
  const isEnding = info.kind === "ending";
  return (
    <span
      style={{ "--hue": info.hue } as React.CSSProperties}
      title={`${info.particle} (${info.romaji}): ${info.role} · ${info.ko}`}
      className={`inline-flex flex-col items-center rounded-lg border-2 leading-tight font-bold transition-transform ${SIZES[size]} ${
        isEnding ? "border-line bg-surface-2 text-muted" : "tint ink-accent border-accent"
      } ${highlight ? "scale-110 shadow-[0_4px_12px_-4px_rgb(0_0_0/0.35)]" : ""}`}
    >
      <span lang="ja">{info.particle}</span>
      {showKorean && (
        <span lang="ko" className={`font-semibold opacity-80 ${size === "lg" ? "text-sm" : "text-[10px]"}`}>
          {info.ko}
        </span>
      )}
    </span>
  );
}
