/**
 * Shapes of the learning content.
 *
 *   Unit   = one real-life situation ("Restaurant"). Shown as a section.
 *   Lesson = one short dialogue inside a unit, made of ask/answer lines.
 *   Line   = one sentence of the dialogue. Also called a "phrase": it is the
 *            thing you practise, and the thing the review system schedules.
 */

export interface Line {
  /** A asks, B answers. Lines always alternate A, B, A, B ... */
  speaker: "A" | "B";
  /** Japanese in the app's markup format. See src/lib/japanese.ts. */
  jp: string;
  /** Pronunciation in English letters (Hepburn romaji). */
  romaji: string;
  /** Meaning in English. */
  en: string;
  /** Meaning in Korean. */
  ko: string;
  /** Optional short tip about usage or nuance (English). */
  note?: string;
}

export interface Lesson {
  /** Stable id used in URLs and in the database. Never change an id. */
  id: string;
  title: string;
  /** One line on what you can do after this lesson. */
  goal: string;
  lines: Line[];
}

export interface Unit {
  id: string;
  title: string;
  /** The situation in Japanese, shown as a small subtitle. */
  titleJp: string;
  emoji: string;
  description: string;
  lessons: Lesson[];
  /** True for the "My lessons" unit that holds AI-generated lessons. */
  custom?: boolean;
}

/**
 * A line plus its identity. This is what the lesson player and the review
 * system work with. `id` is `${lessonId}:${index of the line}`.
 */
export interface Phrase extends Line {
  id: string;
  lessonId: string;
}

export function phraseId(lessonId: string, index: number): string {
  return `${lessonId}:${index}`;
}

/** Turns a lesson's lines into phrases with ids. */
export function lessonPhrases(lesson: Lesson): Phrase[] {
  return lesson.lines.map((line, i) => ({
    ...line,
    id: phraseId(lesson.id, i),
    lessonId: lesson.id,
  }));
}
