/**
 * How much XP each activity is worth. One place to tune the game balance.
 * The daily goal (default 20 XP) is roughly "one lesson plus a short review".
 */
export const XP = {
  /** Finishing a lesson. */
  lesson: 10,
  /** Extra for finishing a lesson with no mistakes. */
  perfectLessonBonus: 5,
  /** Per phrase answered in a review session. */
  reviewPhrase: 1,
  /** Minimum for finishing any review session. */
  reviewMinimum: 5,
  /** Finishing a kana quiz. */
  kanaQuiz: 5,
  /** Per message you send in a role-play conversation. */
  chatMessage: 2,
} as const;

export const DEFAULT_DAILY_GOAL = 20;
