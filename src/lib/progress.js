import { firstOpenGettingStartedStep, gettingStartedFinished } from "./gettingStartedProgress";
import { isWorkbookLesson } from "./lessonKind";
import { answerKey, routeSkipsWriting } from "./workbook";

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

/** Module 1 uses interactive question keys rather than the old numbered Try inputs. */
function hasNoticeResponse(answers) {
  return ["time-energy", "activity-parts", "missing-experience", "own-caught", "own-dont-know", "possibility", "garden-picks"]
    .some((key) => !isBlank((answers || {})[`M1-L1#${key}`]));
}

/** The Try and Reflect boxes with nothing saved in them yet. */
export function missingPrompts(lesson, answers) {
  if (lesson?.code === "M1-L1") {
    if (hasNoticeResponse(answers)) return [];
    return [{ index: "own-caught", label: "What caught your attention (or what you are unsure about)", kind: "Try" }];
  }
  if (hasInteractionLine(lesson, answers)) return [];
  return requiredPrompts(lesson).filter((prompt) => isBlank((answers || {})[answerKey(lesson.code, prompt.index)]));
}

/** A line in any Try or Reflect box is enough. Watch and Pass count without one. A step with no box never blocks. */
export function stepComplete(lesson, answers, states) {
  const route = states && lesson ? states[lesson.code] : "";
  if (routeSkipsWriting(route)) return true;
  if (lesson?.code === "M1-L1") return hasNoticeResponse(answers);
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
 * Which module can be opened. The workbook starts at Module 1. Getting Started
 * is a gate before this list, so nothing here waits on it. Each numbered module
 * opens once every workbook step before it holds one saved line. A coming-later
 * module is never drawn as locked, because nothing about it is waiting on the journal.
 *
 * Optional weekly pacing (see src/lib/pacing.js): `pacing.openedAt` maps module
 * order to the date it first opened. A module also waits until a week after the
 * module before it opened. It never closes again once opened or started.
 */
const PACE_MS = 7 * 24 * 60 * 60 * 1000;

export function buildProgress({ modules, lessonsByOrder, answers, states, pacing = null }) {
  const ordered = (modules || []).slice().sort((a, b) => a.order - b.order);

  const byOrder = {};
  const rows = [];
  /** Every workbook module the next one waits on, in order. */
  const gates = [];
  /** The numbered module just before this one, for weekly pacing. */
  let previous = null;
  const openedAt = (pacing && pacing.openedAt) || {};
  const now = pacing && pacing.now ? pacing.now : Date.now();

  ordered.forEach((module) => {
    const coming = isComingLater(module);
    /**
     * Getting Started and the opener are not steps of a numbered module, even
     * when their records use that module's order.
     */
    const lessons = ((lessonsByOrder || {})[module.order] || []).filter(isWorkbookLesson);
    const incomplete = lessons.filter((lesson) => !stepComplete(lesson, answers, states));
    const stepsOpen = coming ? false : gates.every((entry) => entry.complete);

    // Weekly pacing. The first numbered module has nothing to wait a week on.
    let opensAt = null;
    let weekOpen = true;
    if (pacing && !pacing.skip && !coming && module.kind !== "orientation" && previous) {
      const alreadyOpened = Boolean(openedAt[module.order]);
      // Started means a real saved line, not a step that counts as done because it has no box.
      const started = lessons.some((lesson) =>
        Object.keys(answers || {}).some((key) => key.startsWith(`${lesson.code}#`) && !isBlank(answers[key]))
      );
      const prevOpened = openedAt[previous.order] ? new Date(openedAt[previous.order]).getTime() : NaN;
      const readyAt = Number.isNaN(prevOpened) ? null : prevOpened + PACE_MS;
      opensAt = readyAt ? new Date(readyAt).toISOString() : null;
      weekOpen = alreadyOpened || started || (readyAt !== null && now >= readyAt);
    }

    byOrder[module.order] = {
      order: module.order,
      kind: module.kind,
      slug: module.slug,
      title: module.title,
      label: module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`,
      coming,
      complete: lessons.length > 0 && incomplete.length === 0,
      unlocked: stepsOpen && weekOpen,
      /** Why a built module is shut: "steps" (earlier steps need a line) or "week" (weekly pacing). */
      lockReason: coming ? null : !stepsOpen ? "steps" : !weekOpen ? "week" : null,
      opensAt: !weekOpen ? opensAt : null,
      previousLabel: previous ? `Module ${previous.order}` : "",
      stepCount: lessons.length,
      writtenCount: lessons.length - incomplete.length,
      missing: incomplete.map((lesson) => ({
        code: lesson.code,
        title: lesson.title,
        prompts: missingPrompts(lesson, answers),
      })),
    };

    // Getting Started is not a row in the workbook, and Module 1 does not wait on it.
    if (module.kind === "orientation") return;

    rows.push(byOrder[module.order]);
    if (!coming) previous = byOrder[module.order];

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

/**
 * The step the Life Map offers next.
 * Getting Started comes first: the earliest of those steps that is not done.
 * Once the required ones are done, the next unfinished workbook step, in live workbook order.
 * Nothing left, or Getting Started not fully loaded, means there is no next step.
 */
export function nextOpenStep({ lessons, workbookLessons, answers, states }) {
  const openGettingStarted = firstOpenGettingStartedStep(lessons, answers, states);
  if (openGettingStarted) return openGettingStarted;
  if (!gettingStartedFinished(lessons, answers, states)) return null;
  const book = workbookLessons || lessons || [];
  return book.find((lesson) => isWorkbookLesson(lesson) && !stepComplete(lesson, answers, states)) || null;
}

/**
 * The step the Life Map's "next" button opens.
 * The Life Map comes after Getting Started, so its next step never points back into
 * Getting Started. It is the next unfinished workbook step, starting at Module 1.
 */
export function nextStepAfterLifeMap({ lessons, workbookLessons, answers, states }) {
  const book = workbookLessons || lessons || [];
  return book.find((lesson) => isWorkbookLesson(lesson) && !stepComplete(lesson, answers, states)) || null;
}
