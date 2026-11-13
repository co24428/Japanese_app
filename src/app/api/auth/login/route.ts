/**
 * POST /api/auth/login   { password }
 * Checks the password and sets the session cookie.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken, isCorrectPassword } from "@/lib/auth";
import { ApiError, api, readJson } from "@/server/api";
import { query } from "@/server/db";

const bodySchema = z.object({ password: z.string().min(1).max(200) });

/** After this many wrong passwords within the window, logins are paused. */
const MAX_FAILURES = 8;
const WINDOW_MINUTES = 15;

export const POST = api(
  async (request) => {
    const { password } = await readJson(request, bodySchema);

    // Slow down password guessing. The counter is global because the app has
    // a single account; it resets by itself as old attempts age out.
    const [recent] = await query<{ failures: number }>(
      `SELECT count(*)::int AS failures FROM login_attempts
       WHERE at > now() - make_interval(mins => $1)`,
      [WINDOW_MINUTES],
    );
    if ((recent?.failures ?? 0) >= MAX_FAILURES) {
      throw new ApiError(429, `Too many wrong passwords. Try again in ${WINDOW_MINUTES} minutes.`);
    }

    if (!(await isCorrectPassword(password))) {
      await query("INSERT INTO login_attempts DEFAULT VALUES");
      throw new ApiError(401, "Wrong password.");
    }

    // Success: clear the failure history and hand out the cookie.
    await query("DELETE FROM login_attempts");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true, // not readable by page scripts
      secure: process.env.NODE_ENV === "production", // HTTPS only when deployed
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  },
  { auth: false },
);
