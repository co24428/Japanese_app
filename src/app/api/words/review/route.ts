/**
 * POST   /api/words/review   { id }  -> adds a dictionary word to the review queue
 * DELETE /api/words/review   { id }  -> removes it again
 *
 * `id` is a dictionary entry id such as "bank" (src/lib/content/dictionary.ts).
 */
import { z } from "zod";
import { DICTIONARY } from "@/lib/content/dictionary";
import { ApiError, api, readJson } from "@/server/api";
import { removeWordFromReview, saveWordForReview } from "@/server/progress";
import { getToday } from "@/server/today";

const bodySchema = z.object({ id: z.string().max(60) });

const KNOWN_IDS = new Set(DICTIONARY.map((e) => e.id));

async function readWordId(request: Parameters<typeof readJson>[0]): Promise<string> {
  const { id } = await readJson(request, bodySchema);
  if (!KNOWN_IDS.has(id)) throw new ApiError(404, "Unknown word.");
  return id;
}

export const POST = api(async (request) => {
  await saveWordForReview(await readWordId(request), await getToday());
  return { saved: true };
});

export const DELETE = api(async (request) => {
  await removeWordFromReview(await readWordId(request));
  return { saved: false };
});
