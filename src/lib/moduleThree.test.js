import test from "node:test";
import assert from "node:assert/strict";
import {
  EXAMPLE_LOOKED,
  EXAMPLE_TASK,
  OUTCOME_NOT_YET,
  SOURCE_EXAMPLE,
  SOURCE_OTHER,
  TASK_EXAMPLE,
  attemptedText,
  carrySuggestions,
  checkinSentences,
  effectiveCondition,
  hasResult,
  moduleThreeStepComplete,
  moduleTwoRecap,
  planSentences,
  readExperiment,
  taskFromL1,
} from "./moduleThree.js";
import { stepComplete } from "./progress.js";
import { BRIDGES, bridgeSources } from "./moduleBridges.js";

const L1 = { code: "M3-L1", module_order: 3, try_prompts: ["a", "b"], reflect_prompts: ["c", "d"] };
const L2 = { code: "M3-L2", module_order: 3, try_prompts: ["a", "b", "c", "d"], reflect_prompts: ["e", "f", "g"] };
const L3 = { code: "M3-L3", module_order: 3, try_prompts: ["a", "b", "c"], reflect_prompts: ["d", "e", "f"] };

test("nothing saved: lessons are not complete, and nothing breaks", () => {
  for (const lesson of [L1, L2, L3]) assert.equal(stepComplete(lesson, {}, {}), false);
  assert.deepEqual(moduleTwoRecap({}), []);
  assert.deepEqual(taskFromL1({}), { text: "", origin: "" });
  const x = readExperiment({});
  assert.equal(x.task, "");
  assert.equal(hasResult(x), false);
  assert.equal(planSentences(x), "");
  assert.equal(checkinSentences(x), "");
  assert.equal(attemptedText(x), "");
  assert.ok(carrySuggestions({}).length >= 1);
});

test("'I'm done with this lesson' completes each lesson without writing", () => {
  for (const lesson of [L1, L2, L3]) assert.equal(stepComplete(lesson, { [`${lesson.code}#finished`]: "2026-10-24" }, {}), true);
});

test("answers from the earlier Module 3 still count and are never needed again", () => {
  assert.equal(moduleThreeStepComplete("M3-L1", { "M3-L1#2": "I started late" }), true);
  assert.equal(moduleThreeStepComplete("M3-L2", { "M3-L2#6": "Try again" }), true);
  assert.equal(moduleThreeStepComplete("M3-L3", { "M3-L3#0": "Reply" }), true);
});

test("Module 2 answers arrive in M3-L1 and flow on to M3-L2 (new and earlier keys)", () => {
  const answers = { "M2-L2#1": "Watched a bike repair video", "M2-L2#noticed": "It was confusing; I’m still unsure", "M2-L3#0": "Slower than I thought" };
  const recap = moduleTwoRecap(answers);
  assert.deepEqual(recap.map((r) => r.key), ["M2-L2#1", "M2-L2#noticed", "M2-L3#0"]);
  assert.equal(recap[1].value, "It was confusing, I’m still unsure");
  assert.deepEqual(taskFromL1(answers), { text: "Watched a bike repair video", origin: "m2" });
  // Choosing another activity drops the Module 2 fallback.
  assert.deepEqual(taskFromL1({ ...answers, "M3-L1#source": SOURCE_OTHER }), { text: "", origin: "" });
  // The participant's own words win.
  assert.equal(taskFromL1({ ...answers, "M3-L1#0": "Fixing my bike" }).text, "Fixing my bike");
});

test("the M3-L1 condition preselects M3-L2, and the participant can change it", () => {
  assert.deepEqual(effectiveCondition({ "M3-L1#focus": "environment" }), { id: "environment", from: "l1" });
  assert.deepEqual(effectiveCondition({ "M3-L1#focus": "environment", "M3-L2#condition": "time" }), { id: "time", from: "l2" });
  assert.deepEqual(effectiveCondition({ "M3-L1#focus": "unsure" }), { id: "", from: "" });
});

test("a plan without a result is never shown as a result", () => {
  const answers = {
    "M3-L2#task": "Learning a new computer program",
    "M3-L2#condition": "instructions",
    "M3-L2#0": "Follow a short demonstration instead of written instructions",
    "M3-L2#2": "About 20 minutes",
    "M3-L2#outcome": OUTCOME_NOT_YET,
  };
  const x = readExperiment(answers);
  assert.equal(hasResult(x), false);
  assert.equal(attemptedText(x), "Not tried yet.");
  assert.match(planSentences(x), /Condition to change: Clearer instructions/);
  assert.equal(moduleThreeStepComplete("M3-L2", answers), true);
});

test("the provided example: looking only is not recorded as an experiment", () => {
  const answers = { "M3-L1#source": SOURCE_EXAMPLE, "M3-L2#task-mode": TASK_EXAMPLE, "M3-L2#example-use": EXAMPLE_LOOKED, "M3-L2#outcome": "The adjustment seemed to help." };
  const x = readExperiment(answers);
  assert.equal(x.task, EXAMPLE_TASK);
  assert.equal(x.condition, "instructions");
  assert.equal(hasResult(x), false);
  assert.doesNotMatch(checkinSentences(x), /What happened/);
  assert.match(attemptedText(x), /Not written/);
});

test("M3-L3's carried observation is what Module 4 reads first", () => {
  const items = bridgeSources(BRIDGES[3], { "M3-L3#5": "Was it the instructions, or practice?", "M3-L2#checkin": "What happened: It made things harder." }, {});
  assert.equal(items[0].value, "Was it the instructions, or practice?");
  assert.equal(items[1].key, "M3-L2#checkin");
});
