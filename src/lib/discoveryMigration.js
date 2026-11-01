/**
 * Pure rules for the one-time DiscoveryThread -> DiscoveryRecord move, plus the shapes both sides share.
 * No network and no imports, so every rule here can be tested directly.
 * Original DiscoveryThread rows are never deleted by anything in this file.
 */

/**
 * Migration switch. Off for every participant until the move has been reviewed.
 * `enabled: true` turns it on for everyone. `testEmails` turns it on only for named test accounts.
 */
export const MIGRATION_SWITCH = {
  enabled: false,
  testEmails: [],
};

/** True only when the switch is on, or the signed-in email is a named test account. */
export function migrationAllowed(email, settings = MIGRATION_SWITCH) {
  if (settings.enabled === true) return true;
  const wanted = String(email || "").trim().toLowerCase();
  if (!wanted) return false;
  return (settings.testEmails || []).some((item) => String(item).trim().toLowerCase() === wanted);
}

/**
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

/** The DiscoveryRecord fields for one thread. Every value is copied as saved; nothing is reworded. */
export function recordFromThread(thread) {
  return {
    title: thread.title || "",
    body: thread.response || "",
    context: {},
    decision: "",
    source: {
      thread_id: thread.id,
      kind: thread.source || "",
      question_id: thread.question_id || "",
      question_text: thread.question_text || "",
      path_id: thread.path_id || "",
      follow_up_text: thread.follow_up_text || "",
      option_id: thread.option_id || "",
      option_label: thread.option_label || "",
      notes: thread.notes || "",
      migrated_from: "DiscoveryThread",
    },
  };
}

/**
 * Runs the move with injected storage calls, so it can be tested without an account.
 *   readState()            -> { row, ids: Set }   throws if the migration record can't be read
 *   writeState(state)      -> stores state.ids
 *   listRecords()          -> every DiscoveryRecord row (throws rather than returning a partial list)
 *   listThreads()          -> every DiscoveryThread row (same)
 *   createRecord(fields)   -> creates one DiscoveryRecord row
 * Nothing is created if any read fails. One failed create does not stop the rest; it is retried next run.
 * Resolves to { moved, skipped, failed }.
 */
export async function runMigration({ readState, writeState, listRecords, listThreads, createRecord }) {
  const result = { moved: 0, skipped: 0, failed: 0 };
  const state = await readState();
  const records = (await listRecords()) || [];
  const threads = (await listThreads()) || [];
  const plan = planMigration({
    threads,
    recordThreadIds: records.map((row) => row?.source?.thread_id),
    movedIds: [...state.ids],
  });
  result.skipped = plan.skipped;

  for (const thread of plan.toCreate) {
    try {
      await createRecord(recordFromThread(thread));
      result.moved += 1;
    } catch (error) {
      console.error("Could not move a discovery", error);
      result.failed += 1;
      continue;
    }
    // Record each move as it lands, so an interrupted run does not copy the same thread again.
    state.ids.add(thread.id);
    try {
      await writeState(state);
    } catch (error) {
      // The new record's source.thread_id still stops a repeat copy on the next run.
      console.error("Migration record could not be saved", error);
    }
  }
  return result;
}

/**
 * Threads to show beside Discovery Record entries: every thread no record points at yet.
 * Before migration this is all of them; after it, only any that failed to move. A thread the participant
 * already moved and later deleted from the record is not shown again.
 */
export function unmovedThreads(threads = [], records = [], movedIds = []) {
  return planMigration({
    threads,
    recordThreadIds: records.map((row) => row?.source?.thread_id),
    movedIds,
  }).toCreate;
}

/** Threads for the download: every thread no record points at and not already moved, so a moved or deleted discovery is not written again. */
export function threadsForExport(threads = [], records = [], movedIds = []) {
  const linked = new Set([...records.map((row) => row?.source?.thread_id), ...movedIds].filter(Boolean));
  const seen = new Set();
  return threads.filter((thread) => {
    if (!thread || !thread.id || linked.has(thread.id) || seen.has(thread.id)) return false;
    seen.add(thread.id);
    return true;
  });
}

/** True for a record that came from Discovery on the dashboard (saved there, or moved from the old storage). */
export function isDiscoveryFlowRecord(entry) {
  const kind = entry?.source?.kind;
  return kind === "question" || kind === "own";
}

/**
 * One shape for the Discovery editor, whether the item is a DiscoveryRecord entry or a not-yet-moved thread.
 * The participant's words are passed through unchanged.
 */
export function editableFromRecord(entry) {
  const source = entry.source || {};
  return {
    origin: "record",
    id: entry.id,
    title: entry.title || "",
    response: entry.body || "",
    notes: source.notes || "",
    option_id: source.option_id || "",
    option_label: source.option_label || "",
    source: source.kind || "own",
    question_id: source.question_id || "",
    question_text: source.question_text || "",
    path_id: source.path_id || "",
    follow_up_text: source.follow_up_text || "",
    created_date: entry.created_date,
    updated_date: entry.updated_date,
  };
}

