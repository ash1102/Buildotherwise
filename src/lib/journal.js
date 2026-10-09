import { useEffect, useState } from "react";
import { makeId, readStore, subscribeStore, writeStore } from "./store";

const KEY = "journal";

export function listEntries() {
  const entries = readStore(KEY, []);
  return [...entries].sort((a, b) => (a.created_date < b.created_date ? 1 : -1));
}

export function addEntry(fields) {
  const now = new Date().toISOString();
  const entry = {
    id: makeId("entry"),
    kind: "free",
    body: "",
    lesson_code: "",
    lesson_title: "",
    prompt: "",
    route: "",
    revision_of: "",
    created_date: now,
    updated_date: now,
    ...fields,
  };
  writeStore(KEY, [...readStore(KEY, []), entry]);
  return entry;
}

export function updateEntry(id, patch) {
  const next = readStore(KEY, []).map((entry) =>
    entry.id === id ? { ...entry, ...patch, updated_date: new Date().toISOString() } : entry
  );
  writeStore(KEY, next);
}

export function removeEntry(id) {
  writeStore(
    KEY,
    readStore(KEY, []).filter((entry) => entry.id !== id)
  );
}

export function getEntry(id) {
  return readStore(KEY, []).find((entry) => entry.id === id) || null;
}

export function entriesFor(lessonCode) {
  return listEntries().filter((entry) => entry.lesson_code === lessonCode);
}

/** Latest saved answer per prompt key, so a lesson always reopens where it was left. */
export function entryForPrompt(lessonCode, promptKey) {
  const matches = listEntries().filter(
    (entry) => entry.lesson_code === lessonCode && entry.prompt === promptKey
  );
  return matches[0] || null;
}

export function saveAnswer({ lessonCode, lessonTitle, promptKey, promptLabel, body, route }) {
  const existing = entryForPrompt(lessonCode, promptKey);
  if (!existing) {
    return addEntry({
      kind: "lesson",
      lesson_code: lessonCode,
      lesson_title: lessonTitle,
      prompt: promptKey,
      prompt_label: promptLabel,
      body,
      route: route || "",
    });
  }
  updateEntry(existing.id, { body, route: route ?? existing.route });
  return { ...existing, body, route: route ?? existing.route };
}

/** Revision keeps the earlier wording visible instead of overwriting it. */
export function reviseEntry(id, body) {
  const earlier = getEntry(id);
  if (!earlier) return null;
  return addEntry({
    kind: earlier.kind,
    lesson_code: earlier.lesson_code,
    lesson_title: earlier.lesson_title,
    prompt: earlier.prompt,
    prompt_label: earlier.prompt_label,
    route: earlier.route,
    revision_of: id,
    body,
  });
}

/** A follow-up is its own dated entry, linked to the one it answers. */
export function addFollowUp(parent, body) {
  return addEntry({
    kind: parent.kind,
    body,
    follow_up_of: parent.id,
    lesson_code: parent.lesson_code || "",
    lesson_title: parent.lesson_title || "",
    // A distinct prompt key keeps a lesson reopening on its own saved answer.
    prompt: parent.prompt ? `${parent.prompt}#followup` : "followup",
    prompt_label: "Follow-up",
  });
}

export function useJournalEntries() {
  const [entries, setEntries] = useState(() => listEntries());
  useEffect(() => subscribeStore(KEY, () => setEntries(listEntries())), []);
  return entries;
}