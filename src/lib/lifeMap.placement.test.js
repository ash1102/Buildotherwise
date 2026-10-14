import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LIFEMAP_KEY } from "./workbook.js";
import {
  MAP_PICK_FIELDS,
  MAP_PICK_KEY,
  MAP_QUESTION_PARTS,
  MAP_SECTIONS,
  POSITIONS_KEY,
  QUESTIONS_BY_ID,
  SECTION_AREA_RADIUS,
  buildGraph,
  defaultPositions,
  exploreLines,
  layoutGraph,
  linesFromAnswer,
  settleLines,
} from "./lifeMap.js";

/** Sample answers, one or more for each area the questions belong to. */
const SAMPLES = [
  ["p1-places", "the gym, work, the store, church"],
  ["p1-do", "lift weights"],
  ["p1-how", "the bus"],
  ["p2-placeless", "reading on the bus"],
  ["p3-plus", "the repair cafe"],
  ["p3-minus", "late shifts"],
  ["p4-in-the-way", "childcare"],
  ["p5-ending-up", "libraries"],
];

function sampleMap() {
  const map = {};
  const expected = [];
  SAMPLES.forEach(([questionId, answer]) => {
    const question = QUESTIONS_BY_ID[questionId];
    const lines = linesFromAnswer(question, answer);
    assert.ok(lines.length > 0, `${questionId} produced no lines`);
    map[question.section] = map[question.section] || [];
    lines.forEach((text, index) => {
      const id = `${questionId}-${index}`;
      map[question.section].push({
        id,
        text,
        question_id: questionId,
        entry_id: "",
        links: [],
        source_label: question.text,
      });
      expected.push({ id, section: question.section, text, questionId });
    });
  });
  return { map, expected };
}

test("answers are stored on the same keys the map has always used", () => {
  assert.equal(LIFEMAP_KEY, "lifeMap");
  assert.equal(MAP_PICK_KEY, "lifeMapPick");
  assert.equal(POSITIONS_KEY, "lifeMapPositions");
  assert.deepEqual(
    MAP_SECTIONS.map((section) => [section.key, section.label]),
    [
      ["places", "Your week"],
      ["placeless", "No set place"],
      ["energy", "Energy"],
      ["barriers", "What's missing"],
      ["threads", "Threads"],
    ]
  );
});

test("every question belongs to a section the map draws, and an answer is read back from that section", () => {
  const sectionKeys = new Set(MAP_SECTIONS.map((section) => section.key));
  Object.values(QUESTIONS_BY_ID).forEach((question) => {
    assert.ok(sectionKeys.has(question.section), `${question.id} section ${question.section} is not on the map`);
    assert.equal(MAP_QUESTION_PARTS[question.partIndex].section, question.section);
  });

  assert.deepEqual(linesFromAnswer(QUESTIONS_BY_ID["p3-plus"], "   "), []);
  assert.equal(
    linesFromAnswer(QUESTIONS_BY_ID["p5-ending-up"], "libraries")[0],
    "I keep ending up around libraries"
  );

  const { map, expected } = sampleMap();
  const graph = buildGraph(map);
  expected.forEach((item) => {
    const node = graph.nodes.find((candidate) => candidate.id === item.id);
    assert.ok(node, `${item.id} was dropped`);
    assert.equal(node.section, item.section);
    assert.equal(node.question_id, item.questionId);
    assert.equal(node.text, item.text);
    assert.ok(node.text.trim(), "answer text is blank");
  });

  const places = graph.sections.find((section) => section.key === "places");
  assert.deepEqual(
    places.nodes.map((node) => node.text),
    ["the gym", "work", "the store", "church", "lift weights", "the bus"]
  );

  const handAdded = buildGraph({
    energy: [{ id: "own-1", text: "walking the long way", links: [] }],
  });
  const own = handAdded.nodes.find((node) => node.id === "own-1");
  assert.equal(own.section, "energy");
  assert.equal(own.text, "walking the long way");
});