export function editableFromThread(thread) {
  return {
    origin: "thread",
    id: thread.id,
    title: thread.title || "",
    response: thread.response || "",
    notes: thread.notes || "",
    option_id: thread.option_id || "",
    option_label: thread.option_label || "",
    source: thread.source || "own",
    question_id: thread.question_id || "",
    question_text: thread.question_text || "",
    path_id: thread.path_id || "",
    follow_up_text: thread.follow_up_text || "",
    created_date: thread.created_date,
    updated_date: thread.updated_date,
  };
}

/** The DiscoveryRecord patch for an edit. Keeps every other source field (thread_id, question wording) as it was. */
export function recordPatchFromEdit(entry, next) {
  return {
    title: next.title,
    body: next.response,
    source: {
      ...(entry.source || {}),
      notes: next.notes,
      option_id: next.option_id,
      option_label: next.option_label,
    },
  };
}

/** The DiscoveryRecord fields for a save from Discovery on the dashboard (a threadFromDiscovery row). */
export function recordFieldsFromDiscovery(row) {
  return {
    title: row.title,
    body: row.response,
    source: {
      kind: row.source,
      question_id: row.question_id,
      question_text: row.question_text,
      path_id: row.path_id,
      follow_up_text: row.follow_up_text,
      option_id: row.option_id,
      option_label: row.option_label,
      notes: row.notes,
      description: row.description,
    },
  };
}

/** The one lock every migration, discovery delete and delete-all takes, so they never overlap across tabs. */
export const MIGRATION_LOCK = "entrepalooza-discovery-migration";

/**
 * Runs fn while holding the cross-tab lock (Web Locks), waiting its turn if another tab holds it.
 * Not re-entrant: never call a locked function from inside another locked function.
 * Without Web Locks the work still runs; the fresh plan, the duplicate guard below and the migration record
 * then limit the damage to a rare cross-device race, which dedupeByThreadId hides.
 */
export function withMigrationLock(fn, locks = typeof navigator !== "undefined" ? navigator.locks : undefined) {
  if (locks && typeof locks.request === "function") return locks.request(MIGRATION_LOCK, fn);
  return fn();
}

/**
 * Hides repeat copies of one thread: for each source.thread_id only the oldest record is kept.
 * Nothing is deleted. Works on raw rows and on mapped entries.
 */
export function dedupeByThreadId(records = []) {
  const byAge = [...records].sort((a, b) => {
    const x = a?.created_date || "";
    const y = b?.created_date || "";
    if (x !== y) return x < y ? -1 : 1;
    return String(a?.id) < String(b?.id) ? -1 : 1;
  });
  const seen = new Set();
  const hide = new Set();
  for (const record of byAge) {
    const threadId = record?.source?.thread_id;
    if (!threadId) continue;
    if (seen.has(threadId)) hide.add(record);
    else seen.add(threadId);
  }
  return records.filter((record) => !hide.has(record));
}

/**
 * Deletes one Discovery Record entry and, if it was moved from DiscoveryThread, its one matching original.
 *  0. (see below) any repeat copy of the same discovery is deleted first.
 *  1. tombstone(threadId): the thread id is written to the migration record first. If that fails, nothing is
 *     deleted, so a deleted discovery can never be copied back by a later migration.
 *  2. deleteRecord(): the record is deleted.
 *  3. The original is deleted only when the entry carries the migration marker, and only the single row whose
 *     id equals source.thread_id. No other row is ever touched.
 * Resolves to { originalKept, threadDeleted }. Rejects (with nothing deleted) if step 1 or 2 fails.
 */
export async function deleteMigratedEntry({
  entry,
  tombstone,
  deleteRecord,
  findThreadRows,
  deleteThread,
  findSiblingRecordIds,
  deleteRecordById,
}) {
  const source = entry?.source || {};
  const threadId = source.migrated_from === "DiscoveryThread" && typeof source.thread_id === "string" ? source.thread_id : "";
  if (threadId) {
    await tombstone(threadId);
    // A repeat copy of this same discovery (from a rare cross-device race) is deleted with it, so it can't surface
    // once the visible one is gone. Only copies carrying this thread id and the migration marker; all before the
    // visible entry, so a failure here leaves the visible entry in place and the person can retry.
    const siblings = findSiblingRecordIds ? (await findSiblingRecordIds(threadId)) || [] : [];
    for (const id of siblings) await deleteRecordById(id);
  }
  await deleteRecord();
  if (!threadId) return { originalKept: false, threadDeleted: false };
  try {
    const exact = ((await findThreadRows(threadId)) || []).filter((row) => row && row.id === threadId);
    if (!exact.length) return { originalKept: false, threadDeleted: false };
    await deleteThread(exact[0].id);
    return { originalKept: false, threadDeleted: true };
  } catch (error) {
    console.error("The original copy of this discovery could not be deleted", error);
    return { originalKept: true, threadDeleted: false };
  }
}
