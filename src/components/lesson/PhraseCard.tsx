"use client";
/**
 * One phrase shown in full: audio button, Japanese with furigana, romaji,
 * meaning, an optional usage note, and an "Explain" button (AI).
 * Used when a new phrase is introduced and in the answer feedback.
 */
import { useState } from "react";
import type { Phrase } from "@/lib/content/types";
import { ExplainSheet } from "../ExplainSheet";
import { HelpIcon } from "../icons";
import { Jp } from "../Jp";
import { Meaning } from "../Meaning";
import { usePrefs } from "../PrefsProvider";
import { SpeakButton } from "../SpeakButton";

interface Props {
  phrase: Phrase;
  /** Small label above the phrase, such as "Ask" or "Answer". */
  label?: string;
  /** Smaller text, used inside the feedback bar. */
  compact?: boolean;
}

export function PhraseCard({ phrase, label, compact }: Props) {
  const { showRomaji } = usePrefs();
  const [explaining, setExplaining] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <SpeakButton markup={phrase.jp} size={compact ? "sm" : "md"} className="mt-1" />
      <div className="min-w-0 flex-1">
        {label && <p className="eyebrow mb-0.5">{label}</p>}
        <Jp markup={phrase.jp} className={`block leading-loose font-bold ${compact ? "text-lg" : "text-2xl"}`} />
        {showRomaji && <p className={`text-muted ${compact ? "text-sm" : ""}`}>{phrase.romaji}</p>}
        <p className={compact ? "text-sm" : "mt-1"}>
          <Meaning en={phrase.en} ko={phrase.ko} />
        </p>
        {phrase.note && !compact && (
          <p className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-sm">
            <span aria-hidden="true">💡 </span>
            {phrase.note}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setExplaining(true)}
        className="btn-ghost min-h-9 shrink-0 gap-1 px-2 text-sm"
        aria-label="Explain this phrase"
      >
        <HelpIcon className="size-4.5" />
        <span className="hidden sm:inline">Explain</span>
      </button>

      {explaining && <ExplainSheet jp={phrase.jp} meaning={phrase.en} onClose={() => setExplaining(false)} />}
    </div>
  );
}
