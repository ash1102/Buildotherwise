import { useEffect, useMemo, useState } from "react";
import { readStore, subscribeStore, writeStore } from "./store";

export const NEXT_DECISIONS = [
  "Keep",
  "Change",
  "Test again",
  "Pause",
  "Stop",
  "Another direction",
  "Continue looking",
  "I don't know yet",
];

/** Older saved choices still read as the current words. */
const LEGACY_DECISIONS = {
  "Test Again": "Test again",
  "Pause/Park": "Pause",
  "Another Direction": "Another direction",
  "Continue Looking": "Continue looking",
  "Keep looking": "Continue looking",
};

export function normalizeDecision(label) {
  return LEGACY_DECISIONS[label] || label;
}

function normalizeDecisions(map) {
  const out = {};
  Object.entries(map || {}).forEach(([code, value]) => {
    out[code] = normalizeDecision(value);
  });
  return out;
}

/** Getting Started. Other lessons use the routes stored on the lesson, including Pass. */
export const GETTING_STARTED_ROUTES = ["Say it", "Write it", "Watch", "Pass"];

/** Kept so an older saved choice still reads as paused. It is not offered. */
export const PAUSE_ROUTE = "Write one line, then pause";

/** Watch and Pass count without a writing box. */
export function routeSkipsWriting(route) {
  return /^(pass|watch)$/i.test(String(route || "").trim());
}

/** Options for this lesson, or all eight when the lesson does not name its own. */
export function decisionOptionsFor(lesson) {
  const own = ((lesson && lesson.decision_options) || []).map((option) => String(option).trim()).filter(Boolean);
  return own.length ? own : NEXT_DECISIONS;
}

/** Say it turns on the one talk control. Anything else is just a label. */
export function routeGuidanceFor(route) {
  if (route === PAUSE_ROUTE) return { label: PAUSE_ROUTE, field: "line", paused: true };
  if (route === "Say it") return { label: "Say it", field: "full", voice: true };
  if (route === "Write it") return { label: "Write it", field: "full" };
  if (routeSkipsWriting(route)) return { label: route, field: "none" };
  return null;
}

/**
 * Getting Started always offers Say it, Write it, Watch, and Pass.
 * Any other lesson shows the routes stored on it, and nothing when it has none.
 * The opener is a map, not one of those steps.
 */
export function participationRoutesFor(lesson) {
  if (!lesson || lesson.code === "O.6") return [];
  if (Number(lesson.module_order) === 0) return GETTING_STARTED_ROUTES;
  return ((lesson.routes) || []).map((route) => String(route).trim()).filter(Boolean);
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
  const raw = useStoreState(DECISION_KEY, {});
  return useMemo(() => normalizeDecisions(raw), [raw]);
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
  const rawDecisions = useStoreState(DECISION_KEY, {});
  const decisions = useMemo(() => normalizeDecisions(rawDecisions), [rawDecisions]);
  const states = useStoreState(STATE_KEY, {});
  return { answers, decisions, states };
}

/** Distinguishes "not answered" from a decision, a pass, a watch, or a pause. */
export function describeStep(code, answers, decisions, states) {
  if (decisions && decisions[code]) return "decided";
  const route = states && states[code];
  if (route && /^pass$/i.test(String(route).trim())) return "passed";
  if (route && /^watch$/i.test(String(route).trim())) return "watched";
  if (route === PAUSE_ROUTE) return "paused";
  const saved = Object.keys(answers || {}).some(
    (key) => key.startsWith(`${code}#`) && String(answers[key] || "").trim()
  );
  return saved ? "answered" : "not answered";
}

export function stepStatusLabel(status) {
  return {
    decided: "Next Decision recorded",
    paused: "Paused",
    passed: "Passed",
    watched: "Watched",
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
      sources.push({ code, index, label: `${lesson.title}: ${label}` });
    });
  });
  return sources;
}