"use client";
/**
 * Shows a phrase's translation in the language(s) chosen in Settings:
 * English, Korean, or both.
 */
import { usePrefs } from "./PrefsProvider";

interface Props {
  en: string;
  ko?: string;
  className?: string;
}

export function Meaning({ en, ko, className = "" }: Props) {
  const { meaning } = usePrefs();
  // Fall back to English when a Korean translation is missing.
  if (meaning === "ko" && ko) return <span className={className} lang="ko">{ko}</span>;
  if (meaning === "both" && ko) {
    return (
      <span className={className}>
        {en}
        <span className="block text-[0.9em] text-muted" lang="ko">{ko}</span>
      </span>
    );
  }
  return <span className={className}>{en}</span>;
}
