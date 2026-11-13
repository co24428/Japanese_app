/**
 * Encryption for secrets stored in the database (your AI API keys).
 *
 * Keys are encrypted with AES-256-GCM using a key derived from APP_SECRET.
 * Someone who gets a copy of the database but not the server's environment
 * variables cannot read them.
 *
 * Stored format:  v1:<iv>:<auth tag>:<ciphertext>   (each part base64)
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { getAuthConfig } from "@/lib/auth";

let cachedKey: { secret: string; key: Buffer } | undefined;

function encryptionKey(): Buffer {
  const { secret } = getAuthConfig();
  // scrypt is deliberately slow, so derive the key once per process.
  if (cachedKey?.secret !== secret) {
    cachedKey = { secret, key: scryptSync(secret, "japanese-app:api-keys:v1", 32) };
  }
  return cachedKey.key;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12); // a fresh random IV for every encryption
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

/**
 * Returns the original text, or null if it cannot be decrypted (for example
 * because APP_SECRET was changed after the key was saved).
 */
export function decryptSecret(stored: string): string | null {
  const [version, iv, tag, data] = stored.split(":");
  if (version !== "v1" || !iv || !tag || !data) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
