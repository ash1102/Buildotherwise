import { useEffect, useState } from "react";
import { makeId, readStore, subscribeStore, writeStore } from "./store";
import { LIFEMAP_KEY, setLifeMap } from "./workbook";
import { energyLine } from "./mapEnergy";
import { buildBranches, wouldCycle } from "./lifeMapBranches";

/**
 * The five questions the map is drawn from. The keys are the ones the Life Map has
 * always used, so lines saved before today stay exactly where they were.
 */
export const MAP_SECTIONS = [
  {
    key: "places",
    label: "Your week",
    prompt: "Where this kind of activity happens, and whether you can get there, feel welcome, and afford it.",
  },
  {
    key: "placeless",
    label: "No set place",
    prompt: "Things you do anywhere: reading, walking, talking, making, fixing, helping.",
  },
  {
    key: "energy",
    label: "Energy",
    prompt: "What left you steadier, and what took more than it gave.",
  },
  {
    key: "barriers",
    label: "What's missing",
    prompt: "Cost, transport, childcare, accessibility, schedule, credentials. Facts about the situation, not failings.",
  },
  {
    key: "threads",
    label: "Threads",
    prompt: "What your attention keeps coming back to.",
  },
  {
    key: "groups",
    label: "People and groups",
    prompt: "The groups you're part of, used to be part of, or might want to try. Where you belong, not a headcount.",
  },
];

/**
 * Original question definitions retained for saved-answer compatibility.
 * Revised draft prompts and sequence are defined below; they are not claimed
 * to be verbatim Notion lesson text.
 * `starter: true` means the answer finishes the sentence. The sentence stays the
 * question label on the map. The line itself is only what the participant wrote.
 */
