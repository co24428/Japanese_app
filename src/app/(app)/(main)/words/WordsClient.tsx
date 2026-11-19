"use client";
/**
 * The Words page: two sections behind a segmented switch.
 *   Dictionary  everyday words by category, searchable, each can be saved
 *               into the review queue
 *   Particles   the particle cheat sheet with Korean equivalents
 */
import { useState } from "react";
import { BookmarkIcon, CheckIcon, SearchIcon } from "@/components/icons";
import { Jp } from "@/components/Jp";
import { usePrefs } from "@/components/PrefsProvider";
import { SpeakButton } from "@/components/SpeakButton";
import { callApi } from "@/lib/client/fetch";
import { playSound } from "@/lib/client/sounds";
import {
  DICTIONARY,
  DICTIONARY_CATEGORIES,
  WEARING_VERBS,
  type DictionaryCategory,
  type DictionaryEntry,
} from "@/lib/content/dictionary";
import { kanaReading, normalizeRomaji, plainText, toHiragana } from "@/lib/japanese";
import { ParticleSheet } from "./ParticleSheet";

type Tab = "dictionary" | "particles";

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/** Words an entry can be found by: English, Korean, romaji, kanji and kana. */
function searchWords(entry: DictionaryEntry): string[] {
  const text = [entry.en, entry.ko, entry.romaji, plainText(entry.jp), toHiragana(kanaReading(entry.jp))].join(" ").toLowerCase();
  // Romaji is also indexed without spaces ("pointo kaado" -> "pointokaado").
  return [...text.split(/[\s,()/]+/), normalizeRomaji(entry.romaji)].filter(Boolean);
}
const SEARCH_INDEX = new Map(DICTIONARY.map((e) => [e.id, searchWords(e)]));

/**
 * Latin-letter queries (English, romaji) match the START of a word, so
 * "hat" finds "hat" but not "shatsu". Korean and Japanese queries match
 * anywhere, because their words are not separated by spaces the same way.
 */
