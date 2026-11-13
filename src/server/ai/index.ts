/**
 * The AI features of the app. API routes call these; these call whichever
 * provider (Claude or Gemini) is selected in Settings, with the key that was
 * saved there.
 */
import { createHash } from "node:crypto";
import {
  chatTurnSchema,
  explanationSchema,
  lessonDraftSchema,
  type ChatMessage,
  type ChatTurn,
  type Explanation,
  type LessonDraft,
  type LessonLevel,
} from "@/lib/ai-types";
import type { Lesson, Line } from "@/lib/content/types";
import { kanaReading, markupToRomaji, plainText, romajiMatchesKana, validateMarkup } from "@/lib/japanese";
import { PROVIDER_LABELS, type Provider } from "@/lib/prefs";
import type { Scenario } from "@/lib/scenarios";
import { query } from "../db";
import { newCustomLessonId } from "../lessons";
import { getActiveAi, getApiKey } from "../settings";
import { claude } from "./claude";
import { AiError } from "./errors";
import { gemini } from "./gemini";
import {
  CHAT_OPENING,
  chatSystemPrompt,
  explainSystemPrompt,
  explainUserPrompt,
  lessonFixPrompt,
  lessonSystemPrompt,
  lessonUserPrompt,
} from "./prompts";
import type { AiMessage, AiProvider, JsonRequest } from "./provider";

export { AiError } from "./errors";

const PROVIDERS: Record<Provider, AiProvider> = { claude, gemini };

/** Sends one request to the provider selected in Settings. */
async function generate<T>(request: JsonRequest<T>): Promise<T> {
  const { provider, model, apiKey } = await getActiveAi();
  if (!apiKey) {
    throw new AiError(`Add your ${PROVIDER_LABELS[provider]} API key in Settings to use AI features.`, 400);
  }
  return PROVIDERS[provider].generateJson({ apiKey, model }, request);
}

/** Model ids the saved key can use (for the dropdown in Settings). */
export async function listModels(provider: Provider): Promise<string[]> {
  const apiKey = await getApiKey(provider);
  if (!apiKey) throw new AiError(`No ${PROVIDER_LABELS[provider]} API key saved.`, 400);
  return PROVIDERS[provider].listModels(apiKey);
}

/** Checks a key before it is saved, by asking the provider for its models. */
export async function testApiKey(provider: Provider, apiKey: string): Promise<void> {
  await PROVIDERS[provider].listModels(apiKey);
}

/**
 * Makes AI-written markup safe to display. If it breaks the format (usually
 * a kanji without furigana) we fall back to plain text without furigana
 * rather than showing stray brackets.
 */
export function safeMarkup(markup: string): string {
  const trimmed = markup.trim();
  if (validateMarkup(trimmed).length === 0) return trimmed;
  return trimmed.replace(/\[([^[\]|]+)\|[^[\]]*\]/g, "$1").replace(/[[\]|]/g, "");
}

// ---------------------------------------------------------------------------
// Lesson generation
// ---------------------------------------------------------------------------

const MIN_LINES = 4;
const MAX_LINES = 10;

/** Lists what is wrong with a draft, in words the model can act on. */
function draftProblems(draft: LessonDraft): string[] {
  const problems: string[] = [];
  if (draft.lines.length < MIN_LINES) problems.push(`The lesson needs at least ${MIN_LINES} lines.`);
  draft.lines.forEach((line, i) => {
    for (const p of validateMarkup(line.jp)) problems.push(`Line ${i + 1} ("${line.jp}"): ${p}`);
  });
  return problems;
}

function toLesson(draft: LessonDraft): Lesson {
  // Keep whole ask/answer pairs only, within the size the player expects.
  const count = Math.min(draft.lines.length - (draft.lines.length % 2), MAX_LINES);
  const lines: Line[] = draft.lines.slice(0, count).map((line, i) => {
    const jp = line.jp.trim();
    // Trust the model's romaji only if it really spells out the Japanese.
    const romajiOk = romajiMatchesKana(line.romaji, kanaReading(jp));
    const note = line.note.trim();
    return {
      speaker: i % 2 === 0 ? "A" : "B",
      jp,
      romaji: romajiOk ? line.romaji.trim() : markupToRomaji(jp),
      en: line.en.trim(),
      ko: line.ko.trim(),
      ...(note ? { note } : {}),
    };
  });
  return {
    id: newCustomLessonId(),
    title: draft.title.trim().slice(0, 60) || "My lesson",
    goal: draft.goal.trim().slice(0, 200),
    lines,
  };
}

