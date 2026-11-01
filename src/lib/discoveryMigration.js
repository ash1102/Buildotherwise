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

/** Threads for the download: every thread no record points at, so a moved discovery is written once. */
export function threadsForExport(threads = [], records = []) {
  const linked = new Set(records.map((row) => row?.source?.thread_id).filter(Boolean));
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
