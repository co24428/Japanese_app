import type { KeyWord, Lesson, Line } from "./types";

/**
 * One dialogue line written as a short tuple, to keep the unit files compact:
 *   [japanese markup, romaji, English, Korean, optional note]
 */
export type LineTuple = [jp: string, romaji: string, en: string, ko: string, note?: string];

/** A key word for the lesson preview: [japanese markup, romaji, English, Korean]. */
export type WordTuple = [jp: string, romaji: string, en: string, ko: string];

/**
 * Builds a lesson from tuples. Speakers alternate automatically:
 * 1st line = A (asks), 2nd = B (answers), 3rd = A, ...
 *
 * `words` are the key words shown on the preview card before the lesson.
 */
export function lesson(id: string, title: string, goal: string, tuples: LineTuple[], words: WordTuple[] = []): Lesson {
  const lines: Line[] = tuples.map(([jp, romaji, en, ko, note], i) => ({
    speaker: i % 2 === 0 ? "A" : "B",
    jp,
    romaji,
    en,
    ko,
    ...(note ? { note } : {}),
  }));
  const keyWords: KeyWord[] = words.map(([jp, romaji, en, ko]) => ({ jp, romaji, en, ko }));
  return { id, title, goal, lines, ...(keyWords.length > 0 ? { keyWords } : {}) };
}
