/**
 * GET   /api/settings   -> { prefs, ai }  (ai never contains the keys)
 * PATCH /api/settings   { ...some prefs } -> updated prefs
 */
import { prefsSchema } from "@/lib/prefs";
import { api, readJson } from "@/server/api";
import { getAiStatus, getPrefs, savePrefs } from "@/server/settings";

export const GET = api(async () => {
  const [prefs, ai] = await Promise.all([getPrefs(), getAiStatus()]);
  return { prefs, ai };
});

export const PATCH = api(async (request) => {
  const changes = await readJson(request, prefsSchema.partial());
  return { prefs: await savePrefs(changes) };
});
