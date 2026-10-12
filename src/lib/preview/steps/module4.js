import { TAG } from "../tags";

/**
 * The three Module 4 readings are the owner's verbatim text, loaded from the
 * library records.
 *
 * Two corrections are applied when the stored text is rendered, both from the
 * build brief and both reported for review:
 *  1. Stale module numbering is corrected to the app's numbering ("Module 1.5"
 *     becomes "Module 3", which is the module this reading refers back to).
 *  2. The dropped "stopped after twenty minutes" example is removed. Its
 *     replacement is the swappable example block below, which is not approved
 *     yet and can be replaced without a rebuild.
 */
export const MODULE_4_OLD_EXAMPLE = /twenty minutes|drawer handle|loose drawer/i;

export function correctModule4Text(text) {
  return String(text || "")
    .replace(/Module 1\.5/g, "Module 3")
    .split(/\n{2,}/)
    .filter((paragraph) => !MODULE_4_OLD_EXAMPLE.test(paragraph))
    .join("\n\n");
}

const swappableExample = {
  id: "M4-L1-example",
  version: "1.0",
  type: "example",
  part: "lesson",
  title: "Example block — swappable, not approved yet",
  invented: false,
  swappable: true,
  tag: TAG.PROPOSED,
  afterReading: true,
  body:
    "A learner opens one of two unlabeled links, gets an error page, and never gets into the workshop.\n\n" +
    "What happened: the link failed, and no one was in the room.\n" +
    "One story added: “I’m not the kind of person who can find these things.”\n" +
    "The verdict: “I don’t belong here.”\n\n" +
    "The event is checkable. The story might be right, partly right, or wrong. The verdict makes the largest claim, and it needs the most evidence.",
  note:
    "Proposed in the Notion review draft. Not approved. The old twenty-minutes example is dropped and is not shown in this preview.",
};

export const module4 = {
  key: "module-4",
  slug: "check-the-story-build-evidence",
  order: 4,
  title: "Check the Story, Build Evidence",
  pilot: "pilot_one",
  kind: "module",
  purpose: "Slow down the jump from what happened to what it means.",
  readings: [
    { id: "M4-R1", title: "What Happened Is Not the Same as What It Means", tag: TAG.VERBATIM, correct: true },
    { id: "M4-R2", title: "Don’t Just Argue With the Story. Gather Evidence.", tag: TAG.VERBATIM },
    { id: "M4-R3", title: "Make the Claim the Size of the Evidence", tag: TAG.VERBATIM },
  ],
  steps: [
    {
      code: "M4-L1",
      title: "Separate what happened from what it means",
      sourceLesson: "M4-L1",
      readings: ["M4-R1"],
      blocks: [swappableExample],
    },
    {
      code: "M4-L2",
      title: "Turn a chosen value into a small action",
      sourceLesson: "M4-L2",
      readings: ["M4-R2"],
      blocks: [],
    },
    {
      code: "M4-L3",
      title: "Review the evidence and revise your statement",
      sourceLesson: "M4-L3",
      readings: ["M4-R3"],
      blocks: [],
      decision: true,
    },
  ],
};