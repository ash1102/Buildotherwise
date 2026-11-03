/**
 * Lesson text changes that are waiting on review, plus retired steps.
 *
 * Lesson text lives in the database, which branches share. So a change under
 * review is written here first: it shows on the review branch's preview and
 * nowhere else. When the branch merges, the same text is written to the Lesson
 * record and the entry is removed from PENDING_LESSON_CONTENT, so the database
 * stays the one source. Leaving an entry here after it is synced would hide any
 * later database edit to that lesson.
 *
 * History:
 * - Oct 22-23, 2026: Getting Started trimmed (O.1, O.4, O.5). Synced to the database; overrides removed.
 * - Oct 23, 2026: O.5 became "Make this experience yours" (learning agreement, drawn by LearningAgreement.jsx).
 *   Slot 1 (old join choice) is retired and blank. Synced to the database Oct 24; override removed.
 * - Oct 24, 2026: M1-L3 optional baseline question (answer slot M1-L3#4, shown again in the bridge into
 *   Module 4 and in M4-L1's optional sketch). Synced to the database; override removed.
 * - O.2 is retired from the app (folded into O.1). Its record stays in the database, unused.
 * - Oct 24, 2026: O.1 welcome text and title, and Module 2 lesson times (M2-L1 20, M2-L2 10, M2-L3 10 min),
 *   merged from module-2-interactive and synced to the database; overrides removed.
 *
 * Blank "" prompts keep old answer slots in place. A blank prompt is never shown.
 * Try and Reflect boxes share one numbering run, so new questions go at the END
 * of reflect_prompts, never into try_prompts, or earlier answers would move.
 */

export const RETIRED_GS_CODES = ["O.2"];

export const PENDING_LESSON_CONTENT = {
  "M1-L3": {
    title: "Choose a starting point",
    purpose: "Choose how you might approach Module 2. You can leave any part open, change your mind, or decide not to continue.",
  },
};

/** Apply pending lesson text and drop retired steps. Other lessons pass through untouched. */
export function applyGettingStartedContent(rows) {
  return (rows || [])
    .filter((lesson) => !lesson || !RETIRED_GS_CODES.includes(lesson.code))
    .map((lesson) => {
      const patch = lesson ? PENDING_LESSON_CONTENT[lesson.code] : null;
      return patch ? { ...lesson, ...patch } : lesson;
    });
}

/** Same, for a single lesson. A retired step comes back as null. */
export function applyGettingStartedContentOne(lesson) {
  if (!lesson) return lesson;
  if (RETIRED_GS_CODES.includes(lesson.code)) return null;
  const patch = PENDING_LESSON_CONTENT[lesson.code];
  return patch ? { ...lesson, ...patch } : lesson;
}
