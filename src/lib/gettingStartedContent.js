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
 *
 * Blank "" prompts keep old answer slots in place. A blank prompt is never shown.
 * Try and Reflect boxes share one numbering run, so new questions go at the END
 * of reflect_prompts, never into try_prompts, or earlier answers would move.
 */

export const RETIRED_GS_CODES = ["O.2"];

/**
 * Oct 24, 2026, review branch module-1-interactive: O.1 becomes the brief welcome.
 * Every privacy and rights sentence from the current O.1 record is kept word for word.
 * Added: the welcome points from Ashley's Module 1 Interactive Redesign spec (section 5),
 * and the pause/leave line already used on O.5. Sync to the database on merge, then remove.
 */
export const PENDING_LESSON_CONTENT = {
  "O.1": {
    title: "Welcome: what this is, and what stays private",
    duration_min: 5,
    teach: [
      "## Welcome",
      "Entrepalooza helps you explore interests and possibilities through learning, conversation, and small real-world experiences. You don’t need to know your direction before you begin.",
      "Entrepreneurship is one possible direction. It isn’t a required destination.",
      "## What this is, and isn’t",
      "This is a structured way to notice, try something small, reflect on what happened, and decide what’s next. A job, training, a project, a business, a pause, or still looking all count as finishing.",
      "It is not therapy or treatment. It is not a promise of a job, income, or business success. It is not a test of whether you’re ready. You don’t have to tell your story.",
      "## What stays yours",
      "You decide what to share. What you write stays in your account. Other participants can’t see it, and your private journal isn’t shared unless you choose to share it. You can skip any question without giving a reason. You can download or delete what you’ve written in Settings. You will never be asked for medical, legal, or personal history to take part. If we ever ask to use your words, record something, or follow up later, each one gets its own yes or no.",
      "You can change direction, pause, or stop at any time. To pause or leave, email Start@buildotherwise.org. No reason needed.",
      "Type in any box, or tap Dictate and talk like you’re telling a friend. Questions or concerns: Start@buildotherwise.org.",
    ].join("\n\n"),
  },
  // Oct 24, 2026, module-2-interactive: time estimates for the interactive Module 2 lessons
  // (screen time only; the real-world try in M2-L2 happens outside the workbook).
  "M2-L1": { duration_min: 20 },
  "M2-L2": { duration_min: 10 },
  "M2-L3": { duration_min: 10 },
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
