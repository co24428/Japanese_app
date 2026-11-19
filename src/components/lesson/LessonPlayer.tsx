"use client";
/**
 * Plays a session (a lesson or a review) one exercise at a time.
 *
 * How it works:
 *   - `queue` is the list of exercises. `index` points at the current one.
 *   - You answer, press Check, see feedback, press Continue.
 *   - An exercise you get wrong is added to the end of the queue, so you meet
 *     it again before the session ends (like Duolingo).
 *   - Only your FIRST attempt at each exercise counts towards the results
 *     that are saved; the repeat is just for practice.
 *   - After the last exercise the results are posted to /api/progress and
 *     the completion screen is shown.
 *
 * Feedback: a chime and bounce for a right answer, a buzz and shake for a
 * wrong one (sounds can be turned off in Settings), and a combo counter for
 * several right answers in a row.
 *
 * Around the exercises (lessons only):
 *   before  a "Key particles & words" preview (LessonIntro.tsx)
 *   after   a sentence-structure recap on the completion screen (SentenceRecap.tsx)
 *
 * Keyboard: 1-4 pick an option, Enter checks / continues.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Phrase } from "@/lib/content/types";
import { isArrangementCorrect, testedPhraseId, type Exercise } from "@/lib/exercises";
import { isAnswerCorrect, plainText } from "@/lib/japanese";
import { callApi } from "@/lib/client/fetch";
import { buzz, playSound } from "@/lib/client/sounds";
import { speak, stopSpeaking, useVoiceStatus } from "@/lib/client/speech";
import { CheckIcon, CloseIcon, FlameIcon } from "../icons";
import { usePrefs } from "../PrefsProvider";
import { ArrangeView, ChoiceView, IntroView, TypeView, type Status } from "./ExerciseViews";
import { PhraseCard } from "./PhraseCard";
import { LessonIntro, type LessonPreview } from "./LessonIntro";
import type { RecapItem } from "./SentenceRecap";
import { SessionComplete, type Outcome } from "./SessionComplete";

interface Props {
  mode: "lesson" | "review";
  /** Required when mode is "lesson". */
  lessonId?: string;
  title: string;
  exercises: Exercise[];
  /** Every phrase the exercises refer to, by id. */
  phrases: Record<string, Phrase>;
  /** Where the close button and the final Continue button lead. */
  exitHref: string;
  /** Key particles and words to show before the first exercise (lessons only). */
  preview?: LessonPreview;
}

/** Varied praise, so "Correct!" does not get repetitive. Longer combos get louder praise. */
function praise(combo: number): string {
  if (combo >= 5) return `${combo} in a row! 🔥`;
  if (combo >= 3) return "On a roll!";
  const words = ["Correct!", "Nice!", "Great job!", "Well done!", "That's it!"];
  return words[combo % words.length]!;
}

interface QueueItem {
  exercise: Exercise;
  /** True for a repeat of an exercise that was answered wrongly. */
  retry: boolean;
}

