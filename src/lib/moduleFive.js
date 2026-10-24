import { answerKey, setAnswer } from "./workbook";
import { FINISHED, joinMulti, plainValue, recordAnswer, splitMulti } from "./moduleOne";

/**
 * Module 5 interactive lessons (review branch, Oct 24, 2026).
 *
 * Ashley's "Module 5 Interactive Redesign" is the source for the stages, the
 * journal prompts, the closing, and the journal introduction. Short readings
 * are shortened from the published Module 5 library readings and lesson text.
 * Nothing here writes to Lesson or Module records. Titles and purposes below
 * are a display overlay until Ashley approves those record edits.
 *
 * SAVED-ANSWER KEYS stay in the workbook answers store and are copied to the
 * Conversation Journal by prompt key. Older numbered answers (M5-L1#0 and so
 * on) are never rewritten here. They still display and still count.
 *
 *   M5-L1#pattern         selected pattern card id, or "other"
 *   M5-L1#pattern-other   free text for "Something else I've noticed"
 *   M5-L1#map-before      what was happening before
 *   M5-L1#map-during      what happened while it was unfolding
 *   M5-L1#map-after       what happened afterward
 *   M5-L1#stands-out      optional observation of the whole sequence
 *   M5-L1#journal         one Conversation Journal box
 *   M5-L2#stance          Keep / Adjust / Protect / Not sure, "; "-joined
 *   M5-L2#stance-note     optional explanation
 *   M5-L2#adjust-change   what they might change
 *   M5-L2#adjust-small    a small version
 *   M5-L2#adjust-protect  what they would want to protect while trying it
 *   M5-L2#adjust-tell     what might tell them whether it helped
 *   M5-L2#keep-note       keep pathway
 *   M5-L2#protect-note    protect pathway
 *   M5-L2#unsure-note     not-sure pathway
 *   M5-L2#journal
 *   M5-L3#thinking-now    learning-review choices, "; "-joined
 *   M5-L3#thinking-note   optional words for "what I'm thinking now"
 *   M5-L3#impression      the one takeaway they chose to examine
 *   M5-L3#support         experiences that support it
 *   M5-L3#complicate      what might complicate it
 *   M5-L3#uncertain       what remains uncertain
 *   M5-L3#next            what they chose to do next (also stored as the lesson decision)
 *   M5-L3#next-note       optional note about that choice
 *   M5-L3#journal
 *   <code>#finished       "I'm done with this lesson for now"
 */

export const M5_CODES = ["M5-L1", "M5-L2", "M5-L3"];

export const MODULE_FIVE_TITLE = "Protect What Works and Navigate Intensity";
export const MODULE_FIVE_PURPOSE =
  "What patterns do I recognize in myself, and what might I want to keep, change, or understand better?";

export const MODULE_FIVE_LESSONS = {
  "M5-L1": {
    title: "Understand the Sequence Before You Map It",
    purpose: "Name a pattern you recognize, and look at what happens before, during, and after it.",
  },
  "M5-L2": {
    title: "Protect What Works or Try One Small Response",
    purpose: "Decide what you might want to keep, adjust, protect, or understand better.",
  },
  "M5-L3": {
    title: "Check an Impression and Close Pilot 1",
    purpose: "Look back across the pilot and choose what, if anything, you want to carry forward.",
  },
};

/** Display titles and purposes for this review branch. Stored records are left as they are. */
export function applyModuleFiveContent(rows) {
  return (rows || []).map((lesson) => applyModuleFiveContentOne(lesson));
}

export function applyModuleFiveContentOne(lesson) {
  if (!lesson) return lesson;
  const patch = MODULE_FIVE_LESSONS[lesson.code];
  return patch ? { ...lesson, ...patch } : lesson;
}

export function applyModuleFiveModules(modules) {
  return (modules || []).map((module) =>
    Number(module && module.order) === 5
      ? { ...module, title: MODULE_FIVE_TITLE, purpose: MODULE_FIVE_PURPOSE }
      : module
  );
}

export const JOURNAL_INTRO =
  "You don't have to answer every question. Start wherever something catches your attention. You can explore a memory, question an assumption, disagree with an idea, or follow a thought somewhere unexpected.";

