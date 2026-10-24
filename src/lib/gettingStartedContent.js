/**
 * Getting Started, trimmed (Oct 22, 2026): three short steps instead of four.
 *
 * - O.1 now covers what this is AND what stays private (O.2 folded in).
 * - O.2 is retired from the app. Its record stays in the database, unused.
 * - O.4 is a few optional lines, private to the participant. Nothing is sent. The whole step is optional.
 * - O.5 is only the choice to join. The decision words move to the lessons that use them.
 *   (Oct 23, 2026) O.5 is now "Make this experience yours": a learning agreement
 *   (why I'm here, my approach, an optional note, a permission line, a copy button).
 *   The old join-choice slot (1) is retired and left blank.
 *
 * These fields replace the Lesson records' fields for these codes wherever the
 * curriculum is loaded, so the change can be reviewed on a branch before it
 * goes live. When this is merged, the same text is written to the Lesson
 * records so the database and the app agree.
 *
 * Blank "" prompts keep old answer slots in place. A blank prompt is never
 * shown, so an earlier answer never lands under a different question.
 */

export const RETIRED_GS_CODES = ["O.2"];

export const GETTING_STARTED_CONTENT = {
  "O.1": {
    title: "What this is, and what stays private",
    purpose: "Know what this is, what it isn’t, and what stays yours, before you decide anything.",
    teach:
      "This is a structured way to notice, try something small, reflect on what happened, and decide what’s next. A job, training, a project, a business, a pause, or still looking all count as finishing.\n\n" +
      "It is not therapy or treatment. It is not a promise of a job, income, or business success. It is not a test of whether you’re ready. You don’t have to tell your story.\n\n" +
      "What you write stays in your account. Other participants can’t see it. You can skip any question without giving a reason. You can download or delete what you’ve written in Settings. You will never be asked for medical, legal, or personal history to take part. If we ever ask to use your words, record something, or follow up later, each one gets its own yes or no.\n\n" +
      "Type in any box, or tap Dictate and talk like you’re telling a friend. Questions or concerns: Start@buildotherwise.org.",
    show: null,
    try_prompts: ["", "", ""],
    // Slot 3 held "Anything you want to ask before you start?" (retired Oct 23: nobody reads it). O.1 ends with a Let me in tap.
    reflect_prompts: [""],
    what_comes_out: null,
    duration_min: 5,
  },
  "O.4": {
    title: "What makes it work for you",
    purpose: "Optional. A few lines so taking part fits your life.",
    teach:
      "This step is optional. Fill it in now, later, or not at all. It doesn’t hold anything up.\n\n" +
      "Fill in what’s useful. Leave the rest blank. “None” and “I don’t know yet” are complete answers.\n\n" +
      "This stays private in your workbook. If you want Ashley to know something, email Start@buildotherwise.org.",
    show: "**Example:** “Phone only, limited data. I work Saturdays. No extra support for now.”",
    try_prompts: [
      "",
      "",
      "How you’d like to take part (for example: writing, voice, mostly reading first)",
      "Anything that makes it harder to show up (time, phone or data, access, other)",
      "Support you’d want, or “none for now”",
    ],
    reflect_prompts: [],
    what_comes_out: null,
    duration_min: 3,
  },
  "O.5": {
    title: "Make this experience yours",
    purpose:
      "Entrepalooza isn’t about following someone else’s plan. It’s about exploring what matters to you, trying new things, and deciding what to do with what you discover.",
    teach:
      "You don’t need to know your destination yet.\n\n" +
      "This is yours. You can change your answers anytime. To pause or leave, email Start@buildotherwise.org. No reason needed.",
    show: null,
    // Slot 1 was the old join choice (retired). Slots 2–4 are the learning agreement, drawn by LearningAgreement.
    try_prompts: ["", "", "What brings you here?", "How do you want to approach this?", "Anything else you want to remember about why you’re starting? (Optional)"],
    reflect_prompts: [],
    what_comes_out: null,
    duration_min: 2,
  },
};

/** Apply the trimmed Getting Started text and drop retired steps. Other lessons pass through untouched. */
export function applyGettingStartedContent(rows) {
  return (rows || [])
    .filter((lesson) => !lesson || !RETIRED_GS_CODES.includes(lesson.code))
    .map((lesson) => {
      const patch = lesson ? GETTING_STARTED_CONTENT[lesson.code] : null;
      return patch ? { ...lesson, ...patch } : lesson;
    });
}

/** Same, for a single lesson. A retired step comes back as null. */
export function applyGettingStartedContentOne(lesson) {
  if (!lesson) return lesson;
  if (RETIRED_GS_CODES.includes(lesson.code)) return null;
  const patch = GETTING_STARTED_CONTENT[lesson.code];
  return patch ? { ...lesson, ...patch } : lesson;
}
