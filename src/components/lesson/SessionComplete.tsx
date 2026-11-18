"use client";
/** The celebration screen after a lesson or review session. */
import Link from "next/link";
import { FlameIcon } from "../icons";
import { Confetti } from "../ui/Confetti";
import { CountUp } from "../ui/CountUp";

export interface Outcome {
  xp: number;
  accuracy: number;
  perfect: boolean;
  streak: number;
  todayXp: number;
  dailyGoal: number;
}

interface Props {
  mode: "lesson" | "review";
  outcome: Outcome;
  exitHref: string;
}

export function SessionComplete({ mode, outcome, exitHref }: Props) {
  const goalPercent = Math.min(100, Math.round((outcome.todayXp / outcome.dailyGoal) * 100));
  const goalReached = outcome.todayXp >= outcome.dailyGoal;

  return (
    <div className="stagger mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10 text-center">
      <Confetti />
      <p className="animate-bounce-in text-7xl" aria-hidden="true">
        {outcome.perfect ? "🏆" : "🎉"}
      </p>
      <h1 className="mt-4 text-3xl font-black">
        {outcome.perfect ? "Perfect!" : mode === "lesson" ? "Lesson complete!" : "Review complete!"}
      </h1>
      <p lang="ja" className="mt-1 text-muted">
        おつかれさまでした
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-warn-soft px-2 py-4">
          <p className="text-2xl font-extrabold text-warn tabular-nums">
            <CountUp value={outcome.xp} prefix="+" />
          </p>
          <p className="text-xs font-semibold text-muted">XP</p>
        </div>
        <div className="rounded-2xl bg-good-soft px-2 py-4">
          <p className="text-2xl font-extrabold text-good tabular-nums">
            <CountUp value={outcome.accuracy} />%
          </p>
          <p className="text-xs font-semibold text-muted">First try</p>
        </div>
        <div className="rounded-2xl bg-primary-soft px-2 py-4">
          <p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-primary tabular-nums">
            <FlameIcon className="size-5" />
            {outcome.streak}
          </p>
          <p className="text-xs font-semibold text-muted">Day streak</p>
        </div>
      </div>

      <div className="mt-6 text-left">
        <div className="flex justify-between text-sm font-semibold">
          <span>{goalReached ? "Daily goal reached" : "Daily goal"}</span>
          <span className="text-muted tabular-nums">
            {outcome.todayXp} / {outcome.dailyGoal} XP
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full" style={{ width: `${goalPercent}%` }}>
            <div className={`animate-grow h-full rounded-full bg-good ${goalReached ? "shine" : ""}`} />
          </div>
        </div>
      </div>

      <Link href={exitHref} className="btn-primary mt-10">
        Continue
      </Link>
      <Link href="/" className="btn-ghost mt-2">
        Back to home
      </Link>
    </div>
  );
}
