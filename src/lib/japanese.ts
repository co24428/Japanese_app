/**
 * Japanese text helpers.
 *
 * Every Japanese sentence in this app is stored in ONE compact "markup" string
 * that carries three things at once:
 *
 *     "すみません、 [駅|えき] は どこ です か。"
 *
 *   1. Spaces separate WORDS. Real Japanese has no spaces, so they are removed
 *      for display, but they tell us where to cut the sentence into tiles for
 *      the "arrange the words" exercise.
 *   2. [漢字|かんじ] attaches a kana reading (furigana) to a kanji word.
 *   3. Punctuation stays attached to the word before it.
 *
 * From that one string we can derive: the display text, the furigana, the
 * kana-only reading, the word tiles, and (as a fallback) the romaji.
 *
 * This file is pure (no React, no database) so it is easy to unit test:
 * see tests/japanese.test.ts.
 */

/** One piece of a word: plain kana, or kanji with its reading on top. */
export interface RubyPart {
  text: string;
  /** Kana reading shown above `text`. Only present for kanji parts. */
  reading?: string;
}

/** One word of a sentence (what becomes one tile in the arrange exercise). */
export interface Token {
  parts: RubyPart[];
  /** The word as normally written, e.g. "駅". Includes attached punctuation. */
  text: string;
  /** The word in kana only, e.g. "えき". Includes attached punctuation. */
  reading: string;
}

const KANJI = /[㐀-䶿一-鿿々〆]/;
const KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/;
/** Punctuation we strip when comparing answers or building word tiles. */
const PUNCTUATION = /[。、？！・「」『』…\s.,?!'"\-~〜]/g;

/** Matches one `[kanji|reading]` group. */
const RUBY_GROUP = /\[([^[\]|]+)\|([^[\]|]+)\]/g;

/** Splits markup into words, and each word into plain / furigana parts. */
export function parseJp(markup: string): Token[] {
  return markup
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const parts: RubyPart[] = [];
      let last = 0;
      for (const m of word.matchAll(RUBY_GROUP)) {
        if (m.index > last) parts.push({ text: word.slice(last, m.index) });
        parts.push({ text: m[1]!, reading: m[2]! });
        last = m.index + m[0].length;
      }
      if (last < word.length) parts.push({ text: word.slice(last) });
      return {
        parts,
        text: parts.map((p) => p.text).join(""),
        reading: parts.map((p) => p.reading ?? p.text).join(""),
      };
    });
}

/** The sentence as a Japanese person would write it: "駅はどこですか。" */
export function plainText(markup: string): string {
  return parseJp(markup).map((t) => t.text).join("");
}

/** The sentence in kana only: "えきはどこですか。" */
export function kanaReading(markup: string): string {
  return parseJp(markup).map((t) => t.reading).join("");
}

/** Removes punctuation and spaces: used before comparing two answers. */
export function stripPunctuation(s: string): string {
  return s.replace(PUNCTUATION, "");
}

/** Word tiles for the arrange exercise: ["駅", "は", "どこ", "です", "か"]. */
export function tiles(markup: string): string[] {
  return parseJp(markup)
    .map((t) => stripPunctuation(t.text))
    .filter(Boolean);
}

/**
 * Checks that a markup string is well formed. Returns a list of problems
 * (empty list = valid). Used by the content tests and to verify lessons
 * written by the AI before they are saved.
 */
export function validateMarkup(markup: string): string[] {
  const problems: string[] = [];
  if (!markup.trim()) return ["empty sentence"];

  for (const m of markup.matchAll(RUBY_GROUP)) {
    if (!KANA_ONLY.test(m[2]!)) problems.push(`reading "${m[2]}" must be kana only`);
    if (!KANJI.test(m[1]!)) problems.push(`"${m[1]}" has a reading but contains no kanji`);
    if (/\s/.test(m[0])) problems.push(`no spaces allowed inside ${m[0]}`);
  }

  // Whatever is left after removing the valid groups must not contain kanji
  // (kanji without furigana) or stray bracket characters (broken group).
  const rest = markup.replace(RUBY_GROUP, "");
  if (/[[\]|]/.test(rest)) problems.push("broken [kanji|reading] group");
  const bare = rest.match(new RegExp(KANJI.source, "g"));
  if (bare) problems.push(`kanji without a reading: ${[...new Set(bare)].join("")}`);

  return problems;
}

// ---------------------------------------------------------------------------
// Kana -> romaji
// ---------------------------------------------------------------------------

/** Hepburn romaji for single hiragana. Katakana is converted to hiragana first. */
const KANA: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゔ: "vu",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  ゃ: "ya", ゅ: "yu", ょ: "yo",
};

/** Two-kana combinations (きゃ = kya) including the ones used for loanwords. */
const DIGRAPHS: Record<string, string> = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho", しぇ: "she",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", ちぇ: "che",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo", じぇ: "je",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  てぃ: "ti", でぃ: "di", でゅ: "dyu", とぅ: "tu", どぅ: "du",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ゔぁ: "va", ゔぃ: "vi", ゔぇ: "ve", ゔぉ: "vo",
  つぁ: "tsa",
};

const VOWELS = new Set(["a", "i", "u", "e", "o"]);
const UNMACRON: Record<string, string> = { ā: "aa", ī: "ii", ū: "uu", ē: "ee", ō: "oo" };

