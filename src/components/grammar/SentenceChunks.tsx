"use client";
/**
 * A sentence drawn as [word] + [particle] blocks, so you can see how it is
 * built:   [駅] の  [前] で  [待ちます]
 * Word blocks show furigana (following the preference); particle chips show
 * their Korean equivalent.
 */
import { chunkSentence } from "@/lib/grammar";
import { Jp } from "../Jp";
import { ParticleChip } from "./ParticleChip";

interface Props {
  markup: string;
  /** A particle to emphasise; the others are drawn normally. */
  highlight?: string;
  className?: string;
}

export function SentenceChunks({ markup, highlight, className = "" }: Props) {
  const chunks = chunkSentence(markup);
  return (
    <div className={`flex flex-wrap items-end gap-x-1.5 gap-y-2 ${className}`}>
      {chunks.map((chunk, i) => (
        <span key={i} className="inline-flex max-w-full flex-wrap items-end gap-1">
          {/* One block per word, so long phrases wrap between words, not inside them. */}
          {chunk.words.map((word, j) => (
            <span key={j} className="rounded-lg border border-line bg-surface px-2 py-0.5 text-lg leading-loose font-bold whitespace-nowrap">
              <Jp markup={word} />
            </span>
          ))}
          {chunk.particles.map((info, j) => (
            <ParticleChip key={j} info={info} highlight={highlight === info.particle} />
          ))}
          {chunk.punctuation && (
            <span lang="ja" className="pb-1 text-lg text-muted">
              {chunk.punctuation}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
