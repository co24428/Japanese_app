/**
 * GET /api/settings/models?provider=claude
 * Asks the provider which models the saved key can use.
 */
import { z } from "zod";
import { PROVIDERS } from "@/lib/prefs";
import { listModels } from "@/server/ai";
import { ApiError, api } from "@/server/api";

export const maxDuration = 60;

export const GET = api(async (request) => {
  const provider = z.enum(PROVIDERS).safeParse(request.nextUrl.searchParams.get("provider"));
  if (!provider.success) throw new ApiError(400, "Unknown provider.");
  return { models: await listModels(provider.data) };
});
