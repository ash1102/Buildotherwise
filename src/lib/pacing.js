import { useEffect, useMemo } from "react";
import { useStore } from "./store";
import { progressStorageKey } from "./progressScope";
import { useAuth } from "./AuthContext";
import { buildProgress } from "./progress";

/**
 * Weekly pacing: one new module opens each week.
 *
 * A module opens when both are true:
 *   1. every workbook step before it holds a saved line (the existing rule), and
 *   2. at least PACE_DAYS have passed since the module before it opened.
 *
 * The week leaves room for the real-world try between sessions, and keeps the
 * draft homework load near 2–3 hours a week. Nothing already open ever closes:
 * a module that was opened before, or that already has a saved line, stays open.
 * Admins skip pacing so the whole pilot can be reviewed.
 */
export const PACE_DAYS = 7;
/** Set to true to bring the weekly pass back for everyone. Off = each module opens as soon as the one before it is done. */
export const PACE_ENABLED = false;
const DAY_MS = 24 * 60 * 60 * 1000;
const OPENED_KEY = "moduleOpenedAt";

export function paceReadyAt(openedIso) {
  if (!openedIso) return null;
  const opened = new Date(openedIso).getTime();
  if (Number.isNaN(opened)) return null;
  return new Date(opened + PACE_DAYS * DAY_MS);
}

/** "Tue, Oct 21" in the participant's own locale. */
export function formatOpenDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Progress with weekly pacing applied. Records the first time each module opens,
 * so the next one can open a week later. Safe to call from several components:
 * a date is only written once per module.
 */
export function usePacedProgress({ modules, lessonsByOrder, answers, states }) {
  const { user, isAuthenticated } = useAuth();
  const skip = PACE_ENABLED ? Boolean(isAuthenticated && user?.role === "admin") : true;
  const [openedAt, setOpenedAt] = useStore(progressStorageKey(OPENED_KEY), {});
  // Rounded to the minute so the memo is not rebuilt on every render.
  const minute = Math.floor(Date.now() / 60000);

  const progress = useMemo(
    () =>
      buildProgress({
        modules,
        lessonsByOrder,
        answers,
        states,
        pacing: { openedAt: openedAt || {}, now: minute * 60000, skip },
      }),
    [modules, lessonsByOrder, answers, states, openedAt, minute, skip]
  );

  useEffect(() => {
    if (skip) return;
    const fresh = progress.rows.filter((row) => row.unlocked && !(openedAt || {})[row.order]);
    if (!fresh.length) return;
    setOpenedAt((current) => {
      const nextMap = { ...(current || {}) };
      const stamp = new Date().toISOString();
      fresh.forEach((row) => {
        if (!nextMap[row.order]) nextMap[row.order] = stamp;
      });
      return nextMap;
    });
  }, [progress, openedAt, skip, setOpenedAt]);

  return { ...progress, pacingSkipped: skip };
}
