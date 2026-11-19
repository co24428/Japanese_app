/**
 * Particles: what they are, their Korean equivalents, and how to find them
 * in a sentence.
 *
 * Used by:
 *   - the particle cheat sheet on the Words page
 *   - the lesson preview card (which particles does this lesson use?)
 *   - the sentence recap after a lesson ([word] + [particle] chunks)
 *
 * Pure functions on the app's sentence markup (see src/lib/japanese.ts),
 * tested in tests/grammar.test.ts.
 */
import type { KeyWord, Line } from "./content/types";
import { markupToRomaji, parseJp, stripPunctuation } from "./japanese";

export interface ParticleInfo {
  /** The particle as written. */
  particle: string;
  /** How it is pronounced (は is "wa", を is "o"). */
  romaji: string;
  /** The Korean particle or ending it usually corresponds to. */
  ko: string;
  /** Its job, in a few English words. */
  role: string;
  /**
   * "case": links a word to the rest of the sentence (は, を, に ...).
   * "ending": goes at the end of a sentence (か, ね, よ).
   */
  kind: "case" | "ending";
  /** Colour hue (0-360) used for this particle everywhere in the app. */
  hue: number;
}

/**
 * Every particle the app recognises. The first six are the core particles
 * covered in depth by the cheat sheet (src/lib/content/particles.ts).
 */
export const PARTICLES: Record<string, ParticleInfo> = {
  は: { particle: "は", romaji: "wa", ko: "은/는", role: "topic", kind: "case", hue: 25 },
  が: { particle: "が", romaji: "ga", ko: "이/가", role: "subject", kind: "case", hue: 340 },
  を: { particle: "を", romaji: "o", ko: "을/를", role: "object", kind: "case", hue: 230 },
  の: { particle: "の", romaji: "no", ko: "의", role: "of, 's", kind: "case", hue: 145 },
  に: { particle: "に", romaji: "ni", ko: "에 / 에게", role: "to, at (a time), in", kind: "case", hue: 280 },
  で: { particle: "で", romaji: "de", ko: "에서 / (으)로", role: "at (an action), by", kind: "case", hue: 55 },
  へ: { particle: "へ", romaji: "e", ko: "에 / (으)로", role: "towards", kind: "case", hue: 200 },
  と: { particle: "と", romaji: "to", ko: "와/과, 하고", role: "and, with", kind: "case", hue: 190 },
  も: { particle: "も", romaji: "mo", ko: "도", role: "also", kind: "case", hue: 100 },
  から: { particle: "から", romaji: "kara", ko: "에서 / 부터", role: "from, since", kind: "case", hue: 310 },
  まで: { particle: "まで", romaji: "made", ko: "까지", role: "until, up to", kind: "case", hue: 260 },
  か: { particle: "か", romaji: "ka", ko: "-까?", role: "question", kind: "ending", hue: 0 },
  ね: { particle: "ね", romaji: "ne", ko: "-네요 / -죠", role: "isn't it?", kind: "ending", hue: 0 },
  よ: { particle: "よ", romaji: "yo", ko: "-요!", role: "you know", kind: "ending", hue: 0 },
};

/** The six particles the cheat sheet and lesson previews focus on. */
export const CORE_PARTICLES = ["は", "が", "を", "の", "に", "で"] as const;

/**
 * Is this word (one space-separated word of markup, already stripped of
 * punctuation) a particle? It must be written exactly as the particle, so
 * the kanji 葉 (read は) is never mistaken for the particle は.
 */
export function particleOf(writtenWord: string): ParticleInfo | undefined {
  return PARTICLES[writtenWord];
}

/** A piece of a sentence: some words, then the particles that follow them. */
export interface Chunk {
  /** The words, each in markup (keeps furigana), e.g. ["[駅|えき]"]. Empty if the sentence starts with a particle. */
  words: string[];
  /** Particles after the words, in order (usually zero or one). */
  particles: ParticleInfo[];
  /** Punctuation that followed, e.g. "。", to display the sentence faithfully. */
  punctuation: string;
}

