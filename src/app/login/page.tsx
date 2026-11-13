/** /login: the only page you can see without being logged in. */
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only allow redirects to paths inside this site ("/learn"), never to
  // another website ("//evil.com" or "https://...").
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <p lang="ja" className="text-5xl font-black tracking-tight">
          日本語
        </p>
        <h1 className="mt-3 text-xl font-bold">Nihongo Daily</h1>
        <p className="mt-1 text-muted">Everyday Japanese, a little every day.</p>
      </div>
      <LoginForm next={safeNext} />
    </main>
  );
}
