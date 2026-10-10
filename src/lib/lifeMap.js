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
    prompt: "Where this kind of activity happens — and whether you can get there, feel welcome, and afford it.",
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
    prompt: "Cost, transport, childcare, accessibility, schedule, credentials. Facts about the situation — not failings.",
  },
  {
    key: "threads",
    label: "Threads and questions",
    prompt: "What your attention keeps coming back to.",
  },
];

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
const SECTION_RY = 0.34;
const NODE_RX = 0.135;
const NODE_RY = 0.18;

/** Where each node sits before anyone moves it: around its own question, away from the middle. */
export function defaultPositions(sections) {
  const count = sections.length || 1;
  const spots = { sections: {}, nodes: {} };

  sections.forEach((section, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    spots.sections[section.key] = { x: 0.5 + Math.cos(angle) * SECTION_RX, y: 0.5 + Math.sin(angle) * SECTION_RY };

    const lines = section.nodes;
    lines.forEach((node, position) => {
      const spread = lines.length > 1 ? (position / (lines.length - 1) - 0.5) * 1.2 : 0;
      const aimed = angle + spread;
      spots.nodes[node.id] = {
        x: 0.5 + Math.cos(aimed) * NODE_RX,
        y: 0.5 + Math.sin(aimed) * NODE_RY,
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