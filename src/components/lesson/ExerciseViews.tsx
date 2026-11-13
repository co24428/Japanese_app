"use client";
/**
 * What each exercise looks like. These components only display and collect
 * input; LessonPlayer decides what is correct and what comes next.
 */
import type { Phrase } from "@/lib/content/types";
import type { Tile } from "@/lib/japanese";
import { Jp } from "../Jp";
import { Meaning } from "../Meaning";
import { usePrefs } from "../PrefsProvider";
import { SpeakButton } from "../SpeakButton";
import { PhraseCard } from "./PhraseCard";

/** "answering" until Check is pressed, then "correct" or "wrong". */
export type Status = "answering" | "correct" | "wrong";

function Instruction({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl font-extrabold sm:text-2xl">{children}</h1>;
}

/** The sentence being asked about, in a speech-bubble style box. */
function Prompt({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border-2 border-line bg-surface p-5">{children}</div>;
}

// ---------------------------------------------------------------------------
// Intro: new phrases, not graded
// ---------------------------------------------------------------------------

export function IntroView({ phrases }: { phrases: Phrase[] }) {
  return (
    <div className="space-y-5">
      <Instruction>New phrases</Instruction>
      <p className="-mt-3 text-muted">Listen, then say them out loud.</p>
      {phrases.map((phrase) => (
        <div key={phrase.id} className={`card ${phrase.speaker === "B" ? "border-primary/40 bg-primary-soft/40" : ""}`}>
          <PhraseCard phrase={phrase} label={phrase.speaker === "A" ? "Ask" : "Answer"} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multiple choice: meaning / listen / reverse / reply
// ---------------------------------------------------------------------------

interface ChoiceProps {
  /** How the question is presented. */
  kind: "meaning" | "listen" | "reverse" | "reply";
  /** The phrase shown (or spoken) as the question. */
  prompt: Phrase;
  options: Phrase[];
  answerId: string;
  selected: string | null;
  status: Status;
  onSelect: (id: string) => void;
}

const CHOICE_TITLES = {
  meaning: "What does this mean?",
  listen: "Listen. What does it mean?",
  reverse: "How do you say this in Japanese?",
  reply: "Choose the best reply",
};

export function ChoiceView({ kind, prompt, options, answerId, selected, status, onSelect }: ChoiceProps) {
  const { showRomaji } = usePrefs();
  // Options are meanings when the question is Japanese, and vice versa.
  const japaneseOptions = kind === "reverse" || kind === "reply";

  return (
    <div className="space-y-5">
      <Instruction>{CHOICE_TITLES[kind]}</Instruction>

      {kind === "listen" ? (
        <div className="flex items-center justify-center gap-4 py-4">
          <SpeakButton markup={prompt.jp} size="lg" label="Play the sentence" />
          <SpeakButton markup={prompt.jp} size="md" slow />
        </div>
      ) : kind === "reverse" ? (
        <Prompt>
          <p className="text-xl font-bold">
            <Meaning en={prompt.en} ko={prompt.ko} />
          </p>
        </Prompt>
      ) : (
        <Prompt>
          <div className="flex items-start gap-3">
            <SpeakButton markup={prompt.jp} className="mt-1" />
            <div>
              <Jp markup={prompt.jp} className="block text-2xl leading-loose font-bold" />
              {showRomaji && <p className="text-muted">{prompt.romaji}</p>}
              {/* For "reply" the question's meaning is shown: the test is the answer. */}
              {kind === "reply" && (
                <p className="mt-1 text-sm">
                  <Meaning en={prompt.en} ko={prompt.ko} />
                </p>
              )}
            </div>
          </div>
        </Prompt>
      )}

      <div role="radiogroup" aria-label="Answers" className="grid gap-2.5">
        {options.map((option, i) => {
          const isSelected = selected === option.id;
          // After checking: the right answer turns green, a wrong pick red.
          let look = "border-line bg-surface hover:bg-surface-2";
          if (status === "answering" && isSelected) look = "border-primary bg-primary-soft";
          if (status !== "answering" && option.id === answerId) look = "border-good bg-good-soft";
          else if (status === "wrong" && isSelected) look = "border-bad bg-bad-soft";

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={status !== "answering"}
              onClick={() => onSelect(option.id)}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-2.5 text-left transition-colors disabled:cursor-default ${look}`}
            >
              <span className="hidden size-7 shrink-0 items-center justify-center rounded-lg border border-line text-xs font-bold text-muted sm:flex">
                {i + 1}
              </span>
              {japaneseOptions ? (
                <span>
                  <Jp markup={option.jp} className="block text-lg leading-loose font-bold" />
                  {showRomaji && <span className="block text-sm text-muted">{option.romaji}</span>}
                </span>
              ) : (
                <Meaning en={option.en} ko={option.ko} className="font-semibold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arrange: put the word tiles in order
// ---------------------------------------------------------------------------

interface ArrangeProps {
  prompt: Phrase;
  tiles: Tile[];
  /** Indexes into `tiles`, in the order they were tapped. */
  chosen: number[];
  status: Status;
  onChange: (chosen: number[]) => void;
}

function TileButton({ tile, onClick, disabled, hidden }: { tile: Tile; onClick: () => void; disabled: boolean; hidden?: boolean }) {
  const { showFurigana } = usePrefs();
  return (
    <button
      type="button"
      lang="ja"
      onClick={onClick}
      disabled={disabled || hidden}
      // A used tile keeps its space in the bank (invisible) so tiles do not jump around.
      className={`min-h-12 cursor-pointer rounded-xl border-2 border-b-4 border-line bg-surface px-3.5 text-lg font-bold transition-transform active:translate-y-0.5 disabled:cursor-default ${
        hidden ? "invisible" : ""
      }`}
    >
      {showFurigana && tile.reading !== tile.text ? (
        <ruby>
          {tile.text}
          <rt>{tile.reading}</rt>
        </ruby>
      ) : (
        tile.text
      )}
    </button>
  );
}

export function ArrangeView({ prompt, tiles, chosen, status, onChange }: ArrangeProps) {
  const locked = status !== "answering";
  return (
    <div className="space-y-5">
      <Instruction>Put the words in order</Instruction>
      <Prompt>
        <p className="text-xl font-bold">
          <Meaning en={prompt.en} ko={prompt.ko} />
        </p>
      </Prompt>

      {/* The sentence being built. Tap a tile to send it back. */}
      <div className="flex min-h-32 flex-wrap content-start gap-2 border-y-2 border-line py-3" aria-label="Your sentence">
        {chosen.map((tileIndex, position) => (
          <TileButton
            key={tileIndex}
            tile={tiles[tileIndex]!}
            disabled={locked}
            onClick={() => onChange(chosen.filter((_, i) => i !== position))}
          />
        ))}
      </div>

      {/* The word bank. */}
      <div className="flex flex-wrap justify-center gap-2" aria-label="Word bank">
        {tiles.map((tile, i) => (
          <TileButton key={i} tile={tile} disabled={locked} hidden={chosen.includes(i)} onClick={() => onChange([...chosen, i])} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type: write the sentence
// ---------------------------------------------------------------------------

interface TypeProps {
  prompt: Phrase;
  value: string;
  status: Status;
  onChange: (value: string) => void;
}

export function TypeView({ prompt, value, status, onChange }: TypeProps) {
  return (
    <div className="space-y-5">
      <Instruction>Type it in Japanese</Instruction>
      <Prompt>
        <p className="text-xl font-bold">
          <Meaning en={prompt.en} ko={prompt.ko} />
        </p>
      </Prompt>
      <div>
        <label htmlFor="typed-answer" className="label">
          Romaji or kana are both fine
        </label>
        <input
          id="typed-answer"
          className="input text-lg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={status !== "answering"}
          placeholder="e.g. arigatou gozaimasu"
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