export function LessonPlayer({
  mode,
  lessonId,
  title,
  exercises: initialExercises,
  phrases: initialPhrases,
  exitHref,
  preview,
}: Props) {
  const { speechRate, soundEffects } = usePrefs();
  const voice = useVoiceStatus();

  // Keep the session we started with. The server shuffles a NEW session each
  // time the page data is refreshed (for example when preferences change in
  // another tab); without this, a refresh would swap the phrases under an
  // exercise that is already on screen.
  const [exercises] = useState(initialExercises);
  const [phrases] = useState(initialPhrases);

  const [queue, setQueue] = useState<QueueItem[]>(() => exercises.map((exercise) => ({ exercise, retry: false })));
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("answering");
  const [mistakes, setMistakes] = useState(0);
  // Right answers in a row; shown as a combo badge from 3 upwards.
  const [combo, setCombo] = useState(0);

  // The answer being entered. Only one of these is used per exercise kind.
  const [selected, setSelected] = useState<string | null>(null); // multiple choice
  const [chosen, setChosen] = useState<number[]>([]); // arrange: tile indexes
  const [typed, setTyped] = useState(""); // type

  // First-try result per phrase. A ref (not state) because changing it
  // should not re-render anything.
  const results = useRef(new Map<string, boolean>());

  // False while the preview card is shown; exercises start after it.
  const [started, setStarted] = useState(!preview);
  const start = useCallback(() => setStarted(true), []);

  /**
   * The sentences this session practises, in the order they first appear
   * (for the recap). Single dictionary words are left out: they have no
   * sentence structure to show.
   */
  const recapIds = useMemo(() => {
    const ids: string[] = [];
    for (const e of exercises) {
      for (const id of e.kind === "intro" ? e.phraseIds : [testedPhraseId(e)]) {
        if (!ids.includes(id) && phrases[id]?.lessonId !== "words") ids.push(id);
      }
    }
    return ids;
  }, [exercises, phrases]);

  // After the last exercise: saving -> outcome (or an error to retry).
  const [finished, setFinished] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saveError, setSaveError] = useState("");

  const current = queue[index];
  const exercise = current?.exercise;
  const phrase = (id: string) => phrases[id]!;

  // A listening exercise needs a Japanese voice. If this device has none,
  // show the same question as a reading exercise instead.
  const kind = exercise?.kind === "listen" && voice === "missing" ? "meaning" : exercise?.kind;

  // Speak new phrases and listening questions as soon as they appear.
  useEffect(() => {
    if (!exercise || finished || !started) return;
    if (exercise.kind === "intro") speak(plainText(phrase(exercise.phraseIds[0]!).jp), speechRate);
    if (exercise.kind === "listen") speak(plainText(phrase(exercise.phraseId).jp), speechRate);
    // Deliberately runs once per exercise: the other values used here do not
    // change during a session.
  }, [index, finished, started]);

  // Stop any audio when leaving the page.
  useEffect(() => stopSpeaking, []);

  const canCheck =
    exercise !== undefined &&
    status === "answering" &&
    ((("options" in exercise) && selected !== null) ||
      (exercise.kind === "arrange" && chosen.length > 0) ||
      (exercise.kind === "type" && typed.trim() !== ""));

  const save = useCallback(async () => {
    setSaveError("");
    try {
      const body = {
        mode,
        lessonId,
        results: [...results.current].map(([phraseId, correct]) => ({ phraseId, correct })),
      };
      setOutcome(await callApi<Outcome>("/api/progress", "POST", body));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save your progress.");
    }
  }, [mode, lessonId]);

  const check = useCallback(() => {
    if (!exercise || exercise.kind === "intro" || !canCheck) return;

    let correct: boolean;
    if (exercise.kind === "arrange") {
      correct = isArrangementCorrect(chosen.map((i) => exercise.tiles[i]!.text), phrase(exercise.phraseId));
    } else if (exercise.kind === "type") {
      correct = isAnswerCorrect(typed, phrase(exercise.phraseId).jp);
    } else {
      correct = selected === testedPhraseId(exercise);
    }

    const tested = testedPhraseId(exercise);
    if (!current.retry) {
      // A phrase tested more than once is "correct" only if every first try was.
      results.current.set(tested, (results.current.get(tested) ?? true) && correct);
    }
    setStatus(correct ? "correct" : "wrong");
    setCombo((c) => (correct ? c + 1 : 0));
    playSound(correct ? "correct" : "wrong", soundEffects);
    if (!correct) buzz(soundEffects);
    // Hearing the right answer straight away helps it stick. Wait for the
    // chime to finish so the two do not overlap.
    const answer = plainText(phrase(tested).jp);
    window.setTimeout(() => speak(answer, speechRate), soundEffects ? 450 : 0);
  }, [exercise, canCheck, chosen, typed, selected, current, speechRate, soundEffects]);

  const next = useCallback(() => {
    if (!current) return;
    // Wrong answers come back at the end of the session.
    const updated = status === "wrong" ? [...queue, { exercise: current.exercise, retry: true }] : queue;
    if (status === "wrong") setMistakes((n) => n + 1);
    setQueue(updated);
    setStatus("answering");
    setSelected(null);
    setChosen([]);
    setTyped("");

    if (index + 1 >= updated.length) {
      setFinished(true);
      playSound("complete", soundEffects);
      void save();
    } else {
      setIndex(index + 1);
    }
  }, [current, status, queue, index, save, soundEffects]);

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (finished || !exercise || !started) return;
      // Leave keys alone while an "Explain" sheet is open.
      if (document.querySelector('[role="dialog"]')) return;

      if (event.key === "Enter") {
        event.preventDefault();
        if (exercise.kind === "intro" || status !== "answering") next();
        else check();
      } else if ("options" in exercise && status === "answering" && /^[1-9]$/.test(event.key)) {
        const option = exercise.options[Number(event.key) - 1];
        if (option) setSelected(option);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exercise, status, finished, started, next, check]);

  // ---- After the last exercise -------------------------------------------

  if (finished || !exercise || !kind) {
    if (outcome) {
      const recap: RecapItem[] = recapIds.map((id) => ({
        phrase: phrases[id]!,
        // Only first tries are recorded; a sentence never tested counts as fine.
        correct: results.current.get(id) ?? true,
      }));
      return <SessionComplete mode={mode} outcome={outcome} exitHref={exitHref} recap={recap} />;
    }
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        {saveError ? (
          <>
            <p role="alert" className="max-w-sm font-semibold text-bad">
              {saveError}
            </p>
            <p className="text-sm text-muted">Your answers are still here. Try saving again.</p>
            <button type="button" className="btn-primary" onClick={() => void save()}>
              Try again
            </button>
          </>
        ) : (
          <p className="text-muted" role="status">
            Saving your progress…
          </p>
        )}
      </div>
    );
  }

  // ---- Before the first exercise: the preview card ----------------------

  if (!started && preview) {
    return <LessonIntro title={title} preview={preview} exitHref={exitHref} onStart={start} />;
  }

  // ---- During the session --------------------------------------------------

  // Progress counts exercises passed. A mistake does not move the bar,
  // because that exercise still has to be answered correctly later.
  const passed = index - mistakes + (status === "correct" ? 1 : 0);
  const percent = Math.round((Math.max(0, passed) / exercises.length) * 100);
  const answerPhrase = exercise.kind === "intro" ? null : phrase(testedPhraseId(exercise));

  function confirmExit(event: React.MouseEvent) {
    if (index > 0 && !window.confirm("Leave this session? Your progress in it will be lost.")) {
      event.preventDefault();
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      {/* Top bar: close button and progress. */}
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link href={exitHref} onClick={confirmExit} aria-label="Close" className="btn-ghost size-10 min-h-0 shrink-0 px-0">
          <CloseIcon />
        </Link>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* The bar glows while a combo is running. */}
          <div
            className={`relative h-full rounded-full bg-good transition-[width] duration-500 ease-out ${combo >= 3 ? "shine" : ""}`}
            style={{ width: `${percent}%` }}
          >
            {/* A lighter stripe along the top gives the bar some depth. */}
            <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
        {combo >= 3 && (
          <span
            key={combo}
            className="animate-bounce-in flex shrink-0 items-center gap-0.5 rounded-full bg-warn-soft px-2.5 py-1 text-sm font-extrabold text-warn tabular-nums"
            title={`${combo} right answers in a row`}
          >
            <FlameIcon className="size-4" />
            {combo}
          </span>
        )}
      </header>

      {/* The exercise. `key` restarts the entrance animation for each one. */}
      <main
        key={index}
        className={`flex-1 px-4 pt-4 pb-6 sm:px-6 ${status === "wrong" ? "animate-shake" : status === "correct" ? "" : "animate-pop-in"}`}
      >
        {exercise.kind === "intro" && <IntroView phrases={exercise.phraseIds.map(phrase)} />}

        {"options" in exercise && (
          <ChoiceView
            kind={kind as "meaning" | "listen" | "reverse" | "reply"}
            prompt={phrase(exercise.phraseId)}
            options={exercise.options.map(phrase)}
            answerId={testedPhraseId(exercise)}
            selected={selected}
            status={status}
            onSelect={(id) => {
              setSelected(id);
              playSound("tap", soundEffects);
            }}
          />
        )}

        {exercise.kind === "arrange" && (
          <ArrangeView
            prompt={phrase(exercise.phraseId)}
            tiles={exercise.tiles}
            chosen={chosen}
            status={status}
            onChange={(next) => {
              setChosen(next);
              playSound("tap", soundEffects);
            }}
          />
        )}

        {exercise.kind === "type" && (
          <TypeView prompt={phrase(exercise.phraseId)} value={typed} status={status} onChange={setTyped} />
        )}
      </main>

      {/* Bottom bar: Check button, or feedback with Continue. */}
      <footer
        className={`sticky bottom-0 border-t-2 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 ${
          status === "correct"
            ? "border-good bg-good-soft"
            : status === "wrong"
              ? "border-bad bg-bad-soft"
              : "border-line bg-bg"
        }`}
        aria-live="polite"
      >
        {status !== "answering" && answerPhrase && (
          <div className="animate-slide-up mb-4">
            <p className={`mb-2 flex items-center gap-2 text-lg font-extrabold ${status === "correct" ? "text-good" : "text-bad"}`}>
              <span
                className={`animate-bounce-in flex size-8 items-center justify-center rounded-full text-white ${
                  status === "correct" ? "bg-good" : "bg-bad"
                }`}
              >
                {status === "correct" ? <CheckIcon className="size-5" /> : <CloseIcon className="size-5" />}
              </span>
              {status === "correct" ? praise(combo) : "Not quite. The answer is:"}
            </p>
            <PhraseCard phrase={answerPhrase} compact />
          </div>
        )}

        {exercise.kind === "intro" ? (
          <button type="button" className="btn-primary w-full" onClick={next}>
            Got it
          </button>
        ) : status === "answering" ? (
          <button type="button" className="btn-primary w-full" disabled={!canCheck} onClick={check}>
            Check
          </button>
        ) : (
          <button type="button" className={`w-full ${status === "correct" ? "btn-good" : "btn-bad"}`} onClick={next}>
            Continue
          </button>
        )}
      </footer>
    </div>
  );
}
