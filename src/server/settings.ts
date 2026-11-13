/**
 * Reads and writes the `settings` table: preferences, the chosen AI
 * provider/model, and the encrypted API keys.
 *
 * Setting keys used:
 *   prefs               JSON of Prefs
 *   ai.provider         "claude" | "gemini"
 *   ai.<provider>.model model id
 *   ai.<provider>.key   encrypted API key   (never leaves the server)
 *   ai.<provider>.hint  last 4 characters, shown as "••••abcd"
 */
import {
  DEFAULT_MODELS,
  DEFAULT_PREFS,
  PROVIDERS,
  prefsSchema,
  type AiStatus,
  type Prefs,
  type Provider,
} from "@/lib/prefs";
import { decryptSecret, encryptSecret } from "./crypto";
import { query } from "./db";

async function readAll(): Promise<Map<string, string>> {
  const rows = await query<{ key: string; value: string }>("SELECT key, value FROM settings");
  return new Map(rows.map((r) => [r.key, r.value]));
}

async function write(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value],
  );
}

async function remove(keys: string[]): Promise<void> {
  await query("DELETE FROM settings WHERE key = ANY($1::text[])", [keys]);
}

function parsePrefs(raw: string | undefined): Prefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    // Merge over the defaults so that preferences added in a later version
    // get their default value instead of failing validation.
    return prefsSchema.parse({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function getPrefs(): Promise<Prefs> {
  return parsePrefs((await readAll()).get("prefs"));
}

export async function savePrefs(changes: Partial<Prefs>): Promise<Prefs> {
  const next = prefsSchema.parse({ ...(await getPrefs()), ...changes });
  await write("prefs", JSON.stringify(next));
  return next;
}

function statusFrom(all: Map<string, string>): AiStatus {
  const stored = all.get("ai.provider");
  const provider: Provider = stored === "gemini" ? "gemini" : "claude";
  const models = {} as AiStatus["models"];
  const keys = {} as AiStatus["keys"];
  for (const p of PROVIDERS) {
    models[p] = all.get(`ai.${p}.model`) || DEFAULT_MODELS[p];
    keys[p] = { saved: all.has(`ai.${p}.key`), hint: all.get(`ai.${p}.hint`) ?? null };
  }
  return { provider, models, keys, ready: keys[provider].saved };
}

/** Safe to send to the browser: says whether keys exist, never what they are. */
export async function getAiStatus(): Promise<AiStatus> {
  return statusFrom(await readAll());
}

export async function setAiChoice(choice: { provider?: Provider; model?: { provider: Provider; id: string } }) {
  if (choice.provider) await write("ai.provider", choice.provider);
  if (choice.model) await write(`ai.${choice.model.provider}.model`, choice.model.id);
}

export async function saveApiKey(provider: Provider, apiKey: string): Promise<void> {
  await write(`ai.${provider}.key`, encryptSecret(apiKey));
  await write(`ai.${provider}.hint`, apiKey.slice(-4));
  // The first key you save also selects that provider.
  const all = await readAll();
  if (!all.has("ai.provider")) await write("ai.provider", provider);
}

export async function deleteApiKey(provider: Provider): Promise<void> {
  await remove([`ai.${provider}.key`, `ai.${provider}.hint`]);
}

/** The decrypted key for one provider, or null. For server-side AI calls only. */
export async function getApiKey(provider: Provider): Promise<string | null> {
  const stored = (await readAll()).get(`ai.${provider}.key`);
  return stored ? decryptSecret(stored) : null;
}

/** Everything needed to make an AI call with the currently selected provider. */
export async function getActiveAi(): Promise<{ provider: Provider; model: string; apiKey: string | null }> {
  const all = await readAll();
  const status = statusFrom(all);
  const stored = all.get(`ai.${status.provider}.key`);
  return {
    provider: status.provider,
    model: status.models[status.provider],
    apiKey: stored ? decryptSecret(stored) : null,
  };
}
