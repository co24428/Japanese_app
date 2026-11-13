/** Shown on AI pages when no API key has been saved yet. */
import Link from "next/link";

export function AiSetupNotice() {
  return (
    <div className="card border-dashed text-center">
      <p className="text-4xl" aria-hidden="true">🔑</p>
      <h2 className="mt-2 text-lg font-bold">Add an AI key first</h2>
      <p className="mx-auto mt-1 max-w-sm text-muted">
        This feature uses your own Claude or Gemini API key. It is stored encrypted on the server.
      </p>
      <Link href="/settings" className="btn-primary mt-4">
        Open Settings
      </Link>
    </div>
  );
}
