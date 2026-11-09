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
  "O.1": {
    title: "Before you begin",
    purpose: "",
    description: "A few things worth knowing about Entrepalooza, your choices, and your privacy.",
    teach: `You don't have to know who you want to become or what direction you want to take before you begin.

Entrepalooza is a place to get curious about yourself, explore your interests, strengths, and experiences, and discover what feels meaningful to you.

Through conversation, learning, and real-world experimentation, you'll have opportunities to try new things, challenge assumptions, and see familiar experiences from different perspectives.

What you discover along the way may surprise you, change your direction, or open possibilities you hadn't considered.

The goal isn't to tell you who you should be or what you should pursue. It's to help you develop the understanding, experience, and confidence to decide for yourself.

## A few things worth knowing

Entrepalooza is an evolving educational experience. There's no predetermined outcome or particular direction you're expected to take.

This isn't therapy or treatment, and participation doesn't guarantee a job, income, or business success.

You don't need to prove you're ready, share personal experiences, or turn your past into a particular kind of story.

## What stays yours

### Your experiences are yours to share—or not.

You decide what you're comfortable sharing. You can skip any question without explaining why. You don't need to disclose personal, medical, or legal information to participate.

### Your words belong to you.

What you write is saved in your account. Other participants can't see your private workbook or journal entries unless you choose to share them. Build Otherwise administrators manage the platform and may have access to information stored in it.

You can download or delete your workbook, journal, Life Map, and related reflections in Settings. My Records is managed separately.

### Your permission matters.

If we want to use something you've written, record a conversation, or contact you for a follow-up, we'll ask for your permission separately. Agreeing to one thing doesn't mean agreeing to everything.

### You can change your mind.

You can change direction, take a break, or leave whenever you choose. You don't owe anyone an explanation.

If you want to pause or leave the program, contact Start@buildotherwise.org.

### Need help?

You can type your responses or use the Dictate button to speak them.

Questions or concerns? Email Start@buildotherwise.org.`,
  },
  // M1-L3: a cached lesson row must not bring back an older title.
  "M1-L3": {
    title: "My Way Forward",
    description: "Choose how you might approach Module 2. You can leave any part open, change your mind, or decide not to continue.",
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
