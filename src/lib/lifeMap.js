import { useEffect, useState } from "react";
import { makeId, readStore, subscribeStore, writeStore } from "./store";
import { LIFEMAP_KEY, setLifeMap } from "./workbook";

/**
 * The five questions the map is drawn from. The keys are the ones the Life Map has
 * always used, so lines saved before today stay exactly where they were.
 */
export const MAP_SECTIONS = [
  {
    key: "places",
    label: "Places",
    prompt: "Where this kind of activity happens, and whether you can get there, feel welcome, and afford it.",
  },
  {
    key: "placeless",
    label: "Activities anywhere",
    prompt: "Things you do anywhere: reading, walking, talking, making, fixing, helping.",
  },
  {
    key: "energy",
    label: "Energy",
    prompt: "What left you steadier, and what took more than it gave.",
  },
  {
    key: "barriers",
    label: "Barriers and access",
    prompt: "Cost, transport, childcare, accessibility, schedule, credentials. Facts about the situation, not failings.",
  },
  {
    key: "threads",
    label: "Threads and questions",
    prompt: "What your attention keeps coming back to.",
  },
];

/**
 * The questions that find the lines for the map, in the order of the lesson
 * "Map the Life You're Actually Living" (Notion, Module 1, Parts 1-6). Wording is
 * the lesson's own. Each answer becomes a line under the section named here.
 * `starter: true` means the answer finishes the sentence, so the line keeps it.
 */
export const MAP_QUESTION_PARTS = [
  {
    key: "part-1",
    title: "Draw your week",
    section: "places",
    intro:
      "Think about a normal week. You are not trying to make a geographically accurate map. You're making a map of your lived week.",
    examples:
      "Work, someone else's house, school, stores, a gym, church, meetings, appointments, parks, restaurants, a garage, a friend's place, treatment or recovery spaces, community organizations, places connected to your kids, anywhere else that is actually part of your life.",
    questions: [
      { id: "p1-places", text: "What places do you go in a typical week and weekend?", list: true },
      { id: "p1-do", text: "What do you usually do when you get there?" },
      { id: "p1-how", text: "How do you get to and from those places?" },
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
    questions: [{ id: "p2-placeless", text: "What do you do that doesn't have a place?", list: true }],
  },
  {
    key: "part-3",
    title: "Mark the energy",
    section: "energy",
    intro: "Look over what you have so far. Don't analyze it yet. Just mark it. There is no scoring system.",
    questions: [
      { id: "p3-plus", text: "What gives you energy?" },
      { id: "p3-minus", text: "What drains you?" },
      { id: "p3-star", text: "What do you care about?" },
      { id: "p3-question", text: "What are you curious about?" },
      { id: "p3-dollar", text: "What do you do mostly because you need money or resources?" },
      { id: "p3-bang", text: "Where do you get unusually focused?" },
    ],
  },
  {
    key: "part-4",
    title: "Look at what's missing",
    section: "barriers",
    intro:
      "Sometimes something is missing because you don't care about it. Sometimes it's missing because you can't currently reach it. Those are not the same thing.",
    questions: [
      { id: "p4-used-to", text: "What used to be part of my life that isn't anymore?" },
      { id: "p4-rarely", text: "What do I want to do but rarely get access to?" },
      {
        id: "p4-barrier",
        text: "Where would I go if money, transportation, time, childcare, fear, paperwork, health, or another barrier weren't stopping me?",
      },
      { id: "p4-circumstances", text: "Who or what would be on this map if my circumstances were different?" },
      { id: "p4-in-the-way", text: "What gets in the way?" },
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
];

/** Part 6 of the lesson: one thing worth exploring, or an honest unknown. */
export const MAP_PICK_FIELDS = [
  { id: "one-thing", label: "One thing I might want to understand better is:" },
  { id: "noticed-because", label: "I noticed it because:" },
  { id: "do-not-know", label: "I do NOT know yet:" },
  { id: "small-way", label: "One small way I could learn more about it:" },
];

export const MAP_PICK_KEY = "lifeMapPick";

/** The line an answer becomes. A sentence starter keeps its start so the line reads on its own. */
export function lineFromAnswer(question, answer) {
  const value = String(answer || "").trim();
  if (!value) return "";
  if (!question.starter) return value;
  return `${question.text.replace(/…$/, "").trim()} ${value}`;
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

const POSITIONS_KEY = "lifeMapPositions";

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

export function updateLine(sectionKey, id, patch) {
  const map = readStore(LIFEMAP_KEY, {});
  const items = map[sectionKey] || [];
  setLifeMap({ ...map, [sectionKey]: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
}

export function removeLine(sectionKey, id) {
  const map = readStore(LIFEMAP_KEY, {});
  const items = map[sectionKey] || [];
  setLifeMap({
    ...map,
    [sectionKey]: items
      .map((item) => ({ ...item, links: (item.links || []).filter((link) => link !== id) }))
      .filter((item) => item.id !== id),
  });
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
      text: item.text || "",
      label: item.label || "",
      entry_id: item.entry_id || "",
      links: item.links || [],
      source_code: item.source_code || "",
      source_label: item.source_label || "",
      question_id: item.question_id || "",
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
const ROW = 0.072;
const COL = 0.25;

/**
 * Open spots around a question, nearest first, as [column, row] steps. Rows run
 * away from the middle where there is room, so lines stack under their question
 * instead of piling on top of each other.
 */
function slotsFor(hub) {
  const down = hub.y < 0.5;
  const rows = down ? [1, 2, 3, 4] : [1, -1, 2, -2];
  return rows.map((row) => [0, row]);
}

const within = (value) => Math.min(0.94, Math.max(0.06, value));

/** Where each node sits before anyone moves it: stacked by its own question, away from the middle. */
export function defaultPositions(sections) {
  const count = sections.length || 1;
  const spots = { sections: {}, nodes: {} };

  sections.forEach((section, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const hub = { x: 0.5 + Math.cos(angle) * SECTION_RX, y: 0.5 + Math.sin(angle) * SECTION_RY };
    spots.sections[section.key] = hub;

    const slots = slotsFor(hub);
    section.nodes.forEach((node, position) => {
      const [column, row] = slots[position % slots.length];
      const lap = Math.floor(position / slots.length) * 0.02;
      spots.nodes[node.id] = {
        x: within(hub.x + column * COL + lap),
        y: within(hub.y + row * ROW + lap),
      };
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