import { answerKey, setAnswer } from "./workbook";
import { saveAnswer } from "./journal";
import { plainValue, splitMulti, joinMulti, FINISHED } from "./moduleOne";
import { CATEGORY_BY_ID, possibilityById } from "./explorationGallery";

/**
 * Module 2 interactive lessons (review branch "module-2-interactive", Oct 24, 2026).
 * Built on the Module 1 pattern (src/lib/moduleOne.js). Wording comes from Ashley's
 * Module 2 instructions and addendum unless a comment says DRAFT (Claude).
 *
 * SAVED-ANSWER KEYS (workbook answers store, synced to the account; journal entries are
 * upserted by prompt key, so repeat taps never duplicate an entry).
 *
 * Existing keys reused WITH THEIR ORIGINAL MEANING (Modules 3–5 and the records page read them):
 *   M2-L1#0      "What would you like to explore?" (also the Module 1→2 bridge target)
 *   M2-L1#1      "What is one practical way to encounter or try it?" → the one manageable step
 *   M2-L1#plan   the saved plan as plain sentences (records page: Named try)
 *   M2-L2#1      "What did you actually do or observe?"
 *   M2-L2#2      "What surprised, frustrated, or interested you?" → the optional notice text
 *   M2-L2#30     what got in the way ("; "-joined, same list as before)
 *   M2-L2#31     the smallest version that doesn't need it
 *   M2-L2#32     who or what might know a way around it
 *   M2-L2#checkin what happened, as plain sentences (records page: Try review)
 *   M2-L3#9      what this encounter left you with (read in the bridge into Module 5)
 *
 * New keys:
 *   M2-L1#start-mode     earlier possibility / something different / my own idea / not sure
 *   M2-L1#saved-possibilities  gallery possibilities saved for later ("; "-joined ids)
 *   M2-L1#possibility    the possibility chosen as a starting point (id)
 *   M2-L1#method         Do / Observe / Ask / Investigate
 *   M2-L1#when           when they might do it
 *   M2-L1#obstacles      what might make it difficult ("; "-joined)
 *   M2-L1#smaller        a smaller or more accessible version
 *   M2-L2#outcome        what happened (one of OUTCOMES)
 *   M2-L2#method-used    what kind of encounter they actually had ("; "-joined)
 *   M2-L2#next-move      for not-yet / barrier: adjust, support, smaller step, pause, keep plan
 *   M2-L2#noticed        selectable observations ("; "-joined)
 *   M2-L3#direction      where from here (one of DIRECTIONS)
 *   M2-L3#direction-why  optional explanation
 *   M2-L3#keep-kind      observation / question / possibility
 *   <code>#finished      "I'm done with this lesson for now"
 *
 * Older keys from earlier versions (M2-L1#2–5, #20, #21, M2-L2#0, #3–#13, M2-L3#0–#13
 * except #9) are never written here. They are shown read-only and still count.
 */

export const M2_CODES = ["M2-L1", "M2-L2", "M2-L3"];

export const METHODS = [
  {
    id: "do",
    label: "Do",
    short: "Try a small part of the activity yourself.",
    explain:
      "Doing gives you information about your own experience: what it feels like, which parts hold your attention, and where you get stuck. Keep it small and beginner-sized.",
    examples: [
      "Sew on a loose button instead of learning to make a whole garment.",
      "Cook one dish and change a single ingredient.",
      "Sketch one object instead of designing a product.",
    ],
  },
  {
    id: "observe",
    label: "Observe",
    short: "Watch someone, a process, or an environment.",
    explain:
      "Observing shows you how something actually happens, including the ordinary parts that descriptions skip. It tells you less about how doing it would feel.",
    examples: [
      "Watch a free how-to or “day in the life” video.",
      "Notice how a space you already visit is organized.",
      "Watch a rehearsal, practice, or open meeting.",
    ],
  },
  {
    id: "ask",
    label: "Ask",
    short: "Speak with someone who has relevant experience.",
    explain:
      "Asking gives you an inside view: what fills someone’s day, what surprised them, what newcomers misunderstand. One person’s experience isn’t everyone’s, but it can challenge your assumptions.",
    examples: [
      "Ask a relative, neighbor, or coworker who does it.",
      "Ask at a library desk or community center where you could learn more.",
      "Read an online forum about it first, then ask one question.",
    ],
  },
  {
    id: "investigate",
    label: "Investigate",
    short: "Gather information to understand how something works.",
    explain:
      "Investigating means looking into a question: reading, comparing sources, or examining something closely. It helps you understand before you decide whether to try.",
    examples: [
      "Read about how something works at the library or on a trustworthy site.",
      "Compare two explanations of the same thing.",
      "Look closely at an everyday object and figure out how it’s built.",
    ],
  },
];
export const METHOD_BY_ID = Object.fromEntries(METHODS.map((method) => [method.id, method]));

