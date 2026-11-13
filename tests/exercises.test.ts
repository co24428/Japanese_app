import { describe, expect, it } from "vitest";
import { BUILTIN_UNITS } from "@/lib/content";
import { lessonPhrases, type Phrase } from "@/lib/content/types";
import {
  buildLessonSession,
  buildReviewSession,
  isArrangementCorrect,
  referencedPhraseIds,
  seededRng,
  testedPhraseId,
} from "@/lib/exercises";
import { plainText, tiles } from "@/lib/japanese";

const allLessons = BUILTIN_UNITS.flatMap((u) => u.lessons);
const allPhrases = allLessons.flatMap(lessonPhrases);
const byId = new Map(allPhrases.map((p) => [p.id, p]));
const get = (id: string): Phrase => byId.get(id)!;

describe("buildLessonSession", () => {
  // Build a session for every lesson with several seeds: cheap, and it
  // exercises the distractor logic against the real content.
  for (const lesson of allLessons) {
    it(`${lesson.id}: every exercise is answerable and unambiguous`, () => {
      const phrases = lessonPhrases(lesson);
      const pool = allPhrases.filter((p) => p.lessonId !== lesson.id);

      for (let seed = 1; seed <= 5; seed++) {
        const session = buildLessonSession(phrases, pool, seededRng(seed));
        const graded = session.filter((e) => e.kind !== "intro");

        // Every line is introduced, and tested at least twice.
        const introduced = session.flatMap((e) => (e.kind === "intro" ? e.phraseIds : []));
        expect(introduced).toEqual(phrases.map((p) => p.id));
        for (const p of phrases) {
          expect(graded.filter((e) => testedPhraseId(e) === p.id).length).toBeGreaterThanOrEqual(2);
        }

        for (const e of graded) {
          if ("options" in e) {
            const answer = testedPhraseId(e);
            expect(e.options).toContain(answer);
            expect(e.options.length).toBeGreaterThanOrEqual(3);
            // No two options may look identical to the learner.
            const shown = e.options.map((id) =>
              e.kind === "meaning" || e.kind === "listen" ? get(id).en : plainText(get(id).jp),
            );
            expect(new Set(shown).size).toBe(shown.length);
          }
          if (e.kind === "arrange") {
            const correct = tiles(get(e.phraseId).jp);
            const offered = e.tiles.map((t) => t.text);
            for (const t of correct) expect(offered).toContain(t);
            expect(isArrangementCorrect(correct, get(e.phraseId))).toBe(true);
          }
        }

        // Everything the player needs can be looked up.
        for (const id of referencedPhraseIds(session)) expect(byId.has(id)).toBe(true);
      }
    });
  }

  it("is reproducible with the same seed", () => {
    const phrases = lessonPhrases(allLessons[0]!);
    const a = buildLessonSession(phrases, allPhrases, seededRng(42));
    const b = buildLessonSession(phrases, allPhrases, seededRng(42));
    expect(a).toEqual(b);
  });
});

describe("buildReviewSession", () => {
  it("makes one exercise per due phrase", () => {
    const items = allPhrases.slice(0, 10).map((phrase, i) => ({ phrase, box: i % 6 }));
    const session = buildReviewSession(items, allPhrases, seededRng(7));
    expect(session).toHaveLength(10);
    const tested = session.map((e) => testedPhraseId(e as Exclude<typeof e, { kind: "intro" }>));
    expect(new Set(tested)).toEqual(new Set(items.map((i) => i.phrase.id)));
  });
});
