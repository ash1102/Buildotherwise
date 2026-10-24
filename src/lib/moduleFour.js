import { answerKey, setAnswer } from "./workbook";
import { saveAnswer } from "./journal";
import { plainValue, splitMulti, joinMulti, FINISHED } from "./moduleOne";

/**
 * Module 4 interactive lessons (review branch "module-4-interactive", Oct 24, 2026).
 * Same pattern as Modules 1 and 2. Wording from Ashley's Module 4 instructions unless
 * a comment says DRAFT (Claude).
 *
 * Existing keys reused WITH THEIR ORIGINAL MEANING:
 *   M4-L1#0   What happened (event)
 *   M4-L1#1   What story/explanation was added (also the Module 3→4 bridge target)
 *   M4-L1#2   What verdict/broader judgment followed
 *   M4-L1#3   What is still uncertain
 *   M4-L1#20  Self-characterization sketch (about three sentences)
 *   M4-L1#21  The one sentence chosen to look at
 *   M4-L2#0   The small action that would give evidence
 *   M4-L3#1   What actually happened
 *   M4-L3#2   Which parts are supported, challenged, or still unknown
 *   M4-L3#4   The more accurate wording (bridge into Module 5, records page, discovery map)
 *
 * New keys:
 *   M4-L1#start-mode       how they started (earlier observation / ordinary / example / sketch)
 *   M4-L1#sketch-person    first or third person, as they chose
 *   M4-L1#sketch-kind      what the chosen sentence mostly is (their call)
 *   M4-L1#sort             the four-statement practice (JSON map), not a score
 *   M4-L1#statement        the statement or uncertainty to carry into L2 (copied as written)
 *   M4-L2#statement-mode   keep / revise / another / example
 *   M4-L2#statement        the statement or question to investigate
 *   M4-L2#look-for         what they'd look for
 *   M4-L2#limits           practical limits or support ("; "-joined)
 *   M4-L2#limits-note      optional words about limits or support
 *   M4-L2#plan-status      will try / can't now / decided not to / keep as a question
 *   M4-L3#outcome          what happened with the action
 *   M4-L3#evidence-fit     how the evidence relates to the statement ("; "-joined)
 *   M4-L3#other-explanations  what else might explain it ("; "-joined)
 *   M4-L3#revise-mode      keep / more specific / revise / uncertain / leave open
 *   M4-Lx#go-deeper        the Conversation Journal "Go Deeper" entry (one per lesson)
 *   <code>#finished        "I'm done with this lesson for now"
 */

export const M4_CODES = ["M4-L1", "M4-L2", "M4-L3"];

export const L1_START = [
  "Use something I recorded in Module 2 or 3",
  "Use another ordinary experience",
  "Use the example",
  "Start from a short sketch of myself",
];

export const EXAMPLE_EXPERIENCE = "I tried learning something new, but I stopped after fifteen minutes.";

export const SORT_LABELS = ["Event", "Story", "Verdict", "Uncertain"];

export const SORT_ITEMS = [
  {
    id: "s1",
    text: "I stopped after fifteen minutes.",
    answer: "Event",
    // DRAFT (Claude) feedback
    explain: "This describes what happened. Someone else could observe or check it.",
  },
  {
    id: "s2",
    text: "I’m terrible at learning new things.",
    answer: "Verdict",
    explain: "This turns one fifteen-minute attempt into a judgment about who you are, across all learning. That’s a much bigger claim than the event supports.",
  },
  {
    id: "s3",
    text: "Maybe the instructions were confusing.",
    answer: "Story",
    explain: "This is one possible explanation for why it happened. It might be right, partly right, or wrong.",
  },
  {
    id: "s4",
    text: "I don’t know whether clearer instructions would have helped.",
    answer: "Uncertain",
    explain: "This names something that isn’t established yet. Leaving it unknown is accurate.",
  },
];

export const SKETCH_PERSON = ["First person (“I…”)", "Third person (“They…” or my name)"];
export const SKETCH_KINDS = ["Mostly an event", "Mostly a story", "Mostly a verdict", "Mostly uncertain", "A mix", "I’m not sure"];

export const STATEMENT_MODES = ["Keep it", "Revise it", "Use a different statement", "Use the example"];
export const L2_EXAMPLE = "I’m not good at explaining things.";
export const L2_EXAMPLE_ACTIONS = [
  "Explain a familiar process to another person.",
  "Record a short explanation.",
  "Write instructions for a simple task.",
  "Observe someone explaining a similar idea.",
];

export const LIMITS = [
  "Time",
  "Energy",
  "Privacy",
  "Someone to try it with",
  "A reminder",
  "A quiet place",
  "Nothing in particular",
];
export const LIMITS_NONE = "Nothing in particular";

export const PLAN_STATUS = [
  "I’ll try it and come back",
  "I can’t try it right now",
  "I’ve decided not to try it",
  "I’d rather keep it as a question for now",
];

