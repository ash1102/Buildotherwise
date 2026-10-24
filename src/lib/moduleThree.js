import { answerKey, setAnswer } from "./workbook";
import { saveAnswer } from "./journal";
import { FINISHED, joinMulti, plainValue, splitMulti } from "./moduleOne";

/**
 * Module 3 interactive lessons, "Test How I Operate" (review branch "module-3-interactive",
 * Oct 24, 2026). Built on the Module 1 pattern (src/lib/moduleOne.js, moduleOne/parts.jsx).
 * Wording comes from Ashley's "Module 3 Interactive Redesign" instructions unless a comment
 * says DRAFT (Claude). Nothing here is approved participant curriculum yet.
 *
 * Module 3 does not import Module 2 code. It reads Module 2's saved answers by key, so it
 * works whether or not the Module 2 redesign (branch module-2-interactive) is merged first.
 *
 * SAVED-ANSWER KEYS (workbook answers store, synced to the account; journal entries are
 * upserted by prompt key, so repeat taps never add duplicates).
 *
 * Existing keys reused WITH THEIR ORIGINAL MEANING (other pages read them):
 *   M3-L1#0   the task or experience being considered   (was: "Start with the encounter… or an ordinary task")
 *   M3-L1#1   the setup, in their own words              (was: "What part of its setup can you actually describe")
 *   M3-L2#0   what they'll try differently               (was: "What single part of the setup would you change?")
 *             Records page "Named try", Discovery record "Condition changed".
 *   M3-L2#2   a reasonable limit or stopping point       (was: "What time limit, support, and stop rule…")
 *   M3-L2#4   what happened, in their own words          (was: "What actually happened, or why was it not tried?")
 *   M3-L3#1   what seemed to help or change              (was: "What changed, and what else was different?") Bridge into Module 4.
 *   M3-L3#3   costs and unknowns, in their own words     (was: "What did it cost during and afterward? What is unknown?")
 *   M3-L3#4   optional explanation of what to do next    (was: "Would you choose that condition again? What could change your mind?") Bridge into Module 5.
 *   M3-L3#5   the observation or question for Module 4   (was: "Which observation and unanswered question… carry into Module 4?") Bridge into Module 4.
 *
 * New keys:
 *   M3-L1#source       where the experience comes from (one of SOURCES)
 *   M3-L1#influences   conditions that might have influenced it ("; "-joined CONDITION labels, or NOT_SURE / SOMETHING_ELSE)
 *   M3-L1#focus        one condition id to look at more closely, or "unsure"   → preselects M3-L2#condition
 *   M3-L2#task-mode    continue / different task / provided example (one of TASK_MODES)
 *   M3-L2#task         the task they'll use (editable)
 *   M3-L2#condition    the condition id they'll change
 *   M3-L2#plan         the plan as plain sentences (records page: Named try)
 *   M3-L2#plan-saved   ISO date, when they tapped "Save my plan and come back"
 *   M3-L2#example-use  for the provided example: wrote it both ways / once / only looked
 *   M3-L2#as-planned   optional: tried as planned / partly / something different
 *   M3-L2#outcome      what happened (one of OUTCOMES)
 *   M3-L2#checkin      what happened as plain sentences (records page: Try review)
 *   M3-L3#helped       what seemed to help ("; "-joined)
 *   M3-L3#costs        what made it harder or less practical ("; "-joined)
 *   M3-L3#uncertain    what remains uncertain ("; "-joined)
 *   M3-L3#next         what to do next (one of NEXT_OPTIONS)
 *   <code>#finished    "I'm done with this lesson for now"
 *
 * Older keys from the previous version (M3-L1#2, #3; M3-L2#1, #3, #5, #6; M3-L3#0, #2) are
 * never written here. They are shown read-only and still count toward progress.
 */

export const M3_CODES = ["M3-L1", "M3-L2", "M3-L3"];
export const L1_TITLE = "Understand the setup around a task";
export const L2_TITLE = "Try changing one part of the setup";
export const L3_TITLE = "Review what helped and what it cost";

