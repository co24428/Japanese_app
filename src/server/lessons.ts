/**
 * Lesson lookup: built-in lessons (from code) plus AI-generated lessons
 * (from the `lessons` table), presented as one list of units.
 */
import { BUILTIN_UNITS, getBuiltinLesson } from "@/lib/content";
import { DICTIONARY_PHRASES } from "@/lib/content/dictionary";
import { lessonPhrases, type Lesson, type Phrase, type Unit } from "@/lib/content/types";
import { query, transaction } from "./db";

/** Id of the unit that groups your AI-generated lessons on the Learn page. */
export const CUSTOM_UNIT_ID = "my-lessons";
const CUSTOM_ID_PREFIX = "my-";

export function isCustomLessonId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

/** A new unique id such as "my-m3k9x2ab1". Only a-z, 0-9 and "-". */
export function newCustomLessonId(): string {
  return CUSTOM_ID_PREFIX + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function getCustomLessons(): Promise<Lesson[]> {
  const rows = await query<{ data: Lesson }>("SELECT data FROM lessons ORDER BY created_at DESC");
  return rows.map((r) => r.data);
}

/** All units in display order. The "My lessons" unit appears once it has content. */
export async function getUnits(): Promise<Unit[]> {
  const custom = await getCustomLessons();
  if (custom.length === 0) return BUILTIN_UNITS;
  const myUnit: Unit = {
    id: CUSTOM_UNIT_ID,
    title: "My lessons",
    titleJp: "じぶんのレッスン",
    emoji: "✨",
    description: "Lessons the AI wrote for situations you asked for.",
    lessons: custom,
    custom: true,
  };
  return [myUnit, ...BUILTIN_UNITS];
}

export async function getLesson(id: string): Promise<Lesson | undefined> {
  const builtin = getBuiltinLesson(id);
  if (builtin || !isCustomLessonId(id)) return builtin;
  const rows = await query<{ data: Lesson }>("SELECT data FROM lessons WHERE id = $1", [id]);
  return rows[0]?.data;
}

/** Every phrase of every lesson. Used as wrong options in lesson exercises. */
export async function getAllPhrases(): Promise<Phrase[]> {
  const units = await getUnits();
  return units.flatMap((u) => u.lessons).flatMap(lessonPhrases);
}

/**
 * Everything the review queue can contain: lesson phrases plus dictionary
 * words saved from the Words page. Dictionary words are kept out of
 * getAllPhrases() so single words never appear as wrong options for
 * whole sentences in a lesson.
 */
export async function getReviewablePhrases(): Promise<Phrase[]> {
  return [...(await getAllPhrases()), ...DICTIONARY_PHRASES];
}

export async function saveCustomLesson(lesson: Lesson): Promise<void> {
  await query("INSERT INTO lessons (id, data) VALUES ($1, $2::jsonb)", [lesson.id, JSON.stringify(lesson)]);
}

/** Deletes an AI-generated lesson together with its progress and review data. */
export async function deleteCustomLesson(id: string): Promise<boolean> {
  if (!isCustomLessonId(id)) return false;
  return transaction(async (tx) => {
    const deleted = await tx.query("DELETE FROM lessons WHERE id = $1 RETURNING id", [id]);
    await tx.query("DELETE FROM lesson_progress WHERE lesson_id = $1", [id]);
    await tx.query("DELETE FROM phrase_stats WHERE lesson_id = $1", [id]);
    return deleted.length > 0;
  });
}
