import test from "node:test";
import assert from "node:assert/strict";
import { buildProgress } from "./progress.js";
import { gettingStartedFinished } from "./gettingStartedProgress.js";
import { moduleProgressLabel, moduleProgressDescription } from "./progressLabel.js";

/** Mirrors the live Module records: 0 orientation, 1–5 live, 6–9 coming_later, 10 in_development. */
const MODULES = [
  { order: 0, slug: "getting-started", title: "Getting Started", kind: "orientation", status: "live" },
  ...[1, 2, 3, 4, 5].map((order) => ({ order, slug: `m${order}`, title: `M${order}`, kind: "module", status: "live" })),
  ...[6, 7, 8, 9].map((order) => ({ order, slug: `m${order}`, title: `M${order}`, kind: "module", status: "coming_later" })),
  { order: 10, slug: "m10", title: "M10", kind: "module", status: "in_development" },
];

const step = (order, n) => ({ code: `M${order}-L${n}`, module_order: order, try_prompts: ["x"] });
const LESSONS = {
  0: [{ code: "O.1", module_order: 0, type: "orientation", try_prompts: [] }],
  ...Object.fromEntries([1, 2, 3, 4, 5].map((order) => [order, [step(order, 1), step(order, 2), step(order, 3)]])),
};
const GS_LESSONS = LESSONS[0];

const progress = (answers = {}, states = {}) =>
  buildProgress({ modules: MODULES, lessonsByOrder: LESSONS, answers, states });

test("a brand-new participant can open Module 5 directly", () => {
  const row = progress().byOrder[5];
  assert.equal(row.unlocked, true);
  assert.equal(row.lockReason, null);
});

test("every live module is open with no earlier saved responses", () => {
  const p = progress();
  for (const order of [1, 2, 3, 4, 5]) assert.equal(p.byOrder[order].unlocked, true, `Module ${order}`);
});

test("returning with partial progress: every live module still open, counts kept, nothing changed", () => {
  const answers = { "M1-L1#finished": "x", "M3-L2#finished": "x" };
  const states = { "M2-L1": "Pass" };
  const before = JSON.stringify({ answers, states });
  const p = progress(answers, states);
  for (const order of [1, 2, 3, 4, 5]) assert.equal(p.byOrder[order].unlocked, true, `Module ${order}`);
  assert.equal(p.byOrder[1].writtenCount, 1);
  assert.equal(p.byOrder[2].writtenCount, 1);
  assert.equal(p.byOrder[3].writtenCount, 1);
  assert.equal(p.byOrder[5].writtenCount, 0);
  assert.equal(JSON.stringify({ answers, states }), before, "progress must never modify saved answers");
});

test("unbuilt modules (coming_later, in_development) stay unavailable", () => {
  const p = progress();
  for (const order of [6, 7, 8, 9, 10]) {
    const row = p.byOrder[order];
    assert.ok(row, `Module ${order} row exists`);
    assert.equal(row.unlocked, false, `Module ${order}`);
  }
});

test("Getting Started gate: only the O.1 welcome tap is required, and nothing else", () => {
  assert.equal(gettingStartedFinished(GS_LESSONS, {}, {}), false);
  assert.equal(gettingStartedFinished(GS_LESSONS, {}, { "O.1": "ready" }), true);
  // After the welcome, module access does not depend on any module work.
  const p = progress({}, { "O.1": "ready" });
  assert.equal(p.byOrder[5].unlocked, true);
});

test("progress labels describe what is stored and never claim completion", () => {
  assert.equal(moduleProgressLabel({ writtenCount: 0, stepCount: 3 }).text, "Nothing saved yet");
  assert.equal(moduleProgressLabel({ writtenCount: 1, stepCount: 3 }).text, "1 of 3 steps saved");
  assert.equal(moduleProgressLabel({ writtenCount: 3, stepCount: 3 }).text, "3 of 3 steps saved");
  assert.equal(moduleProgressLabel({ writtenCount: 0, stepCount: 0 }).text, "No steps yet");
  for (const row of [{ writtenCount: 3, stepCount: 3 }, { writtenCount: 1, stepCount: 3 }]) {
    assert.doesNotMatch(moduleProgressLabel(row).text, /complet|finish|master|done/i);
    assert.doesNotMatch(moduleProgressDescription(row), /complet|finish|master|done/i);
  }
});

test("labels read the real progress rows", () => {
  const p = progress({ "M4-L1#finished": "x", "M4-L2#finished": "x" });
  assert.equal(moduleProgressLabel(p.byOrder[4]).text, "2 of 3 steps saved");
  assert.equal(moduleProgressLabel(p.byOrder[5]).text, "Nothing saved yet");
});
