/** POST /api/auth/logout: removes the session cookie. */
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { api } from "@/server/api";

export const POST = api(
  async () => {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  },
  { auth: false },
);
