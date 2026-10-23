/**
 * Getting Started, trimmed (Oct 22, 2026): three short steps instead of four.
 *
 * - O.1 now covers what this is AND what stays private (O.2 folded in).
 * - O.2 is retired from the app. Its record stays in the database, unused.
 * - O.4 is a few optional lines, private to the participant. Nothing is sent. The whole step is optional.
 * - O.5 is only the choice to join. The decision words move to the lessons that use them.
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
      "What you write stays in your account. Other participants can’t see it. Ashley, who runs the program, can technically access what’s stored, but doesn’t read it unless you share it. You can skip any question without giving a reason. You can download or delete what you’ve written in Settings. You will never be asked for medical, legal, or personal history to take part. If we ever ask to use your words, record something, or follow up later, each one gets its own yes or no.\n\n" +
      "Type in any box, or use the Dictate button beside it. Questions or concerns: Start@buildotherwise.org.",
    show: null,
    try_prompts: ["", "", ""],
    reflect_prompts: ["Anything you want to ask before you start? “Nothing” counts."],
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
    duration_min: 3,
  },
  "O.5": {
    title: "Your choice to join",
    purpose: "Decide freely whether and how to take part.",
    teach:
      "Pick what fits right now. It can change later. To change it, pause, or leave, email Start@buildotherwise.org. No reason needed.",
    show: null,
    try_prompts: ["", "Your choice to join."],
    reflect_prompts: [],
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
