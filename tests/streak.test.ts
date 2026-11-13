import { describe, expect, it } from "vitest";
import { addDays, todayIn } from "@/lib/dates";
import { nextReviewState } from "@/lib/srs";
import { buildHeatmap, computeStreaks, heatLevel, type DayActivity } from "@/lib/streak";

const day = (d: string, xp = 10): DayActivity => ({ day: d, xp, lessons: 1, reviews: 0, chats: 0 });

describe("dates", () => {
  it("uses the learner's time zone, not UTC", () => {
    // 20:00 UTC on the 12th is already the 13th in Seoul (UTC+9).
    const now = new Date("2026-11-12T20:00:00Z");
    expect(todayIn("Asia/Seoul", now)).toBe("2026-11-13");
    expect(todayIn("America/Los_Angeles", now)).toBe("2026-11-12");
  });
  it("adds days across month and year ends", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("computeStreaks", () => {
  const today = "2026-11-13";
  it("counts consecutive days ending today", () => {
    const s = computeStreaks([day("2026-11-11"), day("2026-11-12"), day(today)], today);
    expect(s).toEqual({ current: 3, longest: 3, doneToday: true });
  });
  it("keeps the streak alive until the end of today", () => {
    const s = computeStreaks([day("2026-11-11"), day("2026-11-12")], today);
    expect(s).toEqual({ current: 2, longest: 2, doneToday: false });
  });
  it("resets after a missed day but remembers the longest run", () => {
    const s = computeStreaks(
      [day("2026-11-01"), day("2026-11-02"), day("2026-11-03"), day("2026-11-05"), day(today)],
      today,
    );
    expect(s).toEqual({ current: 1, longest: 3, doneToday: true });
  });
  it("ignores days with no XP", () => {
    expect(computeStreaks([day(today, 0)], today).current).toBe(0);
  });
});

describe("heatmap", () => {
  it("maps XP to five levels relative to the goal", () => {
    expect([0, 5, 10, 20, 40].map((xp) => heatLevel(xp, 20))).toEqual([0, 1, 2, 3, 4]);
  });
  it("lays out full weeks ending in the current week", () => {
    const today = "2026-11-13"; // a Friday
    const map = buildHeatmap([day(today, 20)], today, 20, 53);
    expect(map.weeks).toHaveLength(53);
    expect(map.weeks.every((w) => w.length === 7)).toBe(true);
    const lastWeek = map.weeks.at(-1)!;
    expect(lastWeek[5]).toMatchObject({ day: today, level: 3, future: false });
    expect(lastWeek[6]!.future).toBe(true);
  });
});

describe("review scheduling", () => {
  const today = "2026-11-13";
  it("moves up a box and waits longer after a correct answer", () => {
    expect(nextReviewState(undefined, true, today)).toEqual({ box: 1, due: "2026-11-14" });
    expect(nextReviewState({ box: 2, due: today }, true, today)).toEqual({ box: 3, due: "2026-11-20" });
    expect(nextReviewState({ box: 5, due: today }, true, today).box).toBe(5);
  });
  it("drops to box 0 and is due today after a mistake", () => {
    expect(nextReviewState({ box: 4, due: today }, false, today)).toEqual({ box: 0, due: today });
  });
});