const ORIGINAL_QUESTION_PARTS = [
  {
    key: "part-1",
    title: "Draw your week",
    section: "places",
    intro:
      "Think about a normal week. You are not trying to make a geographically accurate map. You're making a map of your lived week.",
    examples:
      "Work, someone else's house, school, stores, a gym, church, meetings, appointments, parks, restaurants, a garage, a friend's place, treatment or recovery spaces, community organizations, places connected to your kids, anywhere else that is actually part of your life.",
    questions: [
      { id: "p1-places", branch: "Places I go", text: "What places do you go in a typical week and weekend?", list: true },
      { id: "p1-do", branch: "What I do there", text: "What do you usually do when you get there?", aboutPlace: "at" },
      { id: "p1-how", branch: "Getting there", text: "How do you get to and from those places?", aboutPlace: "to" },
    ],
  },
  {
    key: "part-2",
    title: "Add the things that don't have a place",
    section: "placeless",
    intro:
      "Some important parts of life happen without going anywhere. Don't let \"I didn't go anywhere\" turn into \"I didn't do anything.\"",
    examples:
      "Research something for hours from your phone, fix things, draw, game, cook, sell things online, talk people through problems, scroll, write, care for somebody, organize things, watch tutorials, work on a car, make music.",
    questions: [{ id: "p2-placeless", branch: "Things I do anywhere", text: "What do you do that doesn't have a place?", list: true }],
  },
  {
    key: "part-3",
    title: "Mark the energy",
    section: "energy",
    intro: "Select an entry from your week, then mark how it affects your energy. You can add a note, change your answer, or leave it uncertain. There is no scoring system.",
    questions: [
      { id: "p3-energy", branch: "Energy marks", text: "How does this entry affect your energy?" },
      { id: "p3-plus", branch: "Gives me energy", text: "What gives you energy?" },
      { id: "p3-minus", branch: "Drains me", text: "What drains you?" },
      { id: "p3-star", branch: "I care about", text: "What do you care about?" },
      { id: "p3-question", branch: "I'm curious about", text: "What are you curious about?" },
      { id: "p3-dollar", branch: "Mostly for money or resources", text: "What do you do mostly because you need money or resources?" },
      { id: "p3-bang", branch: "Where I get focused", text: "Where do you get unusually focused?" },
    ],
  },
  {
    key: "part-4",
    title: "Look at what's missing",
    section: "barriers",
    intro:
      "Sometimes something is missing because you don't care about it. Sometimes it's missing because you can't currently reach it. Those are not the same thing.",
    questions: [
      { id: "p4-used-to", branch: "Used to be part of my life", text: "What used to be part of my life that isn't anymore?" },
      { id: "p4-rarely", branch: "Want, but rarely get to", text: "What do I want to do but rarely get access to?" },
      {
        id: "p4-barrier",
        branch: "If nothing was stopping me",
        text: "Where would I go if money, transportation, time, childcare, fear, paperwork, health, or another barrier weren't stopping me?",
      },
      { id: "p4-circumstances", branch: "If things were different", text: "Who or what would be on this map if my circumstances were different?" },
      { id: "p4-in-the-way", branch: "What gets in the way", text: "What gets in the way?" },
    ],
  },
  {
    key: "part-5",
    title: "Find the threads",
    section: "threads",
    intro: "Now stop looking at individual places. Look for patterns. Finish any of these that actually fit.",
    questions: [
      { id: "p5-ending-up", text: "I keep ending up around…", starter: true },
      { id: "p5-more-time", text: "I spend more time than I realized doing…", starter: true },
      { id: "p5-come-to-me", text: "People seem to come to me for…", starter: true },
      { id: "p5-lose-track", text: "I lose track of time when…", starter: true },
      { id: "p5-researching", text: "I keep researching…", starter: true },
      { id: "p5-weird-amount", text: "I seem to know a weird amount about…", starter: true },
      { id: "p5-improve", text: "I keep trying to improve…", starter: true },
      { id: "p5-frustrated", text: "I get frustrated when…", starter: true },
      { id: "p5-miss", text: "Something I miss is…", starter: true },
      { id: "p5-wish", text: "Something I wish I had access to is…", starter: true },
      { id: "p5-bigger", text: "One part of this map I would willingly make bigger is…", starter: true },
    ],
  },
  {
    key: "part-groups",
    title: "Add the people and groups",
    section: "groups",
    intro:
      "A lot of life happens with other people. A group doesn't need a name or a meeting. It can be the people you text, the crew at work, the regulars somewhere, or people online. You don't have to explain any of it.",
    examples:
      "Family, a circle of friends, coworkers, neighbors, people at church, a team, a crew, a class, other parents, people you game with, an online community, a recovery or support group, people who share your language or where you're from.",
    note: "Skip any of these. A blank line is a real answer.",
    questions: [
      { id: "g-now", branch: "Groups I'm in now", text: "Which groups or circles are part of your life right now?", list: true },
      {
        id: "g-close",
        branch: "How close it feels",
        text: "For each one, how close does it feel right now?",
        about: "g-now",
        aboutLabel: "Which group?",
        chips: ["Close", "In the middle", "At the edge", "Not sure"],
      },
      { id: "g-before", branch: "Groups from before", text: "Are there groups you used to be part of?", list: true },
      {
        id: "g-left",
        branch: "What's left of it",
        text: "Is any of that worth reconnecting with, or is it better left where it is?",
        about: "g-before",
        aboutLabel: "Which group?",
        chips: ["Worth reconnecting", "Changed, but still part of me", "Leaving it where it is", "Not sure"],
      },
      {
        id: "g-curious",
        branch: "Groups I'm curious about",
        text: "Is there a group, place, or kind of people you've wondered about joining, or just seeing?",
        list: true,
      },
      {
        id: "g-take",
        branch: "What it would take",
        text: "What would it take to show up there?",
        section: "barriers",
        about: "g-curious",
        aboutLabel: "Which group?",
      },
    ],
  },
];


/** Draft for review: concrete recall before interpretation. Original definitions
 * remain available so saved answers retain their question IDs and wording. */
