"use client";
import { useState } from "react";
import { callApi } from "@/lib/client/fetch";
import { speak } from "@/lib/client/speech";
import { kanaChart, quizCells, type KanaCell, type KanaScript } from "@/lib/kana";

const QUIZ_LENGTH = 10;
const OPTION_COUNT = 4;

interface Question {
  cell: KanaCell;
  /** Romaji choices, including the right one. */
  options: string[];
}

function shuffled<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/** Picks random characters and, for each, three wrong romaji to choose from. */
function makeQuiz(script: KanaScript): Question[] {
  const cells = quizCells(script);
  const allRomaji = [...new Set(cells.map((c) => c.romaji))];
  return shuffled(cells)
    .slice(0, QUIZ_LENGTH)
    .map((cell) => ({
      cell,
      options: shuffled([
        cell.romaji,
        ...shuffled(allRomaji.filter((r) => r !== cell.romaji)).slice(0, OPTION_COUNT - 1),
      ]),
    }));
}

function Chart({ rows }: { rows: (KanaCell | null)[][] }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {rows.flat().map((cell, i) =>
        cell ? (
          <button
            key={cell.kana}
            type="button"
            onClick={() => speak(cell.kana, 0.8)}
            className="flex cursor-pointer flex-col items-center rounded-2xl border border-line bg-surface py-2.5 transition-transform active:scale-95"
          >
            <span lang="ja" className="text-2xl font-bold">
              {cell.kana}
            </span>
            <span className="text-xs text-muted">{cell.romaji}</span>
          </button>
        ) : (
          <span key={i} aria-hidden="true" />
        ),
      )}
    </div>
  );
}

export function KanaTrainer() {
  const [script, setScript] = useState<KanaScript>("hiragana");
  // null = showing the chart; otherwise a quiz is running.
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [earned, setEarned] = useState<number | null>(null);

  function startQuiz() {
    setQuiz(makeQuiz(script));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setEarned(null);
  }

  function pick(option: string) {
    if (!quiz || picked) return;
    const question = quiz[index]!;
    const correct = option === question.cell.romaji;
    setPicked(option);
    if (correct) setScore((s) => s + 1);
    speak(question.cell.kana, 0.8);

    // Show the result briefly, then move on.
    window.setTimeout(() => {
      setPicked(null);
      setIndex((i) => i + 1);
      if (index + 1 === quiz.length) {
        // Finished: record the XP. A failure here is not worth interrupting for.
        callApi<{ xp: number }>("/api/progress/kana", "POST")
          .then((r) => setEarned(r.xp))
          .catch(() => setEarned(0));
      }
    }, correct ? 600 : 1400);
  }

  const tabs = (
    <div className="inline-flex rounded-2xl bg-surface-2 p-1" role="tablist" aria-label="Script">
      {(["hiragana", "katakana"] as const).map((s) => (
        <button
          key={s}
          type="button"
          role="tab"
          aria-selected={script === s}
          onClick={() => {
            setScript(s);
            setQuiz(null);
          }}
          className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold capitalize ${
            script === s ? "bg-surface text-ink shadow-sm" : "text-muted"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );

  // ---- Quiz finished -------------------------------------------------------
  if (quiz && index >= quiz.length) {
    return (
      <div className="card animate-pop-in text-center">
        <p className="text-5xl" aria-hidden="true">{score === quiz.length ? "🏆" : "👏"}</p>
        <h2 className="mt-3 text-2xl font-extrabold tabular-nums">
          {score} / {quiz.length}
        </h2>
        <p className="text-muted">{earned ? `+${earned} XP` : " "}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={startQuiz}>
            Another round
          </button>
          <button type="button" className="btn-secondary" onClick={() => setQuiz(null)}>
            Back to the chart
          </button>
        </div>
      </div>
    );
  }

  // ---- Quiz running --------------------------------------------------------
  if (quiz) {
    const question = quiz[index]!;
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted tabular-nums">
            Question {index + 1} of {quiz.length}
          </p>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setQuiz(null)}>
            Quit
          </button>
        </div>
        <div className="card py-10 text-center">
          <p lang="ja" className="text-8xl font-black">
            {question.cell.kana}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option) => {
            let look = "border-line bg-surface";
            if (picked && option === question.cell.romaji) look = "border-good bg-good-soft";
            else if (picked === option) look = "border-bad bg-bad-soft";
            return (
              <button
                key={option}
                type="button"
                disabled={picked !== null}
                onClick={() => pick(option)}
                className={`min-h-14 cursor-pointer rounded-2xl border-2 border-b-4 text-xl font-bold disabled:cursor-default ${look}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Chart ---------------------------------------------------------------
  const chart = kanaChart(script);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {tabs}
        <button type="button" className="btn-primary" onClick={startQuiz}>
          Quiz me
        </button>
      </div>
      <section>
        <h2 className="eyebrow mb-2">Basic sounds</h2>
        <Chart rows={chart.basic} />
      </section>
      <section>
        <h2 className="eyebrow mb-2">Voiced sounds</h2>
        <Chart rows={chart.voiced} />
      </section>
    </div>
  );
}
