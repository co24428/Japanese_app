/**
 * /review/session: a review session built from the phrases that are due.
 * With ?all=1 it also takes phrases that are not due yet ("practise anyway").
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import type { Phrase } from "@/lib/content/types";
import { buildReviewSession, referencedPhraseIds, seededRng } from "@/lib/exercises";
import { getAllPhrases } from "@/server/lessons";
import { getDuePhrases } from "@/server/progress";
import { getToday } from "@/server/today";

export const metadata: Metadata = { title: "Review" };

/** Phrases per review session: enough to be useful, short enough to finish. */
const SESSION_SIZE = 12;

export default async function ReviewSessionPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const includeNotDue = (await searchParams).all === "1";
  const items = await getDuePhrases(await getToday(), SESSION_SIZE, includeNotDue);
  if (items.length === 0) redirect("/review");

  const pool = await getAllPhrases();
  const exercises = buildReviewSession(items, pool, seededRng(Date.now()));

  const used = referencedPhraseIds(exercises);
  const lookup: Record<string, Phrase> = {};
  for (const p of pool) if (used.has(p.id)) lookup[p.id] = p;

  return <LessonPlayer mode="review" title="Review" exercises={exercises} phrases={lookup} exitHref="/review" />;
}
