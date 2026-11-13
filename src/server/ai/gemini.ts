/**
 * Gemini (Google) provider, using the REST API directly with fetch.
 *
 * We ask for JSON output (responseMimeType) and describe the expected shape
 * in the prompt as a JSON Schema. The reply is then validated with zod; if
 * it does not fit, we ask once more with the validation errors.
 */
import { z } from "zod";
import { AiError } from "./errors";
import type { AiMessage, AiProvider, JsonRequest, ProviderCredentials } from "./provider";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const TIMEOUT_MS = 90_000;

/**
 * Gemini answers 503 ("high demand") or another 5xx when it is briefly
 * overloaded. These usually clear within seconds, so we wait and try again
 * before giving up. Waits in milliseconds, one entry per retry.
 */
const RETRY_DELAYS_MS = [1_000, 3_000];
const isOverloaded = (status: number) => status === 500 || status === 502 || status === 503 || status === 504;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The parts of Gemini's response we read. */
interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

async function call(path: string, apiKey: string, body?: unknown): Promise<unknown> {
  let response: Response;
  for (let attempt = 0; ; attempt++) {
    try {
      response = await fetch(`${BASE_URL}/${path}`, {
        method: body ? "POST" : "GET",
        // The key goes in a header, not the URL, so it never ends up in logs.
        headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new AiError("Could not reach Gemini. Check the connection and try again.");
    }
    const delay = RETRY_DELAYS_MS[attempt];
    if (!isOverloaded(response.status) || delay === undefined) break;
    await wait(delay);
  }

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (response.ok) return data;

  const detail = data.error?.message ?? response.statusText;
  if (response.status === 400 && /api key/i.test(detail)) {
    throw new AiError("Gemini rejected the API key. Check it in Settings.", 400);
  }
  if (response.status === 401 || response.status === 403) {
    throw new AiError("Gemini rejected the API key. Check it in Settings.", 400);
  }
  if (response.status === 404) {
    throw new AiError("The selected Gemini model does not exist. Pick another one in Settings.", 400);
  }
  if (response.status === 429) {
    throw new AiError("Gemini is rate-limiting this key (or the free quota is used up). Try again later.", 429);
  }
  if (isOverloaded(response.status)) {
    throw new AiError(
      "Gemini is overloaded right now (this is on Google's side). Try again in a minute, " +
        "or pick a different model in Settings.",
      503,
    );
  }
  throw new AiError(`Gemini returned an error (${response.status}): ${detail}`);
}

/** Gemini calls the assistant role "model". */
function toContents(messages: AiMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/** Pulls the JSON text out of a response and parses it. */
function extractJson(data: GeminiResponse): unknown {
  if (data.promptFeedback?.blockReason) {
    throw new AiError("Gemini declined this request. Try rephrasing it.", 400);
  }
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new AiError("Gemini's answer was cut off. Try a shorter request.");
  }
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => !part.thought) // skip the model's reasoning notes
    .map((part) => part.text ?? "")
    .join("")
    .trim()
    // Some models wrap JSON in a ```json code fence despite being told not to.
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  if (!text) throw new AiError("Gemini returned an empty answer. Try again.");
  return JSON.parse(text);
}

export const gemini: AiProvider = {
  async generateJson<T>({ apiKey, model }: ProviderCredentials, request: JsonRequest<T>): Promise<T> {
    const system =
      `${request.system}\n\n` +
      "OUTPUT FORMAT\nReply with one JSON object only (no code fence, no commentary) " +
      `that matches this JSON Schema:\n${JSON.stringify(z.toJSONSchema(request.schema))}`;

    const messages = [...request.messages];
    let problem = "";

    // Two attempts: the second one tells the model what was wrong with the first.
    for (let attempt = 0; attempt < 2; attempt++) {
      const data = (await call(`models/${encodeURIComponent(model)}:generateContent`, apiKey, {
        systemInstruction: { parts: [{ text: system }] },
        contents: toContents(messages),
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 16000 },
      })) as GeminiResponse;

      let json: unknown;
      try {
        json = extractJson(data);
      } catch (error) {
        if (error instanceof AiError) throw error;
        problem = "The reply was not valid JSON.";
        json = undefined;
      }

      if (json !== undefined) {
        const parsed = request.schema.safeParse(json);
        if (parsed.success) return parsed.data;
        problem = parsed.error.issues
          .slice(0, 5)
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
        messages.push({ role: "assistant", content: JSON.stringify(json) });
      } else {
        messages.push({ role: "assistant", content: "(invalid output)" });
      }
      messages.push({
        role: "user",
        content: `That reply did not match the required JSON format (${problem}). Send the complete corrected JSON object.`,
      });
    }
    throw new AiError("Gemini returned an answer in an unexpected format. Try again.");
  },

  async listModels(apiKey: string): Promise<string[]> {
    const data = (await call("models?pageSize=1000", apiKey)) as {
      models?: { name: string; supportedGenerationMethods?: string[] }[];
    };
    return (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""))
      // Hide embedding, image, audio and other special-purpose models.
      .filter((id) => id.startsWith("gemini") && !/embedding|image|tts|audio|live|robotics|computer-use/.test(id))
      .sort();
  },
};
