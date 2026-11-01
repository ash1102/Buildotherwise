/**
 * Runs each deletion step in order and reports what did not finish. Never throws.
 *
 * steps: [label, run] or [label, run, { requiresClean: true }].
 * A step marked requiresClean is skipped (and reported as not finished) if any earlier step failed.
 * The workbook step uses this: deleting the migration record while discoveries still exist would let
 * the next migration copy them back, so the workbook stays until discovery deletion has fully finished.
 * Resolves to the labels of steps that did not finish, in order.
 */
export async function runSteps(steps) {
  const failed = [];
  for (const [label, run, options = {}] of steps) {
    if (options.requiresClean && failed.length) {
      console.warn(`Deletion step skipped because an earlier step did not finish: ${label}`);
      failed.push(label);
      continue;
    }
    try {
      await run();
    } catch (error) {
      console.error(`Deletion step failed: ${label}`, error);
      failed.push(label);
    }
  }
  return failed;
}