const QUESTION_UPDATES = {
  "p1-places": {
    "text": "Think about the past seven days, or another recent stretch you remember. Where did you spend time? Home counts."
  },
  "p1-do": {
    "text": "What do you do at this place?"
  },
  "p1-how": {
    "text": "How do you get to and from this place?"
  },
  "p2-placeless": {
    "text": "What else did you do during that time—at home, online, while travelling, or in different places?",
    "branch": "Other activities"
  },
  "p3-energy": {
    "text": "Think of one recent time you did this or were here. How was your energy afterward compared with before?"
  },
  "p3-star": {
    "text": "What, if anything, matters to you about this entry?",
    "branch": "What matters to me"
  },
  "p3-question": {
    "text": "Is there anything about this entry you would like to understand better?"
  },
  "p3-dollar": {
    "text": "What role, if any, do money or resources play in doing this?",
    "branch": "Money or resources"
  },
  "p3-bang": {
    "text": "What part, if any, holds your attention? Can you remember a recent example?",
    "branch": "What holds my attention"
  },
  "p4-used-to": {
    "text": "Is there an activity or place you remember spending time on before that isn't part of your life now? Add it only if you want to."
  },
  "p4-rarely": {
    "text": "Is there something you have wanted to do recently but haven't had the chance to do?"
  },
  "p4-in-the-way": {
    "text": "What, if anything, made it difficult to do this or get there? 'I don't know' is an answer."
  },
  "p5-ending-up": {
    "text": "Looking across your entries, does any activity, place, or kind of situation appear more than once? Which entries?",
    "branch": "Details that repeat",
    "starter": false
  },
  "p5-more-time": {
    "text": "Which activities took up a lot of your time during the period you mapped, if any?",
    "branch": "Where my time went",
    "starter": false
  },
  "p5-come-to-me": {
    "text": "Has anyone recently asked you for help, information, or company? What did they ask for?",
    "branch": "Recent requests",
    "section": "groups",
    "starter": false
  },
  "p5-lose-track": {
    "text": "Can you remember a recent time you did something longer than you intended? What were you doing?",
    "branch": "Longer than intended",
    "starter": false
  },
  "p5-researching": {
    "text": "What have you looked up, read about, watched, or asked questions about recently, if anything?",
    "branch": "Things I looked into",
    "starter": false
  },
  "p5-weird-amount": {
    "text": "Is there something you have spent time learning about or doing that you want to add?",
    "branch": "Learning and experience",
    "starter": false
  },
  "p5-improve": {
    "text": "Have you recently tried to change, fix, practise, or improve something? What did you do?",
    "branch": "Things I tried to change",
    "starter": false
  },
  "p5-frustrated": {
    "text": "Was there a moment in one of these activities when something didn't work as you wanted? What happened?",
    "branch": "What happened",
    "starter": false
  },
  "p5-miss": {
    "section": "barriers"
  },
  "p5-bigger": {
    "text": "Is there anything here you would like more room for, or would like to keep as it is?",
    "branch": "More room or keep as it is",
    "starter": false
  },
  "g-now": {
    "text": "Who have you spent time with or been in contact with recently—in person or online? You can use a role or group label instead of a name.",
    "branch": "People and groups in my life"
  },
  "g-close": {
    "text": "If you want to mark it, how connected do you feel to this person or group right now?",
    "chips": [
      "Close",
      "Somewhat connected",
      "Not connected right now",
      "Mixed",
      "Not sure"
    ]
  },
  "g-left": {
    "text": "Do you want to do anything with this connection right now, leave it as it is, or leave the question open?",
    "chips": [
      "Find out more",
      "Leave it as it is",
      "Leave the question open"
    ],
    "branch": "What I choose about this connection"
  },
  "g-take": {
    "text": "If you wanted to find out more, what would you need to know first? Is there any support or access you already know you would need?",
    "branch": "Information, support or access"
  }
};
const originalQuestions = Object.fromEntries(ORIGINAL_QUESTION_PARTS.flatMap(part =>
  part.questions.map(question => [question.id, { ...question, section: question.section || part.section }])
));
const revisedQuestion = id => ({ ...originalQuestions[id], ...QUESTION_UPDATES[id] });
const moved = new Set(["p5-come-to-me", "p5-miss", "p5-bigger", "g-left"]);
const retired = new Set(["p3-plus", "p3-minus", "p4-barrier", "p4-circumstances", "p5-wish"]);
const order = ["part-1", "part-2", "part-groups", "part-3", "part-4", "part-5"];
export const MAP_QUESTION_PARTS = order.map(key => {
  const part = ORIGINAL_QUESTION_PARTS.find(item => item.key === key);
  const questions = part.questions.filter(q => !moved.has(q.id) && !retired.has(q.id)).map(q => revisedQuestion(q.id));
  if (key === "part-groups") questions.splice(1, 0, revisedQuestion("p5-come-to-me"));
  if (key === "part-4") questions.splice(1, 0, revisedQuestion("p5-miss"));
  const introductions = {
    "part-1": "Start with a recent stretch you remember. It does not have to be a typical week. Places and activities give you something concrete to look at before deciding what they mean. Use your own life, a clearly labelled fictional example, or just observe. You may skip, pause, or stop.",
    "part-2": "Include everyday activities wherever they happened. Being at home does not mean you did nothing. You do not need to decide whether an activity has a set place.",
    "part-3": "Choose an entry and, if you can, recall one recent occasion. Notice what happened before interpreting it. Energy can stay the same or vary. Other conditions may have contributed; this is not a fixed trait or proof of a cause.",
    "part-4": "Something absent is not necessarily something you want back. If you want to add a past activity or something you could not access, you do not have to explain personal history. Unknowns are welcome.",
    "part-5": "Look over the entries you have added. Choose any question that helps; this is an optional menu, not a checklist. A repeated detail might be worth noticing. It does not tell you yet why it repeats, whether you like it, or whether you want more of it."
  };
  return { ...part, questions, intro: introductions[key] || part.intro,
    title: key === "part-2" ? "Add other everyday activities" : key === "part-3" ? "Notice particular experiences" : part.title };
});
export const MAP_CLOSING_QUESTIONS = [revisedQuestion("p5-bigger"), revisedQuestion("g-left")];

