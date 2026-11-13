/**
 * Shared plumbing for API routes (src/app/api/**).
 *
 * Wrap a route in `api(...)` and it gets, in one place:
 *   - a login check (401 if the session cookie is missing or invalid)
 *   - a same-origin check on writes (blocks other websites from posting here)
 *   - JSON error responses: throw `new ApiError(400, "message")` anywhere
 *
 *     export const POST = api(async (request) => {
 *       const body = await readJson(request, schema);
 *       return { ok: true };            // plain objects become JSON responses
 *     });
 */
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** An error whose message is safe to show to the user. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** True if a state-changing request comes from this site's own pages. */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin GETs and non-browser clients send none
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

type RouteContext<P> = { params: Promise<P> };
type Handler<P> = (request: NextRequest, params: P) => Promise<Response | object>;

interface Options {
  /** Set to false for the login route, which runs before a session exists. */
  auth?: boolean;
}

export function api<P = Record<string, never>>(handler: Handler<P>, options: Options = {}) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<Response> => {
    try {
      if (request.method !== "GET" && !isSameOrigin(request)) {
        throw new ApiError(403, "Cross-site request blocked.");
      }
      if (options.auth !== false) {
        const token = request.cookies.get(SESSION_COOKIE)?.value;
        if (!(await verifySessionToken(token))) throw new ApiError(401, "Please log in again.");
      }
      const result = await handler(request, await context.params);
      return result instanceof Response ? result : NextResponse.json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      // Unexpected: log the details on the server, show a generic message.
      console.error(`[api] ${request.method} ${request.nextUrl.pathname} failed:`, error);
      return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
    }
  };
}

/** Parses the JSON body and validates it. Throws a 400 with a readable reason. */
export async function readJson<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, "Request body must be JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.join(".");
    throw new ApiError(400, `Invalid request${where ? ` (${where})` : ""}: ${issue?.message ?? "bad input"}`);
  }
  return parsed.data;
}
