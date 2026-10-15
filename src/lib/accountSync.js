import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { PREFIX, SYNCED_KEYS, announceAllChanged, baseKeyOf, onLocalWrite } from "./store";

/**
 * Keeps a person's workbook in their account.
 *
 * Writing still happens on the device first, so the page never waits on the
 * network. A moment later the changed part is copied to the person's account
 * (the UserStore entity, readable only by that account in the app). On login the
 * account copy is brought down, so the same journal and answers appear on any
 * device. When both sides changed, the newest copy wins.
 *
 * Keys written before logging in that never belonged to an account (the journal,
 * the Life Map) are moved into the first account that logs in on this device.
 * Getting Started answers written while logged out are not, so one person's
 * answers never count as someone else's progress.
 */

const USER_MARK = "::user::";
const SAVE_DELAY = 1200;
/** Progress keys stay per account on purpose; logged-out copies are never moved in. */
const NOT_MIGRATED = new Set(["answers", "decisions", "stepState", "carried"]);

let currentUser = null;
let rowIds = {};
let dirty = new Set();
let timer = null;
let status = "idle";
let pending = Promise.resolve();
const statusListeners = new Set();

function setStatus(next) {
  status = next;
  statusListeners.forEach((listener) => listener(next));
}

function metaKey(userId) {
  return `${PREFIX}__sync${USER_MARK}${userId}`;
}

function readMeta(userId) {
  try {
    return JSON.parse(window.localStorage.getItem(metaKey(userId)) || "{}") || {};
  } catch {
    return {};
  }
}

function writeMeta(userId, meta) {
  try {
    window.localStorage.setItem(metaKey(userId), JSON.stringify(meta));
  } catch {
    /* storage unavailable */
  }
}

function localName(base, userId) {
  return `${PREFIX}${base}${USER_MARK}${userId}`;
}

function readRaw(name) {
  try {
    return window.localStorage.getItem(name);
  } catch {
    return null;
  }
}

function writeRaw(name, value) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(name);
    else window.localStorage.setItem(name, value);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Move device-only copies of the journal and maps into this account, once. Only
 * into a part the account has nothing saved for, so an older device copy never
 * replaces what the account already holds.
 */
function migrateDeviceCopies(userId, inAccount) {
  const meta = readMeta(userId);
  let moved = false;
  SYNCED_KEYS.forEach((base) => {
    if (NOT_MIGRATED.has(base)) return;
    const loose = readRaw(PREFIX + base);
    if (loose === null) return;
    const mine = readRaw(localName(base, userId));
    if (mine === null && !inAccount.has(base)) {
      writeRaw(localName(base, userId), loose);
      meta[base] = { ...(meta[base] || {}), local: Date.now() };
      dirty.add(base);
      moved = true;
    } else if (base === "journal") {
      // Journal notes written on this device before logging in are added, never dropped.
      try {
        const current = JSON.parse(readRaw(localName(base, userId)) || "[]");
        const extra = JSON.parse(loose || "[]");
        const ids = new Set(current.map((entry) => entry.id));
        const added = extra.filter((entry) => entry && !ids.has(entry.id));
        if (added.length) {
          writeRaw(localName(base, userId), JSON.stringify([...current, ...added]));
          meta[base] = { ...(meta[base] || {}), local: Date.now() };
          dirty.add(base);
          moved = true;
        }
      } catch {
        return; // leave the device copy where it is rather than lose it
      }
    }
    writeRaw(PREFIX + base, null);
  });
  writeMeta(userId, meta);
  return moved;
}

async function pull(userId) {
  const rows = await base44.entities.UserStore.list("-updated_date", 200);
  const meta = readMeta(userId);
  const seen = new Set();
  let changed = false;
  (rows || []).forEach((row) => {
    const base = row.store_key;
    if (!SYNCED_KEYS.has(base) || seen.has(base)) return;
    seen.add(base);
    rowIds[base] = row.id;
    const remoteAt = Number(row.client_updated_at) || 0;
    const entry = meta[base] || {};
    const localAt = Number(entry.local) || 0;
    const hasLocal = readRaw(localName(base, userId)) !== null;
    if (!hasLocal || remoteAt > localAt) {
      writeRaw(localName(base, userId), row.value ?? null);
      meta[base] = { local: remoteAt, synced: remoteAt };
      dirty.delete(base);
      changed = true;
    } else if (localAt > remoteAt) {
      dirty.add(base);
    } else {
      meta[base] = { local: localAt, synced: remoteAt };
    }
  });
  // Anything on this device the account has never seen goes up too.
  SYNCED_KEYS.forEach((base) => {
    if (!seen.has(base) && readRaw(localName(base, userId)) !== null) dirty.add(base);
  });
  writeMeta(userId, meta);
  if (changed) announceAllChanged();
  return seen;
}

