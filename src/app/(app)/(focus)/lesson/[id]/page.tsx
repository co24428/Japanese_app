/**
 * /lesson/:id: plays one lesson.
 * The server builds the exercise list (fresh and shuffled on every visit)
 * and hands it to the LessonPlayer, which runs in the browser.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { lessonPhrases, type Phrase } from "@/lib/content/types";
import { buildLessonSession, referencedPhraseIds, seededRng } from "@/lib/exercises";
import { getAllPhrases, getLesson } from "@/server/lessons";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await getLesson((await params).id);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const lesson = await getLesson((await params).id);
  if (!lesson) notFound();

  const phrases = lessonPhrases(lesson);
  // Phrases from other lessons serve as wrong options in multiple choice.
  const pool = (await getAllPhrases()).filter((p) => p.lessonId !== lesson.id);
  const exercises = buildLessonSession(phrases, pool, seededRng(Date.now()));

  // Send only the phrases this session actually uses.
  const used = referencedPhraseIds(exercises);
  const lookup: Record<string, Phrase> = {};
  for (const p of [...phrases, ...pool]) if (used.has(p.id)) lookup[p.id] = p;

  return (
    <LessonPlayer mode="lesson" lessonId={lesson.id} title={lesson.title} exercises={exercises} phrases={lookup} exitHref="/learn" />
  );
}
