import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { PREFIX, makeId, resolveKey } from "./store";
import { dedupeByThreadId, deleteMigratedEntry, runMigration, withMigrationLock } from "./discoveryMigration";
import { deleteAllPaged } from "./deletionSteps";

/**
 * Discovery Record entries live on the participant's account, one DiscoveryRecord row each,
 * readable and writable only by the account that created them.
 *
 * The app reads from an in-memory copy so pages can respond at once. Changes update that copy
 * immediately and save to the account in the background. Entries saved on this device before
 * this change are copied to the account once, then removed from the device.
 *
 * Nothing here writes to the stores the rest of the workbook uses (answers, decisions, stepState,
 * carried, lifeMap, discoveryNotes, journal), so a discovery never changes a source entry.
 */
const KEY = "discoveries";
const entity = () => base44.entities.DiscoveryRecord;

/** The optional context questions, in the order the page offers them. */
export const DISCOVERY_CONTEXT_FIELDS = [
  { key: "happened", label: "What happened or what did I notice?" },
  { key: "meaning", label: "What meaning am I adding?" },
  { key: "conditions", label: "What conditions, support, barriers, or costs mattered?" },
  { key: "unknown", label: "What remains unknown?" },
  { key: "reconsider", label: "What would make me reconsider?" },
];

export function emptyDiscovery() {
  return { title: "", body: "", context: {}, decision: "" };
}

let cache = [];
let loaded = false;
let loading = null;
/** temp id -> promise of the real account id (or null if the save failed) */
const pendingIds = new Map();
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeDiscoveries(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function sortNewest(items) {
  return [...items].sort((a, b) => (a.created_date < b.created_date ? 1 : -1));
}

function fromRow(row) {
  return {
    id: row.id,
    title: row.title || "",
    body: row.body || "",
    context: row.context || {},
    decision: row.decision || "",
    decision_date: row.decision_date || "",
    decision_note: row.decision_note || "",
    decision_updates: row.decision_updates || [],
    source: row.source || null,
    created_date: row.created_date || new Date().toISOString(),
    updated_date: row.updated_date || row.created_date || new Date().toISOString(),
  };
}

function toPayload(entry) {
  const { id, created_date, updated_date, ...payload } = entry; // eslint-disable-line no-unused-vars
  return payload;
}

function resolveId(id) {
  return pendingIds.get(id) || Promise.resolve(id);
}

export function listDiscoveries() {
  return sortNewest(cache);
}

export function getDiscovery(id) {
  return cache.find((entry) => entry.id === id) || null;
}

export function createDiscovery(fields = {}) {
  const now = new Date().toISOString();
  const decision = fields.decision || "";
  const entry = {
    id: makeId("disc"),
    title: "",
    body: "",
    context: {},
    decision: "",
    decision_date: "",
    decision_note: "",
    decision_updates: [],
    source: null,
    created_date: now,
    updated_date: now,
    ...fields,
    decision,
    decision_date: decision ? now : "",
  };
  cache = sortNewest([...cache, entry]);
  notify();

  const saved = entity()
    .create(toPayload(entry))
    .then((row) => {
      cache = cache.map((item) =>
        item.id === entry.id ? { ...item, id: row.id, created_date: row.created_date || item.created_date } : item
      );
      pendingIds.delete(entry.id);
      notify();
      return row.id;
    })
    .catch((error) => {
      console.error("Discovery Record save failed", error);
      cache = cache.filter((item) => item.id !== entry.id);
      pendingIds.delete(entry.id);
      notify();
      return null;
    });
  pendingIds.set(entry.id, saved);
  return entry;
}

export function updateDiscovery(id, patch) {
  cache = cache.map((entry) =>
    entry.id === id ? { ...entry, ...patch, updated_date: new Date().toISOString() } : entry
  );
  notify();
  resolveId(id).then((realId) => {
    if (!realId) return;
    entity()
      .update(realId, patch)
      .catch((error) => {
        console.error("Discovery Record update failed", error);
        loadDiscoveries();
      });
  });
}

/**
 * Saves a new entry and resolves only once the account has confirmed it.
 * Use this where the participant needs to know the save happened (the Save button on Discovery).
 * Resolves to the saved entry, or rejects with the error so the caller can keep the words on screen.
 */
export async function createDiscoveryConfirmed(fields = {}) {
  const now = new Date().toISOString();
  const decision = fields.decision || "";
  const payload = {
    title: "",
    body: "",
    context: {},
    decision: "",
    decision_date: "",
    decision_note: "",
    decision_updates: [],
    source: null,
    ...fields,
    decision,
    decision_date: decision ? now : "",
  };
  const row = await entity().create(toPayload(payload));
  const entry = fromRow({ ...payload, ...row });
  cache = sortNewest([...cache.filter((item) => item.id !== entry.id), entry]);
  notify();
  return entry;
}

/** Updates an entry and resolves only once the account has confirmed it. Rejects on failure. */
export async function updateDiscoveryConfirmed(id, patch) {
  const realId = await resolveId(id);
  if (!realId) throw new Error("This entry hasn't reached your account yet. Try again in a moment.");
  const row = await entity().update(realId, patch);
  cache = cache.map((entry) =>
    entry.id === id ? { ...entry, ...patch, updated_date: row?.updated_date || new Date().toISOString() } : entry
  );
  notify();
  return row;
}

/**
 * One-time move of DiscoveryThread rows into DiscoveryRecord. The rules live in discoveryMigration.js.
 * Idempotent: each thread's id is stored on the new entry as source.thread_id and in a migration record on the
 * account, and any thread already moved is skipped. Original DiscoveryThread rows are never deleted here.
 * Only one run at a time per tab. Resolves to { moved, skipped, failed }.
 */
const MIGRATION_KEY = "discoveryThreadMigration";

/** Reads every page of a list. Throws instead of returning a partial list. */
async function listAllPages(fetchPage, pageSize = 200) {
  const all = [];
  const seen = new Set();
  for (let skip = 0; ; skip += pageSize) {
    const page = (await fetchPage(skip, pageSize)) || [];
    let fresh = 0;
    for (const row of page) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        all.push(row);
        fresh += 1;
      }
    }
    if (page.length < pageSize) return all;
    if (!fresh) throw new Error("Paging stopped returning new rows, so the list would be incomplete. Nothing was created.");
  }
}