/** Older "ways in" from the previous M2-L1 (M2-L1#21) read as the new approaches. */
const LEGACY_WAY = { try: "do", watch: "observe", ask: "ask" };

export const START_MODES = [
  "Start from something I noticed earlier",
  "Choose something different",
  "Use my own idea",
  "I’m not sure yet",
];

export const WHEN_OPTIONS = ["Today", "This week", "Next week", "When an opportunity comes up"];

export const OBSTACLE_OPTIONS = [
  "Time",
  "Money",
  "Getting there",
  "Childcare or caregiving",
  "No one to ask",
  "Internet or phone",
  "Health or energy",
  "Not sure where to start",
  "Nothing I can think of",
];
export const OBSTACLE_NONE = "Nothing I can think of";

export const OUTCOMES = [
  "I tried what I planned.",
  "I tried part of it.",
  "I did something different.",
  "I haven’t tried it yet.",
  "I ran into a barrier.",
];
export const TRIED_OUTCOMES = OUTCOMES.slice(0, 3);

export const METHOD_USED = ["I did it myself", "I watched or observed", "I asked someone", "I looked into it"];

export const NOT_YET_MOVES = [
  "Keep my plan and come back later",
  "Adjust my plan",
  "Choose a smaller step",
  "Pause for now",
];

export const BARRIER_MOVES = [
  "Adjust my plan",
  "Look for support",
  "Choose a smaller step",
  "Pause for now",
];

/** The same barrier list M2-L2 used before, so earlier answers still match. */
export const BARRIERS = [
  "Money",
  "Transportation",
  "Time",
  "Childcare or caregiving",
  "No one to ask",
  "Internet or phone",
  "Paperwork or ID",
  "Health or energy",
  "Didn’t feel safe or welcome",
  "No opportunity came up",
  "Something else",
];

export const NOTICED = [
  "Something caught my attention",
  "Something surprised me",
  "It was interesting",
  "It was satisfying",
  "It was uncomfortable",
  "It was difficult",
  "It was confusing",
  "Parts of it were boring",
  "I’m still unsure",
];

export const DIRECTIONS = [
  "Explore this further.",
  "Try a different version.",
  "Investigate a related possibility.",
  "Explore something else.",
  "Pause for now.",
  "I’m not sure yet.",
];

export const KEEP_KINDS = ["An observation", "A question", "A possibility"];

export function readKey(answers, code, key) {
  return plainValue((answers || {})[answerKey(code, key)]).trim();
}

export function recordM2(code, title, key, value, label) {
  const text = String(value ?? "");
  setAnswer(code, key, text);
  saveAnswer({ lessonCode: code, lessonTitle: title, promptKey: answerKey(code, key), promptLabel: label, body: text });
}

/** The chosen approach: new key first, then the older "way in". */
export function planMethod(answers) {
  const id = readKey(answers, "M2-L1", "method");
  if (METHOD_BY_ID[id]) return id;
  return LEGACY_WAY[readKey(answers, "M2-L1", 21)] || "";
}

/** Everything the participant planned, read from wherever it was saved. */
export function readPlan(answers) {
  const possibility = possibilityById(readKey(answers, "M2-L1", "possibility"));
  const category = possibility ? CATEGORY_BY_ID[possibility.categoryId] : null;
  return {
    explore: readKey(answers, "M2-L1", 0),
    possibility,
    category,
    method: planMethod(answers),
    step: readKey(answers, "M2-L1", 1),
    when: readKey(answers, "M2-L1", "when"),
    obstacles: splitMulti(readKey(answers, "M2-L1", "obstacles")),
    smaller: readKey(answers, "M2-L1", "smaller"),
  };
}

export function planHasContent(plan) {
  return Boolean(plan.explore || plan.possibility || plan.method || plan.step || plan.when || plan.smaller || plan.obstacles.length);
}

