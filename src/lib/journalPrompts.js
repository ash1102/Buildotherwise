import { answerKey } from "./workbook";

/**
 * Conversation Journal: Go Deeper (review branch "journal-go-deeper", Oct 24, 2026).
 *
 * One reflection section per lesson in Modules 1–4. Primary prompts and follow-ups are
 * Ashley's approved wording. Anything marked DRAFT (Claude) is a small addition for review.
 *
 * STORAGE. Reuses the existing journal, nothing new:
 *   answers   `<code>#go-deeper`  (workbook answers store, synced to the account)
 *   journal   one lesson entry per lesson, prompt key `<code>#go-deeper`, upserted by
 *             saveAnswer, so revisiting or editing never adds a duplicate. Edits and
 *             revisions made on the Journal page are read back here (latest entry wins).
 * The answer is not part of lesson completion: progress tracking is unchanged.
 */

export const GO_DEEPER_KEY = "go-deeper";

export const JOURNAL_INTRO =
  "You don't have to answer every question. Start wherever something catches your attention. You can explore a memory, question an assumption, disagree with an idea, or follow a thought somewhere unexpected.";

const NOT_TRIED_M2 = ["I haven’t tried it yet.", "I ran into a barrier."];

export const GO_DEEPER = {
  "M1-L1": {
    primary: "What catches your attention, and what do you think draws you toward it? Have you noticed similar interests or patterns elsewhere in your life?",
    followUps: [
      "Can you remember an earlier experience that connects to this interest?",
      "What feels interesting about it, even if you don't know why?",
      "Is there something you've been curious about but haven't had the chance to explore?",
    ],
  },
  "M1-L2": {
    primary: "When have you felt genuinely interested in something? How did that interest develop, change, or disappear?",
    followUps: [
      "Did your interest grow through experience, or was it immediate?",
      "Have you ever lost interest in something you once enjoyed?",
      "What does that suggest about the way your interests can change?",
    ],
  },
  "M1-L3": {
    primary: "What have past experiences taught you about how you learn, what helps you participate, and what makes learning difficult?",
    followUps: [
      "When have you felt comfortable exploring something unfamiliar?",
      "What kinds of support or freedom have helped you learn?",
      "What might you want to approach differently this time?",
    ],
  },
  "M2-L1": {
    primary: "Why does this possibility interest you? Does it connect to something you've experienced, wanted, avoided, or wondered about?",
    followUps: [
      "What first brought this possibility to your attention?",
      "What assumptions do you already have about it?",
      "Is there something you hope to understand about yourself through exploring it?",
    ],
  },
  "M2-L2": {
    primary: "What did you notice about yourself during the experience—not just what happened, but how you responded?",
    followUps: [
      "Did your reactions surprise you?",
      "What did you find yourself drawn toward or pulling away from?",
      "Did anything remind you of how you've approached other experiences?",
    ],
    /** Not tried yet, or a barrier: the prompt follows what actually happened. DRAFT (Claude) wording. */
    adapt(answers) {
      const outcome = String((answers || {})[answerKey("M2-L2", "outcome")] || "").trim();
      if (!NOT_TRIED_M2.includes(outcome)) return null;
      return {
        primary: "What did you notice about yourself while planning, trying to get started, or running into barriers—not just what happened, but how you responded?",
        followUps: [
          "Did any of your reactions surprise you?",
          "What did you find yourself drawn toward or pulling away from?",
          "Did anything remind you of how you've approached other experiences?",
        ],
        note: "You don’t need to have completed your exploration to write here.",
      };
    },
  },
  "M2-L3": {
    primary: "Did this experience reveal, challenge, or complicate anything you previously believed about your interests or abilities?",
    followUps: [
      "Was anything different from what you expected?",
      "Are there assumptions you're less certain about now?",
      "What questions are you left wanting to explore?",
    ],
  },
  "M3-L1": {
    primary: "What patterns have you noticed in the environments or situations where you find it easier or harder to engage?",
    followUps: [
      "Are there conditions that seem to affect your attention or energy?",
      "Have you noticed these patterns in different areas of your life?",
      "What might you have overlooked about the circumstances surrounding those experiences?",
    ],
  },
  "M3-L2": {
    primary: "What assumptions do you have about how you work best? Where might those assumptions have come from?",
    followUps: [
      "Have earlier experiences shaped what you expect from yourself?",
      "Are there circumstances where those assumptions don't seem to fit?",
      "What would you be curious to test or understand better?",
    ],
  },
  "M3-L3": {
    primary: "Has this experiment changed how you interpret any previous experiences? What might you want to reconsider?",
    followUps: [
      "Have you ever attributed a difficulty entirely to yourself?",
      "Did changing the conditions reveal any alternative explanations?",
      "What remains uncertain or complicated?",
    ],
    // DRAFT (Claude): keeps the setup from becoming the whole explanation.
    note: "Conditions can explain some things and not others. Both can be true at once.",
  },
  "M4-L1": {
    primary: "What stories have you developed about yourself through your experiences? How might those stories influence the possibilities you consider?",
    followUps: [
      "Can you remember an experience that helped shape one of those stories?",
      "Which parts are based on events, and which parts are interpretations?",
      "Is there anything the story might leave out?",
    ],
  },
  "M4-L2": {
    primary: "Is there a belief about yourself you've rarely had the opportunity to question? What would you genuinely want to understand about it?",
    followUps: [
      "What experiences seem to support the belief?",
      "What experiences might complicate it?",
      "What kind of evidence might help you understand it more accurately?",
    ],
    // DRAFT (Claude): keeps the choice low-stakes.
    note: "An everyday belief works well, like “I’m not a morning person” or “I’m bad with directions.” You don’t need to write about anything painful.",
    /** The optional Module 1 baseline question, shown back so it isn't asked twice. */
    earlier: { key: "M1-L3#4", label: "In Module 1, you noted a belief you hadn’t had the chance to test" },
  },
  "M4-L3": {
    primary: "What are you beginning to understand differently about yourself? What still feels uncertain, contradictory, or unfinished?",
    followUps: [
      "Did your experience support or challenge an earlier interpretation?",
      "Has your perspective changed or become more complicated?",
      "What question would you like to carry forward?",
    ],
    // DRAFT (Claude)
    note: "Nothing has to have changed. “About the same, but more complicated” is a full answer.",
  },
};

