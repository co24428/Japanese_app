/**
 * POST /api/progress
 * Called by the lesson player when a lesson or review session is finished.
 * Saves the results and answers with the XP earned and the updated streak.
 */
import { z } from "zod";
import { computeStreaks } from "@/lib/streak";
import { ApiError, api, readJson } from "@/server/api";
import { getLesson } from "@/server/lessons";
import { completeSession, getRecentActivity } from "@/server/progress";
import { getPrefs } from "@/server/settings";
import { getToday } from "@/server/today";

const bodySchema = z.object({
  mode: z.enum(["lesson", "review"]),
  lessonId: z.string().max(100).optional(),
  results: z
    .array(z.object({ phraseId: z.string().max(120), correct: z.boolean() }))
    .min(1)
    .max(200),
});

export const POST = api(async (request) => {
  const body = await readJson(request, bodySchema);
  if (body.mode === "lesson" && !(body.lessonId && (await getLesson(body.lessonId)))) {
    throw new ApiError(400, "Unknown lesson.");
  }

  const today = await getToday();
  const outcome = await completeSession(body, today);

  // Send back what the "session complete" screen shows.
  const [activity, prefs] = await Promise.all([getRecentActivity(today), getPrefs()]);
  const todayXp = activity.find((a) => a.day === today)?.xp ?? 0;
  return {
    ...outcome,
    streak: computeStreaks(activity, today).current,
    todayXp,
    dailyGoal: prefs.dailyGoal,
  };
});
