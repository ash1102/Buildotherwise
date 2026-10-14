import { useEffect } from "react";
import { readStore, useStore, writeStore } from "./store";

/**
 * Getting Started is the gate before the workbook: steps O.1 to O.5.
 * Whether those steps are done is decided from the answers saved in the browser.
 * The popup below is an older way to fill the same boxes. Submitting it does not
 * open the workbook. The five steps do.
 */

export {
  GS_CODES,
  isGettingStartedLesson,
  gettingStartedSteps,
  gettingStartedStepDone,
  gettingStartedFinished,
  gettingStartedResumePath,
} from "./gettingStartedProgress";

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
