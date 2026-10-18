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
 *   noticeFlow  route pills swap the questions (own thread vs. garden example); replaces the step's generic prompt boxes
 */
export const INTERACTIONS = {
  "M1-L1": [{ type: "noticeFlow" }],
  // Module 2 now uses the concise workbook prompts. The former interactive
  // planner/check-in code remains available, but is not rendered twice.
};

export function interactionsFor(code) {
  return INTERACTIONS[code] || [];
}