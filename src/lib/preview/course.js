import { opener } from "./steps/opener";
import { beforeYouStart } from "./steps/beforeYouStart";
import { module1 } from "./steps/module1";
import { module4 } from "./steps/module4";
import { module2 } from "./steps/module2";
import { otherModules } from "./steps/otherModules";
import { OPTIONAL_AFTER_PILOT_ONE, PILOT_ONE } from "./tags";

/** Numbered modules in curriculum order. */
export const modules = [module1, module2, ...otherModules, module4].sort((a, b) => a.order - b.order);

/** The opener stands at the very front, then "Before you start" without a number, then Modules 1 to 10. */
export const sections = [opener, beforeYouStart, ...modules];

export const stepsByCode = {};
sections.forEach((section) => {
  section.steps.forEach((step) => {
    stepsByCode[step.code] = { step, section };
  });
});

export function getStep(code) {
  return stepsByCode[code] || null;
}

export function getSection(slug) {
  return sections.find((section) => section.slug === slug) || null;
}

export function pilotLabel(section) {
  if (section.pilot === "pilot_one") return PILOT_ONE;
  if (section.pilot === "optional_after") return OPTIONAL_AFTER_PILOT_ONE;
  return null;
}

export function readingCount(section) {
  return (section.readings || []).length;
}

export function lessonCount(section) {
  return section.steps.filter((step) => step.sourceLesson).length;
}

export function activityCount(section) {
  return section.steps.filter((step) => (step.blocks || []).some((block) => block.part === "activity")).length;
}

export function readingsForStep(section, step) {
  const ids = step.readings || [];
  return (section.readings || []).filter((reading) => ids.includes(reading.id));
}

/** Movement inside one section only, so no step ever pushes anyone into the next module. */
export function stepNeighbours(section, code) {
  const index = section.steps.findIndex((step) => step.code === code);
  return {
    index,
    prev: index > 0 ? section.steps[index - 1] : null,
    next: index >= 0 && index < section.steps.length - 1 ? section.steps[index + 1] : null,
  };
}

/** Every block in the preview, with a count of what a reviewer can look at. */
export function blockInventory() {
  const rows = [];
  sections.forEach((section) => {
    section.steps.forEach((step) => {
      (step.blocks || []).forEach((block) => {
        rows.push({ section: section.title, step: step.title, id: block.id, version: block.version, type: block.type, tag: block.tag });
      });
    });
  });
  return rows;
}