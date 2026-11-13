"use client";
/**
 * Makes the learner's preferences (show romaji? furigana? which translation?)
 * available to every component through `usePrefs()`.
 * The server loads them once in src/app/(app)/layout.tsx and passes them in.
 */
import { createContext, useContext } from "react";
import { DEFAULT_PREFS, type Prefs } from "@/lib/prefs";

const PrefsContext = createContext<Prefs>(DEFAULT_PREFS);

export function PrefsProvider({ prefs, children }: { prefs: Prefs; children: React.ReactNode }) {
  return <PrefsContext.Provider value={prefs}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  return useContext(PrefsContext);
}
