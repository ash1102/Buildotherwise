import { base44 } from "@/api/base44Client";
import { isGettingStartedLesson } from "@/lib/gettingStartedProgress";

/**
 * The opening step: mapping the life you are actually living. It is its own
 * step. It is not one of Getting Started's five steps, and it is not part of
 * Module 1.
 */
export const OPENER_LESSON_CODE = "O.6";

export function isOpenerLesson(lesson) {
  return Boolean(lesson) && lesson.code === OPENER_LESSON_CODE;
}

/**
 * A lesson that belongs in the workbook, starting at Module 1.
 * Getting Started (by code, on module 0 or module 1) and the opener stay out.
 * Module order 0 is the Getting Started container, so nothing stored there is a workbook step.
 */
export function isWorkbookLesson(lesson) {
  if (!lesson || isOpenerLesson(lesson) || isGettingStartedLesson(lesson)) return false;
  if (Number(lesson.module_order) === 0) return false;
  return true;
}

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

export function isComingLater(module) {
  return module.status === "coming_later" || module.status === "in_development";
}