async function pushOne(userId, base) {
  const meta = readMeta(userId);
  const at = Number(meta[base]?.local) || Date.now();
  const value = readRaw(localName(base, userId));
  const payload = { store_key: base, value: value ?? "", client_updated_at: at, description: base };
  if (rowIds[base]) {
    await base44.entities.UserStore.update(rowIds[base], payload);
  } else {
    const created = await base44.entities.UserStore.create(payload);
    rowIds[base] = created.id;
  }
  const fresh = readMeta(userId);
  fresh[base] = { ...(fresh[base] || {}), synced: at };
  writeMeta(userId, fresh);
}

function flushNow() {
  const userId = currentUser;
  if (!userId || !dirty.size) return pending;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const keys = [...dirty];
  dirty = new Set();
  setStatus("saving");
  pending = pending
    .then(async () => {
      for (const base of keys) {
        if (currentUser !== userId) return;
        try {
          await pushOne(userId, base);
        } catch {
          dirty.add(base);
        }
      }
      if (currentUser === userId) setStatus(dirty.size ? "error" : "saved");
      if (dirty.size && currentUser === userId) schedule(8000);
    })
    .catch(() => setStatus("error"));
  return pending;
}

function schedule(delay = SAVE_DELAY) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    flushNow();
  }, delay);
}

onLocalWrite((resolvedKey) => {
  if (!currentUser) return;
  const at = String(resolvedKey).indexOf(USER_MARK);
  if (at < 0 || String(resolvedKey).slice(at + USER_MARK.length) !== currentUser) return;
  const base = baseKeyOf(resolvedKey);
  if (!SYNCED_KEYS.has(base)) return;
  const meta = readMeta(currentUser);
  meta[base] = { ...(meta[base] || {}), local: Date.now() };
  writeMeta(currentUser, meta);
  dirty.add(base);
  setStatus("saving");
  schedule();
});

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (currentUser && dirty.size) flushNow();
  });
  window.addEventListener("beforeunload", () => {
    if (currentUser && dirty.size) flushNow();
  });
}

/** Start keeping this account's workbook in sync. Safe to call more than once. */
export async function startAccountSync(userId) {
  if (!userId || currentUser === userId) return;
  currentUser = userId;
  rowIds = {};
  dirty = new Set();
  setStatus("loading");
  try {
    const inAccount = await pull(userId);
    if (currentUser !== userId) return;
    if (migrateDeviceCopies(userId, inAccount)) announceAllChanged();
    if (dirty.size) await flushNow();
    else setStatus("saved");
  } catch {
    if (currentUser === userId) {
      setStatus("offline");
      if (dirty.size) schedule(8000);
    }
  }
}

/**
 * Before logging out: save what is left, then take this account's copy off the
 * device, so the next person on a shared computer does not see it. Anything that
 * could not be saved stays on the device rather than being lost.
 */
export async function stopAccountSync() {
  const userId = currentUser;
  if (!userId) return;
  try {
    await flushNow();
  } catch {
    /* handled below: unsaved keys are kept */
  }
  const unsaved = new Set(dirty);
  SYNCED_KEYS.forEach((base) => {
    if (!unsaved.has(base)) writeRaw(localName(base, userId), null);
  });
  if (!unsaved.size) writeRaw(metaKey(userId), null);
  currentUser = null;
  rowIds = {};
  dirty = new Set();
  setStatus("idle");
  announceAllChanged();
}

/** Delete this account's saved workbook from the account and from this device. */
export async function deleteAccountWorkbook() {
  const userId = currentUser;
  if (!userId) return 0;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  dirty = new Set();
  await pending.catch(() => {});
  const rows = await base44.entities.UserStore.list("-updated_date", 200);
  for (const row of rows || []) {
    await base44.entities.UserStore.delete(row.id);
  }
  SYNCED_KEYS.forEach((base) => writeRaw(localName(base, userId), null));
  writeRaw(metaKey(userId), null);
  rowIds = {};
  announceAllChanged();
  setStatus("saved");
  return (rows || []).length;
}

export function getSyncStatus() {
  return status;
}

export function useSyncStatus() {
  const [value, setValue] = useState(status);
  useEffect(() => {
    statusListeners.add(setValue);
    setValue(status);
    return () => statusListeners.delete(setValue);
  }, []);
  return value;
}
