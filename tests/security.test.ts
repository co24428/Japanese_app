import { beforeAll, describe, expect, it } from "vitest";
import { createSessionToken, isCorrectPassword, verifySessionToken } from "@/lib/auth";
import { decryptSecret, encryptSecret } from "@/server/crypto";

beforeAll(() => {
  process.env.APP_PASSWORD = "correct horse";
  process.env.APP_SECRET = "test-secret";
});

describe("session cookie", () => {
  it("accepts a token it issued", async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });
  it("rejects missing, tampered and expired tokens", async () => {
    const token = await createSessionToken();
    const [expires, signature] = token.split(".");
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("garbage")).toBe(false);
    // Pushing the expiry later without re-signing must not work.
    expect(await verifySessionToken(`${Number(expires) + 1000}.${signature}`)).toBe(false);
    expect(await verifySessionToken(token, Date.now() + 91 * 24 * 60 * 60 * 1000)).toBe(false);
  });
  it("is invalidated when the password changes", async () => {
    const token = await createSessionToken();
    process.env.APP_PASSWORD = "new password";
    expect(await verifySessionToken(token)).toBe(false);
    process.env.APP_PASSWORD = "correct horse";
  });
});

describe("password check", () => {
  it("accepts only the exact password", async () => {
    expect(await isCorrectPassword("correct horse")).toBe(true);
    expect(await isCorrectPassword("correct hors")).toBe(false);
    expect(await isCorrectPassword("")).toBe(false);
  });
});

describe("API key encryption", () => {
  it("round-trips and never stores the plain text", () => {
    const stored = encryptSecret("sk-ant-example-1234");
    expect(stored).not.toContain("sk-ant");
    expect(decryptSecret(stored)).toBe("sk-ant-example-1234");
  });
  it("produces a different ciphertext each time", () => {
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });
  it("returns null for tampered data or a different secret", () => {
    const stored = encryptSecret("secret-key");
    expect(decryptSecret(stored.slice(0, -4) + "AAAA")).toBeNull();
    process.env.APP_SECRET = "another-secret";
    expect(decryptSecret(stored)).toBeNull();
    process.env.APP_SECRET = "test-secret";
  });
});
