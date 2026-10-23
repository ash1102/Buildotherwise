/**
 * Getting Started is three steps in order (O.1, O.4, O.5), found by code. O.3 is optional, offered later.
 * O.2 (rights and privacy) was folded into O.1 on Oct 22, 2026.
 * O.4 sits in the flow but is optional: it never holds the workbook shut. Only O.1 and O.5 are required.
 * They may be stored on module 0 or module 1. The gate does not care which.
 * A step is done when it has a saved answer, or Pass. Watch counts the same way,
 * because the book already treats it as finished without a writing box.
 * Answers and the Pass choice live in the same browser storage as the rest of the book.
 */

export const GS_CODES = ["O.1", "O.4", "O.5"];

/**
 * Optional Getting Started steps. They do not hold the workbook shut.
 * O.3 "How we give feedback" is a group practice, so in the self-paced app it is
 * offered as a read before replying in Tribe threads instead of a gate.
 */
export const OPTIONAL_GS_CODES = ["O.3"];

/** Steps shown in the Getting Started flow that can be left blank without blocking anything. */
export const OPTIONAL_IN_FLOW_GS_CODES = ["O.4"];

export function isOptionalInFlowGettingStartedLesson(lesson) {
  return Boolean(lesson) && OPTIONAL_IN_FLOW_GS_CODES.includes(lesson.code);
}

export function isOptionalGettingStartedLesson(lesson) {
  return Boolean(lesson) && OPTIONAL_GS_CODES.includes(lesson.code);
}

export function isGettingStartedLesson(lesson) {
  return Boolean(lesson) && GS_CODES.includes(lesson.code);
}

/** The required steps in gate order. Missing codes are left out. */
export function gettingStartedSteps(lessons) {
  const byCode = new Map((lessons || []).filter(isGettingStartedLesson).map((lesson) => [lesson.code, lesson]));
  return GS_CODES.map((code) => byCode.get(code)).filter(Boolean);
}

function savedAnswer(lesson, answers) {
  const prefix = `${lesson.code}#`;
  return Object.keys(answers || {}).some((key) => key.startsWith(prefix) && String(answers[key] || "").trim());
}

/** Pass counts. A saved line counts. Watch counts, same as the rest of the book. "Ready" is O.1's Let me in tap. */
export function gettingStartedStepDone(lesson, answers, states) {
  if (!lesson) return false;
  const route = String((states && states[lesson.code]) || "").trim();
  if (/^(pass|watch|ready)$/i.test(route)) return true;
  return savedAnswer(lesson, answers);
}

/** Done, or optional. A settled step never blocks the next one. */
export function gettingStartedStepSettled(lesson, answers, states) {
  return isOptionalInFlowGettingStartedLesson(lesson) || gettingStartedStepDone(lesson, answers, states);
}

/** The first required step that is not done yet, or null. */
export function firstOpenGettingStartedStep(lessons, answers, states) {
  return gettingStartedSteps(lessons).find((lesson) => !gettingStartedStepSettled(lesson, answers, states)) || null;
}

/** Finished only when every step exists and each required one is done. */
export function gettingStartedFinished(lessons, answers, states) {
  const steps = gettingStartedSteps(lessons);
  if (steps.length !== GS_CODES.length) return false;
  return steps.every((lesson) => gettingStartedStepSettled(lesson, answers, states));
}

/**
 * The first step that is not done yet.
 * The Getting Started page is the fallback when the steps are not all loaded.
 */
export function gettingStartedResumePath(lessons, answers, states) {
  const open = firstOpenGettingStartedStep(lessons, answers, states);
  return open ? `/lesson/${open.code}` : "/getting-started";
}
