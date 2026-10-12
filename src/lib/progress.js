import { answerKey } from "./workbook";

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

/** One nonblank line in any Try or Reflect box is enough. A step with no such box never blocks. */
export function stepComplete(lesson, answers) {
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
 * Which module can be opened. Numbered modules open in order: a module opens when
 * every step of the module before it holds one saved line. Getting Started keeps
 * its own promise and never gates Module 1. A coming-later module is never drawn
 * as locked, because nothing about it is waiting on the journal.
 */
export function buildProgress({ modules, lessonsByOrder, answers }) {
  const numbered = (modules || [])
    .filter((module) => module.kind !== "orientation")
    .slice()
    .sort((a, b) => a.order - b.order);

  const before = [];
  const byOrder = {};

  numbered.forEach((module) => {
    const coming = isComingLater(module);
    const lessons = (lessonsByOrder || {})[module.order] || [];
    const incomplete = lessons.filter((lesson) => !stepComplete(lesson, answers));

    byOrder[module.order] = {
      order: module.order,
      slug: module.slug,
      title: module.title,
      coming,
      complete: lessons.length > 0 && incomplete.length === 0,
      unlocked: coming ? false : before.every((entry) => entry.complete),
      stepCount: lessons.length,
      writtenCount: lessons.length - incomplete.length,
      missing: incomplete.map((lesson) => ({
        code: lesson.code,
        title: lesson.title,
        prompts: missingPrompts(lesson, answers),
      })),
    };

    if (!coming) before.push({ order: module.order, complete: byOrder[module.order].complete });
  });

  /** The first module still missing a line, which is what holds the ones after it shut. */
  const blocking = before.find((entry) => !entry.complete) || null;

  return {
    rows: Object.values(byOrder),
    byOrder,
    blockingOrder: blocking ? blocking.order : null,
  };
}