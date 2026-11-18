"use client";
/**
 * Short interface sounds (correct, wrong, lesson complete, tap), generated
 * with the Web Audio API: no audio files to download.
 *
 * They play only when "Sound effects" is on in Settings; components pass
 * the preference in. Browsers only allow audio after the user has touched
 * the page, which is always the case when these are called.
 */

let context: AudioContext | undefined;

function audio(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  context ??= new AudioContext();
  // Mobile browsers start the context "suspended" until a user gesture.
  if (context.state === "suspended") void context.resume();
  return context;
}

/**
 * Plays one soft tone.
 * @param frequency pitch in Hz
 * @param start     seconds from now
 * @param duration  seconds
 */
function tone(frequency: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.18) {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  // A quick fade in and a smooth fade out avoid clicks.
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export type SoundName = "correct" | "wrong" | "complete" | "tap";

const SOUNDS: Record<SoundName, () => void> = {
  // Two rising notes: a bright "ding-ding".
  correct: () => {
    tone(880, 0, 0.18, "triangle");
    tone(1318.5, 0.09, 0.28, "triangle");
  },
  // A low, short double buzz.
  wrong: () => {
    tone(220, 0, 0.16, "square", 0.07);
    tone(196, 0.13, 0.22, "square", 0.07);
  },
  // A rising major chord, one note after another.
  complete: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.45, "triangle", 0.15));
  },
  // A tiny tick for tile taps.
  tap: () => tone(660, 0, 0.06, "sine", 0.08),
};

/** Plays a sound if `enabled` (the "Sound effects" preference) is true. */
export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled) return;
  try {
    SOUNDS[name]();
  } catch {
    // Audio is a nice-to-have: never let it break the lesson.
  }
}

/** A short vibration on phones that support it (Android). */
export function buzz(enabled: boolean): void {
  if (enabled && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(60);
}