export const CLOSING_PARAGRAPHS = [
  "You don't have to leave with a complete plan, a new identity, or a clear answer about your future.",
  "You may have discovered an interest, questioned an assumption, noticed a pattern, or found a question worth pursuing.",
  "What you do with that information is yours to decide.",
];

export const PATTERN_OTHER = "other";

export const PATTERN_CARDS = [
  {
    id: "focused",
    title: "Getting intensely focused",
    example: "You sit down to look something up, and an hour goes by.",
  },
  {
    id: "avoiding",
    title: "Avoiding an uncomfortable task",
    example: "A message sits there because answering it feels hard.",
  },
  {
    id: "quickly",
    title: "Acting quickly under pressure",
    example: "When something feels urgent, you decide before you've had time to think.",
  },
  {
    id: "losing",
    title: "Losing interest when it gets difficult",
    example: "The first part is easy to start. The harder part is where you drift off.",
  },
  {
    id: "toomuch",
    title: "Taking on too much",
    example: "You say yes to one more thing, and then the week is full.",
  },
  {
    id: "absorbed",
    title: "Getting absorbed in an activity",
    example: "You're in the middle of something, and the rest of the room fades.",
  },
  {
    id: "uncertainty",
    title: "Responding strongly to uncertainty",
    example: "When you don't know how something will turn out, your reaction gets big.",
  },
  {
    id: "persisting",
    title: "Sticking with it despite frustration",
    example: "It isn't going well, and you keep at it anyway.",
  },
  {
    id: PATTERN_OTHER,
    title: "Something else I've noticed",
    example: "Use your own words. An ordinary pattern is enough.",
  },
];

export const MAP_SECTIONS = [
  {
    key: "map-before",
    label: "What was happening before the pattern began?",
    cues: "Situation or environment. Thoughts or expectations. Feelings or physical state. Other people or circumstances.",
  },
  {
    key: "map-during",
    label: "What happened while the pattern was unfolding?",
    cues: "Attention and focus. Decisions. Reactions. Actions. Changes in energy or engagement.",
  },
  {
    key: "map-after",
    label: "What happened afterward?",
    cues: "Immediate results. Longer-term consequences. Benefits. Costs. Unanswered questions.",
  },
];

export const STANCES = [
  { id: "keep", label: "Something about this pattern is working, and I may want to preserve it." },
  { id: "adjust", label: "Something about this pattern might work better with a small change." },
  { id: "protect", label: "There's something important I don't want to sacrifice." },
  { id: "unsure", label: "I want to understand this pattern better before deciding." },
];

export const ADJUST_FIELDS = [
  { key: "adjust-change", label: "What might you change?" },
  { key: "adjust-small", label: "What would a small version look like?" },
  { key: "adjust-protect", label: "What would you want to protect?" },
  { key: "adjust-tell", label: "What might tell you whether it helped?" },
];

export const OTHER_PATHS = [
  {
    id: "keep",
    key: "keep-note",
    title: "Keep",
    label: "What about this pattern is working, and what would you want to preserve?",
    hint: "You can also say what protecting it would look like on an ordinary week.",
  },
  {
    id: "protect",
    key: "protect-note",
    title: "Protect",
    label: "What is important here that you don't want to sacrifice?",
    hint: "A responsibility, a limit, your time, a relationship, your privacy, or something else. Details are optional.",
  },
  {
    id: "unsure",
    key: "unsure-note",
    title: "Not sure",
    label: "What do you want to understand better before you decide?",
    hint: "You can also say what you want to keep in view while you figure it out.",
  },
];

export const THINKING_NOW = [
  "Something I understand differently",
  "An interest I want to explore",
  "An assumption I'm questioning",
  "A pattern I'm noticing",
  "Something I want to preserve",
  "A question I haven't answered",
  "Nothing significant has changed yet",
];
export const THINKING_NONE = "Nothing significant has changed yet";

export const NEXT_OPTIONS = [
  "Continue exploring an interest",
  "Try something new",
  "Revisit an earlier activity",
  "Investigate a possible direction",
  "Seek support or resources",
  "Take a break",
  "I'm not sure yet",
];

