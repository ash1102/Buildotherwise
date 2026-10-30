import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, possibilityById } from "./explorationGallery.js";
import { ENCOUNTER_CARDS } from "./moduleOne.js";
import {
  METHOD_BY_ID,
  checkinSentences,
  moduleTwoStepComplete,
  planHasContent,
  planSentences,
  readPlan,
} from "./moduleTwo.js";
import { stepComplete, buildProgress } from "./progress.js";
import { BRIDGES, bridgeSources } from "./moduleBridges.js";

test("gallery: the 12 Module 1 categories, same ids and titles, each with several possibilities", () => {
  assert.deepEqual(CATEGORIES.map((c) => c.id), ENCOUNTER_CARDS.map((c) => c.id));
  assert.deepEqual(CATEGORIES.map((c) => c.title), ENCOUNTER_CARDS.map((c) => c.title));
  for (const category of CATEGORIES) {
    assert.ok(category.possibilities.length >= 4, `${category.id} has several possibilities`);
    const titles = new Set(category.possibilities.map((p) => p.title));
    assert.equal(titles.size, category.possibilities.length, `${category.id} possibilities are distinct`);
  }
});

test("gallery: every possibility has all four sections and valid approaches", () => {
  for (const category of CATEGORIES) {
    for (const p of category.possibilities) {
      assert.ok(p.what.length > 80, `${p.id} explains what it is`);
      assert.ok(p.explore.length >= 2 && p.explore.length <= 3, `${p.id} has 2–3 things to explore`);
      assert.ok(p.tryIt.length >= 2 && p.tryIt.length <= 3, `${p.id} has 2–3 ways to try`);
      assert.ok(p.lead.length >= 2, `${p.id} says where it could lead`);
      for (const way of p.tryIt) assert.ok(METHOD_BY_ID[way.method], `${p.id} uses a known approach`);
      assert.equal(possibilityById(p.id), p);
    }
  }
});

test("gallery: not every category is a business", () => {
  const all = CATEGORIES.flatMap((c) => c.possibilities);
  const business = all.filter((p) => /business|entrepreneur|sell/i.test(p.title));
  assert.ok(business.length <= 2, `only ${business.length} possibility titles are about business`);
});

test("the plan reads back from saved answers, including the older 'way in'", () => {
  const answers = {
    "M2-L1#0": "Explore how habits develop.",
    "M2-L1#possibility": "behavior-3",
    "M2-L1#method": "investigate",
    "M2-L1#1": "Read about how habits form and observe one routine.",
    "M2-L1#when": "This week",
    "M2-L1#obstacles": "Time; Internet or phone",
  };
  const plan = readPlan(answers);
  assert.equal(plan.category.title, "Human Behavior");
  assert.equal(plan.possibility.title, "Investigate how habits develop");
  assert.deepEqual(plan.obstacles, ["Time", "Internet or phone"]);
  assert.match(planSentences(plan), /How: Investigate/);
  assert.equal(readPlan({ "M2-L1#21": "watch" }).method, "observe");
  assert.equal(planHasContent(readPlan({})), false);
});

test("check-in sentences only include what was recorded", () => {
  assert.equal(checkinSentences({}), "");
  const text = checkinSentences({ "M2-L2#outcome": "I ran into a barrier.", "M2-L2#30": "Transportation; Time" });
  assert.equal(text, "What happened: I ran into a barrier.\nWhat got in the way: Transportation, Time");
});

test("completion: an answer, 'done', or an earlier-version answer completes each lesson", () => {
  const L = (code) => ({ code, module_order: 2, try_prompts: ["x"] });
  for (const code of ["M2-L1", "M2-L2", "M2-L3"]) {
    assert.equal(stepComplete(L(code), {}, {}), false);
    assert.equal(stepComplete(L(code), { [`${code}#finished`]: "x" }, {}), true);
  }
  assert.equal(moduleTwoStepComplete("M2-L2", { "M2-L2#outcome": "I haven’t tried it yet." }), true);
  assert.equal(moduleTwoStepComplete("M2-L1", { "M2-L1#20": "repair" }), true);
  assert.equal(moduleTwoStepComplete("M2-L3", { "M2-L3#0": "older answer" }), true);
  assert.equal(stepComplete(L("M2-L2"), {}, { "M2-L2": "Pass" }), true);
});

test("Module 3 is open with nothing saved (Phase 1: no step gate)", () => {
  const modules = [2, 3].map((order) => ({ order, slug: `m${order}`, title: `M${order}`, kind: "module", status: "live" }));
  const lessonsByOrder = {
    2: ["M2-L1", "M2-L2", "M2-L3"].map((code) => ({ code, module_order: 2, try_prompts: ["x"] })),
    3: [{ code: "M3-L1", module_order: 3, try_prompts: ["x"] }],
  };
  const done = { "M2-L1#finished": "x", "M2-L2#finished": "x", "M2-L3#finished": "x" };
  assert.equal(buildProgress({ modules, lessonsByOrder, answers: {}, states: {} }).byOrder[3].unlocked, true);
  assert.equal(buildProgress({ modules, lessonsByOrder, answers: done, states: {} }).byOrder[3].unlocked, true);
});

test("the bridge into Module 3 quotes the new Module 2 answers", () => {
  const items = bridgeSources(BRIDGES[2], { "M2-L2#outcome": "I tried part of it.", "M2-L2#1": "Watched a repair video", "M2-L3#9": "How do they test first?" }, {});
  assert.deepEqual(items.map((i) => i.value), ["I tried part of it.", "How do they test first?", "Watched a repair video"]);
});