export const SOURCES = [
  "My Module 2 exploration",
  "Another ordinary activity from my life",
  "The provided example",
];
export const SOURCE_M2 = SOURCES[0];
export const SOURCE_OTHER = SOURCES[1];
export const SOURCE_EXAMPLE = SOURCES[2];

/**
 * The five conditions. `explain` (M3-L1 card) and `change` (M3-L2 option) are Ashley's
 * wording. `example` and `question` are DRAFT (Claude), written for her review.
 */
export const CONDITIONS = [
  {
    id: "time",
    card: "Time pressure",
    option: "Time and pace",
    explain: "Deadlines, available time, and pace can influence an experience.",
    change: "Change when the task happens or how long it lasts.",
    example:
      "Filling out a form ten minutes before the office closes can feel very different from filling out the same form at home with no deadline.",
    question: "Did how much time you had, or how fast you had to go, shape what happened?",
  },
  {
    id: "environment",
    card: "Environment",
    option: "Environment",
    explain: "Noise, interruptions, comfort, and physical setting may matter.",
    change: "Change noise, interruptions, or physical setting.",
    example:
      "Reading a set of directions at a kitchen table with the TV on and people asking questions, compared with reading them somewhere quiet.",
    question: "Where were you, and was anything pulling your attention away or making you uncomfortable?",
  },
  {
    id: "instructions",
    card: "Instructions",
    option: "Clearer instructions",
    explain: "Clear expectations, demonstrations, and examples can affect how someone approaches a task.",
    change: "Try an example, checklist, or demonstration.",
    example: "Setting up a new phone from a folded leaflet, compared with watching someone do it once first.",
    question: "Did you know what you were supposed to do, and what “done” looked like?",
  },
  {
    id: "support",
    card: "Support",
    option: "Support",
    explain: "Guidance, feedback, collaboration, or the opportunity to work independently may affect engagement.",
    change: "Try guidance, feedback, collaboration, or greater independence.",
    example:
      "Cooking a new recipe with someone nearby who can answer questions, compared with figuring it out alone. Either one can suit a person, and it can change from task to task.",
    question: "Was anyone there to help, give feedback, or leave you to it, and did that fit this task?",
  },
  {
    id: "choice",
    card: "Choice and structure",
    option: "Choice and structure",
    explain: "The degree of flexibility or structure can change how a task feels.",
    change: "Change the amount of flexibility or structure.",
    example:
      "Being told exactly which steps to follow, compared with being given the goal and left to choose how to get there.",
    question: "How much say did you have in how you did it, and was there enough structure to know where to start?",
  },
];
export const CONDITION_BY_ID = Object.fromEntries(CONDITIONS.map((item) => [item.id, item]));

export const NOT_SURE = "I’m not sure";
export const SOMETHING_ELSE = "Something else about the setup";
export const INFLUENCE_OPTIONS = [...CONDITIONS.map((item) => item.card), SOMETHING_ELSE, NOT_SURE];
export const FOCUS_UNSURE = "unsure";

export const TASK_MODES = ["Continue with my earlier task", "Choose a different everyday task", "Use the provided example"];
export const TASK_CONTINUE = TASK_MODES[0];
export const TASK_OTHER = TASK_MODES[1];
export const TASK_EXAMPLE = TASK_MODES[2];

/** The neutral example (from the existing M3-L1 / M3-L2 "show" text). */
export const EXAMPLE_TASK =
  "A three-sentence reply: say you got the message, name one thing you can do, and say when.";
export const EXAMPLE_ADJUSTMENT = "Use the checklist instructions instead of the paragraph instructions.";

export const LIMIT_CHIPS = ["About 20 minutes", "One attempt", "Until I finish one small part", "Stop if it stops being useful"];

