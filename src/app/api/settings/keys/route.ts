/**
 * PUT    /api/settings/keys   { provider, apiKey }  -> tests, encrypts and stores the key
 * DELETE /api/settings/keys   { provider }          -> forgets the key
 *
 * The key travels browser -> server once, over HTTPS, and is never sent back.
 */
import { z } from "zod";
import { PROVIDERS } from "@/lib/prefs";
import { testApiKey } from "@/server/ai";
import { api, readJson } from "@/server/api";
import { deleteApiKey, getAiStatus, saveApiKey } from "@/server/settings";

export const maxDuration = 60;

const putSchema = z.object({
  provider: z.enum(PROVIDERS),
  apiKey: z.string().trim().min(10, "That does not look like an API key.").max(400),
});

export const PUT = api(async (request) => {
  const { provider, apiKey } = await readJson(request, putSchema);
  // Try the key first so a typo is caught now, not in the middle of a lesson.
  // (testApiKey throws an error with a readable message if the key is bad.)
  await testApiKey(provider, apiKey);
  await saveApiKey(provider, apiKey);
  return { ai: await getAiStatus() };
});

export const DELETE = api(async (request) => {
  const { provider } = await readJson(request, z.object({ provider: z.enum(PROVIDERS) }));
  await deleteApiKey(provider);
  return { ai: await getAiStatus() };
});