export const JOURNAL_PROMPTS = {
  "M5-L1": {
    kicker: "Go deeper",
    prompt:
      "Are there patterns in the way you respond to situations that you've noticed throughout your life? How have those patterns helped you, complicated things, or changed over time?",
    followUps: [
      "Have you ever viewed a characteristic of yours as entirely negative or entirely positive?",
      "Does the same characteristic show up differently depending on the situation?",
      "What experiences may have shaped how you understand that part of yourself?",
    ],
  },
  "M5-L2": {
    kicker: "Go deeper",
    prompt:
      "When you think about the ways you respond to challenges, opportunities, or strong interests, what parts of yourself would you want to preserve? Are there parts you'd like more choice over?",
    followUps: [
      "Have you ever tried to change something about yourself that also served an important purpose?",
      "What would a more sustainable version of that pattern look like?",
      "How do you distinguish between something that feels compelling and something you genuinely want to continue?",
    ],
  },
  "M5-L3": {
    kicker: "Looking back",
    prompt:
      "When you look back at what you've explored, questioned, and experienced, what stands out to you? Has anything changed in how you understand yourself, your possibilities, or the direction you might want to take?",
    followUps: [
      "What surprised you about the process?",
      "Was there anything you resisted, disagreed with, or found unhelpful?",
      "What questions are you still carrying?",
      "Is there something you want to explore beyond this program?",
    ],
  },
};

/** Older numbered answers, shown read-only. */
export const EARLIER_M5 = {
  "M5-L1": [
    { key: "M5-L1#0", label: "Where a pressure cue from Module 4 fit, if you placed one" },
    { key: "M5-L1#1", label: "Signal" },
    { key: "M5-L1#2", label: "Story" },
    { key: "M5-L1#3", label: "Urge" },
    { key: "M5-L1#4", label: "Usual action" },
    { key: "M5-L1#5", label: "Cost" },
    { key: "M5-L1#6", label: "An outside condition or practical barrier" },
    { key: "M5-L1#7", label: "Which parts were observations, explanations, or unknowns" },
    { key: "M5-L1#8", label: "Where a choice or a pause could be available" },
    { key: "M5-L1#9", label: "A support, limit, or stop rule" },
  ],
  "M5-L2": [
    { key: "M5-L2#0", label: "A condition that was working, and how you might protect it" },
    { key: "M5-L2#1", label: "One small response you considered" },
    { key: "M5-L2#2", label: "What a useful next choice would look like" },
    { key: "M5-L2#3", label: "Duration, support, and a stop rule" },
    { key: "M5-L2#4", label: "What actually happened next, or why it was not attempted" },
    { key: "M5-L2#5", label: "Whether the next choice was easier, harder, unchanged, or unclear" },
    { key: "M5-L2#6", label: "Effort, discomfort, or a later effect" },
  ],
  "M5-L3": [
    { key: "M5-L3#0", label: "An impression you wanted to check" },
    { key: "M5-L3#1", label: "What you could observe that supported or challenged it" },
    { key: "M5-L3#2", label: "What remained unknown" },
    { key: "M5-L3#3", label: "A decision rule and a boundary" },
    { key: "M5-L3#4", label: "What the task asked of you" },
    { key: "M5-L3#5", label: "One piece of evidence you gathered" },
    { key: "M5-L3#6", label: "One thing worth keeping" },
    { key: "M5-L3#7", label: "One support that mattered" },
    { key: "M5-L3#8", label: "One question for later" },
    { key: "M5-L3#9", label: "What would make a return workable, if you wrote it" },
  ],
};