test("each answer sits in the area of the section its question belongs to", () => {
  const { map } = sampleMap();
  const graph = buildGraph(map);
  const layout = defaultPositions(graph.sections);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  graph.nodes.forEach((node) => {
    const spot = layout.nodes[node.id];
    assert.ok(spot, `${node.id} has no place on the map`);
    const hub = layout.sections[node.section];
    const nearestOther = Math.min(
      ...Object.entries(layout.sections)
        .filter(([key]) => key !== node.section)
        .map(([, other]) => distance(spot, other))
    );
    assert.ok(
      distance(spot, hub) < nearestOther,
      `${node.text} (${node.question_id}) is closer to another area than to ${node.section}`
    );
    assert.ok(
      distance(spot, hub) <= SECTION_AREA_RADIUS,
      `${node.text} (${node.question_id}) left the ${node.section} area`
    );
  });

  const gym = layout.nodes["p1-places-0"];
  const work = layout.nodes["p1-places-1"];
  const lift = layout.nodes["p1-do-0"];
  assert.ok(gym.x !== lift.x || gym.y !== lift.y, "different questions share one spot");
  assert.ok(gym.x !== work.x || gym.y !== work.y, "two answers to the same question share one spot");
});

test("part 6 answers are read from the pick store and blank fields stay off the map", () => {
  const pick = {
    "one-thing": "  community gardens  ",
    "noticed-because": "",
    "do-not-know": "whether it is the people or the plants",
    "small-way": "",
  };
  const lines = exploreLines(pick);
  assert.deepEqual(
    lines.map((line) => line.fieldId),
    ["one-thing", "do-not-know"]
  );
  assert.equal(lines[0].text, "community gardens");
  assert.equal(lines[0].label, MAP_PICK_FIELDS[0].label);
  assert.equal(lines[1].text, "whether it is the people or the plants");
  assert.deepEqual(exploreLines({ nothing_yet: true, "one-thing": "ignored while this is ticked" }), [
    {
      id: "pick:nothing",
      fieldId: "nothing_yet",
      label: "",
      text: "Nothing on the map is worth exploring yet.",
    },
  ]);
  assert.deepEqual(exploreLines({}), []);
});

test("a line someone already moved stays where they put it", () => {
  const graph = buildGraph({
    places: [{ id: "a", text: "the gym", question_id: "p1-places", links: [] }],
  });
  const saved = { a: { x: 0.22, y: 0.22 } };
  const layout = layoutGraph(graph, saved);
  assert.deepEqual(layout.nodes.a, saved.a);
  const settled = settleLines(graph, layout, saved, { w: 900, h: 800 });
  assert.deepEqual(settled.a, saved.a);
});

test("LifeMapBoard's layout search keeps an unmoved line inside its area", () => {
  const board = readFileSync(new URL("../components/map/LifeMapBoard.jsx", import.meta.url), "utf8");
  assert.match(board, /settleLines\(/);
  assert.doesNotMatch(board, /ring <= 30/);

  const graph = buildGraph({
    places: [{ id: "a", text: "the gym", question_id: "p1-places", links: [] }],
    energy: [{ id: "b", text: "the repair cafe", question_id: "p3-plus", links: [] }],
  });
  const base = defaultPositions(graph.sections);
  /** Start on top of the area label, so the search has to look for another spot. */
  const layout = {
    hub: { x: 0.5, y: 0.5 },
    sections: base.sections,
    nodes: {
      a: { ...base.sections.places },
      b: { ...base.sections.energy },
    },
  };
  const settled = settleLines(graph, layout, {}, { w: 900, h: 800 });
  const distance = (left, right) => Math.hypot(left.x - right.x, left.y - right.y);
  graph.nodes.forEach((node) => {
    assert.ok(
      distance(settled[node.id], layout.sections[node.section]) <= SECTION_AREA_RADIUS,
      `${node.text} was walked out of ${node.section}`
    );
  });
});