/** Katakana -> hiragana (they are a fixed distance apart in Unicode). */
export function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/**
 * One sound of a word, with every romaji spelling we accept for it.
 * `spellings[0]` is the preferred (displayed) spelling.
 */
interface Sound {
  spellings: string[];
}

/** Converts a kana string into a list of sounds. Unknown characters are skipped. */
function toSounds(kana: string): Sound[] {
  const s = toHiragana(stripPunctuation(kana));
  const sounds: Sound[] = [];
  let doubleNext = false; // set by っ (small tsu): doubles the next consonant

  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    const one = s[i]!;

    if (one === "っ") {
      doubleNext = true;
      continue;
    }

    if (one === "ー") {
      // Long vowel mark: repeat the vowel of the previous sound.
      const prev = sounds.at(-1)?.spellings[0];
      const vowel = prev?.at(-1);
      if (vowel && VOWELS.has(vowel)) sounds.push({ spellings: [vowel] });
      continue;
    }

    let base: string | undefined;
    if (DIGRAPHS[two]) {
      base = DIGRAPHS[two];
      i++;
    } else {
      base = KANA[one];
    }
    if (!base) continue;

    let spellings = [base];
    // Particles: は is pronounced "wa", へ "e", を "o". From kana alone we
    // cannot know whether は is a particle, so we accept both spellings.
    if (one === "は" && base === "ha") spellings = ["ha", "wa"];
    if (one === "へ" && base === "he") spellings = ["he", "e"];
    if (one === "を") spellings = ["o", "wo"];
    if (one === "ん") spellings = ["n", "m"];
    // Long vowels: とう may be written "tou", "too" or "tō".
    if (one === "う" && base === "u") {
      const prevVowel = sounds.at(-1)?.spellings[0]?.at(-1);
      if (prevVowel === "o") spellings = ["u", "o"];
    }

    if (doubleNext) {
      // っち is "tchi" in Hepburn but people also type "cchi".
      spellings = spellings.flatMap((sp) =>
        sp.startsWith("ch") ? ["t" + sp, "c" + sp] : [sp[0] + sp],
      );
      doubleNext = false;
    }
    sounds.push({ spellings });
  }
  return sounds;
}

/** Lowercases, expands macrons (ō -> oo) and drops everything except a-z. */
export function normalizeRomaji(s: string): string {
  return s
    .toLowerCase()
    .replace(/[āīūēō]/g, (c) => UNMACRON[c]!)
    .replace(/[^a-z]/g, "");
}

/**
 * Does `romaji` spell out `kana`? Tolerant of spacing, punctuation, capitals,
 * wa/ha for は, and the different ways of writing long vowels.
 */
export function romajiMatchesKana(romaji: string, kana: string): boolean {
  const sounds = toSounds(kana);
  if (sounds.length === 0) return false;
  const pattern = sounds.map((s) => `(?:${s.spellings.join("|")})`).join("");
  return new RegExp(`^${pattern}$`).test(normalizeRomaji(romaji));
}

/**
 * Plain kana -> romaji, with no knowledge of particles ("は" -> "ha").
 * Long vowels are written out the way they are typed on a keyboard:
 * とうきょう -> "toukyou", コーヒー -> "koohii".
 */
export function kanaToRomaji(kana: string): string {
  return toSounds(kana)
    .map((sound) => sound.spellings[0])
    .join("");
}

/** Words whose final は is the particle "wa" even though it is not a separate word. */
const WA_WORDS = new Set(["こんにちは", "こんばんは", "では", "それでは"]);

/**
 * Builds romaji for a whole markup sentence, word by word.
 * Used only as a fallback when an AI-written lesson has romaji that does not
 * match its own Japanese. Built-in lessons have hand-written romaji.
 */
export function markupToRomaji(markup: string): string {
  const words = parseJp(markup).map((token) => {
    const kana = stripPunctuation(token.reading);
    let word = kanaToRomaji(kana);
    // A particle written as its own word gets its spoken sound.
    if (kana === "は") word = "wa";
    else if (kana === "へ") word = "e";
    else if (kana === "を") word = "o";
    else if (WA_WORDS.has(kana)) word = word.slice(0, -2) + "wa";

    // Carry over the punctuation that was attached to the word.
    const tail = token.text.match(/[。、？！]+$/)?.[0] ?? "";
    const punct = tail.replace(/。/g, ".").replace(/、/g, ",").replace(/？/g, "?").replace(/！/g, "!");
    return word + punct;
  });
  const sentence = words.filter(Boolean).join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * Checks a typed answer against the expected sentence.
 * The learner may answer in romaji, in kana, or in full Japanese.
 */
export function isAnswerCorrect(input: string, markup: string): boolean {
  const typed = stripPunctuation(input.normalize("NFKC"));
  if (!typed) return false;

  const reading = stripPunctuation(kanaReading(markup));
  // Typed in Japanese: compare with the written form and with the kana form
  // (hiragana and katakana are treated as the same).
  if (typed === stripPunctuation(plainText(markup))) return true;
  if (toHiragana(typed) === toHiragana(reading)) return true;
  // Typed in romaji.
  return romajiMatchesKana(input, reading);
}
