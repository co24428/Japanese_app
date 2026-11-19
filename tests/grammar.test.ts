import { describe, expect, it } from "vitest";
import { getBuiltinLesson } from "@/lib/content";
import type { Line } from "@/lib/content/types";
import { chunkSentence, fallbackKeyWords, lessonParticles, particleOf } from "@/lib/grammar";

/** A readable form of chunks for assertions: "words+particles|...". */
const show = (markup: string) =>
  chunkSentence(markup)
    .map((c) => `${c.words.join(" ")}${c.particles.map((p) => `+${p.particle}`).join("")}${c.punctuation}`)
    .join(" | ");

describe("chunkSentence", () => {
  it("splits a sentence into word + particle chunks", () => {
    expect(show("[駅|えき] の [前|まえ] で [待|ま]ちます。")).toBe("[駅|えき]+の | [前|まえ]+で | [待|ま]ちます。");
  });

  it("keeps words without particles together and attaches sentence endings", () => {
    expect(show("あれ は [何|なん] です か。")).toBe("あれ+は | [何|なん] です+か。");
  });

  it("ends a chunk at punctuation", () => {
    expect(show("はい、 [元気|げんき] です。")).toBe("はい、 | [元気|げんき] です。");
  });

  it("does not mistake a kanji read like a particle for the particle", () => {
    // 葉 is read は but is a noun.
    expect(particleOf("葉")).toBeUndefined();
    expect(show("[木|き] の [葉|は] が [赤|あか]い です。")).toBe("[木|き]+の | [葉|は]+が | [赤|あか]い です。");
  });

  it("recognises two-character particles", () => {
    expect(show("[昨日|きのう] から お[腹|なか] が [痛|いた]い です。")).toBe("[昨日|きのう]+から | お[腹|なか]+が | [痛|いた]い です。");
  });
});

describe("lessonParticles", () => {
  const line = (jp: string): Line => ({ speaker: "A", jp, romaji: "", en: "", ko: "" });

  it("finds the most used case particles, ignoring sentence endings", () => {
    const result = lessonParticles([
      line("[水|みず] を ください。"),
      line("[本|ほん] を [読|よ]みます か。"),
      line("[駅|えき] に [行|い]きます よ。"),
    ]);
    expect(result.map((r) => [r.info.particle, r.count])).toEqual([
      ["を", 2],
      ["に", 1],
    ]);
    expect(result[0]!.example.jp).toBe("[水|みず] を ください。");
  });

  it("gives each pattern a different example sentence when possible", () => {
    const result = lessonParticles([
      line("[荷物|にもつ] を [韓国|かんこく] に [送|おく]ります。"),
      line("[駅|えき] に [行|い]きます。"),
      line("[水|みず] を ください。"),
    ]);
    const examples = result.map((r) => r.example.jp);
    expect(new Set(examples).size).toBe(examples.length);
  });

  it("finds patterns in every built-in lesson", () => {
    const lesson = getBuiltinLesson("street-walk-3")!;
    expect(lessonParticles(lesson.lines)[0]!.info.particle).toBe("を");
  });
});

describe("fallbackKeyWords", () => {
  it("picks distinct kanji words with romaji", () => {
    const words = fallbackKeyWords([
      { speaker: "A", jp: "[駅|えき] は どこ です か。", romaji: "", en: "", ko: "" },
      { speaker: "B", jp: "[駅|えき] の [前|まえ] です。", romaji: "", en: "", ko: "" },
    ]);
    expect(words.map((w) => w.jp)).toEqual(["[駅|えき]", "[前|まえ]"]);
    expect(words[0]!.romaji.toLowerCase()).toBe("eki");
  });
});
