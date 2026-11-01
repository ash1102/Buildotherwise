import { useCallback, useEffect, useState } from "react";
import { getProgressUserId } from "./progressScope";

export const PREFIX = "entrepalooza.v1.";

/**
 * The parts of the workbook that belong to a person and are kept in their
 * account. While someone is logged in, these keys are read and written under
 * their account on this device and copied to their account (see accountSync.js).
 * Anything not listed here (display settings, unsent drafts) stays on the device.
 */
export const SYNCED_KEYS = new Set([
  "journal",
  "answers",
  "decisions",
  "stepState",
  "carried",
  "lifeMap",
  "lifeMapPick",
  "lifeMapPositions",
  "discoveryNotes",
  "plannedTry",
  "tryCheckIns",
  "moduleOpenedAt",
  "gettingStartedSubmitted",
  "recordPrefillSkipped",
]);

const USER_MARK = "::user::";

/** The base key, without any account suffix. */
export function baseKeyOf(key) {
  const at = String(key).indexOf(USER_MARK);
  return at < 0 ? String(key) : String(key).slice(0, at);
}

/** A synced key is kept under the logged-in account; everything else is used as given. */
export function resolveKey(key) {
  const text = String(key);
  if (text.includes(USER_MARK)) return text;
  const userId = getProgressUserId();
  if (userId && SYNCED_KEYS.has(text)) return `${text}${USER_MARK}${userId}`;
  return text;
}

/** Listeners for local writes, used by the account sync. */
const writeListeners = new Set();
export function onLocalWrite(listener) {
  writeListeners.add(listener);
  return () => writeListeners.delete(listener);
}

export function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + resolveKey(key));
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function writeStore(key, value) {
  const resolved = resolveKey(key);
  try {
    window.localStorage.setItem(PREFIX + resolved, JSON.stringify(value));
  } catch (error) {
    /* storage full or unavailable - the page keeps working with in-memory state */
  }
  writeListeners.forEach((listener) => {
    try {
      listener(resolved);
    } catch {
      /* a sync problem never blocks writing */
    }
  });
  window.dispatchEvent(new CustomEvent("entrepalooza:change", { detail: key }));
}

export function subscribeStore(key, handler) {
  const listener = (event) => {
    if (!event.detail || event.detail === key) handler();
  };
  window.addEventListener("entrepalooza:change", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("entrepalooza:change", listener);
    window.removeEventListener("storage", listener);
  };
}

/** Tell every page to re-read, for example after the account copy arrives. */
export function announceAllChanged() {
  window.dispatchEvent(new CustomEvent("entrepalooza:change", { detail: null }));
}

export function useStore(key, fallback) {
  const initial = typeof fallback === "function" ? fallback : () => fallback;
  const [value, setValue] = useState(() => readStore(key, initial()));

  useEffect(() => {
    setValue(readStore(key, initial()));
    return subscribeStore(key, () => setValue(readStore(key, initial())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next) => {
      const current = readStore(key, initial());
      const resolved = typeof next === "function" ? next(current) : next;
      writeStore(key, resolved);
      return resolved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, update];
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