/**
 * Asks the AI for a new dialogue lesson about `topic`. The draft is checked
 * against the markup rules; if it fails, the AI gets one chance to fix it.
 */
export async function generateLesson(topic: string, level: LessonLevel): Promise<Lesson> {
  const messages: AiMessage[] = [{ role: "user", content: lessonUserPrompt(topic, level) }];
  const request = { system: lessonSystemPrompt(), schema: lessonDraftSchema, effort: "medium" as const };

  let draft = await generate({ ...request, messages });
  let problems = draftProblems(draft);

  if (problems.length > 0) {
    messages.push(
      { role: "assistant", content: JSON.stringify(draft) },
      { role: "user", content: lessonFixPrompt(problems) },
    );
    draft = await generate({ ...request, messages });
    problems = draftProblems(draft);
  }
  if (problems.length > 0) {
    throw new AiError("The AI wrote a lesson with formatting mistakes twice in a row. Please try again.");
  }
  return toLesson(draft);
}

// ---------------------------------------------------------------------------
// Role-play chat
// ---------------------------------------------------------------------------

/** Only the most recent messages are sent, to keep each turn fast and cheap. */
const MAX_HISTORY = 30;

/**
 * Produces the AI character's next line plus feedback on the learner's last
 * message. `history` is the conversation so far (empty for the opening line).
 */
export async function chatTurn(scenario: Scenario, history: ChatMessage[]): Promise<ChatTurn> {
  const messages: AiMessage[] = [{ role: "user", content: CHAT_OPENING }];
  for (const message of history.slice(-MAX_HISTORY)) {
    const role = message.role === "ai" ? "assistant" : "user";
    const content = message.role === "ai" ? plainText(message.text) : message.text;
    // Providers require user/assistant to alternate: merge accidental doubles.
    const last = messages.at(-1)!;
    if (last.role === role) last.content += `\n${content}`;
    else messages.push({ role, content });
  }
  // The conversation sent to the model must end with the learner's turn.
  if (messages.at(-1)!.role === "assistant") messages.push({ role: "user", content: "(continue)" });

  const turn = await generate({
    system: chatSystemPrompt(scenario),
    messages,
    schema: chatTurnSchema,
    effort: "low",
  });

  const isOpening = history.length === 0;
  return {
    ...turn,
    reply: { ...turn.reply, jp: safeMarkup(turn.reply.jp) },
    feedback: isOpening
      ? { verdict: "none", corrected: "", correctedRomaji: "", note: "" }
      : { ...turn.feedback, corrected: safeMarkup(turn.feedback.corrected) },
    suggestions: turn.suggestions.slice(0, 3).map((s) => ({ ...s, jp: safeMarkup(s.jp) })),
  };
}

// ---------------------------------------------------------------------------
// Explain a phrase
// ---------------------------------------------------------------------------

/**
 * Explains one sentence (grammar, word by word, Korean comparison).
 * Results are cached in the database by sentence, so asking again is free.
 */
export async function explainPhrase(jpMarkup: string, meaning: string): Promise<Explanation> {
  const sentence = plainText(jpMarkup);
  const key = createHash("sha256").update(sentence).digest("hex");

  const cached = await query<{ data: Explanation }>("SELECT data FROM explanations WHERE phrase_key = $1", [key]);
  if (cached[0]) return cached[0].data;

  const raw = await generate({
    system: explainSystemPrompt(),
    messages: [{ role: "user", content: explainUserPrompt(sentence, meaning) }],
    schema: explanationSchema,
    effort: "medium",
  });
  const explanation: Explanation = {
    ...raw,
    words: raw.words.map((w) => ({ ...w, word: safeMarkup(w.word) })),
    alternatives: raw.alternatives.map((a) => ({ ...a, jp: safeMarkup(a.jp) })),
  };

  await query(
    "INSERT INTO explanations (phrase_key, data) VALUES ($1, $2::jsonb) ON CONFLICT (phrase_key) DO NOTHING",
    [key, JSON.stringify(explanation)],
  );
  return explanation;
}
