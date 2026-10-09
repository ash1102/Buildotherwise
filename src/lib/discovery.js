/**
 * Which saved answer feeds which part of the Builder Discovery Record.
 * Inputs arrive from the activities themselves, so nothing is entered twice.
 */
export const DISCOVERY_SOURCES = {
  "M1-L1#0": { section: "curiosity", label: "What my attention returned to" },
  "M1-L2#2": { section: "curiosity", label: "The sign I said I would watch" },
  "M1-L2#4": { section: "conditions", label: "Conditions that might shape the pattern" },
  "M2-L1#0": { section: "try_plan", label: "The question this try is for" },
  "M2-L1#1": { section: "try_plan", label: "Smallest real action" },
  "M2-L1#2": { section: "try_plan", label: "Balance condition" },
  "M2-L1#3": { section: "try_plan", label: "Boundary" },
  "M2-L1#4": { section: "try_plan", label: "Support" },
  "M2-L1#5": { section: "try_plan", label: "Stop or pause rule" },
  "M2-L2#1": { section: "observed", label: "What I actually did, or did not do" },
  "M2-L2#4": { section: "observed", label: "The story I could easily add" },
  "M2-L2#5": { section: "observed", label: "Evidence that complicates that story" },
  "M2-L2#2": { section: "conditions", label: "A condition or barrier that mattered" },
  "M2-L2#3": { section: "cost", label: "What it cost" },
  "M2-L2#6": { section: "unknown", label: "Still unknown" },
  "M2-L3#0": { section: "observed", label: "What changed from expectation" },
  "M2-L3#1": { section: "observed", label: "Evidence that supports or complicates" },
  "M2-L3#2": { section: "observed", label: "Conditions and after-effects" },
  "M2-L3#3": { section: "unknown", label: "Still unknown" },
  "M2-L3#4": { section: "decide_next", label: "Next action and review point" },
  "M3-L2#0": { section: "conditions", label: "Condition changed" },
  "M3-L2#1": { section: "conditions", label: "What stayed similar" },
  "M3-L3#2": { section: "cost", label: "What it cost" },
  "M4-L3#4": { section: "revised", label: "More accurate wording now" },
  "M5-L3#4": { section: "close", label: "One piece of evidence kept" },
  "M5-L3#5": { section: "close", label: "One thing worth keeping" },
  "M5-L3#6": { section: "close", label: "One support that mattered" },
  "M5-L3#7": { section: "close", label: "One question for later" },
};

/** The named try-log fields the curriculum's own build notes specify. */
export const TRY_LOG_FIELDS = [
  { key: "disc_try_question", source: "M2-L1#0", label: "What it should teach" },
  { key: "disc_try_enjoy", source: "M2-L3#5", label: "Enjoyment (1-7 or words)" },
  { key: "disc_try_progress", source: "M2-L3#6", label: "Goal or accomplishment" },
];

export function entriesFromAnswers(answers = {}) {
  return Object.entries(DISCOVERY_SOURCES)
    .map(([key, meta]) => ({ ...meta, key, value: (answers[key] || "").trim() }))
    .filter((item) => item.value);
}

export function tryLogValues(answers) {
  return TRY_LOG_FIELDS.map((field) => ({
    ...field,
    value: (answers[field.source] || "").trim(),
  }));
}