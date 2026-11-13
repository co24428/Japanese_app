/** /kana: hiragana and katakana charts with audio, plus a quick quiz. */
import type { Metadata } from "next";
import Link from "next/link";
import { KanaTrainer } from "./KanaTrainer";

export const metadata: Metadata = { title: "Kana" };

export default function KanaPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/learn" className="text-sm font-semibold text-primary">
          ← Learn
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold">Kana basics</h1>
        <p className="mt-1 text-muted">
          Japanese has two sound alphabets. Hiragana is for native words and grammar, katakana for foreign words. Tap
          a character to hear it.
        </p>
      </header>
      <KanaTrainer />
    </div>
  );
}
