/**
 * Login session, shared by the proxy (src/proxy.ts) and the API routes.
 *
 * The app has exactly one user, so there is no user table. Logging in with
 * the right password (APP_PASSWORD) gives the browser a signed cookie:
 *
 *     <expiry time in ms>.<HMAC signature of that expiry>
 *
 * The signature is made with APP_SECRET + APP_PASSWORD, so nobody can forge
 * a cookie without knowing them, and changing either one logs everyone out.
 * Nothing is stored on the server.
 *
 * Only the Web Crypto API is used here so the file runs anywhere Next.js
 * runs server code.
 */

export const SESSION_COOKIE = "jp_session";
export const SESSION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 days

interface AuthConfig {
  password: string;
  secret: string;
}

/**
 * Reads the password and secret from the environment.
 * In production both are required. In development, missing values fall back
 * to the password "dev" so the app runs straight after cloning.
 */
export function getAuthConfig(): AuthConfig {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.APP_SECRET;
  if (password && secret) return { password, secret };

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_PASSWORD and APP_SECRET must be set. See .env.example.");
  }
  return { password: password || "dev", secret: secret || "dev-only-secret-do-not-use-in-production" };
}

const encoder = new TextEncoder();

async function signingKey(): Promise<CryptoKey> {
  const { password, secret } = getAuthConfig();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`${secret}\n${password}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(message: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares two strings without leaking, through timing, where they differ. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Creates the cookie value for a fresh login. */
export async function createSessionToken(now = Date.now()): Promise<string> {
  const expires = now + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expires}.${await sign(`session:${expires}`)}`;
}

/** True if the cookie value is one we issued and it has not expired. */
export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < now) return false;
  try {
    return constantTimeEqual(signature, await sign(`session:${expires}`));
  } catch {
    return false; // missing configuration: treat as not logged in
  }
}

/** Checks a typed password against APP_PASSWORD. */
export async function isCorrectPassword(input: string): Promise<boolean> {
  const { password } = getAuthConfig();
  // Sign both sides first: the comparison then takes the same time whatever
  // the input length or content.
  const [a, b] = await Promise.all([sign(`password:${input}`), sign(`password:${password}`)]);
  return constantTimeEqual(a, b);
}