const RESPONSE_KEYS = {
  "M5-L1": ["pattern", "pattern-label", "pattern-other", "map-before", "map-during", "map-after", "stands-out", "journal", FINISHED, "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  "M5-L2": ["stance", "stance-note", "adjust-change", "adjust-small", "adjust-protect", "adjust-tell", "keep-note", "protect-note", "unsure-note", "journal", FINISHED, "0", "1", "2", "3", "4", "5", "6"],
  "M5-L3": ["thinking-now", "thinking-note", "impression", "support", "complicate", "uncertain", "next", "next-note", "journal", FINISHED, "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

export function isModuleFiveInteractive(code) {
  return M5_CODES.includes(code);
}

export function readM5(answers, code, key) {
  return plainValue((answers || {})[answerKey(code, key)]).trim();
}

export function recordM5(code, title, key, value, label) {
  recordAnswer({ code, title }, key, value, label);
}

/** Card id for the picker. The readable name is what the journal and the discovery record keep. */
export function savePatternChoice(id) {
  const title = MODULE_FIVE_LESSONS["M5-L1"].title;
  const card = patternCard(id);
  const label = !id ? "" : id === PATTERN_OTHER ? "Something else I've noticed" : card ? card.title : String(id);
  setAnswer("M5-L1", "pattern", id);
  recordM5("M5-L1", title, "pattern-label", label, "A pattern I recognize");
}

export function patternCard(id) {
  return PATTERN_CARDS.find((card) => card.id === id) || null;
}

/** The pattern in the participant's words. Blank when they haven't chosen one. */
export function patternTitle(answers) {
  const id = readM5(answers, "M5-L1", "pattern");
  if (!id) return "";
  if (id === PATTERN_OTHER) {
    const text = readM5(answers, "M5-L1", "pattern-other");
    return text ? text : "Something else I've noticed";
  }
  const card = patternCard(id);
  return card ? card.title : id;
}

export function mapLines(answers) {
  return MAP_SECTIONS.map((section) => ({
    ...section,
    value: readM5(answers, "M5-L1", section.key),
  })).filter((section) => section.value);
}

export function earlierMapLines(answers) {
  return (EARLIER_M5["M5-L1"] || [])
    .filter((item) => ["M5-L1#1", "M5-L1#2", "M5-L1#3", "M5-L1#4", "M5-L1#5"].includes(item.key))
    .map((item) => ({ label: item.label, value: plainValue((answers || {})[item.key]).trim() }))
    .filter((item) => item.value);
}

export function selectedStances(answers) {
  const saved = splitMulti(readM5(answers, "M5-L2", "stance"));
  return STANCES.filter((item) => saved.includes(item.label)).map((item) => item.id);
}

export function stanceValue(ids) {
  return joinMulti(STANCES.filter((item) => ids.includes(item.id)).map((item) => item.label));
}

/**
 * Saved lines from earlier modules, for the Pilot 1 look-back.
 * Only lines the participant actually wrote. Nothing is filled in.
 */
export const MODULE_FIVE_JOURNEY = {
  module: "Module 5",
  about: "A pattern you recognized, and what you considered keeping, adjusting, or protecting",
};

export const JOURNEY_GROUPS = [
  {
    module: "Module 1",
    about: "Something that caught your attention",
    items: [
      { key: "M1-L1#notice-text", label: "Something you noticed" },
      { key: "M1-L1#stood-out", label: "What stood out" },
      { key: "M1-L1#encounter", label: "Possibilities you selected" },
      { key: "M1-L1#carry-choice", label: "What you chose to carry into Module 2" },
      { key: "M1-L1#0", label: "What you wanted to understand better" },
      { key: "M1-L3#1", label: "What you wanted to bring into Module 2" },
    ],
  },
  {
    module: "Module 2",
    about: "Something you explored or attempted",
    items: [
      { key: "M2-L1#0", label: "What you wanted to explore" },
      { key: "M2-L1#1", label: "One practical way to encounter it" },
      { key: "M2-L2#outcome", label: "What happened" },
      { key: "M2-L2#1", label: "What you actually did or observed" },
      { key: "M2-L3#9", label: "What the encounter left you with" },
    ],
  },
  {
    module: "Module 3",
    about: "A condition you investigated",
    items: [
      { key: "M3-L1#1", label: "A part of the setup you described" },
      { key: "M3-L2#0", label: "The condition you considered changing" },
      { key: "M3-L3#0", label: "The task and condition you tried" },
      { key: "M3-L3#1", label: "What changed" },
    ],
  },
  {
    module: "Module 4",
    about: "An assumption or interpretation you examined",
    items: [
      { key: "M4-L1#0", label: "What happened, as you could observe it" },
      { key: "M4-L1#1", label: "The story that was added" },
      { key: "M4-L1#4", label: "A more accurate statement" },
      { key: "M4-L3#0", label: "The statement you reviewed" },
      { key: "M4-L3#1", label: "What actually happened, or what you could check" },
      { key: "M4-L3#4", label: "Wording that was more accurate" },
    ],
  },
];

function savedLine(answers, key) {
  return plainValue((answers || {})[key]).trim();
}

/** Groups that have at least one saved line. Empty groups are omitted. */
export function journeyGroups(answers) {
  const groups = JOURNEY_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .map((item) => ({ ...item, value: savedLine(answers, item.key) }))
      .filter((item) => item.value),
  })).filter((group) => group.items.length);

  const moduleFive = moduleFiveJourney(answers);
  if (moduleFive.items.length) groups.push(moduleFive);
  return groups;
}

