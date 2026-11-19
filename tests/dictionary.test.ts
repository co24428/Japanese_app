/**
 * Checks the Words page content: every dictionary entry and every particle
 * example must have valid furigana and romaji that matches the reading.
 */
import { describe, expect, it } from "vitest";
import { BUILTIN_UNITS } from "@/lib/content";
import { DICTIONARY, DICTIONARY_PHRASES, WEARING_VERBS, WORDS_LESSON_ID } from "@/lib/content/dictionary";
import { PARTICLE_GUIDES } from "@/lib/content/particles";
import { CORE_PARTICLES, chunkSentence } from "@/lib/grammar";
import { kanaReading, romajiMatchesKana, validateMarkup } from "@/lib/japanese";

describe("dictionary", () => {
  it("has unique, URL-safe ids", () => {
    const ids = DICTIONARY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("does not clash with any lesson id", () => {
    const lessonIds = BUILTIN_UNITS.flatMap((u) => u.lessons.map((l) => l.id));
    expect(lessonIds).not.toContain(WORDS_LESSON_ID);
  });

  it("covers every category, and every piece of clothing names its wearing verb", () => {
    for (const category of ["places", "nature", "clothes", "verbs"]) {
      expect(DICTIONARY.filter((e) => e.category === category).length).toBeGreaterThanOrEqual(10);
    }
    for (const entry of DICTIONARY.filter((e) => e.category === "clothes")) {
      expect(entry.wear, entry.id).toBeDefined();
    }
    // Every wearing verb is used at least once.
    for (const verb of Object.keys(WEARING_VERBS)) {
      expect(DICTIONARY.some((e) => e.wear === verb), verb).toBe(true);
    }
  });

  for (const entry of DICTIONARY) {
    it(`${entry.id}: furigana and romaji are consistent`, () => {
      expect(validateMarkup(entry.jp)).toEqual([]);
      expect(entry.en.trim()).not.toBe("");
      expect(entry.ko.trim()).not.toBe("");
      expect(romajiMatchesKana(entry.romaji, kanaReading(entry.jp))).toBe(true);
    });
  }

  it("wearing verbs are valid too", () => {
    for (const verb of Object.values(WEARING_VERBS)) {
      expect(validateMarkup(verb.jp)).toEqual([]);
      expect(romajiMatchesKana(verb.romaji, kanaReading(verb.jp))).toBe(true);
    }
  });

  it("turns every entry into a reviewable phrase", () => {
    expect(DICTIONARY_PHRASES).toHaveLength(DICTIONARY.length);
    expect(DICTIONARY_PHRASES[0]).toMatchObject({ id: "words:bank", lessonId: "words" });
  });
});

describe("particle cheat sheet", () => {
  it("covers the six core particles", () => {
    expect(PARTICLE_GUIDES.map((g) => g.particle)).toEqual([...CORE_PARTICLES]);
  });

  for (const guide of PARTICLE_GUIDES) {
    describe(guide.particle, () => {
      it("has at least two examples", () => {
        expect(guide.examples.length).toBeGreaterThanOrEqual(2);
      });
      guide.examples.forEach((example) => {
        it(`example "${example.romaji}" is valid and uses ${guide.particle}`, () => {
          expect(validateMarkup(example.jp)).toEqual([]);
          expect(romajiMatchesKana(example.romaji, kanaReading(example.jp))).toBe(true);
          const used = chunkSentence(example.jp).flatMap((c) => c.particles.map((p) => p.particle));
          expect(used).toContain(guide.particle);
        });
      });
    });
  }
});
