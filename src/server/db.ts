/**
 * Database access. SERVER ONLY: never import this from a "use client" file.
 *
 * Two interchangeable backends that both speak Postgres SQL:
 *   - Production: a real Postgres (Vercel Postgres / Neon) through the `pg`
 *     driver, selected when DATABASE_URL (or POSTGRES_URL) is set.
 *   - Local development: PGlite, a Postgres that runs inside Node and stores
 *     its files in ./.data, so `npm run dev` works with no setup.
 *
 * Usage:
 *     const rows = await query<{ day: string }>("SELECT day::text FROM activity WHERE xp > $1", [0]);
 *
 * Tables are created automatically on first use (see SCHEMA below).
 */
import type { Pool } from "pg";

type Params = unknown[];

/** The minimal interface both backends provide. */
export interface Queryable {
  query<T = Record<string, unknown>>(text: string, params?: Params): Promise<T[]>;
}

interface Backend extends Queryable {
  /** Runs `fn` inside BEGIN ... COMMIT; rolls back if it throws. */
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
}

/**
 * The whole database schema. Every statement is idempotent ("IF NOT EXISTS"),
 * so it is safe to run on every cold start.
 *
 * To change the schema later, APPEND a statement, for example:
 *     "ALTER TABLE activity ADD COLUMN IF NOT EXISTS minutes int NOT NULL DEFAULT 0"
 * Do not edit an existing CREATE TABLE: it will not be re-applied to a
 * database that already has the table.
 */
const SCHEMA: string[] = [
  // Key/value store: display preferences, chosen AI provider/model, and the
  // encrypted API keys (see settings.ts).
  `CREATE TABLE IF NOT EXISTS settings (
     key        text PRIMARY KEY,
     value      text NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  // Lessons written by the AI. Built-in lessons live in src/lib/content.
  // `data` is a Lesson object as JSON.
  `CREATE TABLE IF NOT EXISTS lessons (
     id         text PRIMARY KEY,
     data       jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  // One row per lesson you have finished at least once.
  `CREATE TABLE IF NOT EXISTS lesson_progress (
     lesson_id         text PRIMARY KEY,
     completions       int NOT NULL DEFAULT 0,
     best_accuracy     int NOT NULL DEFAULT 0,
     last_completed_at timestamptz
   )`,
  // Review state of each phrase you have practised (see src/lib/srs.ts).
  `CREATE TABLE IF NOT EXISTS phrase_stats (
     phrase_id  text PRIMARY KEY,
     lesson_id  text NOT NULL,
     correct    int NOT NULL DEFAULT 0,
     wrong      int NOT NULL DEFAULT 0,
     box        int NOT NULL DEFAULT 0,
     due        date NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  // One row per day you studied: this is what the heatmap and streak read.
  `CREATE TABLE IF NOT EXISTS activity (
     day     date PRIMARY KEY,
     xp      int NOT NULL DEFAULT 0,
     lessons int NOT NULL DEFAULT 0,
     reviews int NOT NULL DEFAULT 0,
     chats   int NOT NULL DEFAULT 0
   )`,
  // Failed logins, used to slow down password guessing.
  `CREATE TABLE IF NOT EXISTS login_attempts (
     id bigserial PRIMARY KEY,
     at timestamptz NOT NULL DEFAULT now()
   )`,
  // Cache of AI explanations so the same phrase is never paid for twice.
  `CREATE TABLE IF NOT EXISTS explanations (
     phrase_key text PRIMARY KEY,
     data       jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

function connectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

async function createPgBackend(url: string): Promise<Backend> {
  const { Pool } = await import("pg");
  // Serverless functions can run many copies at once, so keep each pool small.
  // With Neon, use the "pooled" connection string.
  const pool: Pool = new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });

  // Take a lock while creating tables so that two cold starts at the same
  // moment do not race each other.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(727274)");
    for (const statement of SCHEMA) await client.query(statement);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  return {
    async query<T>(text: string, params: Params = []) {
      return (await pool.query(text, params)).rows as T[];
    },
    async transaction(fn) {
      const tx = await pool.connect();
      try {
        await tx.query("BEGIN");
        const result = await fn({
          async query<T>(text: string, params: Params = []) {
            return (await tx.query(text, params)).rows as T[];
          },
        });
        await tx.query("COMMIT");
        return result;
      } catch (error) {
        await tx.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        tx.release();
      }
    },
  };
}

async function createPgliteBackend(): Promise<Backend> {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. In production the app needs a Postgres database " +
        "(on Vercel: Storage -> Create Database -> Postgres, then redeploy).",
    );
  }
  const { mkdir } = await import("node:fs/promises");
  const { PGlite } = await import("@electric-sql/pglite");
  await mkdir(".data", { recursive: true });
  const db = new PGlite(".data/pglite");
  for (const statement of SCHEMA) await db.query(statement);
  console.log("[db] No DATABASE_URL set: using the embedded dev database in ./.data");

  return {
    async query<T>(text: string, params: Params = []) {
      return (await db.query(text, params)).rows as T[];
    },
    transaction(fn) {
      return db.transaction((tx) =>
        fn({
          async query<T>(text: string, params: Params = []) {
            return (await tx.query(text, params)).rows as T[];
          },
        }),
      );
    },
  };
}

// The backend is created once and reused. It is stored on `globalThis`
// because in development Next.js reloads modules on every edit, and we do
// not want a new connection pool each time.
const globalStore = globalThis as unknown as { __jpDb?: Promise<Backend> };

function backend(): Promise<Backend> {
  if (!globalStore.__jpDb) {
    const url = connectionString();
    const created = url ? createPgBackend(url) : createPgliteBackend();
    // If the first connection fails, forget it so the next request retries.
    created.catch(() => {
      globalStore.__jpDb = undefined;
    });
    globalStore.__jpDb = created;
  }
  return globalStore.__jpDb;
}

/** Runs one SQL statement and returns its rows. Use $1, $2 ... for values. */
export async function query<T = Record<string, unknown>>(text: string, params?: Params): Promise<T[]> {
  return (await backend()).query<T>(text, params);
}

/** Runs several statements as one all-or-nothing unit. */
export async function transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
  return (await backend()).transaction(fn);
}
