/**
 * Checks every built-in lesson, so a typo in the content fails `npm test`
 * instead of showing up in the app.
 */
import { describe, expect, it } from "vitest";
import { BUILTIN_UNITS } from "@/lib/content";
import { kanaReading, romajiMatchesKana, validateMarkup } from "@/lib/japanese";

const lessons = BUILTIN_UNITS.flatMap((u) => u.lessons);

describe("built-in curriculum", () => {
  it("has unique unit and lesson ids", () => {
    const unitIds = BUILTIN_UNITS.map((u) => u.id);
    const lessonIds = lessons.map((l) => l.id);
    expect(new Set(unitIds).size).toBe(unitIds.length);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  it("uses ids that are safe in URLs and never contain ':'", () => {
    // ':' separates the lesson id from the line number in phrase ids.
    for (const l of lessons) expect(l.id).toMatch(/^[a-z0-9-]+$/);
  });

  for (const lesson of lessons) {
    describe(lesson.id, () => {
      it("is a dialogue of ask/answer pairs", () => {
        expect(lesson.lines.length).toBeGreaterThanOrEqual(4);
        expect(lesson.lines.length % 2).toBe(0);
        lesson.lines.forEach((line, i) => expect(line.speaker).toBe(i % 2 === 0 ? "A" : "B"));
      });

      lesson.lines.forEach((line, i) => {
        it(`line ${i + 1} is complete and consistent: ${line.romaji}`, () => {
          expect(validateMarkup(line.jp)).toEqual([]);
          expect(line.en.trim()).not.toBe("");
          expect(line.ko.trim()).not.toBe("");
          // The hand-written romaji must spell out the furigana reading.
          expect(romajiMatchesKana(line.romaji, kanaReading(line.jp))).toBe(true);
        });
      });
    });
  }
});