export const EXAMPLE_USES = ["I wrote the reply both ways", "I wrote it one way only", "I only looked at the two setups"];
export const EXAMPLE_LOOKED = EXAMPLE_USES[2];

export const AS_PLANNED = ["Yes, as planned", "Partly", "I tried something different"];

/** Outcomes and their feedback: Ashley's wording. */
export const OUTCOMES = [
  {
    label: "The adjustment seemed to help.",
    feedback: "This may be a useful condition to explore again. One attempt cannot establish that it caused the improvement.",
  },
  {
    label: "It made things harder.",
    feedback: "That condition may not have helped this time. It doesn’t establish a permanent limitation.",
  },
  {
    label: "I didn’t notice much difference.",
    feedback: "No clear difference is still information. You may need another observation or a different question.",
  },
  {
    label: "It helped in some ways but had costs.",
    feedback: "An adjustment can have benefits and costs. Both matter when deciding whether to repeat it.",
  },
  {
    label: "I haven’t tried it yet.",
    feedback: "You have a plan, not a result yet. That’s an honest place to stop.",
  },
];
export const OUTCOME_NOT_YET = OUTCOMES[4].label;
export const OUTCOME_LABELS = OUTCOMES.map((item) => item.label);

/** M3-L3 review choices. DRAFT (Claude) lists, drawn from the reading "One Result Is a Clue, Not a Personality". */
export const HELPED_OPTIONS = [
  "I started sooner",
  "I stayed with it longer",
  "I understood what to do",
  "I felt less pressured",
  "I could stop when I meant to",
  "I enjoyed it more",
  "Nothing clearly helped",
  "I’m not sure",
];
export const COST_OPTIONS = [
  "It took more time",
  "It cost money",
  "It needed equipment or tools",
  "It took more effort or energy",
  "It depended on someone else’s help or availability",
  "It needed travel, childcare, or other arrangements",
  "It added pressure",
  "It would be hard to repeat regularly",
  "Nothing I noticed",
];
export const COST_NONE = "Nothing I noticed";
export const UNCERTAIN_OPTIONS = [
  "Whether the change caused the difference",
  "Whether it would happen again",
  "Whether practice or familiarity mattered",
  "Whether it would help with a different task",
  "Whether I could keep it up",
];

/** Ashley's wording. No choice is better than another. */
export const NEXT_OPTIONS = [
  "I want to try this condition again.",
  "I want to adjust it.",
  "I want to explore a different condition.",
  "I don’t have enough information yet.",
  "I don’t want to continue this experiment right now.",
];

export function readKey(answers, code, key) {
  return plainValue((answers || {})[answerKey(code, key)]).trim();
}

export function recordM3(code, title, key, value, label) {
  const text = String(value ?? "");
  setAnswer(code, key, text);
  saveAnswer({ lessonCode: code, lessonTitle: title, promptKey: answerKey(code, key), promptLabel: label, body: text });
}

/** Saved without a journal entry (a date or a mode that means nothing on its own). */
export function setQuiet(code, key, value) {
  setAnswer(code, key, String(value ?? ""));
}

const isLabel = (text) => /^fictional:/i.test(text);

/**
 * What the participant saved in Module 2, read by key. Named keys from the Module 2 redesign
 * first, then the earlier version's slots. Nothing is invented when a slot is empty.
 */
export function moduleTwoRecap(answers) {
  const rows = [
    { key: "M2-L1#0", label: "What you wanted to explore" },
    { key: "M2-L1#1", label: "The step you planned" },
    { key: "M2-L2#outcome", label: "What happened" },
    { key: "M2-L2#1", label: "What you actually did or observed" },
    { key: "M2-L2#noticed", label: "What you noticed" },
    { key: "M2-L2#2", label: "What surprised, frustrated, or interested you" },
    { key: "M2-L2#3", label: "What helped or made it difficult" },
    { key: "M2-L2#13", label: "How the people, setting, or support affected it" },
    { key: "M2-L2#30", label: "What got in the way" },
    { key: "M2-L3#0", label: "What was different from what you expected" },
    { key: "M2-L3#9", label: "What the encounter left you with" },
    { key: "BRIDGE-2-3#0", label: "What helped, and what got in the way (end of Module 2)" },
  ];
  return rows
    .map((row) => ({ ...row, value: plainValue((answers || {})[row.key]).trim().split("; ").join(", ") }))
    .filter((row) => row.value && !isLabel(row.value));
}

