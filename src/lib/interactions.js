/**
 * Which steps get an interactive piece, by lesson code.
 *
 * Kept in code, not in the Lesson data, so the curriculum records themselves are
 * untouched while the structure is still a working draft. Re-point a code here if
 * the step order changes.
 *
 * Types:
 *   tryPlanner  plan one small try by tapping, then save it as plain sentences
 *   tryCheckIn  say what happened after the try; planCode names the step that held the plan
 *   noticeFlow  route pills swap the questions (own thread vs. garden example); replaces the step's generic prompt boxes.
 *               No longer registered (Oct 24, 2026); kept in NoticeFlow.jsx for reference.
 *   m1Notice, m1Attention, m1Agreement
 *               Module 1 interactive lessons (src/components/workbook/moduleOne). `ownsLesson`
 *               means the piece draws the whole step: no generic teach, reading, Try or Reflect
 *               sections. The Lesson record is still loaded for title, purpose, duration and code.
 */
export const INTERACTIONS = {
  "M1-L1": [{ type: "m1Notice", ownsLesson: true }],
  "M1-L2": [{ type: "m1Attention", ownsLesson: true }],
  "M1-L3": [{ type: "m1Agreement", ownsLesson: true }],
  // Module 2 now uses the concise workbook prompts. The former interactive
  // planner/check-in code remains available, but is not rendered twice.
};

export function interactionsFor(code) {
  return INTERACTIONS[code] || [];
}

/** The interaction that draws the whole step, if one does. */
export function lessonOwner(code) {
  return interactionsFor(code).find((item) => item.ownsLesson) || null;
}