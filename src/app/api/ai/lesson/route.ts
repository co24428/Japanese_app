/**
 * POST /api/ai/lesson   { topic, level }
 * Has the AI write a new dialogue lesson, saves it, and returns its id.
 */
import { z } from "zod";
import { LESSON_LEVELS } from "@/lib/ai-types";
import { generateLesson } from "@/server/ai";
import { api, readJson } from "@/server/api";
import { saveCustomLesson } from "@/server/lessons";

// AI calls can take a while; allow the serverless function up to 2 minutes.
export const maxDuration = 120;

const bodySchema = z.object({
  topic: z.string().trim().min(3, "Describe the situation in a few words.").max(300),
  level: z.enum(LESSON_LEVELS),
});

export const POST = api(async (request) => {
  const { topic, level } = await readJson(request, bodySchema);
  const lesson = await generateLesson(topic, level);
  await saveCustomLesson(lesson);
  return { id: lesson.id, title: lesson.title };
});
