import { useEffect } from "react";
import { readStore, useStore, writeStore } from "./store";

/**
 * Getting Started is the gate before the workbook: steps O.1, O.4 and O.5 (O.3 optional).
 * Whether those steps are done is decided from the answers saved in the browser.
 * The popup below is an older way to fill the same boxes. Submitting it does not
 * open the workbook. The steps do.
 */

export {
  GS_CODES,
  OPTIONAL_GS_CODES,
  OPTIONAL_IN_FLOW_GS_CODES,
  isOptionalGettingStartedLesson,
  isOptionalInFlowGettingStartedLesson,
  gettingStartedStepSettled,
  firstOpenGettingStartedStep,
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

/**
 * O.5 "Make this experience yours" (the learning agreement, Oct 23, 2026).
 * Slot 1 held the old join choice and is retired (left blank so old answers never show under a new question).
 * Slot 2: why I'm here. Slot 3: my approach. Slot 4: my note (optional, private).
 */
export const AGREEMENT_CODE = "O.5";
export const AGREEMENT_WHY = 2;
export const AGREEMENT_APPROACH = 3;
export const AGREEMENT_NOTE = 4;
export const SOMETHING_ELSE = "Something else";
export const WHY_CHOICES = [
  "I'm trying to figure out what I want.",
  "I'm ready for something to change.",
  "I have ideas I want to explore.",
  "I'm curious. That's all I know.",
  SOMETHING_ELSE,
];
export const APPROACH_CHOICES = ["At my own pace.", "One small step at a time.", "I'm not sure yet."];
export const AGREEMENT_PERMISSION =
  "I give myself permission to explore, question, experiment, change direction, and move at my own pace.";

/** "Something else — my words" reads back as the choice plus the typed words. */
export function splitWhy(value) {
  const text = String(value || "").trim();
  if (!text) return { choice: "", other: "" };
  if (text === SOMETHING_ELSE || text.startsWith(`${SOMETHING_ELSE} — `)) {
    return { choice: SOMETHING_ELSE, other: text.slice(SOMETHING_ELSE.length).replace(/^ — /, "").trim() };
  }
  return { choice: text, other: "" };
}

export function whyText(choice, other) {
  if (choice !== SOMETHING_ELSE) return choice || "";
  const words = String(other || "").trim();
  return words ? `${SOMETHING_ELSE} — ${words}` : SOMETHING_ELSE;
}

/** What the participant would say: their own words for "Something else", or the choice. */
export function whyDisplay(value) {
  const { choice, other } = splitWhy(value);
  return choice === SOMETHING_ELSE ? other || SOMETHING_ELSE : choice;
}

export function readAgreement(answers) {
  const get = (index) => String((answers || {})[`${AGREEMENT_CODE}#${index}`] || "").trim();
  return { why: whyDisplay(get(AGREEMENT_WHY)), approach: get(AGREEMENT_APPROACH), note: get(AGREEMENT_NOTE) };
}

/** The copy-button text. Lines nobody filled in are left out. */
export function agreementText({ why, approach, note }) {
  const lines = ["My Entrepalooza learning agreement"];
  if (why) lines.push(`Why I'm here: ${why}`);
  if (approach) lines.push(`My approach: ${approach}`);
  if (note) lines.push(`My note: ${note}`);
  lines.push("", AGREEMENT_PERMISSION);
  return lines.join("\n");
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
