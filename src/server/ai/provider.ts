/**
 * The one function both AI providers implement: "given a system prompt and
 * a conversation, return JSON that matches this schema".
 * Everything provider-specific stays inside claude.ts and gemini.ts.
 */
import type { z } from "zod";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface JsonRequest<T> {
  system: string;
  messages: AiMessage[];
  schema: z.ZodType<T>;
  /**
   * How hard the model should think. "low" is fast (chat); "medium" is for
   * content that must be correct (lessons, explanations).
   */
  effort: "low" | "medium";
}

export interface ProviderCredentials {
  apiKey: string;
  model: string;
}

export interface AiProvider {
  generateJson<T>(credentials: ProviderCredentials, request: JsonRequest<T>): Promise<T>;
  /** Model ids available to this API key, for the Settings dropdown. */
  listModels(apiKey: string): Promise<string[]>;
}
