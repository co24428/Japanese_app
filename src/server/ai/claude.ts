/**
 * Claude (Anthropic) provider, using the official SDK.
 *
 * Uses "structured outputs": we hand the API our zod schema and it guarantees
 * the reply is JSON of that shape, which the SDK parses for us.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AiError } from "./errors";
import type { AiProvider, JsonRequest, ProviderCredentials } from "./provider";

function client(apiKey: string): Anthropic {
  // 90 s is plenty for a lesson; one retry covers brief network hiccups.
  return new Anthropic({ apiKey, timeout: 90_000, maxRetries: 1 });
}

/** Turns SDK errors into messages the learner can act on. */
function explain(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof Anthropic.AuthenticationError) {
    return new AiError("Claude rejected the API key. Check it in Settings.", 400);
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return new AiError("This Claude API key is not allowed to use the selected model.", 400);
  }
  if (error instanceof Anthropic.NotFoundError) {
    return new AiError("The selected Claude model does not exist. Pick another one in Settings.", 400);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AiError("Claude is rate-limiting this key. Wait a moment and try again.", 429);
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AiError("Could not reach Claude. Check the connection and try again.");
  }
  if (error instanceof Anthropic.APIError) {
    return new AiError(`Claude returned an error (${error.status ?? "unknown"}): ${error.message}`);
  }
  return new AiError("Unexpected error while calling Claude.");
}

export const claude: AiProvider = {
  async generateJson<T>({ apiKey, model }: ProviderCredentials, request: JsonRequest<T>): Promise<T> {
    try {
      const response = await client(apiKey).beta.messages.parse({
        model,
        max_tokens: 16000,
        system: request.system,
        messages: request.messages,
        output_config: {
          effort: request.effort,
          format: betaZodOutputFormat(request.schema),
        },
        // If Claude's safety system declines a request, let the API retry it
        // on its recommended fallback model instead of failing. Models that
        // do not support this simply ignore it.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });

      if (response.stop_reason === "refusal") {
        throw new AiError("Claude declined this request. Try rephrasing it.", 400);
      }
      if (response.stop_reason === "max_tokens") {
        throw new AiError("Claude's answer was cut off. Try a shorter request.");
      }
      if (response.parsed_output == null) {
        throw new AiError("Claude returned an answer in an unexpected format. Try again.");
      }
      return response.parsed_output as T;
    } catch (error) {
      throw explain(error);
    }
  },

  async listModels(apiKey: string): Promise<string[]> {
    try {
      const ids: string[] = [];
      // The SDK fetches further pages automatically while we iterate.
      for await (const model of client(apiKey).models.list({ limit: 100 })) ids.push(model.id);
      return ids;
    } catch (error) {
      throw explain(error);
    }
  },
};
