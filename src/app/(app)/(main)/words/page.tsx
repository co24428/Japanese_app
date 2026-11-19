/**
 * /words: the everyday dictionary and the particle cheat sheet.
 * /words?tab=particles opens the cheat sheet directly (lessons link there).
 */
import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import { getSavedWordIds } from "@/server/progress";
import { WordsClient } from "./WordsClient";

export const metadata: Metadata = { title: "Words" };

export default async function WordsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab }, saved] = await Promise.all([searchParams, getSavedWordIds()]);
  return (
    <PageTransition>
      <WordsClient initialTab={tab === "particles" ? "particles" : "dictionary"} initialSaved={saved} />
    </PageTransition>
  );
}
