/** POST /api/progress/kana: awards XP for finishing a kana quiz. */
import { XP } from "@/lib/xp";
import { api } from "@/server/api";
import { addActivity } from "@/server/progress";
import { getToday } from "@/server/today";

export const POST = api(async () => {
  await addActivity(await getToday(), { xp: XP.kanaQuiz });
  return { xp: XP.kanaQuiz };
});
