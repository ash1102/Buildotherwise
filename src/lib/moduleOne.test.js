import test from "node:test";
import assert from "node:assert/strict";
import {
  ENCOUNTER_CARDS,
  encounterValue,
  moduleOneStepComplete,
  readAnswer,
  joinMulti,
  selectedEncounterIds,
  splitMulti,
} from "./moduleOne.js";
import { stepComplete, buildProgress } from "./progress.js";
import { BRIDGES, bridgeSources } from "./moduleBridges.js";

const L1 = { code: "M1-L1", module_order: 1, try_prompts: ["a", "b"] };
const L2 = { code: "M1-L2", module_order: 1, try_prompts: [], reflect_prompts: ["q"] };
const L3 = { code: "M1-L3", module_order: 1, try_prompts: ["a", "b", "c"], reflect_prompts: ["d", "e"] };

test("a lesson with nothing saved is not complete", () => {
  for (const lesson of [L1, L2, L3]) assert.equal(stepComplete(lesson, {}, {}), false);
});

test("declining to write: 'I'm done with this lesson' completes it", () => {
  assert.equal(stepComplete(L1, { "M1-L1#finished": "2026-10-24T00:00:00Z" }, {}), true);
  assert.equal(stepComplete(L2, { "M1-L2#finished": "2026-10-24T00:00:00Z" }, {}), true);
  assert.equal(stepComplete(L3, { "M1-L3#finished": "2026-10-24T00:00:00Z" }, {}), true);
});

test("'Nothing comes to mind yet' counts the same as any other answer", () => {
  assert.equal(moduleOneStepComplete("M1-L1", { "M1-L1#notice-route": "Nothing comes to mind yet" }), true);
});

test("answers saved in the earlier versions of Module 1 still count", () => {
  assert.equal(stepComplete(L1, { "M1-L1#own-caught": "gardens" }, {}), true);
  assert.equal(stepComplete(L1, { "M1-L1#0": "old numbered answer" }, {}), true);
  assert.equal(stepComplete(L2, { "M1-L2#0": "a question" }, {}), true);
  assert.equal(stepComplete(L3, { "M1-L3#2": "flexible time" }, {}), true);
  assert.equal(stepComplete(L3, { "M1-L3#4": "baseline belief" }, {}), true);
  // Pass on an old route still counts.
  assert.equal(stepComplete(L2, {}, { "M1-L2": "Pass" }), true);
});

test("Module 2 is open with nothing saved (Phase 1: no step gate)", () => {
  const modules = [
    { order: 1, slug: "m1", title: "One", kind: "module", status: "live" },
    { order: 2, slug: "m2", title: "Two", kind: "module", status: "live" },
  ];
  const lessonsByOrder = { 1: [L1, L2, L3], 2: [{ code: "M2-L1", module_order: 2, try_prompts: ["x"] }] };
  const none = buildProgress({ modules, lessonsByOrder, answers: {}, states: {} });
  assert.equal(none.byOrder[2].unlocked, true);
  const done = { "M1-L1#finished": "x", "M1-L2#finished": "x", "M1-L3#finished": "x" };
  assert.equal(buildProgress({ modules, lessonsByOrder, answers: done, states: {} }).byOrder[2].unlocked, true);
});

test("the Module 1→2 bridge quotes new and old answers exactly, and invents nothing", () => {
  const answers = {
    "M1-L1#notice-text": "Why the bus is always late",
    "M1-L1#encounter": "Repairing what others throw away",
    "M1-L1#carry-choice": "A question I want answered",
    "M1-L1#0": "older answer",
  };
  const items = bridgeSources(BRIDGES[1], answers, {});
  assert.deepEqual(
    items.map((item) => item.value),
    ["Why the bus is always late", "Repairing what others throw away", "A question I want answered", "older answer"]
  );
  assert.deepEqual(bridgeSources(BRIDGES[1], {}, {}), []);
});

test("discovery gallery: 12 cards, any number selected, older saves still match", () => {
  assert.equal(ENCOUNTER_CARDS.length, 12);
  assert.equal(new Set(ENCOUNTER_CARDS.map((card) => card.id)).size, 12);
  // Saved before the gallery grew (one card, older title)
  assert.deepEqual(selectedEncounterIds("Repairing what others throw away"), ["repair"]);
  assert.deepEqual(selectedEncounterIds("Solving a community problem"), ["community"]);
  // Several, none
  assert.deepEqual(selectedEncounterIds(encounterValue(["sound", "food"])), ["sound", "food"]);
  assert.equal(encounterValue([]), "");
  assert.deepEqual(selectedEncounterIds(""), []);
  // Saving uses current titles in gallery order
  assert.equal(encounterValue(["movement", "repair"]), "Repair & Restore; Movement & Performance");
});

test("multi-select answers read back as the same list", () => {
  const list = ["Flexible timing", "A quiet place"];
  assert.deepEqual(splitMulti(joinMulti(list)), list);
  assert.equal(readAnswer({ "M1-L3#1": JSON.stringify("quoted older text") }, "M1-L3", 1), "quoted older text");
});
