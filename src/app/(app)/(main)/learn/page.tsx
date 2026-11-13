/** /learn: every situation and its lessons, with your progress. */
import type { Metadata } from "next";
import Link from "next/link";
import { DeleteLessonButton } from "@/components/DeleteLessonButton";
import { CheckIcon, SparkleIcon } from "@/components/icons";
import { getUnits } from "@/server/lessons";
import { getLessonProgress } from "@/server/progress";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage() {
  const [units, progress] = await Promise.all([getUnits(), getLessonProgress()]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">Learn</h1>
        <p className="mt-1 text-muted">Short conversations for real situations. Each lesson takes about five minutes.</p>
      </header>

      {/* Shortcuts: kana practice and AI lesson creation. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/kana" className="card flex items-center gap-4 transition-colors hover:border-primary">
          <span lang="ja" className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-2xl font-black text-primary">
            あ
          </span>
          <span>
            <span className="block font-bold">Kana basics</span>
            <span className="block text-sm text-muted">Learn to read hiragana and katakana</span>
          </span>
        </Link>
        <Link href="/learn/new" className="card flex items-center gap-4 transition-colors hover:border-primary">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-warn-soft text-warn">
            <SparkleIcon />
          </span>
          <span>
            <span className="block font-bold">Create a lesson</span>
            <span className="block text-sm text-muted">Describe any situation and the AI writes it</span>
          </span>
        </Link>
      </div>

      {units.map((unit) => {
        const done = unit.lessons.filter((l) => progress.has(l.id)).length;
        return (
          <section key={unit.id} className="card p-0" aria-labelledby={`unit-${unit.id}`}>
            <div className="flex items-center gap-4 p-5">
              <span className="text-4xl" aria-hidden="true">
                {unit.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={`unit-${unit.id}`} className="flex flex-wrap items-baseline gap-x-2 text-lg font-extrabold">
                  {unit.title}
                  <span lang="ja" className="text-sm font-medium text-muted">
                    {unit.titleJp}
                  </span>
                </h2>
                <p className="text-sm text-muted">{unit.description}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-muted tabular-nums">
                {done}/{unit.lessons.length}
              </span>
            </div>

            <ul className="border-t border-line">
              {unit.lessons.map((lesson) => {
                const p = progress.get(lesson.id);
                return (
                  <li key={lesson.id} className="flex items-center gap-2 border-b border-line last:border-b-0">
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
                    >
                      {/* Status circle: green tick when completed. */}
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${
                          p ? "border-good bg-good text-white" : "border-line text-transparent"
                        }`}
                      >
                        <CheckIcon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{lesson.title}</span>
                        <span className="block truncate text-sm text-muted">{lesson.goal}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-primary">
                        {p ? `Best ${p.bestAccuracy}%` : "Start"}
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
  );
}
