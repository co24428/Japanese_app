/**
 * Streak and heatmap maths (pure functions, tested in tests/streak.test.ts).
 */
import { addDays, monthOf, weekday } from "./dates";

/** What was done on one day. Mirrors a row of the `activity` table. */
export interface DayActivity {
  day: string; // "YYYY-MM-DD"
  xp: number;
  lessons: number;
  reviews: number;
  chats: number;
}

export interface Streaks {
  /** Days in a row up to today (or yesterday, if today is not done yet). */
  current: number;
  longest: number;
  /** Whether something was done today. */
  doneToday: boolean;
}

/** A day counts as "done" when any XP was earned on it. */
export function computeStreaks(activity: DayActivity[], today: string): Streaks {
  const active = new Set(activity.filter((a) => a.xp > 0).map((a) => a.day));
  const doneToday = active.has(today);

  // Current streak: walk backwards from today. If today is not done yet the
  // streak is still alive as long as yesterday was done.
  let current = 0;
  let cursor = doneToday ? today : addDays(today, -1);
  while (active.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Longest streak: a run starts on any active day whose previous day is not active.
  let longest = 0;
  for (const day of active) {
    if (active.has(addDays(day, -1))) continue;
    let length = 1;
    while (active.has(addDays(day, length))) length++;
    longest = Math.max(longest, length);
  }

  return { current, longest, doneToday };
}

/**
 * Colour intensity of a heatmap square, 0 (nothing) to 4 (a lot),
 * relative to the daily XP goal.
 */
export function heatLevel(xp: number, dailyGoal: number): 0 | 1 | 2 | 3 | 4 {
  if (xp <= 0) return 0;
  if (xp < dailyGoal / 2) return 1;
  if (xp < dailyGoal) return 2;
  if (xp < dailyGoal * 2) return 3;
  return 4;
}

export interface HeatCell {
  day: string;
  xp: number;
  level: 0 | 1 | 2 | 3 | 4;
  /** Days after today are drawn empty and are not clickable. */
  future: boolean;
}

export interface Heatmap {
  /** Columns = weeks (oldest first). Each week has 7 cells, Sunday first. */
  weeks: HeatCell[][];
  /** Month label for each column: set on the first week of each month. */
  monthLabels: (string | null)[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Lays out the last `weekCount` weeks like GitHub's contribution graph. */
export function buildHeatmap(
  activity: DayActivity[],
  today: string,
  dailyGoal: number,
  weekCount = 53,
): Heatmap {
  const xpByDay = new Map(activity.map((a) => [a.day, a.xp]));
  // The last column is the current week; find its Sunday, then go back.
  const lastSunday = addDays(today, -weekday(today));
  const firstSunday = addDays(lastSunday, -7 * (weekCount - 1));

  const weeks: HeatCell[][] = [];
  const monthLabels: (string | null)[] = [];
  let previousMonth = -1;

  for (let w = 0; w < weekCount; w++) {
    const sunday = addDays(firstSunday, w * 7);
    const week: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(sunday, d);
      const xp = xpByDay.get(day) ?? 0;
      week.push({ day, xp, level: heatLevel(xp, dailyGoal), future: day > today });
    }
    weeks.push(week);

    const month = monthOf(sunday);
    monthLabels.push(month !== previousMonth ? MONTHS[month]! : null);
    previousMonth = month;
  }
  return { weeks, monthLabels };
}
