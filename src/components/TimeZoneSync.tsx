"use client";
/**
 * Tells the server which time zone this device is in, by storing it in a
 * cookie. The server uses it to decide what "today" is for your streak
 * (see src/server/today.ts). Renders nothing.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function TimeZoneSync({ serverTimeZone }: { serverTimeZone: string }) {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === serverTimeZone) return;
    document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    // Re-render server components with the right day.
    router.refresh();
  }, [router, serverTimeZone]);

  return null;
}
