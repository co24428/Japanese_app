"use client";
/**
 * The Settings screen. Three sections:
 *   1. AI: which provider to use, its API key and model
 *   2. Display and study preferences (saved as soon as you change them)
 *   3. Log out
 *
 * API keys only ever travel browser -> server. The server answers with
 * "saved: true" and the last four characters, never the key itself.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi } from "@/lib/client/fetch";
import { playSound } from "@/lib/client/sounds";
import { speak, useVoiceStatus } from "@/lib/client/speech";
import { PROVIDERS, PROVIDER_LABELS, type AiStatus, type Prefs, type Provider } from "@/lib/prefs";

/** Where to create a key for each provider. */
const KEY_HELP: Record<Provider, { url: string; site: string; placeholder: string }> = {
  claude: { url: "https://console.anthropic.com/settings/keys", site: "console.anthropic.com", placeholder: "sk-ant-…" },
  gemini: { url: "https://aistudio.google.com/apikey", site: "aistudio.google.com", placeholder: "AIza…" },
};

function ErrorText({ children }: { children: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// One provider: key + model
// ---------------------------------------------------------------------------

interface ProviderCardProps {
  provider: Provider;
  ai: AiStatus;
  onChange: (ai: AiStatus) => void;
}

function ProviderCard({ provider, ai, onChange }: ProviderCardProps) {
  const key = ai.keys[provider];
  const help = KEY_HELP[provider];
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(ai.models[provider]);
  const [models, setModels] = useState<string[]>([]);
  const [busy, setBusy] = useState<"" | "key" | "models" | "model">("");
  const [error, setError] = useState("");

  /** Runs an API call with a busy flag and shared error handling. */
  async function run(what: typeof busy, action: () => Promise<void>) {
    setBusy(what);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const saveKey = (event: React.FormEvent) => {
    event.preventDefault();
    void run("key", async () => {
      const { ai: next } = await callApi<{ ai: AiStatus }>("/api/settings/keys", "PUT", { provider, apiKey });
      setApiKey(""); // do not keep the key in the page once it is saved
      onChange(next);
    });
  };

  const removeKey = () => {
    if (!window.confirm(`Remove the saved ${PROVIDER_LABELS[provider]} key?`)) return;
    void run("key", async () => {
      const { ai: next } = await callApi<{ ai: AiStatus }>("/api/settings/keys", "DELETE", { provider });
      onChange(next);
    });
  };

  const loadModels = () =>
    void run("models", async () => {
      const { models: list } = await callApi<{ models: string[] }>(`/api/settings/models?provider=${provider}`);
      setModels(list);
    });

  const saveModel = (id: string) =>
    void run("model", async () => {
      const { ai: next } = await callApi<{ ai: AiStatus }>("/api/settings/ai", "PUT", { model: { provider, id } });
      onChange(next);
    });

  const select = () =>
    void run("model", async () => {
      const { ai: next } = await callApi<{ ai: AiStatus }>("/api/settings/ai", "PUT", { provider });
      onChange(next);
    });

  const active = ai.provider === provider;

  return (
    <div className={`rounded-3xl border-2 p-5 ${active ? "border-primary" : "border-line"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">{PROVIDER_LABELS[provider]}</h3>
        {active ? (
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">In use</span>
        ) : (
          <button type="button" className="btn-secondary btn-sm" onClick={select} disabled={!key.saved || busy !== ""}>
            Use this one
          </button>
        )}
      </div>

      {/* API key */}
      <form onSubmit={saveKey} className="mt-4">
        <label htmlFor={`${provider}-key`} className="label">
          API key{" "}
          {key.saved ? (
            <span className="font-bold text-good">· saved (ends in {key.hint})</span>
          ) : (
            <span>· not set</span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            id={`${provider}-key`}
            type="password"
            className="input min-w-0 flex-1"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={key.saved ? "Paste a new key to replace it" : help.placeholder}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={apiKey.trim().length < 10 || busy !== ""}>
            {busy === "key" ? "Checking…" : "Save"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Create one at{" "}
          <a href={help.url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
            {help.site}
          </a>
          . The key is tested, then stored encrypted on the server.
          {key.saved && (
            <>
              {" "}
              <button type="button" onClick={removeKey} className="cursor-pointer font-semibold text-bad underline">
                Remove key
              </button>
            </>
          )}
        </p>
      </form>

      {/* Model */}
      <div className="mt-4">
        <label htmlFor={`${provider}-model`} className="label">
          Model
        </label>
        <div className="flex gap-2">
          <input
            id={`${provider}-model`}
            className="input min-w-0 flex-1"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            // Typing a model id by hand is allowed; it is saved when you leave the box.
            onBlur={() => model.trim() && model !== ai.models[provider] && saveModel(model.trim())}
            list={`${provider}-models`}
            autoComplete="off"
            spellCheck={false}
          />
          <datalist id={`${provider}-models`}>
            {models.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
          <button type="button" className="btn-secondary shrink-0" onClick={loadModels} disabled={!key.saved || busy !== ""}>
            {busy === "models" ? "Loading…" : "List"}
          </button>
        </div>
        {models.length > 0 && (
          <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {models.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setModel(id);
                  saveModel(id);
                }}
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  id === ai.models[provider] ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface-2"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-xs text-muted">
          Faster, cheaper models are fine for chat. “List” shows the models your key can use.
        </p>
      </div>

      <div className="mt-3">
        <ErrorText>{error}</ErrorText>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A labelled on/off switch
// ---------------------------------------------------------------------------

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {/* The visible switch: its knob slides when the hidden checkbox is checked. */}
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-good peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

export function SettingsClient({ initialPrefs, initialAi }: { initialPrefs: Prefs; initialAi: AiStatus }) {
  const router = useRouter();
  const voice = useVoiceStatus();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [ai, setAi] = useState(initialAi);
  const [error, setError] = useState("");

  /** Saves one preference immediately. The screen updates first, then the server. */
  async function update(changes: Partial<Prefs>) {
    const previous = prefs;
    setPrefs({ ...prefs, ...changes });
    setError("");
    try {
      await callApi("/api/settings", "PATCH", changes);
      router.refresh(); // other pages pick up the new preferences
    } catch (e) {
      setPrefs(previous); // undo on failure
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }

  async function logout() {
    await callApi("/api/auth/logout", "POST").catch(() => {});
    window.location.href = "/login";
  }

  return (
    <>
      <section className="card space-y-4" aria-labelledby="ai-heading">
        <div>
          <h2 id="ai-heading" className="text-lg font-extrabold">
            AI
          </h2>
          <p className="text-sm text-muted">
            Used for role-play conversations, custom lessons and “Explain”. You pay your provider directly for what you
            use; lessons, review and tracking work without any key.
          </p>
        </div>
        {PROVIDERS.map((provider) => (
          <ProviderCard key={provider} provider={provider} ai={ai} onChange={setAi} />
        ))}
      </section>

      <section className="card" aria-labelledby="display-heading">
        <h2 id="display-heading" className="text-lg font-extrabold">
          Display
        </h2>
        <div className="mt-1 divide-y divide-line">
          <Toggle
            label="Romaji"
            hint="Pronunciation in English letters under the Japanese"
            checked={prefs.showRomaji}
            onChange={(v) => void update({ showRomaji: v })}
          />
          <Toggle
            label="Sound effects"
            hint="Chimes for right and wrong answers, and a short vibration on phones"
            checked={prefs.soundEffects}
            onChange={(v) => {
              void update({ soundEffects: v });
              playSound("correct", v); // a preview when switched on
            }}
          />
          <Toggle
            label="Furigana"
            hint="Small kana readings above kanji"
            checked={prefs.showFurigana}
            onChange={(v) => void update({ showFurigana: v })}
          />
          <div className="py-3">
            <label htmlFor="meaning" className="block font-semibold">
              Translations
            </label>
            <select
              id="meaning"
              className="input mt-2"
              value={prefs.meaning}
              onChange={(e) => void update({ meaning: e.target.value as Prefs["meaning"] })}
            >
              <option value="en">English</option>
              <option value="ko">Korean (한국어)</option>
              <option value="both">English and Korean</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card" aria-labelledby="study-heading">
        <h2 id="study-heading" className="text-lg font-extrabold">
          Study
        </h2>
        <div className="mt-1 divide-y divide-line">
          <div className="py-3">
            <label htmlFor="goal" className="block font-semibold">
              Daily goal
            </label>
            <select
              id="goal"
              className="input mt-2"
              value={prefs.dailyGoal}
              onChange={(e) => void update({ dailyGoal: Number(e.target.value) })}
            >
              <option value={10}>10 XP · one lesson</option>
              <option value={20}>20 XP · a lesson and a review</option>
              <option value={30}>30 XP · serious</option>
              <option value={50}>50 XP · intense</option>
            </select>
          </div>
          <div className="py-3">
            <label htmlFor="rate" className="flex items-baseline justify-between font-semibold">
              Speech speed
              <span className="text-sm font-normal text-muted tabular-nums">{prefs.speechRate.toFixed(1)}×</span>
            </label>
            <input
              id="rate"
              type="range"
              min={0.5}
              max={1.2}
              step={0.1}
              value={prefs.speechRate}
              // Update the label while dragging; save when the slider is released.
              onChange={(e) => setPrefs({ ...prefs, speechRate: Number(e.target.value) })}
              onPointerUp={() => void update({ speechRate: prefs.speechRate })}
              onKeyUp={() => void update({ speechRate: prefs.speechRate })}
              className="mt-3 w-full accent-(--primary)"
            />
            <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => speak("こんにちは。お元気ですか。", prefs.speechRate)}>
              Test the voice
            </button>
            {voice === "missing" && (
              <p className="mt-2 rounded-xl bg-warn-soft px-3 py-2 text-sm">
                This device has no Japanese voice installed, so audio and listening exercises are off. On most phones
                and computers you can add one in the system settings under text-to-speech or spoken content.
              </p>
            )}
          </div>
        </div>
      </section>

      <ErrorText>{error}</ErrorText>

      <section className="card flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Account</h2>
          <p className="text-sm text-muted">You stay logged in on this device for 90 days.</p>
        </div>
        <button type="button" className="btn-secondary btn-sm" onClick={logout}>
          Log out
        </button>
      </section>
    </>
  );
}
