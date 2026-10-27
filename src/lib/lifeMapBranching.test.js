import test from "node:test";
import assert from "node:assert/strict";
import { buildBranches, descendantsOf, freezePlacement } from "./lifeMapBranches.js";
import { QUESTIONS_BY_ID, followUpTargets, isPerEntryQuestion, placementForAnswer } from "./lifeMap.js";

const graphOf = (nodes) => ({ nodes: nodes.map((n) => ({ links: [], parent_id: "", parent_choice: "", branch_group: "", ...n })), links: [] });

test("a follow-up about one place lands under that place, not another", () => {
  const q = QUESTIONS_BY_ID["p1-do"];
  assert.ok(isPerEntryQuestion(q));
  const home = { id: "home", section: "places", question_id: "p1-places", text: "Home" };
  const gym = { id: "gym", section: "places", question_id: "p1-places", text: "Gym" };
  assert.deepEqual(followUpTargets(q, [home, gym]).map((n) => n.id), ["home", "gym"]);
  const answer = { id: "a", section: "places", question_id: "p1-do", text: "Lift", ...placementForAnswer(q, { links: ["gym"] }) };
  const tree = buildBranches(graphOf([home, gym, answer]));
  assert.equal(tree.parentById.a, "gym");
});

test("a thread with no ticked entries is its own entry, not left unplaced", () => {
  const q = QUESTIONS_BY_ID["p5-researching"];
  assert.equal(q.multi, true);
  const line = { id: "t", section: "threads", question_id: "p5-researching", text: "Engines", ...placementForAnswer(q, { links: [], separate: true }) };
  const tree = buildBranches(graphOf([line]));
  assert.deepEqual(tree.roots, ["t"]);
  assert.deepEqual(tree.unlinked, []);
});

test("connecting a line never moves it to another branch", () => {
  const place = { id: "p", section: "places", question_id: "p1-places", text: "Garage" };
  const old = { id: "o", section: "threads", question_id: "p5-researching", text: "Old save" }; // no parent_choice
  const before = buildBranches(graphOf([place, old]));
  assert.deepEqual(before.unlinked, ["o"]);
  const freeze = freezePlacement(before.nodesById.o, before);
  const after = buildBranches(graphOf([place, { ...old, ...freeze, links: ["p"] }]));
  assert.equal(after.parentById.o, undefined);
  assert.deepEqual(after.unlinked, ["o"]);
});

test("a line can't be moved under its own answers", () => {
  const a = { id: "a", section: "places", question_id: "p1-places", text: "Home" };
  const b = { id: "b", section: "places", question_id: "p1-do", text: "Cook", parent_id: "a", parent_choice: "chosen" };
  const tree = buildBranches(graphOf([a, b]));
  assert.ok(descendantsOf("a", tree).has("b"));
});
