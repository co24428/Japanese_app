/** /talk: role-play conversations with the AI. */
import type { Metadata } from "next";
import { AiSetupNotice } from "@/components/AiSetupNotice";
import { getAiStatus } from "@/server/settings";
import { TalkClient } from "./TalkClient";

export const metadata: Metadata = { title: "Talk" };

export default async function TalkPage() {
  const ai = await getAiStatus();
  if (ai.ready) return <TalkClient />;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">Talk</h1>
        <p className="mt-1 text-muted">Practise real conversations. The AI plays the other person and corrects you.</p>
      </header>
      <AiSetupNotice />
    </div>
  );
}
