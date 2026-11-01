/**
 * Pure planning for the one-time DiscoveryThread -> DiscoveryRecord move.
 * No network and no imports, so the rules can be tested directly.
 *
 * A thread is skipped when:
 *  - it was already moved (its id is in movedIds, which is kept even if the participant later deletes the record), or
 *  - a record already points at it (source.thread_id), or
 *  - it appears twice in the list, or it has no id.
 */
export function planMigration({ threads = [], recordThreadIds = [], movedIds = [] } = {}) {
  const done = new Set([...movedIds, ...recordThreadIds].filter(Boolean));
  const seen = new Set();
  const toCreate = [];
  let skipped = 0;
  for (const thread of threads) {
    if (!thread || !thread.id || done.has(thread.id) || seen.has(thread.id)) {
      skipped += 1;
      continue;
    }
    seen.add(thread.id);
    toCreate.push(thread);
  }
  return { toCreate, skipped };
}