export function hasGoDeeper(code) {
  return Boolean(GO_DEEPER[code]);
}

/** Lessons that draw the journal on a part of their own (Module 4's "Go deeper" part). */
const PLACED_BY_LESSON = ["M4-L1", "M4-L2", "M4-L3"];

/** Whether the shared lesson layout should add the journal on the last part. */
export function partFlowAddsGoDeeper(code) {
  return hasGoDeeper(code) && !PLACED_BY_LESSON.includes(code);
}

/**
 * Tappable follow-ups (review branch "go-deeper-tap-followups", Oct 24, 2026).
 * Tapping a follow-up adds it to the writing box as a plain starter line the participant
 * can edit or delete. Nothing records which one was tapped: the text is the only record.
 */
export const STARTER_MARK = "→ ";

export function starterLine(question) {
  return `${STARTER_MARK}${question}`;
}

/** Whether this follow-up's starter line is already in the text. */
export function hasStarter(text, question) {
  return String(text || "").includes(starterLine(question));
}

/** The text with the follow-up added at the end (once), ready to write under. */
export function addStarter(text, question) {
  const current = String(text || "");
  if (hasStarter(current, question)) return current;
  const trimmed = current.replace(/\s+$/, "");
  const gap = trimmed ? "\n\n" : "";
  return `${trimmed}${gap}${starterLine(question)}\n`;
}

/** The prompt set for this lesson, adapted to what the participant recorded when that matters. */
export function goDeeperFor(code, answers) {
  const base = GO_DEEPER[code];
  if (!base) return null;
  const adapted = base.adapt ? base.adapt(answers) : null;
  return { ...base, ...(adapted || {}) };
}
