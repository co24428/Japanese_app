/**
 * Display and study preferences. Stored on the server (so laptop and phone
 * agree) and edited on the Settings page.
 */
import { z } from "zod";
import { DEFAULT_DAILY_GOAL } from "./xp";

export const prefsSchema = z.object({
  /** Show pronunciation in English letters under the Japanese. */
  showRomaji: z.boolean(),
  /** Show small kana readings above kanji. */
  showFurigana: z.boolean(),
  /** Which translation to show. */
  meaning: z.enum(["en", "ko", "both"]),
  /** XP per day that counts as "goal reached". */
  dailyGoal: z.number().int().min(5).max(200),
  /** Speed of the spoken audio: 1 is normal. */
  speechRate: z.number().min(0.5).max(1.2),
});

export type Prefs = z.infer<typeof prefsSchema>;

export const DEFAULT_PREFS: Prefs = {
  showRomaji: true,
  showFurigana: true,
  meaning: "en",
  dailyGoal: DEFAULT_DAILY_GOAL,
  speechRate: 0.9,
};

/** The two AI providers the app can talk to. */
export const PROVIDERS = ["claude", "gemini"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const PROVIDER_LABELS: Record<Provider, string> = {
  claude: "Claude (Anthropic)",
  gemini: "Gemini (Google)",
};

/**
 * Model used until you pick another one in Settings. The Settings page can
 * load the live model list from the provider, so these only need to be
 * sensible starting points.
 */
export const DEFAULT_MODELS: Record<Provider, string> = {
  claude: "claude-opus-5-5",
  gemini: "gemini-flash-latest",
};

/** What the browser is allowed to know about the AI setup: never the keys. */
export interface AiStatus {
  provider: Provider;
  models: Record<Provider, string>;
  keys: Record<Provider, { saved: boolean; hint: string | null }>;
  /** True when the selected provider has a key, i.e. AI features can run. */
  ready: boolean;
}
