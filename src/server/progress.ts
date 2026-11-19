/**
 * Everything that records or reads your progress:
 *   activity         what you did each day  (heatmap, streak, daily goal)
 *   lesson_progress  which lessons are done (ticks on the Learn page)
 *   phrase_stats     review state per phrase (the Review tab)
 */
import type { Phrase } from "@/lib/content/types";
import { addDays } from "@/lib/dates";
import { LEARNED_BOX, nextReviewState } from "@/lib/srs";
import type { DayActivity } from "@/lib/streak";
import { XP } from "@/lib/xp";
import { query, transaction, type Queryable } from "./db";
import { WORDS_LESSON_ID, wordPhraseId } from "@/lib/content/dictionary";
import { getReviewablePhrases } from "./lessons";

// ---------------------------------------------------------------------------
// Daily activity
// ---------------------------------------------------------------------------

/** Activity rows from `fromDay` (inclusive) onwards, oldest first. */
export async function getActivity(fromDay: string): Promise<DayActivity[]> {
  // `day::text` keeps the date as "YYYY-MM-DD" instead of a JS Date, which
  // would be shifted by the server's time zone.
  return query<DayActivity>(
    "SELECT day::text AS day, xp, lessons, reviews, chats FROM activity WHERE day >= $1::date ORDER BY day",
    [fromDay],
  );
}

/** Roughly one year of activity: what the Home page needs. */
export function getRecentActivity(today: string): Promise<DayActivity[]> {
  return getActivity(addDays(today, -400));
}

type ActivityDelta = Partial<Omit<DayActivity, "day">>;

