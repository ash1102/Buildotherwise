import { base44 } from "@/api/base44Client";

export { OPENER_LESSON_CODE, isOpenerLesson, isWorkbookLesson } from "./lessonKind";

/** Modules and lessons are content records, so later modules can be added as data only. */
export async function loadModules() {
  const modules = await base44.entities.Module.list("order", 20);
  return modules;
}

export async function loadLessons(moduleOrder) {
  const lessons = await base44.entities.Lesson.filter({ module_order: moduleOrder }, "order", 40);
  return lessons;
}

export async function loadLesson(code) {
  const matches = await base44.entities.Lesson.filter({ code }, "-created_date", 1);
  return matches[0] || null;
}

/**
 * Modules delivered only in a live session. In the app they show a short
 * self-paced carry-forward screen instead of steps, whatever their status.
 */
export const LIVE_ONLY_MODULES = [10];

export function isLiveOnlyModule(module) {
  return Boolean(module) && LIVE_ONLY_MODULES.includes(Number(module.order));
}

export function isComingLater(module) {
  return module.status === "coming_later" || module.status === "in_development";
}