/** The plan as plain sentences, for the journal and the records page. Only what was chosen. */
export function planSentences(plan) {
  const lines = [];
  if (plan.explore) lines.push(`What I’ll explore: ${plan.explore}`);
  if (plan.category && plan.possibility) lines.push(`From the gallery: ${plan.category.title} · ${plan.possibility.title}`);
  if (plan.method) lines.push(`How: ${METHOD_BY_ID[plan.method].label}`);
  if (plan.step) lines.push(`One manageable step: ${plan.step}`);
  if (plan.when) lines.push(`When: ${plan.when}`);
  if (plan.obstacles.length) lines.push(`What might make it difficult: ${plan.obstacles.join(", ")}`);
  if (plan.smaller) lines.push(`A smaller version: ${plan.smaller}`);
  return lines.join("\n");
}

/** What happened in M2-L2, as plain sentences. */
export function checkinSentences(answers) {
  const lines = [];
  const outcome = readKey(answers, "M2-L2", "outcome");
  if (outcome) lines.push(`What happened: ${outcome}`);
  const used = splitMulti(readKey(answers, "M2-L2", "method-used"));
  if (used.length) lines.push(`Kind of encounter: ${used.join(", ")}`);
  const did = readKey(answers, "M2-L2", 1);
  if (did) lines.push(`What I actually did or observed: ${did}`);
  const barriers = splitMulti(readKey(answers, "M2-L2", 30));
  if (barriers.length) lines.push(`What got in the way: ${barriers.join(", ")}`);
  const move = readKey(answers, "M2-L2", "next-move");
  if (move) lines.push(`What I’ll do about it: ${move}`);
  const noticed = splitMulti(readKey(answers, "M2-L2", "noticed"));
  if (noticed.length) lines.push(`What I noticed: ${noticed.join(", ")}`);
  const text = readKey(answers, "M2-L2", 2);
  if (text) lines.push(`In my words: ${text}`);
  return lines.join("\n");
}

/** Keeps a derived plain-text slot in step with the answers it summarizes. Journal entry is upserted. */
export function syncSummary(code, title, key, label, text, answers) {
  if (readKey(answers, code, key) === text.trim()) return;
  recordM2(code, title, key, text, label);
}

export { splitMulti, joinMulti, FINISHED };

/** Older answers from the previous Module 2, shown read-only. */
export const EARLIER_M2 = {
  "M2-L1": [
    { key: "M2-L1#2", label: "Support or access that would make it possible" },
    { key: "M2-L1#3", label: "A time, cost, or safety limit to respect" },
  ],
  "M2-L2": [
    { key: "M2-L2#0", label: "What caught your attention" },
    { key: "M2-L2#3", label: "What helped or made participation difficult" },
    { key: "M2-L2#4", label: "What it took in time, money, energy, or support" },
    { key: "M2-L2#11", label: "What kind of encounter you had" },
    { key: "M2-L2#12", label: "When your attention changed" },
    { key: "M2-L2#13", label: "How the people, setting, or support affected it" },
  ],
  "M2-L3": [
    { key: "M2-L3#0", label: "What was different from what you expected" },
    { key: "M2-L3#3", label: "What you still wanted to know" },
    { key: "M2-L3#4", label: "What you might explore next" },
    { key: "M2-L3#10", label: "Whether another encounter would help" },
  ],
};

const RESPONSE_KEYS = {
  "M2-L1": ["0", "1", "plan", "start-mode", "saved-possibilities", "possibility", "method", "when", "obstacles", "smaller", "20", "21", FINISHED],
  "M2-L2": ["1", "2", "30", "31", "32", "checkin", "outcome", "method-used", "next-move", "noticed", FINISHED],
  "M2-L3": ["9", "direction", "direction-why", "keep-kind", FINISHED],
};

export function isModuleTwoInteractive(code) {
  return M2_CODES.includes(code);
}

/** Any saved answer, an earlier-version answer, or "I'm done with this lesson" completes a lesson. */
export function moduleTwoStepComplete(code, answers) {
  const has = (key) => String((answers || {})[answerKey(code, key)] || "").trim();
  if ((RESPONSE_KEYS[code] || []).some(has)) return true;
  return (EARLIER_M2[code] || []).some((item) => String((answers || {})[item.key] || "").trim());
}
