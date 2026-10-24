import { answerKey } from "./workbook";

/**
 * Bridges between modules. Each one closes a module by putting the participant's
 * own earlier answers in front of them and asking one short question. The answer
 * is then waiting at the start of the next module, so nobody starts over.
 *
 * `sources` point at saved answers by step code and stored index (Try boxes first,
 * then Reflect boxes, numbered in one run). `lifeMapPick` reads the Life Map's
 * closing reflection. `target` is the first-lesson question the bridge answer can
 * be copied into, only when the participant chooses to. All wording is draft,
 * pending Ashley's review.
 */
export const BRIDGES = {
  1: {
    from: 1,
    to: 2,
    // Ashley's wording for this transition, kept as written:
    aim: "Turn something participants noticed into something they can explore.",
    heading: "From noticing to exploring",
    intro: "Here’s what you noticed in Module 1, in your own words. Module 2 starts from one of these, not from a blank page.",
    sources: [
      // Interactive Module 1 (review branch module-1-interactive). Named keys, see src/lib/moduleOne.js.
      { code: "M1-L1", index: "notice-text", label: "Something you noticed" },
      { code: "M1-L1", index: "map-context", label: "Something you brought in from your Life Map" },
      { code: "M1-L1", index: "encounter", label: "A possibility you selected (an encounter, not a decision)" },
      { code: "M1-L1", index: "stood-out", label: "What stood out to you" },
      { code: "M1-L1", index: "carry-choice", label: "What you chose to carry into Module 2" },
      // Earlier versions of Module 1. Still read, so older answers keep arriving here.
      { code: "M1-L1", index: 0, label: "Something you might want to understand better" },
      { code: "M1-L1", index: 1, label: "What you’d need to encounter, ask, or try" },
      { code: "M1-L3", index: 1, label: "What you wanted to bring into Module 2" },
      { code: "M1-L3", index: "willing", label: "What you were willing to try (your learning agreement)" },
      { code: "M1-L3", index: "support", label: "What makes exploring workable (your learning agreement)" },
      { lifeMapPick: "one-thing", label: "From your Life Map" },
    ],
    question:
      "Pick one thing you noticed. What is one way you could explore it: something to look into, ask about, watch, or try?",
    helper: "“Nothing yet” counts. You can change this in Module 2.",
    target: { code: "M2-L1", index: 0, label: "What would you like to explore?" },
  },
  2: {
    from: 2,
    to: 3,
    aim: "Use an actual experience to examine what helped or got in the way.",
    heading: "From one try to what shaped it",
    intro: "Here’s what you recorded from your Module 2 encounter. Module 3 looks at the conditions around it.",
    sources: [
      { code: "M2-L2", index: 1, label: "What you actually did or observed" },
      { code: "M2-L2", index: 3, label: "What helped or made it difficult" },
      { code: "M2-L2", index: 13, label: "How the people, setting, or support affected it" },
      { code: "M2-L3", index: 0, label: "What was different from what you expected" },
      { code: "M2-L2", index: 30, label: "What got in the way" },
      { code: "M2-L2", index: 31, label: "The smallest version that doesn’t need it" },
    ],
    question: "Pick one real moment from that experience. What helped, and what got in the way?",
    helper: "If you didn’t get the chance to try, say that. It’s a real result.",
    target: {
      code: "M3-L1",
      index: 0,
      label: "Start with the encounter you brought from Module 2",
    },
  },
  3: {
    from: 3,
    to: 4,
    aim: "Use observations to question initial assumptions.",
    heading: "From observations to checking assumptions",
    intro:
      "Here’s what you observed in Module 3, next to what you expected earlier. Module 4 checks the story against what happened.",
    sources: [
      { code: "M1-L1", index: 0, label: "Where you started (Module 1)" },
      { code: "M2-L3", index: 0, label: "What was different from what you expected (Module 2)" },
      // Interactive Module 3 (review branch module-3-interactive): M3-L3#5 is chosen in its last part,
      // so the bridge question isn't asked again here. Named keys, see src/lib/moduleThree.js.
      { code: "M3-L3", index: 5, label: "What you chose to carry into Module 4" },
      { code: "M3-L2", index: "checkin", label: "What happened when you changed the setup (Module 3)" },
      { code: "M3-L3", index: 1, label: "What seemed to help or change" },
      { code: "M3-L1", index: 2, label: "What you observed about starting, continuing, or stopping" },
      { code: "M1-L3", index: 4, label: "Something you believed about yourself and hadn’t tested yet (Module 1)" },
    ],
    question:
      "What did you assume at the start (about the activity, the setup, or yourself) that these observations now question? Or do they back it up?",
    helper: "“They back it up” and “I can’t tell yet” are both real answers.",
    target: { code: "M4-L1", index: 1, label: "What story, if any, was added?" },
  },
  4: {
    from: 4,
    to: 5,
    aim: "Use what they’ve learned to decide what they want to continue, change, or leave alone.",
    heading: "From evidence to choosing what to keep",
    intro: "Here’s what you’ve worked out so far. Module 5 is about protecting what works or making one small adjustment.",
    sources: [
      { code: "M2-L3", index: 9, label: "What your first encounter left you with (Module 2)" },
      { code: "M3-L3", index: "next", label: "What you wanted to do next with your Module 3 experiment" },
      { code: "M3-L3", index: 4, label: "Whether you’d choose that condition again (Module 3)" },
      { code: "M4-L3", index: 4, label: "Your more accurate wording" },
      { code: "M4-L3", index: 5, label: "A cue or protective limit you wanted to carry forward" },
    ],
    question: "Based on what you’ve learned, what do you want to continue, change, or leave alone?",
    helper: "Leaving something alone is a full answer. So is “not sure yet.”",
    chips: ["Continue", "Change", "Leave alone", "Not sure yet"],
    target: null,
  },
};

/** Where a bridge's own answer is kept: in the workbook answers, like any step. */
export function bridgeCode(bridge) {
  return `BRIDGE-${bridge.from}-${bridge.to}`;
}

/** The bridge that closes this module, if any. */
export function bridgeOut(moduleOrder) {
  return BRIDGES[Number(moduleOrder)] || null;
}

/** The bridge that leads into this module, if any. */
export function bridgeIn(moduleOrder) {
  return BRIDGES[Number(moduleOrder) - 1] || null;
}

/** Saved answers can be plain text or a JSON-encoded string. */
export function readable(value) {
  const text = String(value ?? "");
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? parsed : text;
  } catch {
    return text;
  }
}

/** The participant's own earlier words for this bridge. Empty answers are left out. */
export function bridgeSources(bridge, answers, pick) {
  return (bridge?.sources || [])
    .map((source) => {
      const raw = source.lifeMapPick
        ? (pick || {}).nothing_yet ? "" : (pick || {})[source.lifeMapPick]
        : (answers || {})[answerKey(source.code, source.index)];
      const value = readable(raw).trim();
      return { ...source, key: source.lifeMapPick ? `map:${source.lifeMapPick}` : answerKey(source.code, source.index), value };
    })
    .filter((item) => item.value && !/^Fictional:/i.test(item.value));
}
