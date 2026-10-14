import { answerKey, routeSkipsWriting } from "./workbook";
import { isOpenerLesson } from "./curriculum";
import { readSubmitted } from "./gettingStarted";

/**
 * Completion follows the curriculum's own shape: a step counts once one Try or
 * Reflect box holds a nonblank line. Not every question, and never a judgement
 * about the writing — "I don't know yet" counts the same as a paragraph.
 */
export function requiredPrompts(lesson) {
  const tries = (lesson && lesson.try_prompts) || [];
  const reflects = (lesson && lesson.reflect_prompts) || [];
  return [
    ...tries.map((label, index) => ({ index, label, kind: "Try" })),
    ...reflects.map((label, index) => ({ index: tries.length + index, label, kind: "Reflect" })),
  ];
}

/** Blank means nothing but whitespace — a deliberate short answer is not blank. */
function isBlank(value) {
  return !String(value === null || value === undefined ? "" : value).trim();
}

/** The tap-to-answer pieces (try plan, check-in) save a line of their own; it counts like a Try box. */
const INTERACTION_ANSWERS = ["plan", "checkin"];

function hasInteractionLine(lesson, answers) {
  return INTERACTION_ANSWERS.some((key) => !isBlank((answers || {})[`${lesson.code}#${key}`]));
}

/** The Try and Reflect boxes with nothing saved in them yet. */
export function missingPrompts(lesson, answers) {
  if (hasInteractionLine(lesson, answers)) return [];
  return requiredPrompts(lesson).filter((prompt) => isBlank((answers || {})[answerKey(lesson.code, prompt.index)]));
}

/** A line in any Try or Reflect box is enough. Watch and Pass count without one. A step with no box never blocks. */
export function stepComplete(lesson, answers, states) {
  const route = states && lesson ? states[lesson.code] : "";
  if (routeSkipsWriting(route)) return true;
  const prompts = requiredPrompts(lesson);
  if (!prompts.length) return true;
  if (hasInteractionLine(lesson, answers)) return true;
  return prompts.some((prompt) => !isBlank((answers || {})[answerKey(lesson.code, prompt.index)]));
}

/** A module that is not built yet. This is a different state from a locked module. */
function isComingLater(module) {
  return Boolean(module.status) && module.status !== "live";
}

/**
 * Which module can be opened. The program opens in order, starting with its own
 * doorway: Getting Started first, then each numbered module once every step
 * before it holds one saved line — so Module 1 waits on Getting Started, and
 * Module 2 waits on Getting Started and Module 1. A coming-later module is never
 * drawn as locked, because nothing about it is waiting on the journal.
 */
export function buildProgress({ modules, lessonsByOrder, answers, states }) {
  const ordered = (modules || []).slice().sort((a, b) => a.order - b.order);

  const byOrder = {};
  const rows = [];
  /** Every container the gate waits on, in order, so the first unfinished one is the blocker. */
  const gates = [];

  ordered.forEach((module) => {
    const coming = isComingLater(module);
    /**
     * The opening map is its own entry point at the start of the program, not one
     * of Getting Started's steps, so it never counts here and nothing waits on it.
     */
    const lessons = ((lessonsByOrder || {})[module.order] || []).filter((lesson) => !isOpenerLesson(lesson));
    /** Once Getting Started is submitted it is finished, whatever was skipped inside it. */
    const submittedOrientation = module.kind === "orientation" && Boolean(readSubmitted());
    const incomplete = submittedOrientation ? [] : lessons.filter((lesson) => !stepComplete(lesson, answers, states));

    byOrder[module.order] = {
      order: module.order,
      kind: module.kind,
      slug: module.slug,
      title: module.title,
      label: module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`,
      coming,
      complete: lessons.length > 0 && incomplete.length === 0,
      unlocked: coming ? false : gates.every((entry) => entry.complete),
      stepCount: lessons.length,
      writtenCount: lessons.length - incomplete.length,
      missing: incomplete.map((lesson) => ({
        code: lesson.code,
        title: lesson.title,
        prompts: missingPrompts(lesson, answers),
      })),
    };

    if (module.kind !== "orientation") rows.push(byOrder[module.order]);

    // Nothing waits on a module that was never built, or on a container with no steps to finish.
    if (!coming && lessons.length > 0) gates.push(byOrder[module.order]);
  });

  /** The first thing still missing a line, which is what holds everything after it shut. */
  const blocking = gates.find((entry) => !entry.complete) || null;

  return {
    rows,
    byOrder,
    blockingOrder: blocking ? blocking.order : null,
  };
}