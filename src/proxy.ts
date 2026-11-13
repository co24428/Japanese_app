/**
 * Runs before every request (Next.js 16 calls this file "proxy"; older
 * versions called it "middleware").
 *
 * It is the front door: anyone without a valid session cookie is sent to
 * /login (pages) or gets a 401 (API). Pages and API routes also check the
 * session themselves, so this is the first line of defence, not the only one.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** Paths that must work without being logged in. */
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC_PATHS.includes(pathname)) {
    // Already logged in? Skip the login page.
    if (loggedIn && pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (loggedIn) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  // Remember where the visitor was going so login can send them back.
  if (pathname !== "/") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  // Run on everything except Next.js build files and the app icons/manifest,
  // which the browser must be able to load on the login page.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest).*)"],
};
