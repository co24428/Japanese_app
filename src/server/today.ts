/**
 * "What day is it for the learner?"
 *
 * The server runs in UTC, but your streak should follow your own clock. The
 * browser stores its time zone in a `tz` cookie (see
 * src/components/TimeZoneSync.tsx) and the server reads it here.
 */
import { cookies } from "next/headers";
import { DEFAULT_TIME_ZONE, isValidTimeZone, todayIn } from "@/lib/dates";

export const TIME_ZONE_COOKIE = "tz";

export async function getTimeZone(): Promise<string> {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  const tz = value ? decodeURIComponent(value) : "";
  return tz && isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE;
}

/** Today's date ("YYYY-MM-DD") in the learner's time zone. */
export async function getToday(): Promise<string> {
  return todayIn(await getTimeZone());
}