export const OUTCOMES = [
  "I completed the action.",
  "I completed part of it.",
  "I tried something different.",
  "I couldn’t attempt it.",
  "I decided not to attempt it.",
];

export const EVIDENCE_FIT = [
  "It supports part of my statement",
  "It challenges part of my statement",
  "It complicates it",
  "It doesn’t settle it",
  "I don’t have new evidence yet",
];

export const OTHER_EXPLANATIONS = [
  "The setting or conditions",
  "Timing or energy",
  "Support, or the lack of it",
  "How familiar the task was",
  "The instructions",
  "Something I haven’t thought of",
];

export const REVISE_MODES = [
  "Keep my original statement",
  "Make it more specific",
  "Revise it",
  "Mark it as uncertain",
  "Leave the question open",
];

export const JOURNAL_INTRO =
  "You don’t have to answer every question. Start wherever something catches your attention. You can explore a memory, question an assumption, disagree with an idea, or follow a thought somewhere unexpected.";

export const GO_DEEPER = {
  "M4-L1": {
    prompt:
      "What stories have you developed about yourself through your experiences? How might those stories influence the possibilities you consider?",
    followUps: [
      "Can you remember an experience that helped shape one of those stories?",
      "Which parts are based on events, and which parts are interpretations?",
      "Is there anything the story might leave out?",
    ],
  },
  "M4-L2": {
    prompt: "Is there a belief about yourself you’ve rarely had the opportunity to question? What would you genuinely want to understand about it?",
    followUps: [
      "What experiences seem to support the belief?",
      "What experiences might complicate it?",
      "What kind of evidence might help you understand it more accurately?",
    ],
  },
  "M4-L3": {
    prompt: "What are you beginning to understand differently about yourself? What still feels uncertain, contradictory, or unfinished?",
    followUps: [
      "Did your experience support or challenge an earlier interpretation?",
      "Has your perspective changed or become more complicated?",
      "What question would you like to carry forward?",
    ],
  },
};

export function readKey(answers, code, key) {
  return plainValue((answers || {})[answerKey(code, key)]).trim();
}

export function recordM4(code, title, key, value, label) {
  const text = String(value ?? "");
  setAnswer(code, key, text);
  saveAnswer({ lessonCode: code, lessonTitle: title, promptKey: answerKey(code, key), promptLabel: label, body: text });
}

export function readSort(answers) {
  try {
    const raw = (answers || {})[answerKey("M4-L1", "sort")];
    const value = raw ? JSON.parse(raw) : {};
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

/** The statement carried from L1 to L2 and L3: L2's version first, then L1's. */
export function currentStatement(answers) {
  return readKey(answers, "M4-L2", "statement") || readKey(answers, "M4-L1", "statement");
}

export { splitMulti, joinMulti, FINISHED };

/** Older Module 4 answers, shown read-only (never moved or rewritten). */
export const EARLIER_M4 = {
  "M4-L1": [
    { key: "M4-L1#4", label: "A more accurate statement you wrote" },
    { key: "M4-L1#5", label: "Optional deepeners: impact, responsibility, context" },
  ],
  "M4-L2": [
    { key: "M4-L2#1", label: "Ownership check" },
    { key: "M4-L2#2", label: "A cue that would help you notice a chance to practice" },
    { key: "M4-L2#3", label: "The smallest action you could observe" },
    { key: "M4-L2#4", label: "Your practice plan" },
    { key: "M4-L2#5", label: "How you’d tell what actually happened" },
    { key: "M4-L2#6", label: "What you’d record if there was no opportunity" },
    { key: "M4-L2#7", label: "What the usual response might cost" },
  ],
  "M4-L3": [
    { key: "M4-L3#0", label: "The statement you reviewed" },
    { key: "M4-L3#3", label: "Responsibility, repair, support, or skill need" },
    { key: "M4-L3#5", label: "A cue or protective limit for Module 5" },
  ],
};

const RESPONSE_KEYS = {
  "M4-L1": ["0", "1", "2", "3", "20", "21", "start-mode", "sketch-person", "sketch-kind", "sort", "statement", "go-deeper", FINISHED],
  "M4-L2": ["0", "statement-mode", "statement", "look-for", "limits", "limits-note", "plan-status", "go-deeper", FINISHED],
  "M4-L3": ["1", "2", "4", "outcome", "evidence-fit", "other-explanations", "revise-mode", "go-deeper", FINISHED],
};

export function isModuleFourInteractive(code) {
  return M4_CODES.includes(code);
}

export function moduleFourStepComplete(code, answers) {
  const has = (key) => String((answers || {})[answerKey(code, key)] || "").trim();
  if ((RESPONSE_KEYS[code] || []).some(has)) return true;
  return (EARLIER_M4[code] || []).some((item) => String((answers || {})[item.key] || "").trim());
}
