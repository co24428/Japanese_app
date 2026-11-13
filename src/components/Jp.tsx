"use client";
/**
 * Renders Japanese markup ("[駅|えき] は どこ ...") as text with furigana.
 *
 * Always use this component for Japanese text: it sets lang="ja", which
 * makes the browser pick Japanese glyphs and the right voice for screen
 * readers, and it follows the "show furigana" preference.
 */
import { parseJp } from "@/lib/japanese";
import { usePrefs } from "./PrefsProvider";

interface Props {
  markup: string;
  className?: string;
  /** Force furigana on or off. Default: follow the preference. */
  furigana?: boolean;
}

export function Jp({ markup, className, furigana }: Props) {
  const prefs = usePrefs();
  const showFurigana = furigana ?? prefs.showFurigana;

  return (
    <span lang="ja" className={className}>
      {parseJp(markup).map((token, i) => (
        <span key={i}>
          {token.parts.map((part, j) =>
            part.reading && showFurigana ? (
              <ruby key={j}>
                {part.text}
                <rt>{part.reading}</rt>
              </ruby>
            ) : (
              <span key={j}>{part.text}</span>
            ),
          )}
        </span>
      ))}
    </span>
  );
}
