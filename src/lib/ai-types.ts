/**
 * Shapes of what the AI returns. Shared by the server (which validates the
 * AI's JSON against these schemas) and the browser (which renders it).
 *
 * The schemas are deliberately simple (only strings, booleans, arrays and
 * enums, no optional fields) because that is what "structured output" modes
 * of the AI providers support reliably. An empty string means "nothing".
 */
import { z } from "zod";

// --- Lesson generation ------------------------------------------------------

export const lessonDraftSchema = z.object({
  title: z.string().describe("Short English title, at most 5 words"),
  goal: z.string().describe("One English sentence: what the learner can do after this lesson"),
  lines: z.array(
    z.object({
      jp: z.string().describe("Japanese in the app's markup format"),
      romaji: z.string(),
      en: z.string().describe("Natural English meaning"),
      ko: z.string().describe("Natural Korean meaning"),
      note: z.string().describe("Optional short usage tip in English, or an empty string"),
    }),
  ),
});
export type LessonDraft = z.infer<typeof lessonDraftSchema>;

export const LESSON_LEVELS = ["beginner", "elementary", "intermediate"] as const;
export type LessonLevel = (typeof LESSON_LEVELS)[number];

// --- Role-play chat ---------------------------------------------------------

const sentenceSchema = z.object({
  jp: z.string().describe("Japanese in the app's markup format"),
  romaji: z.string(),
  en: z.string(),
});

export const chatTurnSchema = z.object({
  /** What the AI's character says. */
  reply: sentenceSchema.extend({ ko: z.string().describe("Korean meaning") }),
  /** Feedback on the learner's last message. */
  feedback: z.object({
    verdict: z.enum(["good", "fix", "none"]),
    corrected: z.string().describe("Corrected Japanese in markup format, or an empty string"),
    correctedRomaji: z.string(),
    note: z.string().describe("One or two short English sentences, or an empty string"),
  }),
  /** Things the learner could say next. */
  suggestions: z.array(sentenceSchema),
  /** True once the scene has reached a natural end. */
  finished: z.boolean(),
});
export type ChatTurn = z.infer<typeof chatTurnSchema>;

/** One message of the conversation as the browser keeps it. */
export interface ChatMessage {
  role: "user" | "ai";
  /** For "ai": the Japanese reply in markup. For "user": exactly what was typed. */
  text: string;
}

// --- "Explain this phrase" --------------------------------------------------

export const explanationSchema = z.object({
  literal: z.string().describe("Word-for-word English gloss"),
  words: z.array(
    z.object({
      word: z.string().describe("The word in markup format"),
      romaji: z.string(),
      meaning: z.string(),
      role: z.string().describe("e.g. noun, verb (polite form), topic particle"),
    }),
  ),
  grammar: z.array(z.string()).describe("1 to 3 short grammar points in English"),
  koreanTip: z.string().describe("How this maps onto Korean, in English with Korean examples"),
  alternatives: z.array(
    sentenceSchema.extend({ nuance: z.string().describe("When you would use this instead") }),
  ),
});
export type Explanation = z.infer<typeof explanationSchema>;
