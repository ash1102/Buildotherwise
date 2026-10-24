import test from "node:test";
import assert from "node:assert/strict";
import {
  GO_DEEPER,
  JOURNAL_INTRO,
  L2_EXAMPLE,
  OUTCOMES,
  SORT_ITEMS,
  SORT_LABELS,
  STATEMENT_MODES,
  currentStatement,
  isModuleFourInteractive,
  moduleFourStepComplete,
  readSort,
} from "./moduleFour.js";
import { stepComplete } from "./progress.js";
import { lessonOwner } from "./interactions.js";
import { BRIDGES, bridgeSources } from "./moduleBridges.js";

const a = (pairs) => Object.fromEntries(Object.entries(pairs));

test("all three Module 4 lessons are owned by the interactive pieces", () => {
  assert.equal(lessonOwner("M4-L1").type, "m4Separate");
  assert.equal(lessonOwner("M4-L2").type, "m4Action");
  assert.equal(lessonOwner("M4-L3").type, "m4Review");
  assert.ok(!isModuleFourInteractive("M4-L4"));
  assert.ok(!isModuleFourInteractive("M3-L3"));
});

test("classification: the example sorts into Event, Verdict, Story, Uncertain, using known labels", () => {
  assert.equal(SORT_ITEMS.length, 4);
  assert.deepEqual(SORT_ITEMS.map((item) => item.answer), ["Event", "Verdict", "Story", "Uncertain"]);
  for (const item of SORT_ITEMS) {
    assert.ok(SORT_LABELS.includes(item.answer));
    assert.ok(item.explain.length > 20);
  }
});

test("classification answers are read safely, even when the saved value is broken", () => {
  assert.deepEqual(readSort({ "M4-L1#sort": JSON.stringify({ s1: "Story" }) }), { s1: "Story" });
  assert.deepEqual(readSort({ "M4-L1#sort": "{not json" }), {});
  assert.deepEqual(readSort({}), {});
});

test("journal wording is verbatim and every lesson has one prompt with follow-ups", () => {
  assert.equal(
    JOURNAL_INTRO,
    "You don’t have to answer every question. Start wherever something catches your attention. You can explore a memory, question an assumption, disagree with an idea, or follow a thought somewhere unexpected."
  );
  for (const code of ["M4-L1", "M4-L2", "M4-L3"]) {
    assert.ok(GO_DEEPER[code].prompt.endsWith("?"));
    assert.equal(GO_DEEPER[code].followUps.length, 3);
  }
});

test("L3 outcomes include not attempting, in Ashley's wording", () => {
  assert.deepEqual(OUTCOMES, [
    "I completed the action.",
    "I completed part of it.",
    "I tried something different.",
    "I couldn’t attempt it.",
    "I decided not to attempt it.",
  ]);
});

test("the statement carries from L1 into L2 and L3, unless L2 chose another or the example", () => {
  const base = { "M4-L1#statement": "I never finish anything." };
  assert.equal(currentStatement(base), "I never finish anything.");
  assert.equal(currentStatement({ ...base, "M4-L2#statement": "I stop when it gets confusing." }), "I stop when it gets confusing.");
  assert.equal(currentStatement({ ...base, "M4-L2#statement-mode": STATEMENT_MODES[2] }), "");
  assert.equal(currentStatement({ ...base, "M4-L2#statement-mode": STATEMENT_MODES[3], "M4-L2#statement": L2_EXAMPLE }), L2_EXAMPLE);
  assert.equal(currentStatement({}), "");
});

test("completion: any answer, the practice, the journal, or 'done for now' counts; nothing else is required", () => {
  for (const code of ["M4-L1", "M4-L2", "M4-L3"]) {
    assert.equal(moduleFourStepComplete(code, {}), false);
    assert.equal(moduleFourStepComplete(code, { [`${code}#finished`]: "yes" }), true);
    assert.equal(moduleFourStepComplete(code, { [`${code}#go-deeper`]: "Some thoughts" }), true);
    assert.equal(stepComplete({ code, prompts: [] }, { [`${code}#finished`]: "yes" }, {}), true);
  }
  assert.equal(moduleFourStepComplete("M4-L1", { "M4-L1#sort": "{\"s1\":\"Event\"}" }), true);
  assert.equal(moduleFourStepComplete("M4-L3", { "M4-L3#outcome": OUTCOMES[4] }), true);
});

test("answers from the earlier Module 4 still count, and keep their slots", () => {
  assert.equal(moduleFourStepComplete("M4-L2", { "M4-L2#4": "Old plan" }), true);
  assert.equal(moduleFourStepComplete("M4-L1", { "M4-L1#4": "Old accurate statement" }), true);
});

test("bridges: Module 3 → 4 still targets L1's story slot, Module 4 → 5 reads the revised wording", () => {
  assert.equal(BRIDGES[3].target.code, "M4-L1");
  const sources = bridgeSources(BRIDGES[4], { "M4-L3#4": "I had trouble explaining without preparation." });
  assert.ok(sources.some((item) => item.value === "I had trouble explaining without preparation."));
});