/**
 * Splits a sentence into [words] + [particle] chunks:
 *     "[駅|えき] の [前|まえ] で [待|ま]ちます。"
 *  -> [駅]+の  [前]+で  [待ちます]
 */
export function chunkSentence(markup: string): Chunk[] {
  const raw = markup.trim().split(/\s+/).filter(Boolean);
  const tokens = parseJp(markup);
  const chunks: Chunk[] = [];
  let current: Chunk | null = null;

  tokens.forEach((token, i) => {
    const written = stripPunctuation(token.text);
    const punctuation = token.text.slice(written.length);
    const particle = particleOf(written);

    if (particle) {
      // Attach to the words before it (or start an empty chunk if none).
      current ??= { words: [], particles: [], punctuation: "" };
      current.particles.push(particle);
      current.punctuation = punctuation;
      if (punctuation) {
        chunks.push(current);
        current = null;
      }
      return;
    }

    // A new content word. If the previous chunk already has particles, it is complete.
    if (current && current.particles.length > 0) {
      chunks.push(current);
      current = null;
    }
    const word = raw[i] ?? token.text;
    const wordWithoutPunctuation = punctuation ? word.slice(0, word.length - punctuation.length) : word;
    if (current) {
      current.words.push(wordWithoutPunctuation);
    } else {
      current = { words: [wordWithoutPunctuation], particles: [], punctuation: "" };
    }
    if (punctuation) {
      current.punctuation = punctuation;
      chunks.push(current);
      current = null;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

/** A particle pattern used in a lesson, with a line that shows it. */
export interface LessonParticle {
  info: ParticleInfo;
  /** How many times the lesson uses it. */
  count: number;
  /** The first line of the lesson that uses it. */
  example: Line;
}

/**
 * The lesson's main particle patterns: the most used "case" particles,
 * core particles first when counts are equal. Sentence endings (か, ね, よ)
 * are left out because they carry no sentence structure.
 */
export function lessonParticles(lines: Line[], limit = 2): LessonParticle[] {
  const found = new Map<string, LessonParticle>();
  for (const line of lines) {
    for (const chunk of chunkSentence(line.jp)) {
      for (const info of chunk.particles) {
        if (info.kind !== "case") continue;
        const entry = found.get(info.particle);
        if (entry) entry.count++;
        else found.set(info.particle, { info, count: 1, example: line });
      }
    }
  }
  const coreRank = (p: string) => {
    const i = (CORE_PARTICLES as readonly string[]).indexOf(p);
    return i === -1 ? CORE_PARTICLES.length : i;
  };
  const top = [...found.values()]
    .sort((a, b) => b.count - a.count || coreRank(a.info.particle) - coreRank(b.info.particle))
    .slice(0, limit);

  // Give each pattern its own example sentence when the lesson allows it,
  // so the preview does not show the same line twice.
  const usedExamples = new Set<string>();
  for (const entry of top) {
    const fresh = lines.find(
      (line) =>
        !usedExamples.has(line.jp) &&
        chunkSentence(line.jp).some((c) => c.particles.some((p) => p.particle === entry.info.particle)),
    );
    if (fresh) entry.example = fresh;
    usedExamples.add(entry.example.jp);
  }
  return top;
}

/**
 * Key words for a lesson that has none written by hand (AI-generated
 * lessons): the distinct kanji words, in order. Meanings are left empty
 * because the lesson data does not contain word-level meanings.
 */
export function fallbackKeyWords(lines: Line[], limit = 5): KeyWord[] {
  const seen = new Set<string>();
  const words: KeyWord[] = [];
  for (const line of lines) {
    const raw = line.jp.trim().split(/\s+/);
    parseJp(line.jp).forEach((token, i) => {
      const written = stripPunctuation(token.text);
      if (!token.parts.some((p) => p.reading) || seen.has(written) || words.length >= limit) return;
      seen.add(written);
      const markup = (raw[i] ?? "").replace(/[。、？！]+$/, "");
      words.push({ jp: markup, romaji: markupToRomaji(markup), en: "", ko: "" });
    });
  }
  return words;
}
