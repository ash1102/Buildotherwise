import { useEffect, useState } from "react";
import { makeId, readStore, subscribeStore, writeStore } from "./store";

/**
 * Discovery entries live in their own browser-local list.
 * Nothing here writes to the stores the rest of the workbook already uses
 * (answers, decisions, stepState, carried, lifeMap, discoveryNotes, journal),
 * so adding, editing or deleting a discovery never changes a source entry.
 */
const KEY = "discoveries";

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

export function listDiscoveries() {
  const items = readStore(KEY, []);
  return [...items].sort((a, b) => (a.created_date < b.created_date ? 1 : -1));
}

export function getDiscovery(id) {
  return readStore(KEY, []).find((entry) => entry.id === id) || null;
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
  writeStore(KEY, [...readStore(KEY, []), entry]);
  return entry;
}

export function updateDiscovery(id, patch) {
  writeStore(
    KEY,
    readStore(KEY, []).map((entry) =>
      entry.id === id ? { ...entry, ...patch, updated_date: new Date().toISOString() } : entry
    )
  );
}

export function removeDiscovery(id) {
  writeStore(
    KEY,
    readStore(KEY, []).filter((entry) => entry.id !== id)
  );
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

export function useDiscoveries() {
  const [items, setItems] = useState(() => listDiscoveries());
  useEffect(() => subscribeStore(KEY, () => setItems(listDiscoveries())), []);
  return items;
}