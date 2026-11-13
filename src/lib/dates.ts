/**
 * Calendar-day helpers.
 *
 * A "day" in this app is a plain string like "2026-11-13" in the LEARNER'S
 * time zone (not the server's, which runs in UTC). That is what makes the
 * streak and the heatmap line up with your real days.
 */

/** Used when the browser has not told us its time zone yet. */
export const DEFAULT_TIME_ZONE = "Asia/Seoul";

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Today's date ("YYYY-MM-DD") in the given time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  // The "en-CA" locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Parses "YYYY-MM-DD" as midnight UTC, which is safe for day arithmetic. */
function toUtc(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/** Adds (or subtracts) whole days: addDays("2026-01-31", 1) -> "2026-02-01". */
export function addDays(day: string, n: number): string {
  const d = toUtc(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday. */
export function weekday(day: string): number {
  return toUtc(day).getUTCDay();
}

/** Month number 0-11. */
export function monthOf(day: string): number {
  return toUtc(day).getUTCMonth();
}
