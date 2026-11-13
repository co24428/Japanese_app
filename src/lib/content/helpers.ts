import type { Lesson, Line } from "./types";

/**
 * One dialogue line written as a short tuple, to keep the unit files compact:
 *   [japanese markup, romaji, English, Korean, optional note]
 */
export type LineTuple = [jp: string, romaji: string, en: string, ko: string, note?: string];

/**
 * Builds a lesson from tuples. Speakers alternate automatically:
 * 1st line = A (asks), 2nd = B (answers), 3rd = A, ...
 */
export function lesson(id: string, title: string, goal: string, tuples: LineTuple[]): Lesson {
  const lines: Line[] = tuples.map(([jp, romaji, en, ko, note], i) => ({
    speaker: i % 2 === 0 ? "A" : "B",
    jp,
    romaji,
    en,
    ko,
    ...(note ? { note } : {}),
  }));
  return { id, title, goal, lines };
}
