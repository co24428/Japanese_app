/**
 * Tiny helper for calling this app's own API from the browser.
 *
 *     const { prefs } = await callApi<{ prefs: Prefs }>("/api/settings", "PATCH", { showRomaji: false });
 *
 * On failure it throws an Error whose message is the server's `error` text,
 * ready to show to the user.
 */
export async function callApi<T = unknown>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No connection. Check your internet and try again.");
  }

  // Session expired: go back to the login page.
  if (response.status === 401 && !url.startsWith("/api/auth/")) {
    window.location.href = "/login";
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data as T;
}
