import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages ship native/WASM files that must be loaded from
  // node_modules at runtime instead of being bundled by Next.js.
  //  - pg:      the Postgres driver used in production (Vercel Postgres / Neon)
  //  - pglite:  the embedded Postgres used when no DATABASE_URL is set (local dev)
  serverExternalPackages: ["pg", "@electric-sql/pglite"],

  // The embedded dev database is opened with a dynamic import, so Next's file
  // tracer does not see it. Nothing needs it in production (a real
  // DATABASE_URL is required there), so we keep it out of the deployed bundle.
  outputFileTracingExcludes: { "*": ["node_modules/@electric-sql/pglite/**"] },
};

export default nextConfig;
