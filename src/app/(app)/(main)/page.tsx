/**
 * Home: today's goal, what to do next, the streak, and the activity map.
 * A server component: it reads the database directly and sends finished HTML.
 */
import Link from "next/link";
import { Heatmap } from "@/components/Heatmap";
import { ArrowRightIcon, FlameIcon, RepeatIcon, SparkleIcon } from "@/components/icons";
import { FORWARD, PageTransition } from "@/components/PageTransition";
import { CountUp } from "@/components/ui/CountUp";
import { unitStyle } from "@/components/unitTheme";
import { buildHeatmap, computeStreaks } from "@/lib/streak";
import { getUnits } from "@/server/lessons";
import { getLessonProgress, getRecentActivity, getReviewSummary } from "@/server/progress";
import { getAiStatus, getPrefs } from "@/server/settings";
import { getTimeZone, getToday } from "@/server/today";

/** A Japanese greeting that fits the time of day, with its reading and meaning. */
function greeting(timeZone: string): { jp: string; romaji: string; en: string } {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(new Date()));
  if (hour >= 4 && hour < 11) return { jp: "おはようございます", romaji: "Ohayou gozaimasu", en: "Good morning" };
  if (hour >= 11 && hour < 18) return { jp: "こんにちは", romaji: "Konnichiwa", en: "Good afternoon" };
  return { jp: "こんばんは", romaji: "Konbanwa", en: "Good evening" };
}

function Stat({ value, label, index }: { value: number; label: string; index: number }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-3 text-center" style={{ "--i": index } as React.CSSProperties}>
      <p className="text-2xl font-extrabold tabular-nums">
        <CountUp value={value} />
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

export default async function HomePage() {
  const [today, timeZone] = await Promise.all([getToday(), getTimeZone()]);
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
  const hello = greeting(timeZone);

  // The next thing to learn: the first lesson that has never been completed.
  const allLessons = units.flatMap((unit) => unit.lessons.map((lesson, i) => ({ unit, lesson, number: i + 1 })));
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
    <PageTransition>
      <div className="stagger space-y-5">
        <header className="flex items-end justify-between gap-4" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">{dateLabel}</p>
            <h1 lang="ja" className="mt-0.5 truncate text-3xl font-black" title={`${hello.romaji}: ${hello.en}`}>
              {hello.jp}
            </h1>
            <p className="text-sm text-muted">
              {hello.romaji} · {hello.en}
            </p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-lg font-extrabold tabular-nums transition-transform hover:scale-105 ${
              streaks.doneToday ? "bg-warn-soft text-warn" : "bg-surface-2 text-muted"
            }`}
            title={streaks.doneToday ? "Streak kept today" : "Practise today to keep your streak"}
          >
            <FlameIcon className={`size-5 ${streaks.doneToday ? "animate-flicker" : ""}`} />
            {streaks.current}
            <span className="sr-only"> day streak</span>
          </div>
        </header>

        {/* Today's goal and the main call to action. */}
        <section className="card" style={{ "--i": 1 } as React.CSSProperties}>
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
            <div className="h-full rounded-full" style={{ width: `${goalPercent}%` }}>
              <div className={`animate-grow h-full rounded-full bg-good ${goalReached ? "shine" : ""}`} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {next ? (
              <Link
                href={`/lesson/${next.lesson.id}`}
                transitionTypes={FORWARD}
                style={unitStyle(next.unit.id)}
                className="group tint flex items-center gap-4 rounded-3xl border-2 border-b-4 border-accent p-4 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-14px_rgb(0_0_0/0.4)] active:translate-y-0.5 active:border-b-2"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  {next.unit.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="ink-accent block text-xs font-bold tracking-wide uppercase">
                    {lessonsDone === 0 ? "Start here" : "Up next"} · {next.unit.title} {next.number}
                  </span>
                  <span className="block truncate text-lg font-extrabold">{next.lesson.title}</span>
                  <span className="block truncate text-sm text-muted">{next.lesson.goal}</span>
                </span>
                <span className="tint-strong flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRightIcon className="size-5" />
                </span>
              </Link>
            ) : (
              <Link href="/learn/new" transitionTypes={FORWARD} className="card-link flex items-center gap-4 border-2">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-warn-soft text-warn">
                  <SparkleIcon />
                </span>
                <span>
                  <span className="block text-xs font-bold text-muted uppercase">All lessons done</span>
                  <span className="block text-lg font-extrabold">Create a new lesson</span>
                </span>
              </Link>
            )}

            <Link
              href={review.due > 0 ? "/review/session" : "/review"}
              transitionTypes={FORWARD}
              className="card-link group flex items-center gap-4 border-2 p-4"
            >
              <span
                className={`relative flex size-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-180 ${
                  review.due > 0 ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted"
                }`}
              >
                <RepeatIcon />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-muted uppercase">Review</span>
                <span className="block truncate text-lg font-extrabold">
                  {review.due > 0 ? `${review.due} phrase${review.due === 1 ? "" : "s"} due` : "All caught up"}
                </span>
              </span>
              {review.due > 0 && (
                <span className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full bg-bad text-xs font-bold text-white">
                  {review.due > 99 ? "99+" : review.due}
                </span>
              )}
            </Link>
          </div>
        </section>

        {/* Activity map. */}
        <section className="card" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-bold">Your year in Japanese</h2>
            <p className="text-sm text-muted">
              {activeDays} active day{activeDays === 1 ? "" : "s"}
            </p>
          </div>
          <Heatmap data={heatmap} />
        </section>

        <section className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ "--i": 3 } as React.CSSProperties}>
          <Stat value={streaks.current} label="Current streak" index={0} />
          <Stat value={streaks.longest} label="Longest streak" index={1} />
          <Stat value={lessonsDone} label={`of ${allLessons.length} lessons done`} index={2} />
          <Stat value={review.learned} label="Phrases mastered" index={3} />
        </section>
        <p className="text-center text-xs text-muted" style={{ "--i": 4 } as React.CSSProperties}>
          {totalXp} XP earned in the past year · {review.practised} phrases practised
        </p>

        {!ai.ready && (
          <section className="card flex items-center justify-between gap-4 border-dashed" style={{ "--i": 5 } as React.CSSProperties}>
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
    </PageTransition>
  );
}
