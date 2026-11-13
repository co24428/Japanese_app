"use client";
/**
 * "Explain this" panel: asks the AI to break a sentence down (word by word,
 * grammar, comparison with Korean) and shows the result in a sheet that
 * slides up from the bottom on phones and is centred on laptops.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Explanation } from "@/lib/ai-types";
import { callApi } from "@/lib/client/fetch";
import { CloseIcon } from "./icons";
import { Jp } from "./Jp";
import { SpeakButton } from "./SpeakButton";

interface Props {
  /** Japanese markup of the sentence to explain. */
  jp: string;
  /** Its meaning, given to the AI as context. */
  meaning: string;
  onClose: () => void;
}

export function ExplainSheet({ jp, meaning, onClose }: Props) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [error, setError] = useState("");

  // Load the explanation when the sheet opens.
  useEffect(() => {
    let cancelled = false;
    callApi<{ explanation: Explanation }>("/api/ai/explain", "POST", { jp, meaning })
      .then((data) => !cancelled && setExplanation(data.explanation))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [jp, meaning]);

  // Close with the Escape key.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Explanation">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/45" />

      <div className="animate-pop-in relative flex max-h-[88dvh] w-full max-w-xl flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-3xl">
        <header className="flex items-start gap-3 border-b border-line p-5">
          <SpeakButton markup={jp} />
          <div className="min-w-0 flex-1">
            <Jp markup={jp} className="text-xl leading-loose font-bold" />
            <p className="text-sm text-muted">{meaning}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost size-10 min-h-0 shrink-0 px-0">
            <CloseIcon />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          {error && (
            <div role="alert" className="rounded-2xl bg-bad-soft p-4 text-sm text-bad">
              <p className="font-semibold">{error}</p>
              <Link href="/settings" className="mt-1 inline-block underline">
                Open Settings
              </Link>
            </div>
          )}

          {!explanation && !error && (
            <p className="py-8 text-center text-muted" role="status">
              Asking the AI…
            </p>
          )}

          {explanation && (
            <>
              <section>
                <h3 className="eyebrow">Word for word</h3>
                <p className="mt-1">{explanation.literal}</p>
                <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                  {explanation.words.map((w, i) => (
                    <li key={i} className="flex items-baseline gap-3 px-3.5 py-2.5">
                      <Jp markup={w.word} className="shrink-0 text-lg leading-loose font-bold" />
                      <span className="shrink-0 text-sm text-muted">{w.romaji}</span>
                      <span className="min-w-0 flex-1 text-sm">
                        {w.meaning}
                        <span className="block text-xs text-muted">{w.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {explanation.grammar.length > 0 && (
                <section>
                  <h3 className="eyebrow">Grammar</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {explanation.grammar.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </section>
              )}

              {explanation.koreanTip && (
                <section className="rounded-2xl bg-primary-soft p-4">
                  <h3 className="eyebrow text-primary">Compared with Korean</h3>
                  <p className="mt-1">{explanation.koreanTip}</p>
                </section>
              )}

              {explanation.alternatives.length > 0 && (
                <section>
                  <h3 className="eyebrow">Other ways to say it</h3>
                  <ul className="mt-2 space-y-3">
                    {explanation.alternatives.map((alt, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <SpeakButton markup={alt.jp} size="sm" />
                        <div>
                          <Jp markup={alt.jp} className="leading-loose font-bold" />
                          <p className="text-sm text-muted">{alt.romaji}</p>
                          <p className="text-sm">{alt.en}</p>
                          <p className="text-xs text-muted">{alt.nuance}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
