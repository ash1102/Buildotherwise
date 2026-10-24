import test from "node:test";
import assert from "node:assert/strict";
import { stepComplete } from "./progress.js";
import {
  CLOSING_PARAGRAPHS,
  JOURNAL_INTRO,
  JOURNAL_PROMPTS,
  MODULE_FIVE_TITLE,
  applyModuleFiveContent,
  applyModuleFiveModules,
  journeyGroups,
  moduleFiveStepComplete,
  patternTitle,
  reviewColumns,
  selectedStances,
  stanceValue,
} from "./moduleFive.js";

const lesson = (code) => ({
  code,
  try_prompts: ["one"],
  reflect_prompts: ["two"],
});

test("display overlay renames Module 5 only", () => {
  const modules = applyModuleFiveModules([
    { order: 4, title: "Check the Story, Build Evidence", purpose: "Keep it" },
    { order: 5, title: "Tuning Your Instrument", purpose: "Listen" },
  ]);
  assert.equal(modules[0].title, "Check the Story, Build Evidence");
  assert.equal(modules[1].title, MODULE_FIVE_TITLE);
  assert.match(modules[1].purpose, /patterns do I recognize/);

  const lessons = applyModuleFiveContent([
    { code: "M4-L3", title: "Review the evidence and revise your statement" },
    { code: "M5-L1", title: "Listen before you tune", purpose: "old" },
    { code: "M5-L3", title: "Check an impression and take stock" },
  ]);
  assert.equal(lessons[0].title, "Review the evidence and revise your statement");
  assert.equal(lessons[1].title, "Understand the Sequence Before You Map It");
  assert.equal(lessons[2].title, "Check an Impression and Close Pilot 1");
});

test("pattern title reads the card, the participant's words, or nothing", () => {
  assert.equal(patternTitle({}), "");
  assert.equal(patternTitle({ "M5-L1#pattern": "focused" }), "Getting intensely focused");
  assert.equal(patternTitle({ "M5-L1#pattern": "other" }), "Something else I've noticed");
  assert.equal(
    patternTitle({ "M5-L1#pattern": "other", "M5-L1#pattern-other": "Checking the lock twice" }),
    "Checking the lock twice"
  );
});

test("keep / adjust / protect round-trips and can be combined", () => {
  const ids = ["keep", "protect"];
  const saved = { "M5-L2#stance": stanceValue(ids) };
  assert.deepEqual(selectedStances(saved), ids);
  assert.equal(selectedStances({ "M5-L2#stance": "" }).length, 0);
});

test("look-back shows only saved lines and never fills a gap", () => {
  assert.deepEqual(journeyGroups({}), []);
  const groups = journeyGroups({
    "M1-L1#notice-text": "Bike repair",
    "M1-L1#stood-out": "  ",
    "M3-L2#0": "",
    "M5-L1#pattern": "avoiding",
    "M5-L1#map-before": "The sink was full.",
  });
  assert.deepEqual(groups.map((group) => group.module), ["Module 1", "Module 5"]);
  assert.equal(groups[0].items.length, 1);
  assert.equal(groups[0].items[0].value, "Bike repair");
  assert.equal(groups[1].items[0].value, "Avoiding an uncomfortable task");
  assert.match(groups[1].items[1].value, /sink was full/);
  const columns = reviewColumns({ "M2-L2#1": "Watched a repair" });
  assert.equal(columns.started.length, 0);
  assert.equal(columns.experienced.length, 1);
  assert.equal(columns.experienced[0].value, "Watched a repair");
});

test("an older Module 5 answer still completes the lesson, and a blank one does not", () => {
  for (const code of ["M5-L1", "M5-L2", "M5-L3"]) {
    assert.equal(stepComplete(lesson(code), {}, {}), false);
    assert.equal(moduleFiveStepComplete(code, {}), false);
  }
  assert.equal(stepComplete(lesson("M5-L1"), { "M5-L1#1": "My attention sped up." }, {}), true);
  assert.equal(stepComplete(lesson("M5-L2"), { "M5-L2#stance": "I want to understand this pattern better before deciding." }, {}), true);
  assert.equal(stepComplete(lesson("M5-L3"), { "M5-L3#5": "One comparison of the two instructions." }, {}), true);
  assert.equal(stepComplete(lesson("M5-L3"), { "M5-L3#finished": "2026-10-24T00:00:00Z" }, {}), true);
  const earlier = { code: "M4-L1", try_prompts: ["What happened?"], reflect_prompts: [] };
  assert.equal(stepComplete(earlier, {}, {}), false);
  assert.equal(stepComplete(earlier, { "M4-L1#0": "I stopped after one sketch." }, {}), true);
});

test("journal introduction, prompts, and closing stay verbatim", () => {
  assert.equal(
    JOURNAL_INTRO,
    "You don't have to answer every question. Start wherever something catches your attention. You can explore a memory, question an assumption, disagree with an idea, or follow a thought somewhere unexpected."
  );
  assert.deepEqual(CLOSING_PARAGRAPHS, [
    "You don't have to leave with a complete plan, a new identity, or a clear answer about your future.",
    "You may have discovered an interest, questioned an assumption, noticed a pattern, or found a question worth pursuing.",
    "What you do with that information is yours to decide.",
  ]);
  assert.match(JOURNAL_PROMPTS["M5-L1"].prompt, /^Are there patterns in the way you respond/);
  assert.match(JOURNAL_PROMPTS["M5-L2"].prompt, /^When you think about the ways you respond/);
  assert.match(JOURNAL_PROMPTS["M5-L3"].prompt, /^When you look back at what you've explored/);
  assert.equal(JOURNAL_PROMPTS["M5-L1"].followUps.length, 3);
  assert.equal(JOURNAL_PROMPTS["M5-L2"].followUps.length, 3);
  assert.equal(JOURNAL_PROMPTS["M5-L3"].followUps.length, 4);
  assert.equal(JOURNAL_PROMPTS["M5-L3"].kicker, "Looking back");
});
