/**
 * The kana tables for the Kana page: hiragana and katakana, laid out in the
 * traditional rows of five (a-i-u-e-o). `null` is an empty cell in the chart.
 */
import { kanaToRomaji } from "./japanese";

export interface KanaCell {
  kana: string;
  romaji: string;
}

export type KanaScript = "hiragana" | "katakana";

/** Each string is one chart row; "・" marks an empty cell. */
const BASIC_ROWS = [
  "あいうえお",
  "かきくけこ",
  "さしすせそ",
  "たちつてと",
  "なにぬねの",
  "はひふへほ",
  "まみむめも",
  "や・ゆ・よ",
  "らりるれろ",
  "わ・・・を",
  "ん・・・・",
];

/** The same sounds "voiced" with the ゛ and ゜ marks: ka -> ga, ha -> ba/pa. */
const VOICED_ROWS = ["がぎぐげご", "ざじずぜぞ", "だぢづでど", "ばびぶべぼ", "ぱぴぷぺぽ"];

function toKatakana(hiragana: string): string {
  // Katakana sits exactly 0x60 above hiragana in Unicode.
  return String.fromCharCode(hiragana.charCodeAt(0) + 0x60);
}

function buildRows(rows: string[], script: KanaScript): (KanaCell | null)[][] {
  return rows.map((row) =>
    [...row].map((char) => {
      if (char === "・") return null;
      return { kana: script === "katakana" ? toKatakana(char) : char, romaji: kanaToRomaji(char) };
    }),
  );
}

export function kanaChart(script: KanaScript) {
  return { basic: buildRows(BASIC_ROWS, script), voiced: buildRows(VOICED_ROWS, script) };
}

/**
 * Characters used in the quiz. ぢ and づ are left out because they sound the
 * same as じ and ず, so "which romaji is this?" would have two right answers.
 */
export function quizCells(script: KanaScript): KanaCell[] {
  const { basic, voiced } = kanaChart(script);
  return [...basic, ...voiced]
    .flat()
    .filter((cell): cell is KanaCell => cell !== null && !"ぢづヂヅ".includes(cell.kana));
}
