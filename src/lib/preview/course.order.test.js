import assert from "node:assert/strict";
import test from "node:test";
import { sections } from "./course.js";

test("the Life Map sits after orientation and before Module 1", () => {
  assert.equal(sections[0].slug, "before-you-start");
  assert.equal(sections[0].kind, "orientation");
  assert.equal(sections[1].slug, "life-map");
  assert.equal(sections[1].kind, "lifemap");
  assert.equal(sections[1].label, "Before Module 1");
  assert.equal(sections[1].steps[0].sourceLesson, "O.6");
  assert.equal(sections[1].steps.some((step) => (step.blocks || []).some((block) => block.type === "life_map")), true);

  const module1 = sections.find((section) => section.order === 1);
  assert.equal(module1.title, "Find Something Worth Exploring");
  assert.equal(module1.steps[0].title, "Notice without forcing an answer");
  assert.equal(module1.steps.some((step) => (step.blocks || []).some((block) => block.type === "life_map")), false);
  assert.ok(sections.findIndex((section) => section.order === 1) > sections.findIndex((section) => section.slug === "life-map"));
});
