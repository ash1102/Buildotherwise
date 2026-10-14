import { useEffect } from "react";
import { readStore, useStore, writeStore } from "./store";

/**
 * Getting Started as a one-time pop-up. It opens on someone's first visit, can be
 * closed with "Not now" and reopened from the home page, and once submitted it is
 * finished: it stops appearing, and the answers stay readable in Settings.
 */

export const GS_CODES = ["O.1", "O.2", "O.3", "O.4", "O.5"];
export const GS_SUBMITTED_KEY = "gettingStartedSubmitted";
export const GS_SEEN_KEY = "gettingStartedPopupSeen";
const OPEN_EVENT = "entrepalooza:open-getting-started";

/** The join choices, in the lesson's own words. */
export const JOIN_CHOICES = ["Join", "Join with adjustments", "Not yet", "No thanks"];

/** O.5's second box holds the choice, written as "Choice — note" so the step page still reads it. */
export function splitChoice(value) {
  const text = String(value || "").trim();
  const match = JOIN_CHOICES.slice()
    .sort((a, b) => b.length - a.length)
    .find((choice) => text === choice || text.startsWith(`${choice} — `));
  if (!match) return { choice: "", note: text };
  return { choice: match, note: text.slice(match.length).replace(/^ — /, "").trim() };
}

export function joinChoiceText(choice, note) {
  const cleanNote = String(note || "").trim();
  if (!choice) return cleanNote;
  return cleanNote ? `${choice} — ${cleanNote}` : choice;
}

export function isGettingStartedLesson(lesson) {
  return Boolean(lesson) && GS_CODES.includes(lesson.code);
}

export function readSubmitted() {
  return readStore(GS_SUBMITTED_KEY, null);
}

export function useGettingStartedSubmitted() {
  const [value] = useStore(GS_SUBMITTED_KEY, null);
  return value;
}

export function markSubmitted(record) {
  writeStore(GS_SUBMITTED_KEY, { at: new Date().toISOString(), ...record });
}

export function markSeen() {
  writeStore(GS_SEEN_KEY, true);
}

export function readSeen() {
  return Boolean(readStore(GS_SEEN_KEY, false));
}

export function openGettingStarted() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function useOpenGettingStartedListener(handler) {
  useEffect(() => {
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, [handler]);
}
