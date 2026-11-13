/** /review: how many phrases are due, and a button to start reviewing. */
import type { Metadata } from "next";
import Link from "next/link";
import { BOX_INTERVALS } from "@/lib/srs";
import { getReviewSummary } from "@/server/progress";
import { getToday } from "@/server/today";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage() {
  const summary = await getReviewSummary(await getToday());

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">Review</h1>
        <p className="mt-1 text-muted">
          Phrases come back just before you would forget them. Mistakes return the same day.
        </p>
      </header>

      <section className="card text-center">
        {summary.practised === 0 ? (
          <>
            <p className="text-5xl" aria-hidden="true">🌱</p>
            <h2 className="mt-3 text-lg font-bold">Nothing to review yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-muted">Finish a lesson first. Its phrases will show up here tomorrow.</p>
            <Link href="/learn" className="btn-primary mt-5">
              Go to lessons
            </Link>
          </>
        ) : summary.due > 0 ? (
          <>
            <p className="text-6xl font-black text-primary tabular-nums">{summary.due}</p>
            <h2 className="mt-1 text-lg font-bold">phrase{summary.due === 1 ? "" : "s"} due for review</h2>
            <Link href="/review/session" className="btn-primary mt-5 w-full sm:w-auto sm:px-10">
              Start review
            </Link>
          </>
        ) : (
          <>
            <p className="text-5xl" aria-hidden="true">✅</p>
            <h2 className="mt-3 text-lg font-bold">All caught up</h2>
            <p className="mx-auto mt-1 max-w-sm text-muted">Nothing is due today. You can still practise your weakest phrases.</p>
            <Link href="/review/session?all=1" className="btn-secondary mt-5">
              Practise anyway
            </Link>
          </>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-2 px-4 py-4 text-center">
          <p className="text-2xl font-extrabold tabular-nums">{summary.practised}</p>
          <p className="text-xs font-medium text-muted">Phrases practised</p>
        </div>
        <div className="rounded-2xl bg-surface-2 px-4 py-4 text-center">
          <p className="text-2xl font-extrabold tabular-nums">{summary.learned}</p>
          <p className="text-xs font-medium text-muted">Phrases mastered</p>
        </div>
      </section>

      <section className="card">
        <h2 className="font-bold">How review works</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Each correct answer moves a phrase up a level, and it returns after{" "}
          {BOX_INTERVALS.slice(1).join(", ")} days. A wrong answer sends it back to the start. Higher levels get harder
          exercises: first recognising the meaning, later building and typing the sentence yourself.
        </p>
      </section>
    </div>
  );
}
