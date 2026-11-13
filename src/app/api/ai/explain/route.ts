/**
 * POST /api/ai/explain   { jp, meaning }
 * Explains one sentence. Cached per sentence in the database.
 */
import { z } from "zod";
import { explainPhrase } from "@/server/ai";
import { api, readJson } from "@/server/api";

export const maxDuration = 120;

const bodySchema = z.object({
  jp: z.string().trim().min(1).max(400),
  meaning: z.string().trim().max(400),
});

export const POST = api(async (request) => {
  const { jp, meaning } = await readJson(request, bodySchema);
  return { explanation: await explainPhrase(jp, meaning) };
});
