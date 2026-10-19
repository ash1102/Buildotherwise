import assert from "node:assert/strict";
import test from "node:test";
import { buildBranches, branchMarkdown, wouldCycle } from "./lifeMapBranches.js";
import { nextOpenStep } from "./progress.js";
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
  mapWithoutLine,
  settleLines,
  setLineParent,
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
  ["g-now", "family, the crew at work"],
  ["g-close", "In the middle"],
  ["g-take", "a ride on Saturdays"],
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
      ["groups", "People and groups"],
    ]
  );
});

test("every question belongs to a section the map draws, and an answer is read back from that section", () => {
  const sectionKeys = new Set(MAP_SECTIONS.map((section) => section.key));
  Object.values(QUESTIONS_BY_ID).forEach((question) => {
    assert.ok(sectionKeys.has(question.section), `${question.id} section ${question.section} is not on the map`);
    assert.equal(question.section, question.section || MAP_QUESTION_PARTS[question.partIndex].section);
    if (!MAP_QUESTION_PARTS[question.partIndex].questions.find((item) => item.id === question.id).section) {
      assert.equal(MAP_QUESTION_PARTS[question.partIndex].section, question.section);
    }
  });

  assert.deepEqual(linesFromAnswer(QUESTIONS_BY_ID["p3-plus"], "   "), []);
  assert.equal(QUESTIONS_BY_ID["p5-ending-up"].branch, "I keep ending up around");
  assert.equal(linesFromAnswer(QUESTIONS_BY_ID["p5-ending-up"], "libraries")[0], "libraries");

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

test("a Part 5 line already saved with its starter shows only the answer", () => {
  const question = QUESTIONS_BY_ID["p5-researching"];
  assert.equal(question.text, "I keep researching…");
  assert.equal(question.branch, "I keep researching");
  assert.equal(linesFromAnswer(question, "test thread")[0], "test thread");

  const graph = buildGraph({
    threads: [{ id: "old", text: "I keep researching test thread", question_id: "p5-researching", links: [] }],
  });
  assert.equal(graph.nodes[0].text, "test thread");
  assert.equal(graph.nodes[0].question_id, "p5-researching");
});

function step(code, moduleOrder, extra = {}) {
  return {
    code,
    title: extra.title || code,
    module_order: moduleOrder,
    order: extra.order ?? 1,
    try_prompts: extra.try_prompts || ["note"],
  };
}

test("the map offers the next unfinished step, or nothing when the book is done", () => {
  const gettingStarted = ["O.1", "O.2", "O.3", "O.4", "O.5"].map((code, index) =>
    step(code, 0, { order: index, title: code === "O.1" ? "What this is (and isn't)" : code })
  );
  const opener = step("O.6", 0, { order: 6, title: "Map the life", try_prompts: ["map"] });
  const first = step("M1-L1", 1, { order: 1, title: "Notice what returns" });
  const second = step("M1-L2", 1, { order: 2, title: "Look again" });
  const lessons = [...gettingStarted, opener, first, second];

  assert.equal(nextOpenStep({ lessons, workbookLessons: lessons, answers: {}, states: {} }).code, "O.1");

  const throughFour = {
    answers: { "O.1#0": "here", "O.2#0": "pace", "O.3#0": "note" },
    states: { "O.4": "Pass" },
  };
  assert.equal(nextOpenStep({ lessons, workbookLessons: lessons, ...throughFour }).code, "O.5");

  const started = { answers: { ...throughFour.answers, "O.5#0": "done" }, states: throughFour.states };
  assert.equal(nextOpenStep({ lessons, workbookLessons: lessons, ...started }).code, "M1-L1");

  const midBook = { answers: { ...started.answers, "M1-L1#own-caught": "noticed" }, states: started.states };
  assert.equal(nextOpenStep({ lessons, workbookLessons: lessons, ...midBook }).code, "M1-L2");

  const finished = { answers: { ...midBook.answers, "M1-L2#0": "again" }, states: midBook.states };
  assert.equal(nextOpenStep({ lessons, workbookLessons: lessons, ...finished }), null);

  const missingLast = gettingStarted.slice(0, 4);
  assert.equal(
    nextOpenStep({
      lessons: missingLast,
      workbookLessons: [first],
      answers: throughFour.answers,
      states: { ...throughFour.states },
    }),
    null
  );
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

test("removing a line drops it and the links that pointed at it", () => {
  const map = {
    threads: [{ id: "a", text: "test thread", links: ["b"] }],
    places: [{ id: "b", text: "the gym", links: ["a", "c"] }, { id: "c", text: "work", links: [] }],
  };
  const next = mapWithoutLine(map, "threads", "a");
  assert.deepEqual(next.threads, []);
  assert.deepEqual(next.places[0].links, ["c"]);
  assert.equal(next.places[1].id, "c");
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

function branchingFixture() {
  return buildGraph({
    places: [
      { id: "home", text: "Home", question_id: "p1-places", links: [] },
      { id: "moms", text: "mom's house", question_id: "p1-places", links: [] },
      { id: "laundry", text: "Laundry", question_id: "p1-do", links: ["moms"] },
      { id: "baby", text: "Take care of baby", question_id: "p1-do", links: ["home"] },
      { id: "ride", text: "Mom picks me up and drops me off", question_id: "p1-how", links: ["moms"] }
    ],
    placeless: [
      { id: "meetings", text: "online meetings", question_id: "p2-placeless", links: [] },
      { id: "school", text: "School", question_id: "p2-placeless", links: [] }
    ],
    energy: [
      { id: "laundry-energy", text: "Laundry — Not sure yet", question_id: "p3-energy", links: ["laundry"], energy_choice: "unsure" },
      { id: "meeting-energy", text: "online meetings — Both", question_id: "p3-energy", links: ["meetings"], energy_choice: "both", energy_note: "The experience varies." },
      { id: "care", text: "Success in my program", question_id: "p3-star", links: [] }
    ],
    barriers: [{ id: "network", text: "Networking", question_id: "p4-rarely", links: [] }]
  });
}

test("existing selected connections unfold place → activity → reflection without changing answers", () => {
  const graph = branchingFixture();
  const before = JSON.stringify(graph);
  const tree = buildBranches(graph);
  assert.equal(tree.parentById.laundry, "moms");
  assert.equal(tree.parentById.baby, "home");
  assert.equal(tree.parentById.ride, "moms");
  assert.equal(tree.parentById["laundry-energy"], "laundry");
  assert.equal(tree.parentById["meeting-energy"], "meetings");
  assert.ok(tree.unlinked.includes("care"));
  assert.ok(tree.missing.includes("network"));
  const visited = [];
  const walk = (id) => { visited.push(id); tree.childrenById[id].forEach(walk); };
  [...tree.roots, ...tree.missing, ...tree.unlinked].forEach(walk);
  assert.equal(new Set(visited).size, graph.nodes.length);
  assert.equal(visited.length, graph.nodes.length, "every saved entry appears once");
  assert.equal(JSON.stringify(graph), before, "branch rendering never rewrites saved answers");
});

test("ambiguous connections and identical wording do not choose a parent for the participant", () => {
  const graph = buildGraph({
    placeless: [
      { id: "a", text: "Reading", question_id: "p2-placeless", links: [] },
      { id: "b", text: "Reading", question_id: "p2-placeless", links: [] }
    ],
    energy: [
      { id: "exact", text: "Gives energy", question_id: "p3-plus", links: ["b"] },
      { id: "ambiguous", text: "Both", question_id: "p3-energy", links: ["a", "b"] }
    ]
  });
  let tree = buildBranches(graph);
  assert.equal(tree.parentById.exact, "b");
  assert.equal(tree.parentById.ambiguous, undefined);
  graph.nodes.find((node) => node.id === "ambiguous").parent_id = "a";
  tree = buildBranches(graph);
  assert.equal(tree.parentById.ambiguous, "a");
});

test("branch cycles are rejected and explicitly separate answers stay separate", () => {
  const graph = branchingFixture();
  graph.nodes.find((node) => node.id === "care").parent_choice = "standalone";
  graph.nodes.find((node) => node.id === "care").links = ["school"];
  const tree = buildBranches(graph);
  assert.ok(tree.roots.includes("care"));
  assert.equal(tree.parentById.care, undefined);
  assert.ok(wouldCycle("moms", "laundry-energy", tree.parentById));
  assert.equal(wouldCycle("care", "school", tree.parentById), false);
});

test("download follows the same branches and preserves unplaced answers and journal notes", () => {
  const graph = branchingFixture();
  graph.nodes.find((node) => node.id === "laundry").entry_id = "journal-1";
  const markdown = branchMarkdown(graph, QUESTIONS_BY_ID, [{ id: "journal-1", body: "A private observation." }]);
  assert.ok(markdown.includes("- mom's house"));
  assert.ok(markdown.includes("  - Laundry"));
  assert.ok(markdown.includes("    - Laundry — Not sure yet"));
  assert.ok(markdown.includes("Journal: A private observation."));
  assert.ok(markdown.includes("## Answers not yet placed in a branch"));
  assert.ok(markdown.includes("Success in my program"));
});

test("explicitly fictional saved examples are preserved in storage but excluded from participant takeaways", () => {
  const pick = { "one-thing": "Fictional: A sample activity.", "do-not-know": "I am still deciding." };
  const before = JSON.stringify(pick);
  const lines = exploreLines(pick);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].text, "I am still deciding.");
  assert.equal(JSON.stringify(pick), before);
});


test("an existing answer can move into What's missing, survive reload and export, then move to another branch", () => {
  const oldWindow = globalThis.window;
  const oldEvent = globalThis.CustomEvent;
  const values = new Map();
  globalThis.window = {
    localStorage: { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) },
    dispatchEvent() {},
  };
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  try {
    const key = "entrepalooza.v1.lifeMap";
    const graph = branchingFixture();
    const map = Object.fromEntries(graph.sections.map((section) => [section.key, section.nodes]));
    values.set(key, JSON.stringify(map));
    assert.equal(setLineParent("care", "__missing"), true);
    let reloaded = JSON.parse(values.get(key));
    assert.equal(reloaded.energy.find((node) => node.id === "care").question_id, "p3-star");
    let tree = buildBranches(buildGraph(reloaded));
    assert.ok(tree.missing.includes("care"));
    assert.ok(tree.missing.includes("network"));
    assert.ok(!tree.unlinked.includes("care"));
    const markdown = branchMarkdown(buildGraph(reloaded), QUESTIONS_BY_ID);
    assert.ok(markdown.includes("## What’s missing\n- Success in my program"));
    assert.ok(markdown.includes("- Networking"));
    assert.equal(setLineParent("care", "school"), true);
    reloaded = JSON.parse(values.get(key));
    tree = buildBranches(buildGraph(reloaded));
    assert.equal(tree.parentById.care, "school");
    assert.ok(!tree.missing.includes("care"));
    assert.equal(tree.nodesById.care.text, "Success in my program");
  } finally {
    globalThis.window = oldWindow;
    globalThis.CustomEvent = oldEvent;
  }
});