/** Every DiscoveryThread row on this account. */
export function listAllThreads() {
  return listAllPages((skip, limit) => base44.entities.DiscoveryThread.list("-updated_date", limit, skip));
}

function listAllRecords() {
  return listAllPages((skip, limit) => entity().list("-created_date", limit, skip));
}

/** Every DiscoveryRecord row on this account, read straight from the account (not the in-memory copy). */
export async function listAllDiscoveryRecords() {
  return dedupeByThreadId(await listAllRecords()).map(fromRow);
}

/**
 * Thread ids already moved once, stored on the account. The id stays here even if the participant
 * later deletes the record, so the thread is never copied again.
 */
async function readMigrationState() {
  const rows = (await base44.entities.UserStore.filter({ store_key: MIGRATION_KEY }, "-updated_date", 5)) || [];
  const row = rows[0] || null;
  const ids = new Set();
  for (const item of rows) {
    if (!item || !item.value) continue;
    let parsed;
    try {
      parsed = JSON.parse(item.value);
    } catch {
      throw new Error("The migration record can't be read, so migration stopped. Nothing was created.");
    }
    if (!Array.isArray(parsed)) throw new Error("The migration record has an unexpected shape. Migration stopped.");
    parsed.forEach((id) => ids.add(id));
  }
  return { row, ids };
}

/** The ids already moved, for deciding which threads still show on the page. Empty if it can't be read. */
export async function readMovedThreadIds() {
  try {
    return [...(await readMigrationState()).ids];
  } catch {
    return [];
  }
}

