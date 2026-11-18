"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LESSON_LEVELS, type LessonLevel } from "@/lib/ai-types";
import { callApi } from "@/lib/client/fetch";

/** Tap one to fill the text box. */
const IDEAS = [
  "Returning an item at a clothes shop",
  "Ordering at an izakaya with friends",
  "Asking a pharmacist for cold medicine",
  "Getting a haircut",
  "Renting a bicycle",
  "Talking to a neighbour about the weather",
];

const LEVEL_LABELS: Record<LessonLevel, string> = {
  beginner: "Beginner: very short sentences",
  elementary: "Elementary: everyday polite Japanese",
  intermediate: "Intermediate: longer, more natural",
};

export function NewLessonForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<LessonLevel>("beginner");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { id } = await callApi<{ id: string }>("/api/ai/lesson", "POST", { topic, level });
      router.push(`/lesson/${id}`); // start the new lesson straight away
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the lesson.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      <div>
        <label htmlFor="topic" className="label">
          Situation
        </label>
        <textarea
          id="topic"
          className="input min-h-24 py-3"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={300}
          placeholder="For example: buying a SIM card at the airport"
          required
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setTopic(idea)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-[translate,border-color,background-color] duration-150 hover:-translate-y-px hover:border-primary active:scale-95 ${
                topic === idea ? "border-primary bg-primary-soft font-semibold text-primary" : "border-line bg-surface-2"
              }`}
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="level" className="label">
          Level
        </label>
        <select id="level" className="input" value={level} onChange={(e) => setLevel(e.target.value as LessonLevel)}>
          {LESSON_LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={busy || topic.trim().length < 3}>
        {busy ? "Writing your lesson… (up to a minute)" : "Create lesson"}
      </button>
    </form>
  );
}