/** Every map question by id, including retired IDs for saved-answer compatibility. */
export const QUESTIONS_BY_ID = Object.fromEntries(
  [...ORIGINAL_QUESTION_PARTS, ...MAP_QUESTION_PARTS, { section: "threads", questions: MAP_CLOSING_QUESTIONS }].flatMap((part) =>
    part.questions.map((question) => [
      question.id,
      {
        ...question,
        branch: question.branch || question.text.replace(/…$/, "").trim(),
        partIndex: MAP_QUESTION_PARTS.findIndex(item => item.questions.some(q => q.id === question.id)),
        section: question.section || part.section,
      },
    ])
  )
);

/** Part 6 of the lesson: one thing worth exploring, or an honest unknown. */
export const MAP_PICK_FIELDS = [
  { id: "one-thing", label: "One thing I might want to understand better is:" },
  { id: "noticed-because", label: "The entry or experience that brought this to my attention was:" },
  { id: "do-not-know", label: "I do NOT know yet:" },
  { id: "small-way", label: "One small way I could learn more about it:" },
];

export const MAP_PICK_KEY = "lifeMapPick";

/**
 * Part 6 is not a line in the lifeMap store. It lives under lifeMapPick, one field
 * per prompt. Only filled answers are drawn, so a blank box does not become an
 * empty spot. "Nothing yet" replaces the four fields while it is ticked.
 */
