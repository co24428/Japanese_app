/**
 * Spaced repetition ("review") scheduling.
 *
 * Each phrase you have practised sits in a box from 0 to 5 (a Leitner system):
 *   - answer correctly  -> it moves up one box and comes back later
 *   - answer wrongly    -> it drops to box 0 and is due again today
 * The higher the box, the longer the wait before the phrase is due again.
 */
import { addDays } from "./dates";

/** Days to wait before the next review, indexed by box number. */
export const BOX_INTERVALS = [0, 1, 3, 7, 14, 30] as const;
export const MAX_BOX = BOX_INTERVALS.length - 1;

/** A phrase in box 4 or higher is counted as "learned" on the Home page. */
export const LEARNED_BOX = 4;

export interface ReviewState {
  box: number;
  /** Day ("YYYY-MM-DD") on which the phrase should be reviewed again. */
  due: string;
}

/** `previous` is undefined the first time a phrase is practised. */
export function nextReviewState(
  previous: ReviewState | undefined,
  correct: boolean,
  today: string,
): ReviewState {
  if (!correct) return { box: 0, due: today };
  const box = Math.min((previous?.box ?? 0) + 1, MAX_BOX);
  return { box, due: addDays(today, BOX_INTERVALS[box]!) };
}