/** A short label for the Module 2 activity, when there is one. */
export function moduleTwoActivity(answers) {
  const pick = (key) => plainValue((answers || {})[key]).trim();
  return pick("M2-L2#1") || pick("M2-L1#0") || pick("M2-L1#1") || "";
}

/** The task M3-L1 was about, for M3-L2. `origin` says where it came from. */
export function taskFromL1(answers) {
  const source = readKey(answers, "M3-L1", "source");
  const own = readKey(answers, "M3-L1", 0);
  if (source === SOURCE_EXAMPLE) return { text: EXAMPLE_TASK, origin: "example" };
  if (own) return { text: own, origin: "l1" };
  const m2 = moduleTwoActivity(answers);
  if (source !== SOURCE_OTHER && m2) return { text: m2, origin: "m2" };
  return { text: "", origin: "" };
}

/** The condition M3-L2 is about: saved choice first, then the one named in M3-L1, then the example's. */
export function effectiveCondition(answers) {
  const saved = readKey(answers, "M3-L2", "condition");
  if (CONDITION_BY_ID[saved]) return { id: saved, from: "l2" };
  const focus = readKey(answers, "M3-L1", "focus");
  if (CONDITION_BY_ID[focus]) return { id: focus, from: "l1" };
  if (readKey(answers, "M3-L2", "task-mode") === TASK_EXAMPLE) return { id: "instructions", from: "example" };
  return { id: "", from: "" };
}

/** Everything about the M3-L2 experiment, read from wherever it was saved. */
export function readExperiment(answers) {
  const mode = readKey(answers, "M3-L2", "task-mode");
  const ownTask = readKey(answers, "M3-L2", "task");
  const carried = taskFromL1(answers);
  const task = ownTask || (mode === TASK_EXAMPLE ? EXAMPLE_TASK : mode === TASK_CONTINUE || !mode ? carried.text : "");
  const condition = effectiveCondition(answers);
  return {
    mode,
    example: mode === TASK_EXAMPLE,
    task,
    condition: condition.id,
    conditionFrom: condition.from,
    adjustment: readKey(answers, "M3-L2", 0),
    limit: readKey(answers, "M3-L2", 2),
    planSaved: readKey(answers, "M3-L2", "plan-saved"),
    exampleUse: readKey(answers, "M3-L2", "example-use"),
    asPlanned: readKey(answers, "M3-L2", "as-planned"),
    outcome: readKey(answers, "M3-L2", "outcome"),
    observation: readKey(answers, "M3-L2", 4),
  };
}

export function experimentHasPlan(x) {
  return Boolean(x.task || x.condition || x.adjustment || x.limit);
}

/** True only when a real result was recorded: an outcome other than "not yet", and not a look-only example. */
export function hasResult(x) {
  if (x.example && x.exampleUse === EXAMPLE_LOOKED) return false;
  return Boolean(x.outcome && x.outcome !== OUTCOME_NOT_YET);
}

/** The plan as plain sentences, for the journal and records page. Only what was chosen. */
export function planSentences(x) {
  const lines = [];
  if (x.task) lines.push(`Task: ${x.task}`);
  if (x.condition) lines.push(`Condition to change: ${CONDITION_BY_ID[x.condition].option}`);
  if (x.adjustment) lines.push(`What I’ll try differently: ${x.adjustment}`);
  if (x.limit) lines.push(`Limit or stopping point: ${x.limit}`);
  return lines.join("\n");
}

