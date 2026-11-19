"use client";
/**
 * The "Key particles & words" card shown before a lesson's exercises.
 * Skimmable on purpose: one or two particle patterns with an example from
 * the lesson, and the key words with audio. Enter or the button starts.
 */
import Link from "next/link";
import { useEffect } from "react";
import type { KeyWord } from "@/lib/content/types";
import { particleGuide } from "@/lib/content/particles";
import type { LessonParticle } from "@/lib/grammar";
import { Formula } from "../grammar/Formula";
import { ParticleChip } from "../grammar/ParticleChip";
import { SentenceChunks } from "../grammar/SentenceChunks";
import { BACK } from "../PageTransition";
import { ArrowRightIcon, CloseIcon } from "../icons";
import { Jp } from "../Jp";
import { Meaning } from "../Meaning";
import { usePrefs } from "../PrefsProvider";
import { SpeakButton } from "../SpeakButton";

/** What the server prepares for the preview (see src/app/(app)/(focus)/lesson/[id]/page.tsx). */
export interface LessonPreview {
  goal: string;
  particles: LessonParticle[];
  words: KeyWord[];
}

interface Props {
  title: string;
  preview: LessonPreview;
  exitHref: string;
  onStart: () => void;
}

export function LessonIntro({ title, preview, exitHref, onStart }: Props) {
  const { showRomaji } = usePrefs();

  // Enter starts the lesson, like "Got it" / "Continue" during exercises.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !document.querySelector('[role="dialog"]')) {
        event.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link
          href={exitHref}
          transitionTypes={BACK}
          aria-label="Close"
          className="btn-ghost size-10 min-h-0 shrink-0 px-0"
        >
          <CloseIcon />
        </Link>
        <p className="eyebrow">Before you start</p>
      </header>

      <main className="stagger flex-1 space-y-5 px-4 pt-2 pb-6 sm:px-6">
        <div style={{ "--i": 0 } as React.CSSProperties}>
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-muted">{preview.goal}</p>
        </div>

        {preview.particles.length > 0 && (
          <section style={{ "--i": 1 } as React.CSSProperties}>
            <h2 className="eyebrow mb-2">Key particles</h2>
            <ul className="space-y-3">
              {preview.particles.map(({ info, example }, i) => {
                const guide = particleGuide(info.particle);
                // If the lesson has only one sentence showing both patterns, show it once.
                const repeated = i > 0 && preview.particles[i - 1]!.example.jp === example.jp;
                return (
                  <li
                    key={info.particle}
                    className="card space-y-3 p-4"
                    style={{ "--hue": info.hue } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3">
                      <ParticleChip info={info} size="lg" showKorean={false} />
                      <div>
                        <p className="font-bold">
                          <span lang="ja">{info.particle}</span> ({info.romaji}) · {info.role}
                        </p>
                        <p lang="ko" className="ink-accent text-sm font-bold">
                          ≈ {info.ko}
                        </p>
                      </div>
                    </div>
                    {guide && <Formula parts={guide.formula} highlight={info.particle} />}
                    {/* The pattern in a sentence from this lesson. */}
                    {repeated ? (
                      <p className="text-sm text-muted">Used in the same sentence as above.</p>
                    ) : (
                      <div className="flex items-start gap-2.5 rounded-2xl bg-surface-2 p-3">
                        <SpeakButton markup={example.jp} size="sm" className="mt-1" />
                        <div className="min-w-0 space-y-1">
                          <SentenceChunks markup={example.jp} highlight={info.particle} />
                          <p className="text-sm text-muted">
                            <Meaning en={example.en} ko={example.ko} />
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Link
              href="/words?tab=particles"
              className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Full particle guide →
            </Link>
          </section>
        )}

        {preview.words.length > 0 && (
          <section style={{ "--i": 2 } as React.CSSProperties}>
            <h2 className="eyebrow mb-2">Key words</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {preview.words.map((word) => (
                <li
                  key={word.jp}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-[border-color,translate] duration-150 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <SpeakButton markup={word.jp} size="sm" />
                  <div className="min-w-0">
                    <Jp markup={word.jp} className="block text-lg leading-loose font-bold" />
                    <p className="truncate text-sm text-muted">
                      {showRomaji && word.romaji}
                      {showRomaji && word.en && " · "}
                      {word.en && <Meaning en={word.en} ko={word.ko} />}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="sticky bottom-0 border-t-2 border-line bg-bg px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <button type="button" className="btn-primary w-full" onClick={onStart} autoFocus>
          Start lesson
          <ArrowRightIcon className="size-5" />
        </button>
      </footer>
    </div>
  );
}
