import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  MIGRATION_LOCK,
  MIGRATION_SWITCH,
  dedupeByThreadId,
  deleteMigratedEntry,
  editableFromRecord,
  editableFromThread,
  isDiscoveryFlowRecord,
  migrationAllowed,
  planMigration,
  recordFieldsFromDiscovery,
  recordFromThread,
  recordPatchFromEdit,
  runMigration,
  threadsForExport,
  unmovedThreads,
  withMigrationLock,
} from "./discoveryMigration.js";
import { deleteAllPaged, runSteps } from "./deletionSteps.js";
import { discoveryExportLines, threadFromDiscovery } from "./discoveryThreadData.js";
import { QUESTIONS } from "./dashboardDiscovery.js";

const read = (file) => readFileSync(file, "utf8");
const quiet = () => {
  const saved = [console.error, console.warn];
  console.error = () => {};
  console.warn = () => {};
  return () => ([console.error, console.warn] = saved);
};

const thread = (id, extra = {}) => ({
  id,
  source: "question",
  title: `Title ${id}`,
  question_id: "noticing",
  question_text: "What keeps catching your attention?",
  path_id: "attention",
  response: `  my own words ${id}  `,
  follow_up_text: "Which fits?",
  option_id: "opt-a",
  option_label: "Option A",
  notes: `notes ${id}`,
  created_date: `2026-10-0${id.slice(-1)}T00:00:00Z`,
  ...extra,
});

/** An in-memory account: threads, records and the migration record, with switchable failures. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A minimal stand-in for navigator.locks: one holder at a time, the rest wait in order. */
function fakeLocks() {
  const queues = new Map();
  return {
    request(name, fn) {
      const previous = queues.get(name) || Promise.resolve();
      const run = previous.then(() => fn());
      queues.set(name, run.catch(() => {}));
      return run;
    },
  };
}

function fakeAccount(threads, { failCreateFor = [], failStateWrite = false, corruptState = false, failListThreads = false, slow = false } = {}) {
  const account = {
    threads: threads.map((t) => ({ ...t })),
    records: [],
    state: corruptState ? "{not json" : null,
    creates: 0,
    deletedThreads: 0,
  };
  let next = 1;
  account.io = {
    readState: async () => {
      if (account.state === "{not json") throw new Error("The migration record can't be read");
      return { row: account.state ? { id: "s1" } : null, ids: new Set(account.state ? JSON.parse(account.state) : []) };
    },
    writeState: async (state) => {
      if (failStateWrite) throw new Error("state write failed");
      account.state = JSON.stringify([...state.ids]);
    },
    listRecords: async () => {
      if (slow) await tick();
      return account.records.map((r) => ({ ...r }));
    },
    listThreads: async () => {
      if (failListThreads) throw new Error("list failed");
      return account.threads.map((t) => ({ ...t }));
    },
    createRecord: async (fields) => {
      if (slow) await tick();
      if (failCreateFor.includes(fields.source.thread_id)) throw new Error("create failed");
      account.creates += 1;
      account.records.push({ id: `rec-${next++}`, ...fields });
    },
  };
  return account;
}

// ---------- Migration ----------

