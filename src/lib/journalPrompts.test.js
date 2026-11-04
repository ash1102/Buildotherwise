import test from "node:test";
import assert from "node:assert/strict";
import { GO_DEEPER, JOURNAL_INTRO, goDeeperFor, hasGoDeeper } from "./journalPrompts.js";

const CODES = ["M1-L1", "M1-L2", "M1-L3", "M2-L1", "M2-L2", "M2-L3", "M3-L1", "M3-L2", "M3-L3", "M4-L1", "M4-L2", "M4-L3"];

test("all twelve lessons in Modules 1–4 have a Go Deeper prompt, and nothing else does", () => {
  assert.deepEqual(Object.keys(GO_DEEPER).sort(), CODES);
  for (const code of CODES) {
    const set = goDeeperFor(code, {});
    assert.ok(set.primary.length > 20, code);
    const followUpLimit = code === "M1-L2" ? 4 : 3;
    assert.ok(set.followUps.length >= 2 && set.followUps.length <= followUpLimit, code);
  }
  assert.equal(hasGoDeeper("M5-L1"), false);
  assert.equal(hasGoDeeper("O.1"), false);
});

test("the intro is the approved wording", () => {
  assert.equal(
    JOURNAL_INTRO,
    "This is an optional space to write, ask a question, or disagree with something here. You can skip it or leave it blank; it does not need to be personal."
  );
});

test("spot-check approved primary prompts", () => {
  assert.equal(
    goDeeperFor("M1-L1", {}).primary,
    "Is there anything from this lesson you want to keep exploring? A question, an observation, “nothing yet,” or a blank space are all fine.",
  );
  assert.ok(
    goDeeperFor("M1-L2", {}).followUps.some((prompt) => prompt.includes("difficult experience")),
    "M1-L2 keeps the optional lived-experience follow-up",
  );
  assert.equal(goDeeperFor("M3-L2", {}).primary, "What assumptions do you have about how you work best? Where might those assumptions have come from?");
  assert.equal(goDeeperFor("M4-L3", {}).primary, "What are you beginning to understand differently about yourself? What still feels uncertain, contradictory, or unfinished?");
});

test("M2-L2 follows what actually happened, without pretending the try was done", () => {
  const done = goDeeperFor("M2-L2", { "M2-L2#outcome": "I tried what I planned." });
  assert.match(done.primary, /during the experience/);
  for (const outcome of ["I haven’t tried it yet.", "I ran into a barrier."]) {
    const notYet = goDeeperFor("M2-L2", { "M2-L2#outcome": outcome });
    assert.match(notYet.primary, /planning, trying to get started, or running into barriers/);
    assert.ok(notYet.note);
  }
});

import { addStarter, hasStarter, starterLine } from "./journalPrompts.js";

test("tapping a follow-up adds it once as an editable starter line", () => {
  const q = "Did your reactions surprise you?";
  assert.equal(addStarter("", q), `${starterLine(q)}\n`);
  const withText = addStarter("Something I wrote.  \n", q);
  assert.equal(withText, `Something I wrote.\n\n${starterLine(q)}\n`);
  assert.equal(addStarter(withText, q), withText);
  assert.equal(hasStarter(withText, q), true);
  assert.equal(hasStarter("Something I wrote.", q), false);
});
