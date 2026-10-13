/**
 * Content status tags for the preview. Every block of teaching, reading or
 * interaction carries one, so a reviewer can always tell owner-approved wording
 * from a placeholder, a draft, or a new proposal. Nothing here is a claim that
 * the content is approved.
 */
export const TAG = {
  VERBATIM: "verbatim",
  NEEDS_FULL_TEXT: "needs_full_text",
  DRAFT: "draft",
  NEEDS_WORDING: "needs_wording",
  PROPOSED: "proposed",
  REUSED: "reused",
  PLACEHOLDER: "placeholder",
};

export const TAG_LABELS = {
  verbatim: { short: "Your exact words", long: "Copied from your own text, unedited.", tone: "ok" },
  needs_full_text: {
    short: "Needs full text from Ashley",
    long: "A shortened version is loaded. The full text is not in this preview yet.",
    tone: "warn",
  },
  draft: {
    short: "Draft: needs Ashley’s approval",
    long: "Written from this module’s own lesson text. Not your wording, not approved.",
    tone: "warn",
  },
  needs_wording: {
    short: "Needs Ashley’s wording",
    long: "Factually needed, but not your words yet. Kept in place until you replace them.",
    tone: "warn",
  },
  proposed: {
    short: "New proposal, not approved",
    long: "A new interaction or example proposed for review. Not existing curriculum.",
    tone: "warn",
  },
  reused: {
    short: "Existing approved lesson",
    long: "Rendered from the lesson record already in the app. Nothing was rewritten.",
    tone: "muted",
  },
  placeholder: {
    short: "Not written yet",
    long: "This part is still empty. Nothing has been invented to fill it.",
    tone: "warn",
  },
};

/** How a skipped or blank answer is described. Never a decision, never a label. */
export const NO_RESPONSE = "No response";

/** The eight Next Decision words. Pass is a route, not one of these. */
export const NEXT_DECISION_LABELS = [
  "Keep",
  "Change",
  "Test again",
  "Pause",
  "Stop",
  "Another direction",
  "Continue looking",
  "I don't know yet",
];

export const CONTINUE_LOOKING = "Continue looking";

/** Pilot split from the build brief. */
export const PILOT_ONE = "Pilot 1";
export const OPTIONAL_AFTER_PILOT_ONE = "Optional, after Pilot 1";