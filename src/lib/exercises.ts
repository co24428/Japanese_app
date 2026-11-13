/**
 * Turns phrases into a practice session (a list of exercises).
 *
 * Pure functions: give them phrases and a random-number generator, get back
 * exercises. The server builds a session when you open a lesson and the
 * browser just plays it (see src/components/lesson/LessonPlayer.tsx).
 */
import type { Phrase } from "./content/types";
import { normalizeRomaji, plainText, tiles as wordTiles } from "./japanese";

/**
 * The kinds of exercise, from easiest to hardest:
 *   intro    read and listen to a new ask/answer pair (not graded)
 *   meaning  read the Japanese, pick what it means
 *   listen   hear the Japanese (text hidden), pick what it means
 *   reply    read a question, pick the reply that fits
 *   reverse  read the meaning, pick the Japanese
 *   arrange  read the meaning, put the Japanese words in order
 *   type     read the meaning, type the Japanese (romaji or kana)
 *
 * `options` and `phraseIds` hold phrase ids; the player looks the phrases up.
 */
export type Exercise =
  | { kind: "intro"; phraseIds: string[] }
  | { kind: "meaning"; phraseId: string; options: string[] }
  | { kind: "listen"; phraseId: string; options: string[] }
  | { kind: "reverse"; phraseId: string; options: string[] }
  | { kind: "reply"; phraseId: string; answerId: string; options: string[] }
  | { kind: "arrange"; phraseId: string; tiles: string[] }
  | { kind: "type"; phraseId: string };

export type GradedExercise = Exclude<Exercise, { kind: "intro" }>;

/** The phrase an exercise is testing (what gets marked right or wrong). */
export function testedPhraseId(exercise: GradedExercise): string {
  return exercise.kind === "reply" ? exercise.answerId : exercise.phraseId;
}

// ---------------------------------------------------------------------------
// Randomness
// ---------------------------------------------------------------------------

export type Rng = () => number;

/** Small seeded random generator, so tests can produce the same session twice. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const OPTION_COUNT = 4;
/** Sentences longer than this (in romaji letters) are not asked as typing exercises. */
const MAX_TYPED_LENGTH = 22;
const MIN_ARRANGE_TILES = 3;
const EXTRA_TILES = 2;

const byMeaning = (p: Phrase) => p.en.trim().toLowerCase();
const byJapanese = (p: Phrase) => plainText(p.jp);

/**
 * Picks wrong answers for a multiple-choice question.
 * `key` decides what counts as "the same answer": two phrases with the same
 * key never appear together, otherwise there would be two correct options.
 * `near` (phrases from the same lesson) are preferred over the wider `pool`.
 */
function pickDistractors(
  answer: Phrase,
  near: Phrase[],
  pool: Phrase[],
  key: (p: Phrase) => string,
  rng: Rng,
  count = OPTION_COUNT - 1,
): Phrase[] {
  const used = new Set([key(answer)]);
  const picked: Phrase[] = [];
  for (const candidate of [...shuffle(near, rng), ...shuffle(pool, rng)]) {
    if (picked.length >= count) break;
    if (used.has(key(candidate))) continue;
    used.add(key(candidate));
    picked.push(candidate);
  }
  return picked;
}

function choice(
  kind: "meaning" | "listen" | "reverse",
  phrase: Phrase,
  near: Phrase[],
  pool: Phrase[],
  rng: Rng,
): GradedExercise {
  const key = kind === "reverse" ? byJapanese : byMeaning;
  const options = shuffle([phrase, ...pickDistractors(phrase, near, pool, key, rng)], rng);
  return { kind, phraseId: phrase.id, options: options.map((p) => p.id) };
}

function reply(question: Phrase, answer: Phrase, near: Phrase[], pool: Phrase[], rng: Rng): GradedExercise {
  // Wrong options should look like answers too, so only use B lines,
  // and never the question itself.
  const answers = (list: Phrase[]) => list.filter((p) => p.speaker === "B" && p.id !== question.id);
  const distractors = pickDistractors(answer, answers(near), answers(pool), byJapanese, rng);
  const options = shuffle([answer, ...distractors], rng);
  return { kind: "reply", phraseId: question.id, answerId: answer.id, options: options.map((p) => p.id) };
}

function canArrange(phrase: Phrase): boolean {
  return wordTiles(phrase.jp).length >= MIN_ARRANGE_TILES;
}

function canType(phrase: Phrase): boolean {
  return normalizeRomaji(phrase.romaji).length <= MAX_TYPED_LENGTH;
}

