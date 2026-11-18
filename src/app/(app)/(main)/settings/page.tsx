/** /settings: AI keys and models, display preferences, log out. */
import type { Metadata } from "next";
import { PageTransition } from "@/components/PageTransition";
import { getAiStatus, getPrefs } from "@/server/settings";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [prefs, ai] = await Promise.all([getPrefs(), getAiStatus()]);
  return (
    <PageTransition>
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">Settings</h1>
      </header>
      <SettingsClient initialPrefs={prefs} initialAi={ai} />
    </div>
    </PageTransition>
  );
}
