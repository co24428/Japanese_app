/**
 * PUT /api/settings/ai   { provider?, model?: { provider, id } }
 * Chooses which provider is used and which model each provider uses.
 */
import { z } from "zod";
import { PROVIDERS } from "@/lib/prefs";
import { api, readJson } from "@/server/api";
import { getAiStatus, setAiChoice } from "@/server/settings";

const bodySchema = z.object({
  provider: z.enum(PROVIDERS).optional(),
  model: z
    .object({
      provider: z.enum(PROVIDERS),
      id: z.string().trim().min(1).max(100).regex(/^[\w.:\-/]+$/, "Model ids contain only letters, digits, . - _ : /"),
    })
    .optional(),
});

export const PUT = api(async (request) => {
  await setAiChoice(await readJson(request, bodySchema));
  return { ai: await getAiStatus() };
});
