/**
 * Phase 1 progress wording for a module row on the dashboard.
 *
 * It only says what is stored: how many steps have something saved. A step counts once it has an
 * answer, or a choice such as Pass, Watch, or "I'm done with this lesson" (see stepComplete).
 * That is a record of activity, not a measure of learning, so nothing here says "completed".
 */
export function moduleProgressLabel(row) {
  const saved = Math.max(0, Number(row?.writtenCount) || 0);
  const total = Math.max(0, Number(row?.stepCount) || 0);
  if (!total) return { text: "No steps yet", muted: true };
  if (saved === 0) return { text: "Nothing saved yet", muted: true };
  return { text: `${Math.min(saved, total)} of ${total} steps saved`, muted: false };
}

/** Screen-reader version: spells out what "saved" means. */
export function moduleProgressDescription(row) {
  const saved = Math.max(0, Number(row?.writtenCount) || 0);
  const total = Math.max(0, Number(row?.stepCount) || 0);
  return `${Math.min(saved, total)} of ${total} steps have an answer or choice saved`;
}
