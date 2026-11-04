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
  "This is an optional space to write, ask a question, or disagree with something here. You can skip it or leave it blank; it does not need to be personal.";

const NOT_TRIED_M2 = ["I haven’t tried it yet.", "I ran into a barrier."];

export const GO_DEEPER = {
  "M1-L1": {
    primary: "Is there anything from this lesson you want to keep exploring? A question, an observation, “nothing yet,” or a blank space are all fine.",
    followUps: [
      "Would you like to keep a question from this lesson?",
      "Is there a possibility you might want to look at again?",
      "Would you rather leave this here for now?",
    ],
  },
  "M1-L2": {
    primary: "Was there a point in this lesson you want to think through, question, or leave behind?",
    followUps: [
      "Which explanation seems useful to you, if any?",
      "Did anything in the examples seem incomplete or different from your experience?",
      "Would you rather move on without adding anything?",
    ],
  },
  "M1-L3": {
    primary: "What, if anything, do you want to take with you from this lesson? It could be a practical preference, an open question, or nothing.",
    followUps: [
      "What might make an activity easier to try, if you choose to?",
      "Is there a limit or support you would want to keep in mind?",
      "Would you rather leave your next step open?",
    ],
  },
  "M2-L1": {
    primary: "Is there anything here you want to explore, question, or leave open? You don't need a reason or a past interest.",
    followUps: [
      "What first brought this possibility to your attention?",
      "What assumptions do you already have about it?",
      "Is there something you hope to understand about yourself through exploring it?",
    ],
  },
  "M2-L2": {
    primary: "What happened, if anything? You can write about trying, observing, planning, a barrier, or not starting yet.",
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
        primary: "What happened while planning or getting started, if anything? A barrier, a pause, or not trying yet all count.",
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
    primary: "Did anything stand out, even if you haven't tried it? 'Nothing yet' is a complete answer.",
    followUps: [
      "Was anything different from what you expected?",
      "Are there assumptions you're less certain about now?",
      "What questions are you left wanting to explore?",
    ],
  },
  "M3-L1": {
    primary: "Would you like to compare two different setups, or just imagine which might be easier to try? No past example needed.",
    followUps: [
      "Are there conditions that seem to affect your attention or energy?",
      "Have you noticed these patterns in different areas of your life?",
      "What might you have overlooked about the circumstances surrounding those experiences?",
    ],
  },
  "M3-L2": {
    primary: "What setup might make a small activity more workable for you? You can guess or leave it open.",
    followUps: [
      "What might you expect from this setup, even if you haven't tried it?",
      "Are there circumstances where those assumptions don't seem to fit?",
      "What would you be curious to test or understand better?",
    ],
  },
  "M3-L3": {
    primary: "If you tried something, did the setup make a difference? If not, what would you want to compare someday?",
    followUps: [
      "Could the conditions explain part of the difficulty?",
      "What other explanations might fit?",
      "What remains uncertain or complicated?",
    ],
    // DRAFT (Claude): keeps the setup from becoming the whole explanation.
    note: "Conditions can explain some things and not others. Both can be true at once.",
  },
  "M4-L1": {
    primary: "Want to examine how an event can lead to different interpretations? You can use the lesson's example instead of your own life.",
    followUps: [
      "Can you remember an experience that helped shape one of those stories?",
      "Which parts are based on events, and which parts are interpretations?",
      "Is there anything the story might leave out?",
    ],
  },
  "M4-L2": {
    primary: "Want to test a claim or assumption? It can be about a fictional example, an everyday task, or yourself—your choice.",
    followUps: [
      "What observations, if any, support that claim?",
      "What might offer a different explanation?",
      "What kind of evidence might help you understand it more accurately?",
    ],
    // DRAFT (Claude): keeps the choice low-stakes.
    note: "An everyday belief works well, like “I’m not a morning person” or “I’m bad with directions.” You don’t need to write about anything painful.",
    /** The optional Module 1 baseline question, shown back so it isn't asked twice. */
    earlier: { key: "M1-L3#4", label: "In Module 1, you noted a belief you hadn’t had the chance to test" },
  },
  "M4-L3": {
    primary: "Is there a question, example, or possibility you want to carry forward? Nothing needs to have changed.",
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
