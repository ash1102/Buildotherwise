/**
 * Which saved answer feeds which part of the Builder Discovery Record.
 * Inputs arrive from the activities themselves, so nothing is entered twice.
 */
export const DISCOVERY_SOURCES = {
  "M1-L1#0": { section: "curiosity", label: "What my attention returned to" },
  "M1-L2#0": { section: "curiosity", label: "The sign I said I would watch" },
  "M1-L2#1": { section: "conditions", label: "Conditions that might shape the pattern" },
  "M2-L1#0": { section: "try_plan", label: "The question this try is for" },
  "M2-L1#1": { section: "try_plan", label: "Smallest real action" },
  "M2-L1#2": { section: "try_plan", label: "Balance condition" },
  "M2-L1#3": { section: "try_plan", label: "Boundary" },
  "M2-L1#4": { section: "try_plan", label: "Support" },
  "M2-L1#5": { section: "try_plan", label: "Stop or pause rule" },
  "M2-L2#1": { section: "observed", label: "What I actually did, or did not do" },
  "M2-L2#2": { section: "observed", label: "What frustrated or bored me" },
  "M2-L2#3": { section: "conditions", label: "What helped" },
  "M2-L2#4": { section: "cost", label: "What it cost" },
  "M2-L2#6": { section: "unknown", label: "Still unknown, or what contradicts my first impression" },
  "M2-L3#0": { section: "observed", label: "What changed from expectation" },
  "M2-L3#1": { section: "observed", label: "Evidence that supports or complicates" },
  "M2-L3#2": { section: "observed", label: "Conditions and after-effects" },
  "M2-L3#3": { section: "unknown", label: "Still unknown" },
  "M2-L3#4": { section: "decide_next", label: "Next action and review point" },
  "M3-L2#0": { section: "conditions", label: "Condition changed" },
  "M3-L2#1": { section: "conditions", label: "What stayed similar" },
  "M3-L3#3": { section: "cost", label: "What it cost" },
  "M4-L3#4": { section: "revised", label: "More accurate wording now" },
  "M5-L3#5": { section: "close", label: "One piece of evidence kept" },
  "M5-L3#6": { section: "close", label: "One thing worth keeping" },
  "M5-L3#7": { section: "close", label: "One support that mattered" },
  "M5-L3#8": { section: "close", label: "One question for later" },
  "M5-L1#pattern-label": { section: "close", label: "A pattern you recognized" },
  "M5-L1#pattern-other": { section: "close", label: "A pattern you described" },
  "M5-L2#stance": { section: "close", label: "What you considered keeping, adjusting, or protecting" },
  "M5-L3#support": { section: "close", label: "What supports this impression" },
  "M5-L3#complicate": { section: "close", label: "What might complicate it" },
  "M5-L3#uncertain": { section: "close", label: "What remains uncertain" },
  "M5-L3#thinking-now": { section: "close", label: "What you're thinking now" },
  "M5-L3#next": { section: "close", label: "What you chose to do next" },
};

/**
 * The record's section labels, shared by the record page's export and the
 * folded view of what the steps already saved.
 */
export const GROUP_LABELS = {
  curiosity: "Where your attention went",
  try_plan: "The try plan and its stop rule",
  observed: "What you observed, and what you made of it",
  unknown: "Still unknown",
  conditions: "Conditions worth keeping or changing",
  cost: "What it cost",
  revised: "Revised statements",
  decide_next: "Next action and review point",
  close: "What you are keeping from Modules 1–5",
};

/** The named try-log fields the curriculum's own build notes specify. */
export const TRY_LOG_FIELDS = [
  { key: "disc_try_question", source: "M2-L1#0", label: "What it should teach" },
  // Enjoyment and goal ratings were pointed at M2-L3 boxes that ask other questions.
  // No step asks for those ratings right now, so they are left out until one does.
];

export function entriesFromAnswers(answers = {}) {
  return Object.entries(DISCOVERY_SOURCES)
    .map(([key, meta]) => ({ ...meta, key, value: (answers[key] || "").trim() }))
    .filter((item) => item.value);
}

/**
 * The answer key a record source comes from, e.g. "M1-L1#0" → step code and prompt
 * position. Kept so every saved answer can name and link to the step it came from.
 */
export function parseSourceKey(key) {
  const [code, index] = String(key || "").split("#");
  return { code: code || "", index: Number(index) };
}

/** The same saved answers, each carrying the step and question it came from. */
export function sourcesFromAnswers(answers = {}, lessonsByCode = {}) {
  return entriesFromAnswers(answers).map((item) => {
    const { code, index } = parseSourceKey(item.key);
    const lesson = lessonsByCode[code];
    const prompts = [...((lesson && lesson.try_prompts) || []), ...((lesson && lesson.reflect_prompts) || [])];
    return {
      ...item,
      lesson_code: code,
      lesson_title: (lesson && lesson.title) || code,
      question: prompts[index] || item.label,
    };
  });
}

/**
 * Lines saved in the steps that are not part of the Discovery Record's own
 * questions. Counted separately so "saved in a step" and "feeds your record" are
 * never read as the same thing.
 */
export function savedLineCount(answers = {}) {
  return Object.values(answers || {}).filter((value) => String(value || "").trim()).length;
}

export function tryLogValues(answers) {
  return TRY_LOG_FIELDS.map((field) => ({
    ...field,
    value: (answers[field.source] || "").trim(),
  }));
}