async function writeMigrationState(state) {
  // Merge with what the account holds now, so ids another device or tab recorded are never overwritten.
  const latest = await readMigrationState();
  latest.ids.forEach((id) => state.ids.add(id));
  if (!state.row) state.row = latest.row;
  const payload = {
    store_key: MIGRATION_KEY,
    value: JSON.stringify([...state.ids]),
    client_updated_at: Date.now(),
    description: "Discovery migration record. Do not edit.",
  };
  if (state.row) {
    await base44.entities.UserStore.update(state.row.id, payload);
  } else {
    // Keep the new row, so the next write updates it instead of creating a second migration record.
    state.row = await base44.entities.UserStore.create(payload);
  }
}

let migrating = null;

/**
 * Runs the move while holding the cross-tab lock, with the plan read fresh once the lock is held, so a second
 * tab waits and then finds nothing left to copy. Also one run at a time within this tab.
 */
export function migrateThreadsToRecords() {
  if (!migrating) {
    migrating = withMigrationLock(() =>
      runMigration({
        readState: readMigrationState,
        writeState: writeMigrationState,
        listRecords: listAllRecords,
        listThreads: listAllThreads,
        createRecord: (fields) => entity().create(toPayload({ ...emptyDiscovery(), ...fields })),
      })
    ).finally(() => {
      migrating = null;
    });
  }
  return migrating;
}

/**
 * Deletes one entry and resolves only once the account confirms it. Rejects (and keeps the entry) on failure.
 * For an entry moved from the original storage, the one matching DiscoveryThread row is deleted too, after the
 * thread id is recorded so migration can never copy it back. Resolves to { originalKept, threadDeleted }.
 */
export function removeDiscoveryConfirmed(id) {
  return withMigrationLock(async () => {
    const entry = getDiscovery(id);
    const realId = await resolveId(id);
    if (!realId) throw new Error("This entry hasn't reached your account yet. Try again in a moment.");
    const result = await deleteMigratedEntry({
      entry,
      tombstone: async (threadId) => {
        const state = await readMigrationState();
        state.ids.add(threadId);
        await writeMigrationState(state);
      },
      deleteRecord: () => entity().delete(realId),
      findThreadRows: (threadId) => base44.entities.DiscoveryThread.filter({ id: threadId }, "-updated_date", 2),
      deleteThread: (threadId) => base44.entities.DiscoveryThread.delete(threadId),
    });
    cache = cache.filter((item) => item.id !== id);
    notify();
    return result;
  });
}

export function removeDiscovery(id) {
  cache = cache.filter((entry) => entry.id !== id);
  notify();
  resolveId(id).then((realId) => {
    if (!realId) return;
    entity()
      .delete(realId)
      .catch((error) => {
        console.error("Discovery Record delete failed", error);
        loadDiscoveries();
      });
  });
}

/**
 * Revisiting a decision keeps the earlier wording: the decision being replaced
 * moves into the entry's own history instead of being overwritten.
 */
export function reviseDecision(id, decision, note) {
  const entry = getDiscovery(id);
  if (!entry || !decision) return;
  const now = new Date().toISOString();
  const superseded =
    entry.decision && entry.decision !== decision
      ? [
          ...(entry.decision_updates || []),
          {
            id: makeId("update"),
            decision: entry.decision,
            note: entry.decision_note || "",
            date: entry.decision_date || entry.updated_date || entry.created_date,
          },
        ]
      : entry.decision_updates || [];
  updateDiscovery(id, {
    decision,
    decision_date: now,
    decision_note: note || "",
    decision_updates: superseded,
  });
}

/** True when at least one optional context field holds something. */
export function hasContext(context) {
  return DISCOVERY_CONTEXT_FIELDS.some((field) => (context?.[field.key] || "").trim());
}

export function contextRows(context) {
  return DISCOVERY_CONTEXT_FIELDS.map((field) => ({
    label: field.label,
    value: (context?.[field.key] || "").trim(),
  })).filter((row) => row.value);
}

