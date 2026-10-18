import { useEffect, useMemo, useState } from "react";
import { progressStorageKey } from "./progressScope";
import { readStore, subscribeStore, writeStore } from "./store";

export const NEXT_DECISIONS = [
  "Keep",
  "Change",
  "Test again",
  "Pause",
  "Stop",
  "Another direction",
  "Keep looking",
  "I don't know yet",
];

/** Older saved choices still read as the current words. */
const LEGACY_DECISIONS = {
  "Test Again": "Test again",
  "Pause/Park": "Pause",
  "Another Direction": "Another direction",
  "Continue Looking": "Keep looking",
  "Continue looking": "Keep looking",
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

/** Say it shows the talk control. Watch and Pass need no writing. Anything else is a label. */
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

/** These four are the workbook progress the gate reads. Life Map and the journal stay on the browser key. */
const SCOPED_KEYS = new Set([ANSWER_KEY, DECISION_KEY, STATE_KEY, CARRIED_KEY]);

function storageKey(baseKey) {
  return SCOPED_KEYS.has(baseKey) ? progressStorageKey(baseKey) : baseKey;
}

export function readWorkbookValue(baseKey, fallback) {
  return readStore(storageKey(baseKey), fallback);
}

/** field key used to store one answer */
export function answerKey(code, index) {
  return `${code}#${index}`;
}

export function getAnswer(code, index) {
  const answers = readStore(storageKey(ANSWER_KEY), {});
  return answers[answerKey(code, index)] || "";
}

export function setAnswer(code, index, value) {
  const key = storageKey(ANSWER_KEY);
  const answers = readStore(key, {});
  answers[answerKey(code, index)] = value;
  writeStore(key, answers);
}

export function useAnswers() {
  return useStoreState(ANSWER_KEY, {});
}

export function setDecision(code, label) {
  const key = storageKey(DECISION_KEY);
  const decisions = readStore(key, {});
  decisions[code] = label;
  writeStore(key, decisions);
}

export function setStepState(code, state) {
  const key = storageKey(STATE_KEY);
  const states = readStore(key, {});
  states[code] = state;
  writeStore(key, states);
}

export function useStepState() {
  return useStoreState(STATE_KEY, {});
}

export function useDecisions() {
  const raw = useStoreState(DECISION_KEY, {});
  return useMemo(() => normalizeDecisions(raw), [raw]);
}

export function setCarried(code, keys) {
  const key = storageKey(CARRIED_KEY);
  const carried = readStore(key, {});
  carried[code] = keys;
  writeStore(key, carried);
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

function useStoreState(baseKey, fallback) {
  const key = storageKey(baseKey);
  const read = () => readStore(key, fallback);
  const [slot, setSlot] = useState(() => ({ key, value: read() }));
  if (slot.key !== key) {
    setSlot({ key, value: read() });
  }
  useEffect(() => {
    setSlot({ key, value: readStore(key, fallback) });
    return subscribeStore(key, () => setSlot({ key, value: readStore(key, fallback) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return slot.key === key ? slot.value : read();
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
    // M1-L1 uses interactive named answers, not its obsolete numbered prompt fields.
    const prompts = code === "M1-L1"
      ? [
          { index: "own-caught", label: "What caught your attention" },
          { index: "own-dont-know", label: "What I don't know yet" },
          { index: "possibility", label: "What might help you learn a little more?" },
        ]
      : code === "M2-L1"
        ? [{ index: "plan", label: "My saved experiment plan" }]
        : code === "M2-L2"
          ? [{ index: "checkin", label: "What happened during my try" }]
          : [...(lesson.try_prompts || []), ...(lesson.reflect_prompts || [])]
              .map((label, index) => ({ label, index }));
    prompts.forEach(({ label, index }) => {
      sources.push({ code, index, label: `${lesson.title}: ${label}` });
    });
  });
  return sources;
}