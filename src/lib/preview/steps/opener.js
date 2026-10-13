import { TAG } from "../tags";

/**
 * The opener: mapping the life you are actually living. It stands at the very
 * front, before "Before you start", and holds the life-mapping step that used to
 * sit at the end of that sequence.
 */
export const opener = {
  key: "start-here",
  slug: "start-here",
  title: "Start here",
  label: "Start here",
  pilot: null,
  kind: "orientation",
  purpose: "Put your real week on one page before planning anything: the first thing you do.",
  readings: [{ id: "BY-R6", title: "Map the Life You're Actually Living", tag: TAG.REUSED }],
  steps: [
    {
      code: "BY-L6",
      title: "Map your life right now",
      sourceLesson: "O.6",
      readings: ["BY-R6"],
      blocks: [],
    },
  ],
};