export function exploreLines(pick) {
  const value = pick || {};
  if (value.nothing_yet) {
    return [
      {
        id: "pick:nothing",
        fieldId: "nothing_yet",
        label: "",
        text: "I’m not choosing something to explore right now.",
      },
    ];
  }
  return MAP_PICK_FIELDS.map((field) => ({
    id: `pick:${field.id}`,
    fieldId: field.id,
    label: field.label,
    text: String(value[field.id] || "").trim(),
  })).filter((line) => line.text && !/^Fictional:/i.test(line.text));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The words that belong on the node. A sentence starter stays the question label.
 * An older line may still have that starter glued on the front. Take it back off
 * so the node shows only what the participant wrote.
 */
export function answerText(question, text) {
  const value = String(text || "").trim();
  if (!value || !question || !question.starter) return value;
  const prefix = String(question.text || "").replace(/…$/, "").trim();
  if (!prefix) return value;
  const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:[\\s….:,;\\-–—]+)`, "i");
  const matched = value.match(pattern);
  if (!matched) return value;
  const rest = value.slice(matched[0].length).trim();
  return rest || value;
}

/** The line an answer becomes. The starter is not copied onto the line. */
export function lineFromAnswer(question, answer) {
  const value = String(answer || "").trim();
  if (!value) return "";
  return answerText(question, value);
}

/** Pieces of one answer: each new line is its own piece, and list questions also split at commas. */
export function splitText(value, atCommas) {
  const pattern = atCommas ? /[\n,;]+/ : /\n+/;
  return String(value || "")
    .split(pattern)
    .map((piece) => piece.trim())
    .filter(Boolean);
}

/** Every line one answer becomes. */
export function linesFromAnswer(question, answer) {
  return splitText(answer, Boolean(question.list))
    .map((piece) => lineFromAnswer(question, piece))
    .filter(Boolean);
}

export const POSITIONS_KEY = "lifeMapPositions";

export function readPositions() {
  return readStore(POSITIONS_KEY, {});
}

export function setNodePosition(id, position) {
  writeStore(POSITIONS_KEY, { ...readPositions(), [id]: position });
}

export function usePositions() {
  const [value, setValue] = useState(() => readPositions());
  useEffect(() => subscribeStore(POSITIONS_KEY, () => setValue(readPositions())), []);
  return value;
}

export function addLine(sectionKey, line) {
  const map = readStore(LIFEMAP_KEY, {});
  const items = map[sectionKey] || [];
  const item = { id: makeId("map"), text: "", entry_id: "", links: [], ...line };
  setLifeMap({ ...map, [sectionKey]: [...items, item] });
  return item;
}

/** Save against the current map so a repeated click updates rather than duplicates. */
export function saveEnergyMark(sourceId, choice, note) {
  const map = readStore(LIFEMAP_KEY, {});
  const source = Object.values(map).flatMap((items) => Array.isArray(items) ? items : []).find((line) => line.id === sourceId);
  const line = energyLine(source, choice, note);
  if (!line) return null;
  const energy = map.energy || [];
  const existing = energy.find((item) => item.question_id === "p3-energy" && item.energy_version === 2 && (item.links || []).includes(sourceId));
  const item = { ...(existing || {}), ...line, parent_id: sourceId, id: existing?.id || makeId("map"), links: [...new Set([sourceId, ...(existing?.links || [])])] };
  setLifeMap({ ...map, energy: existing ? energy.map((old) => old.id === existing.id ? item : old) : [...energy, item] });
  return item;
}

/** Changing a branch is an explicit participant choice; reject cycles. */
export function setLineParent(childId, parentId) {
  const map = readStore(LIFEMAP_KEY, {});
  const graph = buildGraph(map);
  const tree = buildBranches(graph);
  const child = tree.nodesById[childId];
  if (child && parentId === "__missing") {
    updateLine(child.section, childId, { parent_id: "", parent_choice: "chosen", branch_group: "barriers" });
    return true;
  }
  if (!child || (parentId && !tree.nodesById[parentId]) || wouldCycle(childId, parentId, tree.parentById)) return false;
  updateLine(child.section, childId, {
    parent_id: parentId || "",
    parent_choice: parentId ? "chosen" : "standalone",
    branch_group: "",
    links: parentId ? [...new Set([...(child.links || []), parentId])] : child.links
  });
  return true;
}

export function updateLine(sectionKey, id, patch) {
  const map = readStore(LIFEMAP_KEY, {});
  const items = map[sectionKey] || [];
  setLifeMap({ ...map, [sectionKey]: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
}

/** Drop one line from its area, and drop every link that pointed at it. */
export function mapWithoutLine(map, sectionKey, id) {
  const next = {};
  Object.entries(map || {}).forEach(([key, items]) => {
    const list = Array.isArray(items) ? items : [];
    next[key] = list
      .filter((item) => !(key === sectionKey && item.id === id))
      .map((item) => ({ ...item, parent_id: item.parent_id === id ? "" : item.parent_id, links: (item.links || []).filter((link) => link !== id) }));
  });
  return next;
}

export function removeLine(sectionKey, id) {
  const map = readStore(LIFEMAP_KEY, {});
  setLifeMap(mapWithoutLine(map, sectionKey, id));
  const positions = { ...readPositions() };
  delete positions[id];
  writeStore(POSITIONS_KEY, positions);
}

/**
 * Every line becomes a node under the question it answers. A connection is either
 * the question's own structure (this line answers that question) or a link the
 * person chose themselves. Nothing here reads meaning into an answer.
 */
export function buildGraph(map) {
  const sections = MAP_SECTIONS.map((section) => ({
    ...section,
    nodes: ((map || {})[section.key] || []).map((item) => ({
      id: item.id,
      section: section.key,
      text: answerText(originalQuestions[item.question_id] || QUESTIONS_BY_ID[item.question_id], item.text || ""),
      label: item.label || "",
      entry_id: item.entry_id || "",
      links: item.links || [],
      source_code: item.source_code || "",
      source_label: item.source_label || "",
      question_id: item.question_id || "",
      parent_id: item.parent_id || "",
      parent_choice: item.parent_choice || "",
      branch_group: item.branch_group || "",
      energy_choice: item.energy_choice || "",
      energy_note: item.energy_note || "",
      energy_version: item.energy_version || 1,
    })),
  }));

  const nodes = sections.flatMap((section) => section.nodes);
  const known = new Set(nodes.map((node) => node.id));
  const links = [];

  nodes.forEach((node) => {
    (node.links || []).forEach((other) => {
      if (!known.has(other) || other === node.id) return;
      const seen = links.some((pair) => pair.includes(node.id) && pair.includes(other));
      if (!seen) links.push([node.id, other]);
    });
  });

  return { sections, nodes, links };
}

const SECTION_RX = 0.30;
const SECTION_RY = 0.36;
/** Half the gap between neighbouring areas, so a line cannot land in the next one. */
export const SECTION_AREA_RADIUS = 0.16;
const AREA_RADIUS = SECTION_AREA_RADIUS - 0.015;
const AREA_MARGIN = 0.08;

function questionRank(sectionKey, questionId) {
  const part = MAP_QUESTION_PARTS.find((item) => item.section === sectionKey);
  if (!part) return 1000;
  const index = part.questions.findIndex((question) => question.id === questionId);
  return index === -1 ? 1000 : index;
}

/**
 * Spots inside one section's area, nearest the hub first and starting on the side
 * that faces away from the middle. Answers to the same question are placed in order,
 * so they sit together in the area that question belongs to.
 */
function slotsNearHub(hub, angle, count) {
  const chosen = [];
  const minGap = 0.048;
  const taken = (point) => chosen.some((other) => Math.hypot(point.x - other.x, point.y - other.y) < minGap);

  for (let ring = 0; ring < 8 && chosen.length < count; ring += 1) {
    const radius = 0.052 + ring * 0.028;
    if (radius > AREA_RADIUS) break;
    const steps = Math.max(6, 4 + ring * 4);
    for (let step = 0; step < steps && chosen.length < count; step += 1) {
      const turn = (step / steps) * Math.PI * 2;
      const point = {
        x: hub.x + Math.cos(angle + turn) * radius,
        y: hub.y + Math.sin(angle + turn) * radius,
      };
      if (Math.hypot(point.x - hub.x, point.y - hub.y) > AREA_RADIUS) continue;
      if (point.x < AREA_MARGIN || point.x > 1 - AREA_MARGIN || point.y < AREA_MARGIN || point.y > 1 - AREA_MARGIN) {
        continue;
      }
      if (taken(point)) continue;
      chosen.push(point);
    }
  }

  let extra = 0;
  while (chosen.length < count) {
    extra += 1;
    chosen.push({
      x: Math.min(1 - AREA_MARGIN, Math.max(AREA_MARGIN, hub.x + ((extra % 3) - 1) * 0.03)),
      y: Math.min(1 - AREA_MARGIN, Math.max(AREA_MARGIN, hub.y)),
    });
  }
  return chosen;
}

/** Where each node sits before anyone moves it: in the area of the question it answers. */
export function defaultPositions(sections) {
  const count = sections.length || 1;
  const spots = { sections: {}, nodes: {} };

  sections.forEach((section, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const hub = { x: 0.5 + Math.cos(angle) * SECTION_RX, y: 0.5 + Math.sin(angle) * SECTION_RY };
    spots.sections[section.key] = hub;

    const ordered = section.nodes
      .map((node, order) => ({ node, order, rank: questionRank(section.key, node.question_id) }))
      .sort((a, b) => a.rank - b.rank || a.order - b.order)
      .map((item) => item.node);
    const slots = slotsNearHub(hub, angle, ordered.length);
    ordered.forEach((node, position) => {
      spots.nodes[node.id] = slots[position];
    });
  });

  return spots;
}

/** The layout in use: what the person moved stays where they put it. */
export function layoutGraph(graph, saved) {
  const base = defaultPositions(graph.sections);
  const nodes = {};
  graph.sections.forEach((section) =>
    section.nodes.forEach((node) => {
      nodes[node.id] = (saved || {})[node.id] || base.nodes[node.id] || { x: 0.5, y: 0.5 };
    })
  );
  return { hub: { x: 0.5, y: 0.5 }, sections: base.sections, nodes };
}

const PILL_LINE_H = 44;
const PILL_GAP = 6;

function pillSize(text, maxWidth, height) {
  return {
    w: Math.min(maxWidth, String(text || "").length * 6.8 + 12) + 24,
    h: height,
  };
}

function pillsOverlap(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w + PILL_GAP && Math.abs(a.y - b.y) * 2 < a.h + b.h + PILL_GAP;
}

/**
 * Nudge lines nobody has moved so they do not sit on each other, the area label,
 * or the middle. The search stays inside that line's area. If nothing clear fits
 * there, the line stays on its layout spot rather than walking into the next area.
 * A line the person already placed is returned exactly as saved.
 */
export function settleLines(graph, layout, saved, box) {
  if (!box || !box.w || !box.h) return { ...(layout.nodes || {}) };
  const taken = [{ x: box.w / 2, y: box.h / 2, w: 230, h: 64 }];

  graph.sections.forEach((section) => {
    const hub = layout.sections[section.key];
    if (hub) taken.push({ x: hub.x * box.w, y: hub.y * box.h, ...pillSize(section.label, 220, 34) });
  });

  const result = {};
  const unplaced = [];
  graph.nodes.forEach((node) => {
    const spot = (layout.nodes || {})[node.id];
    if (!spot) return;
    const text = (QUESTIONS_BY_ID[node.question_id] || {}).branch || node.label || node.text;
    if ((saved || {})[node.id]) {
      result[node.id] = spot;
      taken.push({ x: spot.x * box.w, y: spot.y * box.h, ...pillSize(text, 152, PILL_LINE_H) });
    } else {
      unplaced.push(node);
    }
  });

  unplaced.forEach((node) => {
    const start = layout.nodes[node.id];
    const hub = (layout.sections || {})[node.section];
    const text = (QUESTIONS_BY_ID[node.question_id] || {}).branch || node.label || node.text;
    const size = pillSize(text, 152, PILL_LINE_H);
    const inArea = (x, y) => {
      if (!hub) return true;
      return Math.hypot(x / box.w - hub.x, y / box.h - hub.y) <= SECTION_AREA_RADIUS;
    };
    const fits = (x, y) => {
      if (!inArea(x, y)) return false;
      const rect = { x, y, ...size };
      if (x - size.w / 2 < 4 || x + size.w / 2 > box.w - 4 || y - size.h / 2 < 4 || y + size.h / 2 > box.h - 4) {
        return false;
      }
      return !taken.some((other) => pillsOverlap(rect, other));
    };

    const sx = start.x * box.w;
    const sy = start.y * box.h;
    let best = fits(sx, sy) ? { x: sx, y: sy } : null;
    const maxRadius = Math.min(box.w, box.h) * SECTION_AREA_RADIUS;
    for (let ring = 1; !best && ring * 14 <= maxRadius; ring += 1) {
      const radius = ring * 14;
      const steps = 8 + ring * 2;
      for (let i = 0; i < steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2 + Math.PI / 2;
        const x = sx + Math.cos(angle) * radius;
        const y = sy + Math.sin(angle) * radius * 0.7;
        if (fits(x, y)) {
          best = { x, y };
          break;
        }
      }
    }

    const placed = best || { x: sx, y: sy };
    taken.push({ ...placed, ...size });
    result[node.id] = { x: placed.x / box.w, y: placed.y / box.h };
  });

  return result;
}

/** Saved answers to the workbook's own questions, offered so nothing is typed twice. */
export function savedAnswerOptions(lessons, answers) {
  const options = [];
  (lessons || []).forEach((lesson) => {
    const tries = lesson.try_prompts || [];
    const prompts = [
      ...tries.map((label, index) => ({ label, index, kind: "Try" })),
      ...(lesson.reflect_prompts || []).map((label, index) => ({ label, index: tries.length + index, kind: "Reflect" })),
    ];
    prompts.forEach((prompt) => {
      const value = String((answers || {})[`${lesson.code}#${prompt.index}`] || "").trim();
      if (!value) return;
      options.push({
        key: `${lesson.code}#${prompt.index}`,
        code: lesson.code,
        index: prompt.index,
        lessonTitle: lesson.title,
        stepLabel: `${prompt.kind}: ${prompt.label}`,
        value,
      });
    });
  });
  return options;
}