function moduleFiveJourney(answers) {
  const items = [];
  const title = patternTitle(answers);
  if (title) items.push({ key: "M5-L1#pattern", label: "A pattern you recognized", value: title });
  mapLines(answers).forEach((section) => {
    items.push({ key: answerKey("M5-L1", section.key), label: section.label, value: section.value });
  });
  const stood = readM5(answers, "M5-L1", "stands-out");
  if (stood) items.push({ key: "M5-L1#stands-out", label: "What stood out in the sequence", value: stood });
  earlierMapLines(answers).forEach((line) => {
    items.push({ key: `earlier-${line.label}`, label: `From your earlier map: ${line.label}`, value: line.value });
  });
  const stance = readM5(answers, "M5-L2", "stance");
  if (stance) items.push({ key: "M5-L2#stance", label: "What you considered keeping, adjusting, or protecting", value: stance });
  const notes = {
    "keep-note": "What you wanted to preserve",
    "protect-note": "What you didn't want to sacrifice",
    "unsure-note": "What you wanted to understand better",
    "adjust-change": "What you might change",
    "adjust-small": "A small version",
    "adjust-protect": "What you wanted to protect while trying it",
    "adjust-tell": "What might tell you whether it helped",
    "stance-note": "A note on that choice",
  };
  Object.entries(notes).forEach(([key, label]) => {
    const value = readM5(answers, "M5-L2", key);
    if (value) items.push({ key: answerKey("M5-L2", key), label, value });
  });
  return { ...MODULE_FIVE_JOURNEY, items };
}

const STARTED_KEYS = [
  { key: "M1-L1#notice-text", label: "Something you noticed" },
  { key: "M1-L1#0", label: "What you wanted to understand better" },
  { key: "M1-L1#stood-out", label: "What stood out" },
  { key: "M2-L1#0", label: "What you wanted to explore" },
  { key: "M1-L3#4", label: "Something you believed and hadn't tested" },
  { key: "M4-L1#1", label: "A story you separated from what happened" },
];

const EXPERIENCED_KEYS = [
  { key: "M2-L2#1", label: "What you actually did or observed" },
  { key: "M2-L2#outcome", label: "What happened with your try" },
  { key: "M3-L2#0", label: "A condition you investigated" },
  { key: "M3-L3#1", label: "What changed" },
  { key: "M4-L3#1", label: "What you could check" },
  { key: "M4-L3#4", label: "Wording that was more accurate" },
];

/** Two columns of recorded words, plus nothing invented for an empty column. */
export function reviewColumns(answers) {
  const started = STARTED_KEYS.map((item) => ({ ...item, value: savedLine(answers, item.key) })).filter((item) => item.value);
  const experienced = EXPERIENCED_KEYS.map((item) => ({ ...item, value: savedLine(answers, item.key) })).filter((item) => item.value);
  const title = patternTitle(answers);
  if (title) experienced.push({ key: "M5-L1#pattern", label: "A pattern you recognized", value: title });
  const stance = readM5(answers, "M5-L2", "stance");
  if (stance) experienced.push({ key: "M5-L2#stance", label: "What you considered keeping, adjusting, or protecting", value: stance });
  return { started, experienced };
}

export function moduleFiveStepComplete(code, answers) {
  const keys = RESPONSE_KEYS[code] || [];
  return keys.some((key) => String((answers || {})[answerKey(code, key)] || "").trim());
}
