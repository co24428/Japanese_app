"use client";
/**
 * Spoken Japanese using the browser's built-in text-to-speech
 * (the Web Speech API). It is free, works offline on most devices and needs
 * no API key. Quality depends on the device: phones and Macs are good.
 */
import { useEffect, useState } from "react";

function synth(): SpeechSynthesis | undefined {
  return typeof window === "undefined" ? undefined : window.speechSynthesis;
}

function japaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = synth()?.getVoices() ?? [];
  const japanese = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
  // Prefer a voice installed on the device over one that needs the network.
  return japanese.find((v) => v.localService) ?? japanese[0];
}

/** Says `text` in Japanese. `rate` 1 is normal speed, 0.6 is slow. */
export function speak(text: string, rate = 0.9): void {
  const s = synth();
  if (!s || !text) return;
  s.cancel(); // stop anything still playing
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = rate;
  const voice = japaneseVoice();
  if (voice) utterance.voice = voice;
  s.speak(utterance);
}

export function stopSpeaking(): void {
  synth()?.cancel();
}

export type VoiceStatus = "loading" | "ready" | "missing";

/**
 * Tells whether this device can speak Japanese. Browsers load their voice
 * list asynchronously, so the answer starts as "loading".
 */
export function useVoiceStatus(): VoiceStatus {
  const [status, setStatus] = useState<VoiceStatus>("loading");

  useEffect(() => {
    const s = synth();
    if (!s) {
      setStatus("missing");
      return;
    }
    const check = () => {
      if (japaneseVoice()) setStatus("ready");
      // An empty list usually means "not loaded yet", so keep waiting.
      else if (s.getVoices().length > 0) setStatus("missing");
    };
    check();
    s.addEventListener("voiceschanged", check);
    // Some browsers never fire the event: decide after a short wait.
    const timer = window.setTimeout(() => setStatus((v) => (v === "loading" ? "missing" : v)), 2500);
    return () => {
      s.removeEventListener("voiceschanged", check);
      window.clearTimeout(timer);
    };
  }, []);

  return status;
}
