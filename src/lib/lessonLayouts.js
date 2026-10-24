/**
 * How a step is laid out on screen, by lesson code.
 *
 * Kept in code, beside interactions.js, so the Lesson records stay untouched while
 * the layout is still a prototype. A step with no entry keeps the standard order:
 * What to know → Reading → Try → Reflect → Decision.
 *
 * Layouts:
 *   discovery_first  the activity comes first; the explanation and reading follow it,
 *                    relabelled so they read as "why this matters" and "go deeper".
 *
 * Labels are SUGGESTED wording (Claude), pending Ashley's review.
 */
export const LESSON_LAYOUTS = {
  "M1-L1": {
    layout: "discovery_first",
    labels: {
      try: "Start here",
      teach: "Why this matters",
      reading: "Go deeper (optional)",
    },
    // NoticeFlow's Life Map explainer opens only for people who start from their map.
    collapseMapIntro: true,
  },
};

export function layoutFor(code) {
  return LESSON_LAYOUTS[code] || null;
}

/** Beats that move behind the activity in a discovery-first step. */
const EXPLAIN_KEYS = ["reference", "teach", "reading"];

/**
 * Reorder a step's beats for its layout. Bridges in and out keep their places;
 * the activity moves up, and the explanation moves to just after it.
 */
export function arrangeBeats(beats, code) {
  const config = layoutFor(code);
  if (!config || config.layout !== "discovery_first") return beats;
  const labels = config.labels || {};
  const relabel = (beat) => (labels[beat.key] ? { ...beat, label: labels[beat.key] } : beat);
  const explain = beats.filter((beat) => EXPLAIN_KEYS.includes(beat.key)).map(relabel);
  const rest = beats.filter((beat) => !EXPLAIN_KEYS.includes(beat.key)).map(relabel);
  const tryAt = rest.findIndex((beat) => beat.key === "try");
  if (tryAt < 0) return [...rest, ...explain];
  return [...rest.slice(0, tryAt + 1), ...explain, ...rest.slice(tryAt + 1)];
}
