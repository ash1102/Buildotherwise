import assert from "node:assert/strict";
import test from "node:test";
import { buildBranches } from "./lifeMapBranches.js";
import { hybridScene } from "./lifeMapHybrid.js";

function node(partial) {
  return {
    links: [],
    parent_id: "",
    parent_choice: "",
    branch_group: "",
    question_id: "",
    text: "",
    label: "",
    section: "places",
    ...partial,
  };
}

function sceneFrom(nodes, options) {
  const graph = { nodes, sections: [], links: [] };
  return hybridScene(graph, buildBranches(graph), options);
}

test("the hybrid map draws areas and only the connections a person made", () => {
  const place = node({ id: "home", question_id: "p1-places", text: "home" });
  const cooking = node({ id: "cook", question_id: "p1-do", text: "cooking", links: ["home"] });
  const reading = node({ id: "read", question_id: "p2-placeless", section: "placeless", text: "reading", links: ["home"] });
  const sameWords = node({ id: "other", question_id: "p2-placeless", section: "placeless", text: "reading" });
  const closed = sceneFrom([place, cooking, reading, sameWords]);

  assert.deepEqual(closed.nodes.map((item) => item.id).sort(), ["home", "other", "read"]);
  assert.equal(
    closed.edges.some((edge) => edge.kind === "chosen" && [edge.from, edge.to].sort().join() === "home,read"),
    true
  );
  assert.equal(closed.edges.some((edge) => edge.from === "read" && edge.to === "other"), false);
  assert.equal(closed.edges.some((edge) => edge.to === "cook"), false);
  assert.equal(closed.hiddenById.home, 1);
  assert.equal(closed.edges.some((edge) => edge.from === "center" && edge.to === "section:places"), true);

  const open = sceneFrom([place, cooking, reading, sameWords], { focusId: "home" });
  assert.ok(open.nodes.some((item) => item.id === "cook"));
  assert.equal(open.edges.some((edge) => edge.kind === "detail" && edge.from === "home" && edge.to === "cook"), true);
  assert.equal(open.edges.some((edge) => edge.kind === "chosen" && [edge.from, edge.to].includes("cook")), false);
});
