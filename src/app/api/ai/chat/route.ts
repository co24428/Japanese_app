/**
 * POST /api/ai/chat   { scenarioId | custom, history }
 * One turn of a role-play conversation. The browser keeps the conversation
 * and sends all of it each time; nothing about the chat is stored.
 */
import { z } from "zod";
import { SCENARIOS, customScenario } from "@/lib/scenarios";
import { XP } from "@/lib/xp";
import { chatTurn } from "@/server/ai";
import { ApiError, api, readJson } from "@/server/api";
import { addActivity } from "@/server/progress";
import { getToday } from "@/server/today";

export const maxDuration = 120;

const bodySchema = z.object({
  scenarioId: z.string().max(40).optional(),
  custom: z.string().trim().min(3).max(300).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "ai"]), text: z.string().trim().min(1).max(600) }))
    .max(80),
});

export const POST = api(async (request) => {
  const body = await readJson(request, bodySchema);
  const scenario = body.custom
    ? customScenario(body.custom)
    : SCENARIOS.find((s) => s.id === body.scenarioId);
  if (!scenario) throw new ApiError(400, "Unknown scenario.");

  const turn = await chatTurn(scenario, body.history);
  // Each message you send counts towards today's activity.
  const spoke = body.history.at(-1)?.role === "user";
  if (spoke) await addActivity(await getToday(), { xp: XP.chatMessage, chats: 1 });
  return { turn, xp: spoke ? XP.chatMessage : 0 };
});
