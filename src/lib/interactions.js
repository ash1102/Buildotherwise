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
  "M2-L1": [{ type: "tryPlanner" }],
  "M2-L2": [{ type: "tryCheckIn", planCode: "M2-L1" }],
};

export function interactionsFor(code) {
  return INTERACTIONS[code] || [];
}