function arrange(phrase: Phrase, near: Phrase[], rng: Rng): GradedExercise {
  const correct = wordTiles(phrase.jp);
  // A couple of words from other sentences make it less of a pure jigsaw.
  const extras = shuffle(
    [...new Set(near.flatMap((p) => wordTiles(p.jp)))].filter((w) => !correct.includes(w)),
    rng,
  ).slice(0, EXTRA_TILES);

  let mixed = shuffle([...correct, ...extras], rng);
  // Avoid handing over the tiles already in the right order.
  for (let tries = 0; tries < 5 && mixed.slice(0, correct.length).join("") === correct.join(""); tries++) {
    mixed = shuffle(mixed, rng);
  }
  return { kind: "arrange", phraseId: phrase.id, tiles: mixed };
}

/** Is this arrangement of tiles the right sentence? */
export function isArrangementCorrect(chosen: string[], phrase: Phrase): boolean {
  // Compare joined text so that two identical tiles are interchangeable.
  return chosen.join("") === wordTiles(phrase.jp).join("");
}

/** The hardest exercise this phrase supports, preferring `wanted`. */
function production(
  wanted: "arrange" | "type" | "reverse",
  phrase: Phrase,
  near: Phrase[],
  pool: Phrase[],
  rng: Rng,
): GradedExercise {
  if (wanted === "type" && canType(phrase)) return { kind: "type", phraseId: phrase.id };
  if (wanted !== "reverse" && canArrange(phrase)) return arrange(phrase, near, rng);
  return choice("reverse", phrase, near, pool, rng);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/**
 * A lesson session: for each ask/answer pair, first show it, then check that
 * it was understood. After all pairs, a second round makes you produce each
 * sentence yourself.
 *
 * @param phrases the lesson's lines, in dialogue order
 * @param pool    phrases from other lessons, used only as wrong options
 */
export function buildLessonSession(phrases: Phrase[], pool: Phrase[], rng: Rng): Exercise[] {
  const others = (p: Phrase) => phrases.filter((x) => x.id !== p.id);
  const session: Exercise[] = [];

  // Round 1: understand.
  for (let i = 0; i < phrases.length; i += 2) {
    const ask = phrases[i]!;
    const answer = phrases[i + 1]; // undefined if the lesson has an odd line count
    session.push({ kind: "intro", phraseIds: answer ? [ask.id, answer.id] : [ask.id] });
    session.push(choice("meaning", ask, others(ask), pool, rng));
    if (answer) {
      // Alternate reading and listening so both get practised.
      session.push(choice(i % 4 === 0 ? "listen" : "meaning", answer, others(answer), pool, rng));
      session.push(reply(ask, answer, others(answer), pool, rng));
    }
  }

  // Round 2: produce. Cycle through the three production exercises.
  const wanted = ["arrange", "reverse", "type"] as const;
  shuffle(phrases, rng).forEach((phrase, i) => {
    session.push(production(wanted[i % wanted.length]!, phrase, others(phrase), pool, rng));
  });

  return session;
}

/** A phrase that is due for review, with how well it is known (its box). */
export interface ReviewItem {
  phrase: Phrase;
  box: number;
}

/**
 * A review session: one exercise per due phrase. Phrases you know better
 * (higher box) get harder exercises.
 */
export function buildReviewSession(items: ReviewItem[], pool: Phrase[], rng: Rng): Exercise[] {
  return shuffle(items, rng).map(({ phrase, box }, i) => {
    // Wrong options come from the same lesson first: similar topic, harder to guess.
    const near = pool.filter((p) => p.lessonId === phrase.lessonId && p.id !== phrase.id);
    const even = i % 2 === 0;
    if (box <= 1) return choice(even ? "meaning" : "listen", phrase, near, pool, rng);
    if (box <= 3) return production(even ? "arrange" : "reverse", phrase, near, pool, rng);
    return production(even ? "type" : "arrange", phrase, near, pool, rng);
  });
}

/** Every phrase id an exercise list refers to (so the server can send them along). */
export function referencedPhraseIds(exercises: Exercise[]): Set<string> {
  const ids = new Set<string>();
  for (const e of exercises) {
    if (e.kind === "intro") e.phraseIds.forEach((id) => ids.add(id));
    else ids.add(e.phraseId);
    if ("options" in e) e.options.forEach((id) => ids.add(id));
    if (e.kind === "reply") ids.add(e.answerId);
  }
  return ids;
}
