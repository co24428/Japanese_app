/** /learn/new: describe a situation and let the AI write a lesson for it. */
import type { Metadata } from "next";
import Link from "next/link";
import { AiSetupNotice } from "@/components/AiSetupNotice";
import { getAiStatus } from "@/server/settings";
import { NewLessonForm } from "./NewLessonForm";

export const metadata: Metadata = { title: "Create a lesson" };

export default async function NewLessonPage() {
  const ai = await getAiStatus();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/learn" className="text-sm font-semibold text-primary">
          ← Learn
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold">Create a lesson</h1>
        <p className="mt-1 text-muted">
          Describe a situation you expect to be in. The AI writes a short dialogue and it becomes a normal lesson with
          exercises and reviews.
        </p>
      </header>
      {ai.ready ? <NewLessonForm /> : <AiSetupNotice />}
    </div>
  );
}
