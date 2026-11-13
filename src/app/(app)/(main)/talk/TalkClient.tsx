"use client";
/**
 * The role-play chat.
 *
 * The conversation lives only in this component's state (it is not saved).
 * Each time you send a message, the whole conversation goes to
 * /api/ai/chat, which returns the character's reply, feedback on what you
 * wrote, and suggestions for what to say next.
 */
import { useEffect, useRef, useState } from "react";
import { CheckIcon, SendIcon } from "@/components/icons";
import { Jp } from "@/components/Jp";
import { Meaning } from "@/components/Meaning";
import { usePrefs } from "@/components/PrefsProvider";
import { SpeakButton } from "@/components/SpeakButton";
import type { ChatMessage, ChatTurn } from "@/lib/ai-types";
import { callApi } from "@/lib/client/fetch";
import { speak, stopSpeaking } from "@/lib/client/speech";
import { plainText } from "@/lib/japanese";
import { SCENARIOS, customScenario, type Scenario } from "@/lib/scenarios";

/** A message as shown on screen. */
type Bubble =
  | { role: "ai"; reply: ChatTurn["reply"] }
  | { role: "user"; text: string; feedback?: ChatTurn["feedback"] };

export function TalkClient() {
  const { showRomaji, speechRate } = usePrefs();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [custom, setCustom] = useState("");

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [suggestions, setSuggestions] = useState<ChatTurn["suggestions"]>([]);
  const [finished, setFinished] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bubbles, busy]);

  useEffect(() => stopSpeaking, []);

  /** Asks the server for the AI's next turn, given the conversation so far. */
  async function requestTurn(active: Scenario, conversation: Bubble[]) {
    setBusy(true);
    setError("");
    const history: ChatMessage[] = conversation.map((b) =>
      b.role === "ai" ? { role: "ai", text: b.reply.jp } : { role: "user", text: b.text },
    );
    try {
      const { turn } = await callApi<{ turn: ChatTurn }>("/api/ai/chat", "POST", {
        ...(active.id === "custom" ? { custom: active.setting } : { scenarioId: active.id }),
        history,
      });
      // Attach the feedback to the message it is about, then add the reply.
      const updated = [...conversation];
      const last = updated.at(-1);
      if (last?.role === "user") updated[updated.length - 1] = { ...last, feedback: turn.feedback };
      setBubbles([...updated, { role: "ai", reply: turn.reply }]);
      setSuggestions(turn.finished ? [] : turn.suggestions);
      setFinished(turn.finished);
      speak(plainText(turn.reply.jp), speechRate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI did not answer.");
    } finally {
      setBusy(false);
    }
  }

  function start(chosen: Scenario) {
    setScenario(chosen);
    setBubbles([]);
    setSuggestions([]);
    setFinished(false);
    setInput("");
    void requestTurn(chosen, []);
  }

  function send(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy || !scenario) return;
    const conversation: Bubble[] = [...bubbles, { role: "user", text }];
    setBubbles(conversation);
    setInput("");
    setSuggestions([]);
    void requestTurn(scenario, conversation);
  }

  // ---- Scene picker --------------------------------------------------------

  if (!scenario) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold">Talk</h1>
          <p className="mt-1 text-muted">
            Pick a scene. The AI plays the other person, you answer in Japanese (romaji is fine), and you get a
            correction after every message.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => start(s)}
              className="card flex cursor-pointer items-center gap-4 text-left transition-colors hover:border-primary"
            >
              <span className="text-3xl" aria-hidden="true">
                {s.emoji}
              </span>
              <span>
                <span className="block font-bold">{s.title}</span>
                <span className="block text-sm text-muted">You are {s.userRole}</span>
              </span>
            </button>
          ))}
        </div>

        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim().length >= 3) start(customScenario(custom.trim()));
          }}
        >
          <label htmlFor="custom-scene" className="block font-bold">
            Or describe your own scene
          </label>
          <input
            id="custom-scene"
            className="input"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={300}
            placeholder="e.g. Asking the landlord to fix the heating"
          />
          <button type="submit" className="btn-secondary" disabled={custom.trim().length < 3}>
            Start this scene
          </button>
        </form>
      </div>
    );
  }

  // ---- Conversation --------------------------------------------------------

  const lastIsUser = bubbles.at(-1)?.role === "user";

  return (
    <div>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">
            <span aria-hidden="true">{scenario.emoji} </span>
            {scenario.title}
          </h1>
          <p className="truncate text-sm text-muted">You are {scenario.userRole}</p>
        </div>
        <button type="button" className="btn-secondary btn-sm shrink-0" onClick={() => setScenario(null)}>
          End
        </button>
      </header>

      <ol className="space-y-4" aria-live="polite">
        {bubbles.map((bubble, i) =>
          bubble.role === "ai" ? (
            <li key={i} className="animate-pop-in flex max-w-[92%] items-start gap-2">
              <SpeakButton markup={bubble.reply.jp} size="sm" className="mt-2" />
              <div className="rounded-3xl rounded-tl-md border border-line bg-surface px-4 py-3">
                <Jp markup={bubble.reply.jp} className="block text-lg leading-loose font-bold" />
                {showRomaji && <p className="text-sm text-muted">{bubble.reply.romaji}</p>}
                <p className="mt-1 text-sm">
                  <Meaning en={bubble.reply.en} ko={bubble.reply.ko} />
                </p>
              </div>
            </li>
          ) : (
            <li key={i} className="animate-pop-in ml-auto flex max-w-[92%] flex-col items-end gap-1.5">
              <p className="rounded-3xl rounded-tr-md bg-primary px-4 py-3 font-semibold text-on-primary">{bubble.text}</p>

              {bubble.feedback?.verdict === "good" && (
                <p className="flex items-start gap-1.5 rounded-2xl bg-good-soft px-3 py-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-good" />
                  <span>{bubble.feedback.note || "Natural and correct."}</span>
                </p>
              )}
              {bubble.feedback?.verdict === "fix" && (
                <div className="rounded-2xl bg-warn-soft px-3 py-2 text-sm">
                  <p className="eyebrow text-warn">Better</p>
                  {bubble.feedback.corrected && (
                    <div className="mt-1 flex items-start gap-2">
                      <SpeakButton markup={bubble.feedback.corrected} size="sm" />
                      <div>
                        <Jp markup={bubble.feedback.corrected} className="block text-base leading-loose font-bold" />
                        <p className="text-muted">{bubble.feedback.correctedRomaji}</p>
                      </div>
                    </div>
                  )}
                  {bubble.feedback.note && <p className="mt-1">{bubble.feedback.note}</p>}
                </div>
              )}
            </li>
          ),
        )}

        {busy && (
          <li className="text-sm text-muted" role="status">
            {bubbles.length === 0 ? "Setting the scene…" : "Thinking…"}
          </li>
        )}
      </ol>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl bg-bad-soft p-4 text-sm text-bad">
          <p className="font-semibold">{error}</p>
          {/* Re-send exactly the same conversation. */}
          <button type="button" className="mt-2 font-bold underline" onClick={() => void requestTurn(scenario, bubbles)}>
            Try again
          </button>
        </div>
      )}

      {finished && (
        <div className="card mt-6 text-center">
          <p className="text-4xl" aria-hidden="true">🎉</p>
          <h2 className="mt-2 text-lg font-bold">Scene complete</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary" onClick={() => start(scenario)}>
              Play it again
            </button>
            <button type="button" className="btn-secondary" onClick={() => setScenario(null)}>
              Choose another scene
            </button>
          </div>
        </div>
      )}

      {!finished && suggestions.length > 0 && !busy && (
        <div className="mt-5">
          <p className="eyebrow mb-2">You could say</p>
          <div className="grid gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                // Fills the text box (in romaji) so you can still edit it before sending.
                onClick={() => setInput(s.romaji)}
                className="cursor-pointer rounded-2xl border border-line bg-surface px-4 py-2.5 text-left hover:border-primary"
              >
                <Jp markup={s.jp} className="block leading-loose font-bold" />
                <span className="block text-sm text-muted">
                  {showRomaji ? `${s.romaji} · ` : ""}
                  {s.en}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={bottom} className="h-4" />

      {/* Message box. Sticks above the phone tab bar. */}
      {!finished && (
        <form
          onSubmit={send}
          className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 mt-2 flex gap-2 rounded-3xl border border-line bg-surface p-2 shadow-lg md:bottom-4"
        >
          <label htmlFor="chat-input" className="sr-only">
            Your message
          </label>
          <input
            id="chat-input"
            className="input min-h-11 flex-1 border-0 px-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder={lastIsUser && busy ? "Waiting for the reply…" : "Answer in Japanese (romaji is fine)"}
            autoComplete="off"
            autoCapitalize="none"
          />
          <button type="submit" className="btn-primary min-h-11 px-4" disabled={busy || !input.trim()} aria-label="Send">
            <SendIcon className="size-5" />
          </button>
        </form>
      )}
    </div>
  );
}
