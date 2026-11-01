/**
 * Deletes every row a list call returns, reading again after each batch so lists longer than one page are cleared.
 * Stops with an error (instead of looping forever) if the same rows come back after being deleted.
 * Resolves to the number deleted.
 */
export async function deleteAllPaged(listPage, deleteOne, what = "Entries") {
  let total = 0;
  let previous = "";
  for (;;) {
    const rows = (await listPage()) || [];
    if (!rows.length) return total;
    const batch = rows.map((row) => row.id).join(",");
    if (batch === previous) {
      throw new Error(`${what} keep coming back after delete, so deletion stopped. Some may remain.`);
    }
    previous = batch;
    for (const row of rows) {
      await deleteOne(row.id);
      total += 1;
    }
  }
}

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
