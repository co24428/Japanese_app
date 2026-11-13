import { describe, expect, it } from "vitest";
import {
  isAnswerCorrect,
  kanaReading,
  kanaToRomaji,
  markupToRomaji,
  parseJp,
  plainText,
  romajiMatchesKana,
  tiles,
  validateMarkup,
} from "@/lib/japanese";

const SENTENCE = "すみません、 [駅|えき] は どこ です か。";

describe("markup parsing", () => {
  it("derives display text, reading and tiles from one string", () => {
    expect(plainText(SENTENCE)).toBe("すみません、駅はどこですか。");
    expect(kanaReading(SENTENCE)).toBe("すみません、えきはどこですか。");
    expect(tiles(SENTENCE)).toEqual(["すみません", "駅", "は", "どこ", "です", "か"]);
  });

  it("handles kanji and kana mixed inside one word", () => {
    const [word] = parseJp("お[飲|の]み[物|もの]");
    expect(word!.parts).toEqual([
      { text: "お" },
      { text: "飲", reading: "の" },
      { text: "み" },
      { text: "物", reading: "もの" },
    ]);
    expect(word!.reading).toBe("おのみもの");
  });
});

describe("validateMarkup", () => {
  it("accepts well-formed markup", () => {
    expect(validateMarkup(SENTENCE)).toEqual([]);
  });
  it("rejects kanji without furigana", () => {
    expect(validateMarkup("駅 は どこ")).not.toEqual([]);
  });
  it("rejects broken groups and non-kana readings", () => {
    expect(validateMarkup("[駅|えき は")).not.toEqual([]);
    expect(validateMarkup("[駅|eki]")).not.toEqual([]);
  });
});

describe("romaji", () => {
  it("converts kana including small tsu, digraphs and long vowels", () => {
    expect(kanaToRomaji("きっぷ")).toBe("kippu");
    expect(kanaToRomaji("しゃしん")).toBe("shashin");
    expect(kanaToRomaji("コーヒー")).toBe("koohii");
    expect(kanaToRomaji("タッチ")).toBe("tatchi");
    expect(kanaToRomaji("チェックイン")).toBe("chekkuin");
  });

  it("accepts the common spelling variants", () => {
    expect(romajiMatchesKana("Eki wa doko desu ka?", "えきはどこですか")).toBe(true);
    expect(romajiMatchesKana("eki ha doko desu ka", "えきはどこですか")).toBe(true);
    expect(romajiMatchesKana("arigatō", "ありがとう")).toBe(true);
    expect(romajiMatchesKana("arigatou", "ありがとう")).toBe(true);
    expect(romajiMatchesKana("kōhī", "コーヒー")).toBe(true);
    expect(romajiMatchesKana("eki wa koko desu", "えきはどこですか")).toBe(false);
  });

  it("builds sentence romaji with spoken particles", () => {
    expect(markupToRomaji(SENTENCE)).toBe("Sumimasen, eki wa doko desu ka.");
    expect(markupToRomaji("これ を ください。")).toBe("Kore o kudasai.");
    expect(markupToRomaji("こんにちは。")).toBe("Konnichiwa.");
  });
});

describe("isAnswerCorrect", () => {
  it("accepts romaji, kana and full Japanese", () => {
    expect(isAnswerCorrect("eki wa doko desu ka", SENTENCE.replace("すみません、 ", ""))).toBe(true);
    expect(isAnswerCorrect("えきはどこですか", "[駅|えき] は どこ です か。")).toBe(true);
    expect(isAnswerCorrect("駅はどこですか？", "[駅|えき] は どこ です か。")).toBe(true);
    expect(isAnswerCorrect("エキハドコデスカ", "[駅|えき] は どこ です か。")).toBe(true);
  });
  it("rejects wrong and empty answers", () => {
    expect(isAnswerCorrect("", SENTENCE)).toBe(false);
    expect(isAnswerCorrect("eki desu", "[駅|えき] は どこ です か。")).toBe(false);
  });
});
