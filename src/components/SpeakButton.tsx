"use client";
/** Round button that reads a Japanese sentence aloud. */
import { plainText } from "@/lib/japanese";
import { speak } from "@/lib/client/speech";
import { SpeakerIcon } from "./icons";
import { usePrefs } from "./PrefsProvider";

interface Props {
  /** Japanese markup to read. */
  markup: string;
  size?: "sm" | "md" | "lg";
  /** Read slowly (for the "slow" button in listening exercises). */
  slow?: boolean;
  label?: string;
  className?: string;
}

const SIZES = {
  sm: "size-9 [&_svg]:size-4.5",
  md: "size-11 [&_svg]:size-5.5",
  lg: "size-24 [&_svg]:size-11",
};

export function SpeakButton({ markup, size = "md", slow, label, className = "" }: Props) {
  const { speechRate } = usePrefs();
  return (
    <button
      type="button"
      onClick={() => speak(plainText(markup), slow ? 0.6 : speechRate)}
      aria-label={label ?? (slow ? "Play slowly" : "Play audio")}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-soft text-primary transition-transform active:scale-90 ${SIZES[size]} ${className}`}
    >
      {slow ? <span className="text-xs font-bold">0.6×</span> : <SpeakerIcon />}
    </button>
  );
}