function matches(entry: DictionaryEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const words = SEARCH_INDEX.get(entry.id)!;
  if (/^[a-z\s'-]+$/.test(q)) {
    const compact = normalizeRomaji(q);
    return words.some((w) => w.startsWith(q) || (compact.length > 0 && w.startsWith(compact)));
  }
  const kana = toHiragana(q);
  return words.some((w) => w.includes(q) || w.includes(kana));
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

/** The badge on clothes showing which verb "wears" them. */
function WearBadge({ verb }: { verb: keyof typeof WEARING_VERBS }) {
  const info = WEARING_VERBS[verb];
  return (
    <span
      title={`${info.en}. ${info.note}`}
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary"
    >
      <span aria-hidden="true">👕</span>
      <Jp markup={info.jp} furigana={false} />
      <span className="font-semibold opacity-75">{info.romaji}</span>
      <span lang="ko" className="font-semibold opacity-75">
        · {info.ko}
      </span>
    </span>
  );
}

interface CardProps {
  entry: DictionaryEntry;
  saved: boolean;
  onToggle: () => void;
  busy: boolean;
}

function WordCard({ entry, saved, onToggle, busy }: CardProps) {
  const { showRomaji } = usePrefs();
  return (
    <li className="card flex flex-col gap-3 p-4 transition-[translate,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_24px_-16px_rgb(0_0_0/0.4)]">
      <div className="flex items-start gap-3">
        <SpeakButton markup={entry.jp} className="mt-1.5" />
        <div className="min-w-0 flex-1">
          <Jp markup={entry.jp} className="block text-2xl leading-loose font-bold" />
          {showRomaji && <p className="text-sm text-muted">{entry.romaji}</p>}
          <p className="mt-0.5 font-semibold">{entry.en}</p>
          <p lang="ko" className="text-sm text-muted">
            {entry.ko}
          </p>
        </div>
      </div>
      {(entry.wear || entry.note) && (
        <div className="space-y-1.5">
          {entry.wear && <WearBadge verb={entry.wear} />}
          {entry.note && <p className="text-xs leading-relaxed text-muted">{entry.note}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        aria-pressed={saved}
        className={`group/save mt-auto inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-sm font-bold transition-[background-color,border-color,color,scale] duration-150 active:scale-95 disabled:opacity-60 ${
          saved
            ? "border-good/40 bg-good-soft text-good hover:border-bad/40 hover:bg-bad-soft hover:text-bad"
            : "border-line bg-surface text-ink hover:border-primary/50 hover:text-primary"
        }`}
      >
        {saved ? <CheckIcon className="size-4" /> : <BookmarkIcon className="size-4" />}
        {/* Hovering a saved word reveals that clicking removes it. */}
        {saved ? (
          <>
            <span className="group-hover/save:hidden">In review</span>
            <span className="hidden group-hover/save:inline">Remove from review</span>
          </>
        ) : (
          "Save to review"
        )}
      </button>
    </li>
  );
}

/** Explains the six wearing verbs, shown above the clothes list. */
function WearingVerbGuide() {
  return (
    <div className="card mb-4 border-primary/30 bg-primary-soft/40 p-4">
      <h3 className="font-bold">“Wear” depends on where it goes</h3>
      <p className="mt-0.5 text-sm text-muted">
        Japanese has a different verb for each part of the body, and they split differently from Korean.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {Object.values(WEARING_VERBS).map((verb) => (
          <li key={verb.romaji} className="flex items-start gap-2.5 rounded-2xl bg-surface p-3">
            <SpeakButton markup={verb.jp} size="sm" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <Jp markup={verb.jp} className="text-lg leading-loose font-bold" />
                <span className="text-sm text-muted">{verb.romaji}</span>
                <span lang="ko" className="text-sm font-semibold text-primary">
                  ≈ {verb.ko}
                </span>
              </p>
              <p className="text-sm">{verb.en}</p>
              <p className="text-xs text-muted">{verb.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function WordsClient({ initialTab, initialSaved }: { initialTab: Tab; initialSaved: string[] }) {
  const { soundEffects } = usePrefs();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DictionaryCategory | "all">("all");
  const [saved, setSaved] = useState(() => new Set(initialSaved));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  function switchTab(next: Tab) {
    setTab(next);
    // Keep the URL in step so a refresh or a shared link opens the same tab.
    const url = next === "particles" ? "/words?tab=particles" : "/words";
    window.history.replaceState(null, "", url);
  }

  /** Saves or removes a word. The screen updates first, then the server. */
  async function toggle(id: string) {
    const wasSaved = saved.has(id);
    const next = new Set(saved);
    if (wasSaved) next.delete(id);
    else next.add(id);
    setSaved(next);
    setBusy(id);
    setError("");
    if (!wasSaved) playSound("correct", soundEffects);
    try {
      await callApi("/api/words/review", wasSaved ? "DELETE" : "POST", { id });
    } catch (e) {
      setSaved(saved); // undo
      setError(e instanceof Error ? e.message : "Could not update the review queue.");
    } finally {
      setBusy(null);
    }
  }

  const visible = DICTIONARY.filter((e) => (category === "all" || e.category === category) && matches(e, query));
  const groups = DICTIONARY_CATEGORIES.map((c) => ({ ...c, entries: visible.filter((e) => e.category === c.id) })).filter(
    (g) => g.entries.length > 0,
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold">Words</h1>
        <p className="mt-1 text-muted">Everyday words you see on the street, and how particles map to Korean.</p>
      </header>

      {/* Section switch. */}
      <div className="grid grid-cols-2 rounded-2xl bg-surface-2 p-1" role="tablist" aria-label="Section">
        {(
          [
            ["dictionary", "📖 Dictionary"],
            ["particles", "🔗 Particles"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => switchTab(id)}
            className={`cursor-pointer rounded-xl py-2.5 text-sm font-bold transition-[background-color,color,box-shadow] duration-200 ${
              tab === id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "particles" ? (
        <ParticleSheet />
      ) : (
        <>
          {/* Search and category filter. Stays visible while scrolling. */}
          <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-bg/90 px-4 py-2 backdrop-blur-md md:-mx-8 md:px-8">
            <label className="relative block">
              <span className="sr-only">Search words</span>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                className="input pl-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in English, 한국어, romaji or かな"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </label>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Category">
              {[{ id: "all" as const, title: "All", emoji: "✨" }, ...DICTIONARY_CATEGORIES].map((c) => {
                const count = c.id === "all" ? DICTIONARY.length : DICTIONARY.filter((e) => e.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,translate] duration-150 hover:-translate-y-px active:scale-95 ${
                      category === c.id
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-line bg-surface text-muted hover:border-primary/40 hover:text-ink"
                    }`}
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    {c.title}
                    <span className="text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-muted">
            {saved.size === 0
              ? "Tap “Save to review” on any word to practise it in your Review sessions."
              : `${saved.size} word${saved.size === 1 ? "" : "s"} in your review queue.`}
          </p>

          {error && (
            <p role="alert" className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
              {error}
            </p>
          )}

          {groups.length === 0 && (
            <div className="card text-center text-muted">
              <p className="text-3xl" aria-hidden="true">🔍</p>
              <p className="mt-2">No words match “{query}”.</p>
            </div>
          )}

          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`cat-${group.id}`}>
              <h2 id={`cat-${group.id}`} className="mb-3 flex items-center gap-2 text-lg font-extrabold">
                <span aria-hidden="true">{group.emoji}</span>
                {group.title}
                <span className="text-sm font-semibold text-muted">{group.entries.length}</span>
              </h2>
              {group.id === "clothes" && !query && <WearingVerbGuide />}
              <ul className="grid gap-3 sm:grid-cols-2">
                {group.entries.map((entry) => (
                  <WordCard
                    key={entry.id}
                    entry={entry}
                    saved={saved.has(entry.id)}
                    busy={busy === entry.id}
                    onToggle={() => void toggle(entry.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