test("migration copies each thread once, word for word, and never touches the originals", async () => {
  const restore = quiet();
  const originals = [thread("t1"), thread("t2", { source: "own", question_id: "", option_id: "", option_label: "" })];
  const account = fakeAccount(originals);
  const result = await runMigration(account.io);
  restore();
  assert.deepEqual(result, { moved: 2, skipped: 0, failed: 0 });
  assert.equal(account.records.length, 2);
  assert.deepEqual(account.threads, originals, "originals are unchanged and nothing was deleted");
  const moved = account.records.find((r) => r.source.thread_id === "t1");
  assert.equal(moved.body, "  my own words t1  ", "the participant's words are not trimmed or reworded");
  assert.equal(moved.title, "Title t1");
  assert.equal(moved.source.option_label, "Option A");
  assert.equal(moved.source.notes, "notes t1");
  assert.equal(moved.source.migrated_from, "DiscoveryThread");
  assert.deepEqual(JSON.parse(account.state).sort(), ["t1", "t2"]);
  const rules = read("src/lib/discoveryMigration.js");
  const moveRules = rules.slice(rules.indexOf("export function planMigration"), rules.indexOf("export function unmovedThreads"));
  assert.doesNotMatch(moveRules, /\.delete\(|deleteThread|deleteRecord|deleteAll|deleteMigratedEntry/, "planning and running the move can't delete anything");
  assert.doesNotMatch(rules, /base44|import /, "the rules stay free of the account client");
});

test("migration is idempotent: a second and third run create nothing", async () => {
  const account = fakeAccount([thread("t1"), thread("t2"), thread("t3")]);
  await runMigration(account.io);
  const second = await runMigration(account.io);
  const third = await runMigration(account.io);
  assert.deepEqual(second, { moved: 0, skipped: 3, failed: 0 });
  assert.deepEqual(third, { moved: 0, skipped: 3, failed: 0 });
  assert.equal(account.records.length, 3);
});

test("partial failure: what failed is retried next run, nothing is duplicated", async () => {
  const restore = quiet();
  const account = fakeAccount([thread("t1"), thread("t2"), thread("t3")], { failCreateFor: ["t2"] });
  const first = await runMigration(account.io);
  assert.deepEqual(first, { moved: 2, skipped: 0, failed: 1 });
  assert.deepEqual(JSON.parse(account.state).sort(), ["t1", "t3"], "the failed thread is not marked as moved");
  assert.equal(unmovedThreads(account.threads, account.records, JSON.parse(account.state)).map((t) => t.id).join(), "t2", "the failed one still shows on the page from its original copy");

  const healthy = { ...account.io, createRecord: async (fields) => account.records.push({ id: "rec-late", ...fields }) };
  const second = await runMigration(healthy);
  restore();
  assert.deepEqual(second, { moved: 1, skipped: 2, failed: 0 });
  assert.deepEqual(account.records.map((r) => r.source.thread_id).sort(), ["t1", "t2", "t3"]);
});

test("if the migration record can't be saved, source.thread_id still prevents a second copy", async () => {
  const restore = quiet();
  const account = fakeAccount([thread("t1"), thread("t2")], { failStateWrite: true });
  await runMigration(account.io);
  const again = await runMigration(account.io);
  restore();
  assert.equal(account.state, null);
  assert.deepEqual(again, { moved: 0, skipped: 2, failed: 0 });
  assert.equal(account.records.length, 2);
});

test("a failed read stops migration before anything is created", async () => {
  const listFails = fakeAccount([thread("t1")], { failListThreads: true });
  await assert.rejects(runMigration(listFails.io));
  assert.equal(listFails.creates, 0);

  const corrupt = fakeAccount([thread("t1")], { corruptState: true });
  await assert.rejects(runMigration(corrupt.io));
  assert.equal(corrupt.creates, 0);
});

test("a discovery the participant deleted after it moved is not copied back", async () => {
  const account = fakeAccount([thread("t1"), thread("t2")]);
  await runMigration(account.io);
  account.records = account.records.filter((r) => r.source.thread_id !== "t1"); // deleted on the page
  const again = await runMigration(account.io);
  assert.deepEqual(again, { moved: 0, skipped: 2, failed: 0 });
  assert.equal(account.records.length, 1);
  assert.equal(unmovedThreads(account.threads, account.records, JSON.parse(account.state)).length, 0, "and it isn't shown again");
});

test("duplicate or id-less threads are skipped", () => {
  const plan = planMigration({ threads: [thread("t1"), thread("t1"), { title: "no id" }, null] });
  assert.equal(plan.toCreate.length, 1);
  assert.equal(plan.skipped, 3);
});

test("migration is off for participants: shipped switch is off, and only named test accounts can turn it on", () => {
  assert.equal(MIGRATION_SWITCH.enabled, false, "must stay false until the move has been reviewed");
  assert.deepEqual(MIGRATION_SWITCH.testEmails, [], "no account is opted in by default");
  assert.equal(migrationAllowed("someone@example.com"), false);
  assert.equal(migrationAllowed(""), false);
  const settings = { enabled: false, testEmails: ["Tester@Example.com"] };
  assert.equal(migrationAllowed(" tester@example.com ", settings), true);
  assert.equal(migrationAllowed("participant@example.com", settings), false);
  assert.equal(migrationAllowed("anyone@example.com", { enabled: true, testEmails: [] }), true);
  const page = read("src/pages/DiscoveryRecordPage.jsx");
  assert.ok(page.indexOf("migrationAllowed(email)") < page.indexOf("migrateThreadsToRecords()"), "the page checks the switch before migrating");
});

// ---------- What shows on the page and in the download ----------

test("before migration every earlier save shows; once moved, each discovery shows once", async () => {
  const threads = [thread("t1"), thread("t2")];
  assert.equal(unmovedThreads(threads, [], []).length, 2);
  const account = fakeAccount(threads);
  await runMigration(account.io);
  assert.equal(unmovedThreads(account.threads, account.records, JSON.parse(account.state)).length, 0);
  assert.equal(account.records.filter(isDiscoveryFlowRecord).length, 2);
});

test("the download writes a moved discovery once and keeps any not yet moved", () => {
  const threads = [thread("t1"), thread("t2"), thread("t2")];
  const records = [{ id: "r1", ...recordFromThread(threads[0]) }];
  const earlier = threadsForExport(threads, records);
  assert.deepEqual(earlier.map((t) => t.id), ["t2"]);
  const text = discoveryExportLines(earlier).join("\n");
  assert.match(text, /\(1 discovery\)/);
  assert.doesNotMatch(text, /Title t1/);
});

test("the Settings download reads the Discovery Record from the account, not the page's memory", () => {
  const settings = read("src/pages/Settings.jsx");
  const fn = settings.slice(settings.indexOf("const download = async"), settings.indexOf("const deleteAllDiscoveries"));
  assert.match(fn, /listAllDiscoveryRecords\(\)/);
  assert.match(fn, /listAllThreads\(\)/);
  assert.match(fn, /threadsForExport\(threads, records, movedIds\)/);
  assert.doesNotMatch(fn, /listDiscoveries\(\)|listMyThreads\(\)/);
  const lib = read("src/lib/discoveries.js");
  assert.match(lib, /export async function listAllDiscoveryRecords\(\)\s*\{\s*return dedupeByThreadId\(await listAllRecords\(\)\)/);
  assert.match(lib, /if \(!fresh\) throw new Error/, "paging throws rather than returning a partial list");
});

// ---------- Deletion ----------

function pagedStore(count, { stuck = false } = {}) {
  const rows = Array.from({ length: count }, (_, i) => ({ id: `row-${i}` }));
  return {
    rows,
    list: async () => rows.slice(0, 200),
    del: async (id) => {
      if (stuck) return;
      rows.splice(rows.findIndex((r) => r.id === id), 1);
    },
  };
}

test("delete-all clears accounts larger than one page", async () => {
  const store = pagedStore(450);
  assert.equal(await deleteAllPaged(store.list, store.del), 450);
  assert.equal(store.rows.length, 0);
});

test("delete-all stops with an error instead of looping when rows come back", async () => {
  const store = pagedStore(3, { stuck: true });
  await assert.rejects(deleteAllPaged(store.list, store.del, "Discoveries"), /keep coming back/);
});

test("the workbook (and the migration record in it) is deleted last, and only if discovery deletion finished", async () => {
  const restore = quiet();
  const order = [];
  const failed = await runSteps([
    ["earlier copies", async () => order.push("threads")],
    ["records", async () => { order.push("records"); throw new Error("nope"); }],
    ["my records", async () => order.push("myRecords")],
    ["workbook", async () => order.push("workbook"), { requiresClean: true }],
  ]);
  restore();
  assert.deepEqual(order, ["threads", "records", "myRecords"]);
  assert.deepEqual(failed, ["records", "workbook"]);

  const settings = read("src/pages/Settings.jsx");
  const steps = settings.slice(settings.indexOf("const WORKBOOK_STEPS"), settings.indexOf("const SYNC_WORDS"));
  const at = (name) => steps.indexOf(name);
  assert.ok(at("deleteAllThreads") < at("deleteAllDiscoveryRecords"));
  assert.ok(at("deleteAllDiscoveryRecords") < at("deleteAccountWorkbook"));
  assert.match(steps, /deleteAccountWorkbook, \{ requiresClean: true \}/);
});

test("after a full discovery delete, migration has nothing to copy back", async () => {
  const account = fakeAccount([thread("t1"), thread("t2")]);
  await runMigration(account.io);
  account.threads = [];
  account.records = [];
  const again = await runMigration(account.io);
  assert.deepEqual(again, { moved: 0, skipped: 0, failed: 0 });
  assert.equal(account.records.length, 0);
});

test("migration itself never deletes; deleting one entry goes through the exact-match rules", () => {
  const lib = read("src/lib/discoveries.js");
  const migrate = lib.slice(lib.indexOf("export function migrateThreadsToRecords"), lib.indexOf("/**\n * Deletes one entry and resolves"));
  assert.doesNotMatch(migrate, /\.delete\(|deleteThread|deleteAll|deleteMigratedEntry/, "migration itself never deletes");
  const remove = lib.slice(lib.indexOf("export function removeDiscoveryConfirmed"), lib.indexOf("export function removeDiscovery("));
  assert.match(remove, /deleteMigratedEntry\(/);
  assert.match(remove, /DiscoveryThread\.filter\(\{ id: threadId \}/);
  assert.match(lib, /if \(!migrating\)/, "one migration at a time per tab");
});

// ---------- Saving and editing ----------

test("a save from Discovery lands in the Discovery Record in the participant's words", () => {
  const row = threadFromDiscovery({
    title: "",
    state: { questionId: "noticing", pointId: "attention", own: false, text: " lists calm me ", optionId: QUESTIONS.noticing.options[0].id, notes: " later " },
  });
  const fields = recordFieldsFromDiscovery(row);
  assert.equal(fields.body, "lists calm me");
  assert.equal(fields.source.kind, "question");
  assert.equal(fields.source.notes, "later");
  assert.equal(fields.source.option_label, QUESTIONS.noticing.options[0].label);
  assert.ok(isDiscoveryFlowRecord(fields));
  const viaRecord = editableFromRecord({ id: "x", ...fields });
  const viaThread = editableFromThread({ id: "x", ...row });
  for (const key of ["title", "response", "notes", "option_id", "option_label", "source", "question_id", "question_text", "path_id", "follow_up_text"]) {
    assert.equal(viaRecord[key], viaThread[key], `${key} reads the same whichever storage it is in`);
  }
});

test("editing a moved entry changes only what was edited and keeps its link to the original", () => {
  const entry = { id: "r1", ...recordFromThread(thread("t1")) };
  const patch = recordPatchFromEdit(entry, { title: "New", response: "new words", notes: "more", option_id: "opt-b", option_label: "Option B" });
  assert.equal(patch.body, "new words");
  assert.equal(patch.source.thread_id, "t1");
  assert.equal(patch.source.question_text, entry.source.question_text);
  assert.equal(patch.source.option_label, "Option B");
  assert.equal(patch.source.notes, "more");
  assert.equal(entry.source.option_label, "Option A", "the stored entry isn't mutated");
});

test("the merged page keeps editing, changing a choice and Try something related", () => {
  const view = read("src/components/discovery/DiscoveryFlowEntry.jsx");
  for (const text of ["Save changes", "Clear my choice", 'type="radio"', "Try something related", "A small experiment · optional", "Yes, delete it"]) {
    assert.ok(view.includes(text), text);
  }
  assert.match(view, /await onSave\(next\);\s*setTitle/, "success only after the save resolves");
  assert.match(view, /Your words are still here/);
  const page = read("src/pages/DiscoveryRecordPage.jsx");
  assert.match(page, /<DiscoveryFlowEntry/);
  assert.match(page, /<DiscoveryCard/);
  assert.match(page, /updateDiscoveryConfirmed\(entry\.id, recordPatchFromEdit\(entry, next\)\)/);
});

test("DiscoveryRecord is owner-only on every operation", () => {
  const schema = JSON.parse(read("base44/entities/DiscoveryRecord.jsonc"));
  for (const op of ["create", "read", "update", "delete"]) {
    assert.deepEqual(schema.rls[op], { created_by_id: "{{user.id}}" }, op);
  }
});

test("participants see 'Discovery Record' everywhere, and /my-discoveries redirects", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.jsx$/.test(name)) files.push(full);
    }
  };
  walk("src");
  for (const file of files) assert.doesNotMatch(read(file), /My Discoveries/, file);
  for (const file of files) assert.doesNotMatch(read(file), /to="\/my-discoveries"/, file);
  assert.match(read("src/App.jsx"), /path="\/my-discoveries" element=\{<Navigate to="\/record" replace \/>\}/);
  assert.doesNotMatch(read("src/App.jsx"), /MyDiscoveriesPage/);
});

// ---------- Two tabs, delete safeguards ----------

test("two tabs migrating at once without the lock would duplicate (this is the risk the lock removes)", async () => {
  const account = fakeAccount([thread("t1"), thread("t2")], { slow: true });
  await Promise.all([runMigration(account.io), runMigration(account.io)]);
  assert.ok(account.records.length > 2, "both tabs copied the same threads");
});

test("two tabs migrating at once with the lock create each record exactly once", async () => {
  const locks = fakeLocks();
  const account = fakeAccount([thread("t1"), thread("t2"), thread("t3")], { slow: true });
  const tab = () => withMigrationLock(() => runMigration(account.io), locks);
  const results = await Promise.all([tab(), tab(), tab()]);
  assert.equal(account.records.length, 3);
  assert.deepEqual(account.records.map((r) => r.source.thread_id).sort(), ["t1", "t2", "t3"]);
  assert.equal(results.filter((r) => r.moved > 0).length, 1, "only one tab did the move");
  assert.equal(results.reduce((sum, r) => sum + r.moved, 0), 3);
  assert.equal(MIGRATION_LOCK, "entrepalooza-discovery-migration");
});

test("the lock is released when a run fails, so the next tab can go", async () => {
  const locks = fakeLocks();
  await assert.rejects(withMigrationLock(async () => { throw new Error("boom"); }, locks));
  assert.equal(await withMigrationLock(async () => "ok", locks), "ok");
});

test("without Web Locks the work still runs", async () => {
  assert.equal(await withMigrationLock(async () => "ran", undefined), "ran");
});

test("a repeat copy from another device is hidden (oldest kept), never deleted", () => {
  const rows = [
    { id: "b", created_date: "2026-11-01T10:00:02Z", source: { thread_id: "t1" } },
    { id: "a", created_date: "2026-11-01T10:00:01Z", source: { thread_id: "t1" } },
    { id: "c", created_date: "2026-11-01T10:00:03Z", source: { thread_id: "t2" } },
    { id: "d", created_date: "2026-11-01T10:00:04Z", source: null },
    { id: "e", created_date: "2026-11-01T10:00:05Z", source: { thread_id: "" } },
  ];
  const kept = dedupeByThreadId(rows).map((r) => r.id).sort();
  assert.deepEqual(kept, ["a", "c", "d", "e"]);
  assert.equal(rows.length, 5, "input untouched");
});

function deleteHarness({ failTombstone = false, failRecord = false, failThread = false, threadRows } = {}) {
  const calls = [];
  const rows = threadRows || [{ id: "t1" }];
  return {
    calls,
    io: {
      tombstone: async (id) => { calls.push(["tombstone", id]); if (failTombstone) throw new Error("tombstone failed"); },
      deleteRecord: async () => { calls.push(["deleteRecord"]); if (failRecord) throw new Error("record delete failed"); },
      findThreadRows: async (id) => { calls.push(["find", id]); return rows; },
      deleteThread: async (id) => { calls.push(["deleteThread", id]); if (failThread) throw new Error("thread delete failed"); },
    },
  };
}
const migratedEntry = (threadId = "t1") => ({ id: "r1", source: { thread_id: threadId, migrated_from: "DiscoveryThread" } });

test("deleting a migrated entry records the thread id first, then deletes the record, then exactly its original", async () => {
  const h = deleteHarness();
  const result = await deleteMigratedEntry({ entry: migratedEntry(), ...h.io });
  assert.deepEqual(h.calls, [["tombstone", "t1"], ["deleteRecord"], ["find", "t1"], ["deleteThread", "t1"]]);
  assert.deepEqual(result, { originalKept: false, threadDeleted: true });
});

test("if the thread id can't be recorded, nothing is deleted", async () => {
  const restore = quiet();
  const h = deleteHarness({ failTombstone: true });
  await assert.rejects(deleteMigratedEntry({ entry: migratedEntry(), ...h.io }));
  restore();
  assert.deepEqual(h.calls, [["tombstone", "t1"]]);
});

test("if the record can't be deleted, the original is left alone", async () => {
  const h = deleteHarness({ failRecord: true });
  await assert.rejects(deleteMigratedEntry({ entry: migratedEntry(), ...h.io }));
  assert.equal(h.calls.some((c) => c[0] === "deleteThread"), false);
});

test("only the single row whose id matches is deleted, even if the lookup returns more", async () => {
  const h = deleteHarness({ threadRows: [{ id: "other-1" }, { id: "t1" }, { id: "other-2" }] });
  await deleteMigratedEntry({ entry: migratedEntry(), ...h.io });
  assert.deepEqual(h.calls.filter((c) => c[0] === "deleteThread"), [["deleteThread", "t1"]]);

  const none = deleteHarness({ threadRows: [{ id: "other-1" }] });
  const result = await deleteMigratedEntry({ entry: migratedEntry(), ...none.io });
  assert.equal(none.calls.some((c) => c[0] === "deleteThread"), false, "no exact match, so nothing deleted");
  assert.deepEqual(result, { originalKept: false, threadDeleted: false });
});

test("an entry without the migration marker never touches DiscoveryThread", async () => {
  for (const entry of [{ id: "r1", source: { kind: "question" } }, { id: "r2", source: { thread_id: "t1" } }, { id: "r3", source: null }, { id: "r4" }]) {
    const h = deleteHarness();
    await deleteMigratedEntry({ entry, ...h.io });
    assert.deepEqual(h.calls, [["deleteRecord"]], JSON.stringify(entry));
  }
});

test("if the original can't be deleted, the entry is still gone, the person is told, and it can't come back", async () => {
  const restore = quiet();
  const h = deleteHarness({ failThread: true });
  const result = await deleteMigratedEntry({ entry: migratedEntry(), ...h.io });
  restore();
  assert.deepEqual(result, { originalKept: true, threadDeleted: false });
  assert.deepEqual(h.calls.slice(0, 2), [["tombstone", "t1"], ["deleteRecord"]]);
  // The recorded id keeps migration, the page and the download from using the leftover original.
  const moved = ["t1"];
  assert.deepEqual(planMigration({ threads: [thread("t1")], movedIds: moved }).toCreate, []);
  assert.deepEqual(unmovedThreads([thread("t1")], [], moved), []);
  assert.deepEqual(threadsForExport([thread("t1")], [], moved), []);
});

test("wiring: migrate, delete one and delete all all take the lock; reads merge ids across devices", () => {
  const lib = read("src/lib/discoveries.js");
  assert.match(lib, /migrating = withMigrationLock\(\(\) =>\s*runMigration\(/);
  assert.match(lib, /export function removeDiscoveryConfirmed\(id\) \{\s*return withMigrationLock\(/);
  assert.match(lib, /export function deleteAllDiscoveryRecords\(\) \{\s*return withMigrationLock\(/);
  assert.match(read("src/lib/discoveryThreads.js"), /return withMigrationLock\(\(\) => deleteAllPaged\(listMyThreads/);
  assert.match(lib, /latest\.ids\.forEach\(\(id\) => state\.ids\.add\(id\)\)/, "a write never drops ids another tab recorded");
  assert.match(lib, /dedupeByThreadId\(await listAllRecords\(\)\)/);
  assert.match(read("src/pages/Settings.jsx"), /threadsForExport\(threads, records, movedIds\)/);
  assert.equal(MIGRATION_SWITCH.enabled, false);
  assert.deepEqual(MIGRATION_SWITCH.testEmails, []);
});
