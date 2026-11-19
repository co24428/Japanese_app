"use client";
/**
 * "Sentence structure recap" after a lesson or review: every sentence
 * practised, broken into [word] + [particle] blocks, with the particles
 * that came up listed at the top. Sentences answered wrongly are marked.
 */
import type { Phrase } from "@/lib/content/types";
import { chunkSentence, type ParticleInfo } from "@/lib/grammar";
import { ParticleChip } from "../grammar/ParticleChip";
import { SentenceChunks } from "../grammar/SentenceChunks";
import { Meaning } from "../Meaning";
import { usePrefs } from "../PrefsProvider";
import { SpeakButton } from "../SpeakButton";

export interface RecapItem {
  phrase: Phrase;
  /** False if any first-try answer about this sentence was wrong. */
  correct: boolean;
}

export function SentenceRecap({ items }: { items: RecapItem[] }) {
  const { showRomaji } = usePrefs();
  if (items.length === 0) return null;

  // Every structural particle used, in order of first appearance.
  const used = new Map<string, ParticleInfo>();
  for (const { phrase } of items) {
    for (const chunk of chunkSentence(phrase.jp)) {
      for (const p of chunk.particles) if (p.kind === "case" && !used.has(p.particle)) used.set(p.particle, p);
    }
  }

  return (
    <section className="text-left" aria-labelledby="recap-heading">
      <h2 id="recap-heading" className="text-lg font-extrabold">
        Sentence structure recap
      </h2>
      <p className="text-sm text-muted">How each sentence is built: words, then the particle that links them.</p>

      {used.size > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Particles in this session">
          {[...used.values()].map((info) => (
            <span key={info.particle} className="flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-3 pl-1 text-xs font-semibold">
              <ParticleChip info={info} showKorean={false} />
              {info.role}
            </span>
          ))}
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {items.map(({ phrase, correct }) => (
          <li
            key={phrase.id}
            className={`flex items-start gap-3 rounded-2xl border-2 p-3 ${correct ? "border-line bg-surface" : "border-bad/40 bg-bad-soft/50"}`}
          >
            <SpeakButton markup={phrase.jp} size="sm" className="mt-1" />
            <div className="min-w-0 flex-1 space-y-1">
              <SentenceChunks markup={phrase.jp} />
              {showRomaji && <p className="text-sm text-muted">{phrase.romaji}</p>}
              <p className="text-sm">
                <Meaning en={phrase.en} ko={phrase.ko} />
              </p>
            </div>
            {!correct && (
              <span className="shrink-0 rounded-full bg-bad px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white uppercase">
                Review
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
