import { useEffect, useState } from "react";
import { readStore, subscribeStore, writeStore } from "./store";

export const NEXT_DECISIONS = [
  "Keep",
  "Change",
  "Test Again",
  "Pause/Park",
  "Stop",
  "Another Direction",
  "Continue Looking",
];

/**
 * Every participation route writes something. There is no pass, and no route
 * that skips the journal: one line is what makes a step yours, so the writing
 * routes are the shared set, and pausing keeps the line before it pauses.
 */
export const WRITING_ROUTES = [
  {
    label: "Write it in my own words",
    blurb: "Your own words, kept in this browser.",
    cue: "Say it your way. One line is enough to count.",
    field: "full",
  },
  {
    label: "Write from the neutral example",
    blurb: "Start from the example on this step instead of your own material.",
    cue: "Use the neutral example as your starting point, then swap in what fits you.",
    field: "full",
  },
  {
    label: "Write one line only",
    blurb: "One line, written now. That is the whole ask.",
    cue: "One line only. Short is fine.",
    field: "line",
  },
];

/** Write the line, then leave the step for later. */
export const PAUSE_ROUTE = "Write one line, then pause";

/** Available on every step, whichever routes the step itself names. */
export const UNIVERSAL_ROUTES = [PAUSE_ROUTE];

export const PARTICIPATION_ROUTES = [...WRITING_ROUTES.map((route) => route.label), ...UNIVERSAL_ROUTES];

/** Older wording that let a step be taken without writing. It has no place now. */
const RETIRED_ROUTES = /^(pass|observe|observe only|pause or stop|come back later|observe:)/i;

/** How a chosen route answers the page: field shape, wording, and pause state. */
export function routeGuidanceFor(route) {
  if (route === PAUSE_ROUTE) {
    return {
      label: PAUSE_ROUTE,
      blurb: "Write a line now and come back to this step later.",
      cue: "Your line is saved, and this step waits here for you.",
      field: "line",
      paused: true,
    };
  }
  return WRITING_ROUTES.find((item) => item.label === route) || null;
}

/**
 * A step's own routes come first, then the writing routes that are always
 * available. Anything that once meant "take no part and write nothing" is left
 * out. Falls back to the writing routes when a step names none.
 */
export function participationRoutesFor(lesson) {
  const own = ((lesson && lesson.routes) || []).filter((route) => !RETIRED_ROUTES.test(String(route).trim()));
  if (!own.length) return PARTICIPATION_ROUTES;
  return [...own, ...PARTICIPATION_ROUTES].filter((route, index, list) => list.indexOf(route) === index);
}

export const ANSWER_KEY = "answers";
export const DECISION_KEY = "decisions";
export const STATE_KEY = "stepState";
export const CARRIED_KEY = "carried";
export const LIFEMAP_KEY = "lifeMap";
export const DISCOVERY_KEY = "discoveryNotes";

/** field key used to store one answer */
export function answerKey(code, index) {
  return `${code}#${index}`;
}

export function getAnswer(code, index) {
  const answers = readStore(ANSWER_KEY, {});
  return answers[answerKey(code, index)] || "";
}

export function setAnswer(code, index, value) {
  const answers = readStore(ANSWER_KEY, {});
  answers[answerKey(code, index)] = value;
  writeStore(ANSWER_KEY, answers);
}

export function useAnswers() {
  return useStoreState(ANSWER_KEY, {});
}

export function setDecision(code, label) {
  const decisions = readStore(DECISION_KEY, {});
  decisions[code] = label;
  writeStore(DECISION_KEY, decisions);
}

export function setStepState(code, state) {
  const states = readStore(STATE_KEY, {});
  states[code] = state;
  writeStore(STATE_KEY, states);
}

export function useStepState() {
  return useStoreState(STATE_KEY, {});
}

export function useDecisions() {
  return useStoreState(DECISION_KEY, {});
}

export function setCarried(code, keys) {
  const carried = readStore(CARRIED_KEY, {});
  carried[code] = keys;
  writeStore(CARRIED_KEY, carried);
}

export function useCarried() {
  return useStoreState(CARRIED_KEY, {});
}

export function useLifeMap() {
  return useStoreState(LIFEMAP_KEY, {});
}

export function setLifeMap(next) {
  writeStore(LIFEMAP_KEY, next);
}

export function useDiscoveryNotes() {
  return useStoreState(DISCOVERY_KEY, {});
}

export function setDiscoveryNote(section, value) {
  const notes = readStore(DISCOVERY_KEY, {});
  notes[section] = value;
  writeStore(DISCOVERY_KEY, notes);
}

function useStoreState(key, fallback) {
  const [value, setValue] = useState(() => readStore(key, fallback));
  useEffect(() => {
    setValue(readStore(key, fallback));
    return subscribeStore(key, () => setValue(readStore(key, fallback)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

/** Answers, decisions and step states together, kept in sync across pages. */
export function useWorkbook() {
  const answers = useStoreState(ANSWER_KEY, {});
  const decisions = useStoreState(DECISION_KEY, {});
  const states = useStoreState(STATE_KEY, {});
  return { answers, decisions, states };
}

/** Distinguishes "not answered" from a deliberate pass or pause. */
export function describeStep(code, answers, decisions, states) {
  if (decisions && decisions[code]) return "decided";
  if (states && states[code] === PAUSE_ROUTE) return "paused";
  const saved = Object.keys(answers || {}).some(
    (key) => key.startsWith(`${code}#`) && String(answers[key] || "").trim()
  );
  return saved ? "answered" : "not answered";
}

export function stepStatusLabel(status) {
  return {
    decided: "Next Decision recorded",
    paused: "One line written, then paused",
    answered: "Answered",
    "not answered": "Not answered yet",
  }[status];
}

/** Earlier answers that may be selected as context in a later step. */
export function buildCarrySources(codes, lessonsByCode) {
  const sources = [];
  (codes || []).forEach((code) => {
    const lesson = lessonsByCode[code];
    if (!lesson) return;
    const prompts = [...(lesson.try_prompts || []), ...(lesson.reflect_prompts || [])];
    prompts.forEach((label, index) => {
      sources.push({ code, index, label: `${lesson.title} — ${label}` });
    });
  });
  return sources;
}