/** What happened, as plain sentences. Never fills in a result that wasn't recorded. */
export function checkinSentences(x) {
  const lines = [];
  if (x.example && x.exampleUse) lines.push(`How I used the example: ${x.exampleUse}`);
  if (x.outcome && !(x.example && x.exampleUse === EXAMPLE_LOOKED)) lines.push(`What happened: ${x.outcome}`);
  if (x.asPlanned && hasResult(x)) lines.push(`Tried as planned: ${x.asPlanned}`);
  if (x.observation) lines.push(`In my words: ${x.observation}`);
  return lines.join("\n");
}

/** What was actually attempted, in plain words. */
export function attemptedText(x) {
  if (x.example) {
    if (!x.exampleUse) return "";
    if (x.exampleUse === EXAMPLE_LOOKED) return "Looked at the two instruction formats. Not written.";
    return x.exampleUse === EXAMPLE_USES[0] ? "Wrote the reply with both instruction formats." : "Wrote the reply with one instruction format.";
  }
  if (!x.outcome) return "";
  if (x.outcome === OUTCOME_NOT_YET) return "Not tried yet.";
  if (x.asPlanned === AS_PLANNED[1]) return "Tried part of the plan.";
  if (x.asPlanned === AS_PLANNED[2]) return "Tried something different from the plan.";
  if (x.asPlanned === AS_PLANNED[0]) return "Tried the adjustment as planned.";
  return "Tried the adjustment.";
}

/** Suggestions to carry into Module 4, built only from what they saved. DRAFT (Claude). */
export function carrySuggestions(answers) {
  const x = readExperiment(answers);
  const out = [];
  if (x.observation) out.push(x.observation);
  const condition = x.condition ? CONDITION_BY_ID[x.condition].option.toLowerCase() : "";
  if (hasResult(x) && condition) out.push(`Was it the ${condition} that made the difference, or something else?`);
  if (condition && !hasResult(x)) out.push(`What would I notice if I changed the ${condition}?`);
  out.push("Would the same setup help with a different task?");
  out.push("What would I need to see before I became more certain?");
  return [...new Set(out)].slice(0, 4);
}

export { splitMulti, joinMulti, FINISHED };

/** Answers from the previous Module 3, shown read-only. */
export const EARLIER_M3 = {
  "M3-L1": [
    { key: "M3-L1#2", label: "What you observed about starting, continuing, or stopping" },
    { key: "M3-L1#3", label: "What you wanted to find out about one condition" },
  ],
  "M3-L2": [
    { key: "M3-L2#1", label: "What task and amount of time would stay similar" },
    { key: "M3-L2#3", label: "What would show it was easier to start, adjust, or stop" },
    { key: "M3-L2#5", label: "What effort or discomfort it took" },
    { key: "M3-L2#6", label: "What you might try again, and what would change your conclusion" },
  ],
  "M3-L3": [
    { key: "M3-L3#0", label: "What task and condition you actually tried" },
    { key: "M3-L3#2", label: "Whether the condition affected choice, flexibility, enjoyment, pressure, or stopping" },
  ],
};

const RESPONSE_KEYS = {
  "M3-L1": ["0", "1", "source", "influences", "focus", FINISHED],
  "M3-L2": ["0", "2", "4", "task-mode", "task", "condition", "plan", "plan-saved", "example-use", "as-planned", "outcome", "checkin", FINISHED],
  "M3-L3": ["1", "3", "4", "5", "helped", "costs", "uncertain", "next", FINISHED],
};

export function isModuleThreeInteractive(code) {
  return M3_CODES.includes(code);
}

/** Any saved answer, an earlier-version answer, or "I'm done with this lesson" completes a lesson. */
export function moduleThreeStepComplete(code, answers) {
  const has = (key) => String((answers || {})[key] || "").trim();
  if ((RESPONSE_KEYS[code] || []).some((key) => has(answerKey(code, key)))) return true;
  return (EARLIER_M3[code] || []).some((item) => has(item.key));
}
