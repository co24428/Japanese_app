/**
 * Home: today's goal, what to do next, the streak, and the activity map.
 * A server component: it reads the database directly and sends finished HTML.
 */
import Link from "next/link";
import { Heatmap } from "@/components/Heatmap";
import { ArrowRightIcon, FlameIcon } from "@/components/icons";
import { buildHeatmap, computeStreaks } from "@/lib/streak";
import { getUnits } from "@/server/lessons";
import { getLessonProgress, getRecentActivity, getReviewSummary } from "@/server/progress";
import { getAiStatus, getPrefs } from "@/server/settings";
import { getToday } from "@/server/today";

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-3 text-center">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

export default async function HomePage() {
  const today = await getToday();
  const [activity, prefs, progress, units, review, ai] = await Promise.all([
    getRecentActivity(today),
    getPrefs(),
    getLessonProgress(),
    getUnits(),
    getReviewSummary(today),
    getAiStatus(),
  ]);

  const streaks = computeStreaks(activity, today);
  const heatmap = buildHeatmap(activity, today, prefs.dailyGoal);
  const todayXp = activity.find((a) => a.day === today)?.xp ?? 0;
  const goalPercent = Math.min(100, Math.round((todayXp / prefs.dailyGoal) * 100));
  const goalReached = todayXp >= prefs.dailyGoal;

  // The next thing to learn: the first lesson that has never been completed.
  const allLessons = units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
  const next = allLessons.find(({ lesson }) => !progress.has(lesson.id));
  const lessonsDone = allLessons.filter(({ lesson }) => progress.has(lesson.id)).length;

  const activeDays = activity.filter((a) => a.xp > 0).length;
  const totalXp = activity.reduce((sum, a) => sum + a.xp, 0);

  const dateLabel = new Date(`${today}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{dateLabel}</p>
          <h1 lang="ja" className="mt-0.5 text-3xl font-black">
            こんにちは！
          </h1>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-lg font-extrabold tabular-nums ${
            streaks.doneToday ? "bg-warn-soft text-warn" : "bg-surface-2 text-muted"
          }`}
          title={streaks.doneToday ? "Streak kept today" : "Practise today to keep your streak"}
        >
          <FlameIcon className="size-5" />
          {streaks.current}
          <span className="sr-only"> day streak</span>
        </div>
      </header>

      {/* Today's goal and the main call to action. */}
      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold">{goalReached ? "Daily goal reached 🎉" : "Today's goal"}</h2>
          <p className="text-sm font-semibold text-muted tabular-nums">
            {todayXp} / {prefs.dailyGoal} XP
          </p>
        </div>
        <div
          className="mt-3 h-3.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={goalPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily goal progress"
        >
          <div className="h-full rounded-full bg-good transition-[width]" style={{ width: `${goalPercent}%` }} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {next ? (
            <Link href={`/lesson/${next.lesson.id}`} className="btn-primary h-auto flex-col items-start gap-0 py-3 text-left">
              <span className="text-xs font-semibold opacity-80">
                {lessonsDone === 0 ? "Start here" : "Next lesson"} · {next.unit.emoji} {next.unit.title}
              </span>
              <span className="flex w-full items-center justify-between gap-2">
                {next.lesson.title}
                <ArrowRightIcon className="size-5 shrink-0" />
              </span>
            </Link>
          ) : (
            <Link href="/learn/new" className="btn-primary h-auto flex-col items-start gap-0 py-3 text-left">
              <span className="text-xs font-semibold opacity-80">All lessons done</span>
              <span>Create a new lesson with AI</span>
            </Link>
          )}

          <Link
            href={review.due > 0 ? "/review/session" : "/review"}
            className="btn-secondary h-auto flex-col items-start gap-0 py-3 text-left"
          >
            <span className="text-xs font-semibold text-muted">Review</span>
            <span>{review.due > 0 ? `${review.due} phrase${review.due === 1 ? "" : "s"} due` : "Nothing due right now"}</span>
          </Link>
        </div>
      </section>

      {/* Activity map. */}
      <section className="card">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-bold">Your year in Japanese</h2>
          <p className="text-sm text-muted">
            {activeDays} active day{activeDays === 1 ? "" : "s"}
          </p>
        </div>
        <Heatmap data={heatmap} />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={streaks.current} label="Current streak" />
        <Stat value={streaks.longest} label="Longest streak" />
        <Stat value={`${lessonsDone}/${allLessons.length}`} label="Lessons done" />
        <Stat value={review.learned} label="Phrases mastered" />
      </section>
      <p className="text-center text-xs text-muted">
        {totalXp} XP earned in the past year · {review.practised} phrases practised
      </p>

      {!ai.ready && (
        <section className="card flex items-center justify-between gap-4 border-dashed">
          <div>
            <h2 className="font-bold">Turn on the AI features</h2>
            <p className="mt-0.5 text-sm text-muted">
              Add your Claude or Gemini key to get role-play conversations, custom lessons and explanations.
            </p>
          </div>
          <Link href="/settings" className="btn-secondary btn-sm shrink-0">
            Set up
          </Link>
        </section>
      )}
    </div>
  );
}
