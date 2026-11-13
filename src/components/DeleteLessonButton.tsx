"use client";
/** Trash button next to an AI-generated lesson on the Learn page. */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi } from "@/lib/client/fetch";
import { TrashIcon } from "./icons";

export function DeleteLessonButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete the lesson "${title}"? Its progress is deleted too.`)) return;
    setBusy(true);
    try {
      await callApi(`/api/lessons/${id}`, "DELETE");
      router.refresh(); // reload the list from the server
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not delete the lesson.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={`Delete lesson ${title}`}
      className="mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-bad-soft hover:text-bad disabled:opacity-40"
    >
      <TrashIcon className="size-5" />
    </button>
  );
}
