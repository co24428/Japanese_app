/**
 * A sentence pattern such as  [Place] で [Object] を [Verb]:
 * slots are dashed boxes to fill in, particles are coloured chips.
 */
import type { FormulaPart } from "@/lib/content/particles";
import { particleOf } from "@/lib/grammar";
import { ParticleChip } from "./ParticleChip";

export function Formula({ parts, highlight }: { parts: FormulaPart[]; highlight?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Sentence pattern">
      {parts.map((part, i) => {
        if ("slot" in part) {
          return (
            <span key={i} className="rounded-lg border-2 border-dashed border-line px-2 py-1 text-sm font-semibold text-muted">
              {part.slot}
            </span>
          );
        }
        const info = particleOf(part.text);
        return info ? (
          <ParticleChip key={i} info={info} size="md" showKorean={false} highlight={highlight === part.text} />
        ) : (
          <span key={i} lang="ja" className="px-1 text-lg font-bold">
            {part.text}
          </span>
        );
      })}
    </div>
  );
}
