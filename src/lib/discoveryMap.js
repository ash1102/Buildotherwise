import { GROUP_LABELS, entriesFromAnswers } from "./discovery";
import { NEXT_DECISIONS, describeStep } from "./workbook";

/**
 * The Discovery Map is drawn entirely from stores the workbook already writes:
 * answers, decisions, step states, carry-forward choices, journal entries,
 * Life Map lines and the discoveries kept in the Discovery Record.
 * Nothing on this page asks for new writing.
 */

/** How each step reads on the trail. Classes are written out so the build keeps them. */
export const STATE_STYLE = {
  decided: "border-copper/60 bg-copper-wash/70 text-copper",
  answered: "border-teal-deep/40 bg-teal-deep-wash text-teal-deep",
  paused: "border-dashed border-natural-deep bg-white text-ink-faint",
  passed: "border-natural-deep bg-white text-ink-faint",
  "not answered": "border-natural bg-ivory/60 text-ink-faint",
};

export const STATE_DOT = {
  decided: "border-copper bg-copper",
  answered: "border-teal-deep bg-teal-deep",
  paused: "border-dashed border-natural-deep bg-white",
  passed: "border-natural-deep bg-natural-deep",
  "not answered": "border-natural bg-white",
};

export const STATE_LABEL = {
  decided: "Next Decision recorded",
  answered: "Something written",
  paused: "Paused",
  passed: "Passed",
  "not answered": "Still open",
};

export const STATE_ORDER = ["decided", "answered", "paused", "passed", "not answered"];

/** Working privately is how most steps are taken, so it is not repeated as a choice made. */
const QUIET_ROUTE = "Work privately";

/**
 * One station per module, with its steps and the choices recorded inside it.
 * A module whose steps are not here yet is drawn as a station along the path.
 */
export function buildTrail({ modules, lessonsByOrder, answers, decisions, states, carried }) {
  const carriedCodes = (entry) =>
    [...new Set((entry || []).map((key) => String(key).split("#")[0]))].filter(Boolean);

  return (modules || []).map((module) => {
    const steps = (lessonsByOrder[module.order] || []).map((lesson) => ({
      code: lesson.code,
      title: lesson.title,
      order: lesson.order,
      status: describeStep(lesson.code, answers, decisions, states),
      decision: (decisions || {})[lesson.code] || "",
      route: (states || {})[lesson.code] || "",
      carried: carriedCodes((carried || {})[lesson.code]),
    }));

    const choices = steps
      .filter((step) => step.decision || (step.route && step.route !== QUIET_ROUTE))
      .map((step) => ({
        code: step.code,
        decision: step.decision,
        route: step.decision ? "" : step.route,
      }));

    const carriedIn = [...new Set(steps.flatMap((step) => step.carried))].filter(
      (code) => !steps.some((step) => step.code === code)
    );

    return {
      key: module.id || module.slug || String(module.order),
      module,
      steps,
      choices,
      carriedIn,
      written: steps.filter((step) => step.status !== "not answered").length,
    };
  });
}

/** The Next Decisions and participation routes recorded so far, with the steps they belong to. */
export function buildChoiceTally({ decisions, states, lessonsByCode }) {
  const named = (code) => (lessonsByCode || {})[code]?.title || "A step in your workbook";

  const decisionRows = NEXT_DECISIONS.map((label) => ({
    label,
    steps: Object.entries(decisions || {})
      .filter(([, value]) => value === label)
      .map(([code]) => ({ code, title: named(code) })),
  })).filter((row) => row.steps.length);

  const byRoute = {};
  Object.entries(states || {}).forEach(([code, route]) => {
    if (!route) return;
    byRoute[route] = byRoute[route] || [];
    byRoute[route].push({ code, title: named(code) });
  });

  const routeRows = Object.entries(byRoute)
    .map(([label, steps]) => ({ label, steps }))
    .sort((a, b) => b.steps.length - a.steps.length);

  return { decisionRows, routeRows };
}

/** Where the record has gathered: the sections the steps themselves fill, plus the kept entries. */
export function buildGathering({ answers, discoveries, journal, map }) {
  const fromAnswers = entriesFromAnswers(answers);
  const mapLines = Object.values(map || {}).reduce(
    (count, list) => count + (Array.isArray(list) ? list.length : 0),
    0
  );
  const writtenAnswers = Object.values(answers || {}).filter((value) => String(value || "").trim()).length;

  return {
    sections: Object.entries(GROUP_LABELS).map(([key, label]) => ({
      key,
      label,
      items: fromAnswers.filter((item) => item.section === key),
    })),
    figures: [
      { label: "Lines saved in steps", value: writtenAnswers },
      { label: "Journal lines", value: (journal || []).length },
      { label: "Discoveries you kept", value: (discoveries || []).length },
      { label: "Life Map lines", value: mapLines },
    ],
  };
}