/** Entries saved on this device before the move. Read once, then cleared after they reach the account. */
function legacyDeviceEntries() {
  const found = [];
  const keys = [PREFIX + resolveKey(KEY), PREFIX + KEY];
  for (const storageKey of [...new Set(keys)]) {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const items = raw ? JSON.parse(raw) : [];
      if (Array.isArray(items)) found.push(...items);
    } catch {
      /* unreadable old copy: nothing to move */
    }
  }
  return found;
}

function clearDeviceEntries() {
  for (const storageKey of new Set([PREFIX + resolveKey(KEY), PREFIX + KEY])) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* storage unavailable: leave it */
    }
  }
}

async function doLoad() {
  try {
    const rows = dedupeByThreadId(await listAllRecords());
    const remote = rows.map(fromRow);
    const known = new Set(remote.map((entry) => `${entry.title}\u0000${entry.body}`));

    const local = legacyDeviceEntries();
    const toMove = local.filter((entry) => !known.has(`${entry.title || ""}\u0000${entry.body || ""}`));
    const moved = [];
    let allMoved = true;
    for (const item of toMove) {
      try {
        const row = await entity().create(toPayload({ ...emptyDiscovery(), ...item }));
        moved.push(fromRow(row));
      } catch (error) {
        allMoved = false;
        console.error("Could not move a Discovery Record entry to the account", error);
      }
    }
    if (allMoved && local.length) clearDeviceEntries();

    const pendingNow = cache.filter((entry) => pendingIds.has(entry.id));
    cache = sortNewest([...remote, ...moved, ...pendingNow]);
    loaded = true;
    notify();
  } catch (error) {
    console.error("Discovery Record could not load", error);
  }
}

/** Loads the signed-in participant's Discovery Record from their account. Safe to call repeatedly. */
export function loadDiscoveries() {
  if (!loading) loading = doLoad().finally(() => (loading = null));
  return loading;
}

/** Deletes every DiscoveryRecord row on this account. Used by Settings. Resolves to the number deleted. */
export function deleteAllDiscoveryRecords() {
  return withMigrationLock(async () => {
    try {
      return await deleteAllPaged(() => entity().list("-created_date", 200), (id) => entity().delete(id), "Discovery Record entries");
    } finally {
      cache = [];
      notify();
    }
  });
}

/** Plain-text lines for the workbook download. Oldest first. Blank-safe for migrated, DiscoveryStart and WorkbookSources entries. */
export function recordExportLines(records = []) {
  if (!records.length) return [];
  const lines = ["", "## Discovery Record", ""];
  [...records]
    .sort((a, b) => (a.created_date > b.created_date ? 1 : -1))
    .forEach((entry) => {
      const source = entry.source || {};
      const when = entry.created_date ? new Date(entry.created_date).toLocaleString() : "";
      const from = source.question_text || source.lesson_title || source.label || "";
      lines.push(`### ${entry.title || "Untitled discovery"}${when ? ` · ${when}` : ""}`);
      if (from) lines.push(`From: ${from}`);
      if (source.option_label) lines.push(`Chose: ${source.option_label}`);
      if (source.follow_up_text) lines.push(`Follow-up: ${source.follow_up_text}`);
      if (source.notes) lines.push(`Notes: ${source.notes}`);
      if (entry.body) lines.push(entry.body);
      contextRows(entry.context).forEach((row) => lines.push(`${row.label} ${row.value}`));
      if (entry.decision) {
        lines.push(`Decision: ${entry.decision}${entry.decision_note ? ` (${entry.decision_note})` : ""}`);
      }
      lines.push("");
    });
  return lines;
}

export function useDiscoveries() {
  const [items, setItems] = useState(() => listDiscoveries());
  useEffect(() => {
    const off = subscribeDiscoveries(() => setItems(listDiscoveries()));
    if (!loaded) loadDiscoveries();
    return off;
  }, []);
  return items;
}
