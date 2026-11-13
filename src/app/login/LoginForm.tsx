"use client";
import { useState } from "react";
import { callApi } from "@/lib/client/fetch";

export function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await callApi("/api/auth/login", "POST", { password });
      // A full page load (not a client-side navigation) so that every
      // server component renders with the new session cookie.
      window.location.href = next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log in.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !password} className="btn-primary w-full">
        {busy ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
