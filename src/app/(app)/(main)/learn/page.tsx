/** /learn: every situation and its lessons, with your progress. */
import type { Metadata } from "next";
import Link from "next/link";
import { DeleteLessonButton } from "@/components/DeleteLessonButton";
import { ArrowRightIcon, CheckIcon, SparkleIcon } from "@/components/icons";
import { FORWARD, PageTransition } from "@/components/PageTransition";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { unitStyle } from "@/components/unitTheme";
import { getUnits } from "@/server/lessons";
import { getLessonProgress } from "@/server/progress";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage() {
  const [units, progress] = await Promise.all([getUnits(), getLessonProgress()]);

  // The first lesson not yet completed gets a "Next" badge.
  const nextId = units.flatMap((u) => u.lessons).find((l) => !progress.has(l.id))?.id;

  return (
    <PageTransition>
      <div className="stagger space-y-6">
        <header style={{ "--i": 0 } as React.CSSProperties}>
          <h1 className="text-2xl font-extrabold">Learn</h1>
          <p className="mt-1 text-muted">Short conversations for real situations. Each lesson takes about five minutes.</p>
        </header>

        {/* Shortcuts: kana practice and AI lesson creation. */}
        <div className="grid gap-3 sm:grid-cols-2" style={{ "--i": 1 } as React.CSSProperties}>
          <Link href="/kana" transitionTypes={FORWARD} className="card-link group flex items-center gap-4">
            <span
              lang="ja"
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-2xl font-black text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            >
              あ
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Kana basics</span>
              <span className="block text-sm text-muted">Learn to read hiragana and katakana</span>
            </span>
            <ArrowRightIcon className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
          <Link href="/learn/new" transitionTypes={FORWARD} className="card-link group flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-warn-soft text-warn transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <SparkleIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Create a lesson</span>
              <span className="block text-sm text-muted">Describe any situation and the AI writes it</span>
            </span>
            <ArrowRightIcon className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </div>

        {units.map((unit, unitIndex) => {
          const done = unit.lessons.filter((l) => progress.has(l.id)).length;
          const complete = done === unit.lessons.length;
          return (
            <section
              key={unit.id}
              className="card overflow-hidden p-0"
              style={{ ...unitStyle(unit.id), "--i": Math.min(unitIndex + 2, 8) } as React.CSSProperties}
              aria-labelledby={`unit-${unit.id}`}
            >
              {/* Unit header in the unit's own colour. */}
              <div className="tint flex items-center gap-4 p-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-3xl shadow-sm" aria-hidden="true">
                  {unit.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="ink-accent text-xs font-bold tracking-wide uppercase">
                    {unit.custom ? "Your lessons" : `Situation ${unitIndex + (units[0]?.custom ? 0 : 1)}`}
                  </p>
                  <h2 id={`unit-${unit.id}`} className="flex flex-wrap items-baseline gap-x-2 text-lg font-extrabold">
                    {unit.title}
                    <span lang="ja" className="text-sm font-medium text-muted">
                      {unit.titleJp}
                    </span>
                  </h2>
                  <p className="text-sm text-muted">{unit.description}</p>
                </div>
                <ProgressRing
                  value={done / unit.lessons.length}
                  label={`${done} of ${unit.lessons.length} lessons done`}
                  color={complete ? "var(--good)" : "light-dark(oklch(0.62 0.16 var(--hue)), oklch(0.72 0.14 var(--hue)))"}
                >
                  {complete ? (
                    <CheckIcon className="size-5 text-good" />
                  ) : (
                    <span className="text-xs font-bold tabular-nums">
                      {done}/{unit.lessons.length}
                    </span>
                  )}
                </ProgressRing>
              </div>

              <ul>
                {unit.lessons.map((lesson, i) => {
                  const p = progress.get(lesson.id);
                  const isNext = lesson.id === nextId;
                  return (
                    <li key={lesson.id} className="flex items-center border-t border-line">
                      <Link
                        href={`/lesson/${lesson.id}`}
                        transitionTypes={FORWARD}
                        className="group flex min-w-0 flex-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/70 active:bg-surface-2"
                      >
                        {/* Step circle: number, or a tick once completed. */}
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-b-4 font-extrabold transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
                            p
                              ? "border-[color-mix(in_srgb,var(--good)_75%,black)] bg-good text-white"
                              : isNext
                                ? "tint-strong border-accent text-white"
                                : "border-line bg-surface text-muted"
                          }`}
                        >
                          {p ? <CheckIcon className="size-5" /> : i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 font-bold">
                            <span className="truncate">{lesson.title}</span>
                            {isNext && (
                              <span className="tint ink-accent shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">
                                Next
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-sm text-muted">{lesson.goal}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                          {p ? <span className="text-muted">Best {p.bestAccuracy}%</span> : "Start"}
                          <ArrowRightIcon className="size-4 -translate-x-1 opacity-0 transition-[translate,opacity] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                        </span>
                      </Link>
                      {unit.custom && <DeleteLessonButton id={lesson.id} title={lesson.title} />}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </PageTransition>
  );
}