/** Adds to today's totals, creating the row on the first activity of the day. */
export async function addActivity(day: string, delta: ActivityDelta, db: Queryable = { query }): Promise<void> {
  await db.query(
    `INSERT INTO activity (day, xp, lessons, reviews, chats) VALUES ($1::date, $2, $3, $4, $5)
     ON CONFLICT (day) DO UPDATE SET
       xp      = activity.xp      + EXCLUDED.xp,
       lessons = activity.lessons + EXCLUDED.lessons,
       reviews = activity.reviews + EXCLUDED.reviews,
       chats   = activity.chats   + EXCLUDED.chats`,
    [day, delta.xp ?? 0, delta.lessons ?? 0, delta.reviews ?? 0, delta.chats ?? 0],
  );
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export interface LessonProgress {
  completions: number;
  /** Best first-try accuracy, 0-100. */
  bestAccuracy: number;
}

export async function getLessonProgress(): Promise<Map<string, LessonProgress>> {
  const rows = await query<{ lesson_id: string; completions: number; best_accuracy: number }>(
    "SELECT lesson_id, completions, best_accuracy FROM lesson_progress",
  );
  return new Map(rows.map((r) => [r.lesson_id, { completions: r.completions, bestAccuracy: r.best_accuracy }]));
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

interface StatRow {
  phrase_id: string;
  box: number;
  due: string;
}

export interface ReviewSummary {
  /** Phrases due today or earlier. */
  due: number;
  /** Phrases practised at least once. */
  practised: number;
  /** Phrases you know well (box >= LEARNED_BOX). */
  learned: number;
}

export async function getReviewSummary(today: string): Promise<ReviewSummary> {
  const [row] = await query<{ due: number; practised: number; learned: number }>(
    `SELECT
       count(*) FILTER (WHERE due <= $1::date)::int AS due,
       count(*)::int                                AS practised,
       count(*) FILTER (WHERE box >= $2)::int       AS learned
     FROM phrase_stats`,
    [today, LEARNED_BOX],
  );
  return row ?? { due: 0, practised: 0, learned: 0 };
}

/**
 * Phrases to review now, weakest and most overdue first.
 * With `includeNotDue`, phrases that are not due yet are included as well
 * (the "practise anyway" button).
 */
export async function getDuePhrases(
  today: string,
  limit: number,
  includeNotDue = false,
): Promise<{ phrase: Phrase; box: number }[]> {
  const rows = await query<StatRow>(
    `SELECT phrase_id, box, due::text AS due FROM phrase_stats
     WHERE due <= $1::date OR $3::boolean ORDER BY box, due LIMIT $2`,
    [today, limit, includeNotDue],
  );
  const byId = new Map((await getReviewablePhrases()).map((p) => [p.id, p]));
  // A phrase can be missing if its lesson was deleted or edited: skip it.
  return rows.flatMap((r) => {
    const phrase = byId.get(r.phrase_id);
    return phrase ? [{ phrase, box: r.box }] : [];
  });
}

// ---------------------------------------------------------------------------
// Dictionary words saved for review (Words page)
// ---------------------------------------------------------------------------
//
// A saved word is simply a row in phrase_stats with lesson_id "words", so it
// flows through the same review sessions and scheduling as lesson phrases.

/** Dictionary entry ids (e.g. "bank") currently in the review queue. */
export async function getSavedWordIds(): Promise<string[]> {
  const rows = await query<{ phrase_id: string }>("SELECT phrase_id FROM phrase_stats WHERE lesson_id = $1", [WORDS_LESSON_ID]);
  const prefix = `${WORDS_LESSON_ID}:`;
  return rows.map((r) => r.phrase_id.slice(prefix.length));
}

/** Adds a word to the review queue, due today. Saving it again changes nothing. */
export async function saveWordForReview(entryId: string, today: string): Promise<void> {
  await query(
    `INSERT INTO phrase_stats (phrase_id, lesson_id, box, due) VALUES ($1, $2, 0, $3::date)
     ON CONFLICT (phrase_id) DO NOTHING`,
    [wordPhraseId(entryId), WORDS_LESSON_ID, today],
  );
}

/** Takes a word out of the review queue (its review history is deleted). */
export async function removeWordFromReview(entryId: string): Promise<void> {
  await query("DELETE FROM phrase_stats WHERE phrase_id = $1 AND lesson_id = $2", [wordPhraseId(entryId), WORDS_LESSON_ID]);
}

// ---------------------------------------------------------------------------
// Finishing a session
// ---------------------------------------------------------------------------

export interface SessionResult {
  mode: "lesson" | "review";
  /** Required when mode is "lesson". */
  lessonId?: string;
  /** One entry per graded phrase: was it right on the first try? */
  results: { phraseId: string; correct: boolean }[];
}

export interface SessionOutcome {
  xp: number;
  accuracy: number; // 0-100
  perfect: boolean;
}

/**
 * Saves a finished lesson or review session: updates each phrase's review
 * state, marks the lesson complete, and adds XP to today.
 * Everything happens in one transaction, so a failure leaves nothing half-saved.
 */
export async function completeSession(session: SessionResult, today: string): Promise<SessionOutcome> {
  const known = new Map((await getReviewablePhrases()).map((p) => [p.id, p]));

  // A phrase may be tested several times in one session. It counts as
  // correct only if every attempt was correct.
  const perPhrase = new Map<string, boolean>();
  for (const r of session.results) {
    if (!known.has(r.phraseId)) continue; // ignore ids we do not recognise
    perPhrase.set(r.phraseId, (perPhrase.get(r.phraseId) ?? true) && r.correct);
  }

  const total = perPhrase.size;
  const right = [...perPhrase.values()].filter(Boolean).length;
  const accuracy = total === 0 ? 0 : Math.round((right / total) * 100);
  const perfect = total > 0 && right === total;

  const xp =
    session.mode === "lesson"
      ? XP.lesson + (perfect ? XP.perfectLessonBonus : 0)
      : Math.max(XP.reviewMinimum, total * XP.reviewPhrase);

  await transaction(async (tx) => {
    const ids = [...perPhrase.keys()];
    const existing = await tx.query<StatRow>(
      "SELECT phrase_id, box, due::text AS due FROM phrase_stats WHERE phrase_id = ANY($1::text[])",
      [ids],
    );
    const previous = new Map(existing.map((r) => [r.phrase_id, r]));

    for (const [phraseId, correct] of perPhrase) {
      const next = nextReviewState(previous.get(phraseId), correct, today);
      await tx.query(
        `INSERT INTO phrase_stats (phrase_id, lesson_id, correct, wrong, box, due)
         VALUES ($1, $2, $3, $4, $5, $6::date)
         ON CONFLICT (phrase_id) DO UPDATE SET
           correct    = phrase_stats.correct + EXCLUDED.correct,
           wrong      = phrase_stats.wrong   + EXCLUDED.wrong,
           box        = EXCLUDED.box,
           due        = EXCLUDED.due,
           updated_at = now()`,
        [phraseId, known.get(phraseId)!.lessonId, correct ? 1 : 0, correct ? 0 : 1, next.box, next.due],
      );
    }

    if (session.mode === "lesson" && session.lessonId) {
      await tx.query(
        `INSERT INTO lesson_progress (lesson_id, completions, best_accuracy, last_completed_at)
         VALUES ($1, 1, $2, now())
         ON CONFLICT (lesson_id) DO UPDATE SET
           completions       = lesson_progress.completions + 1,
           best_accuracy     = GREATEST(lesson_progress.best_accuracy, EXCLUDED.best_accuracy),
           last_completed_at = now()`,
        [session.lessonId, accuracy],
      );
    }

    await addActivity(
      today,
      { xp, lessons: session.mode === "lesson" ? 1 : 0, reviews: session.mode === "review" ? 1 : 0 },
      tx,
    );
  });

  return { xp, accuracy, perfect };
}
