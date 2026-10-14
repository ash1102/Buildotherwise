/**
 * Getting Started is five steps, O.1 to O.5, found by code.
 * They may be stored on module 0 or module 1. The gate does not care which.
 * A step is done when it has a saved answer, or Pass. Watch counts the same way,
 * because the book already treats it as finished without a writing box.
 * Answers and the Pass choice live in the same browser storage as the rest of the book.
 */

export const GS_CODES = ["O.1", "O.2", "O.3", "O.4", "O.5"];

export function isGettingStartedLesson(lesson) {
  return Boolean(lesson) && GS_CODES.includes(lesson.code);
}

/** O.1 to O.5 in gate order. Missing codes are left out. */
export function gettingStartedSteps(lessons) {
  const byCode = new Map((lessons || []).filter(isGettingStartedLesson).map((lesson) => [lesson.code, lesson]));
  return GS_CODES.map((code) => byCode.get(code)).filter(Boolean);
}

function savedAnswer(lesson, answers) {
  const prefix = `${lesson.code}#`;
  return Object.keys(answers || {}).some((key) => key.startsWith(prefix) && String(answers[key] || "").trim());
}

/** Pass counts. A saved line counts. Watch counts, same as the rest of the book. */
export function gettingStartedStepDone(lesson, answers, states) {
  if (!lesson) return false;
  const route = String((states && states[lesson.code]) || "").trim();
  if (/^(pass|watch)$/i.test(route)) return true;
  return savedAnswer(lesson, answers);
}

/** Finished only when all five steps exist and each one is done. */
export function gettingStartedFinished(lessons, answers, states) {
  const steps = gettingStartedSteps(lessons);
  if (steps.length !== GS_CODES.length) return false;
  return steps.every((lesson) => gettingStartedStepDone(lesson, answers, states));
}

/**
 * The first step that is not done yet.
 * The Getting Started page is the fallback when the five steps are not all loaded.
 */
export function gettingStartedResumePath(lessons, answers, states) {
  const open = gettingStartedSteps(lessons).find((lesson) => !gettingStartedStepDone(lesson, answers, states));
  return open ? `/lesson/${open.code}` : "/getting-started";
}
