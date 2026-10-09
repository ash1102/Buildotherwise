import { useCallback, useEffect, useState } from "react";

const PREFIX = "entrepalooza.v1.";

export function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    /* storage full or unavailable - the page keeps working with in-memory state */
  }
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