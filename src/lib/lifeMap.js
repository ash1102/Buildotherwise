import { useEffect, useState } from "react";
import { makeId, readStore, subscribeStore, writeStore } from "./store";
import { LIFEMAP_KEY, setLifeMap } from "./workbook";
import { ENERGY_QUESTION, energyLine } from "./mapEnergy";
import { buildBranches, wouldCycle } from "./lifeMapBranches";

/**
 * The map areas. The keys are the ones the Life Map has always used, so lines
 * saved before today stay in the same place.
 */
export const MAP_SECTIONS = [
  {
    key: "places",
    label: "Your week",
    prompt: "Places from a recent stretch you remember. Home counts.",
  },
  {
    key: "placeless",
    label: "Activities",
    prompt: "Other things you did then, including at home, online, while travelling, or in different places.",
  },
  {
    key: "energy",
    label: "Energy",
    prompt: "One recent observation about energy. Not a permanent description of the activity.",
  },
  {
    key: "barriers",
    label: "What's missing",
    prompt: "Something that used to be part of life, something wanted but not reached, or what made access difficult. Absence is not the same as wanting it back.",
  },
  {
    key: "threads",
    label: "Threads",
    prompt: "A repeated detail might be worth noticing. It does not tell you yet why it repeats, whether you like it, or whether you want more of it.",
  },
  {
    key: "groups",
    label: "People and groups",
    prompt: "People and groups you have been in contact with, used to be with, or have wondered about. A role or group label is enough.",
  },
];

/**
 * Guided questions, in recall order. Saved lines keep these ids. `retired` questions
 * stay here so older answers still have a label; they are not shown in the guide.
 * `starter` / `legacyStarters` strip an old sentence opening off a saved line.
 * `context: "entry"` attaches a new answer to something already on the map.
 */
export const MAP_QUESTION_PARTS = [
  {
    key: "part-1",
    title: "Recent places",
    section: "places",
    intro:
      "Think about the past seven days, or another recent stretch you remember. You are not trying to make a geographically accurate map.",
    examples:
      "Home, work, someone else's house, school, stores, a gym, church, meetings, appointments, parks, restaurants, a garage, a friend's place, treatment or recovery spaces, community organizations, places connected to your kids, anywhere else that is actually part of your life.",
    questions: [
      {
        id: "p1-places",
        branch: "Places I go",
        text: "Think about the past seven days, or another recent stretch you remember. Where did you spend time? Home counts.",
        list: true,
      },
      { id: "p1-do", branch: "What I do there", text: "What do you do at this place?", aboutPlace: "at" },
      {
        id: "p1-how",
        branch: "Getting there",
        text: "How do you get to and from this place?",
        aboutPlace: "to",
        helper: "“I’m already there” is an answer.",
        chips: ["I'm already there"],
      },
    ],
  },
  {
    key: "part-2",
    title: "Other activities",
    section: "placeless",
    intro:
      "Include what you did at home, online, while travelling, or in more than one place. You do not have to decide whether an activity is literally placeless.",
    examples:
      "Research something for hours from your phone, fix things, draw, game, cook, sell things online, talk people through problems, scroll, write, care for somebody, organize things, watch tutorials, work on a car, make music.",
    questions: [
      {
        id: "p2-placeless",
        branch: "Other things I did",
        text: "What else did you do during that time—at home, online, while travelling, or in different places?",
        list: true,
      },
    ],
  },
  {
    key: "part-groups",
    title: "People and groups",
    section: "groups",
    intro:
      "Who has been part of this recent stretch, in person or online? A group does not need a name or a meeting. You can use a role or group label instead of a name.",
    examples:
      "Family, a circle of friends, coworkers, neighbors, people at church, a team, a crew, a class, other parents, people you game with, an online community, a recovery or support group, people who share your language or where you're from.",
    note: "Skip any of these. A blank line is a real answer.",
    questions: [
      {
        id: "g-now",
        branch: "People and groups now",
        text: "Who have you spent time with or been in contact with recently—in person or online? You can use a role or group label instead of a name.",
        list: true,
      },
      {
        id: "p5-come-to-me",
        branch: "Asked me for",
        text: "Has anyone recently asked you for help, information, or company? What did they ask for?",
        helper: "One request does not establish a recurring role.",
        legacyStarters: ["People seem to come to me for"],
      },
      {
        id: "g-close",
        branch: "How connected it feels",
        text: "If you want to mark it, how connected do you feel to this person or group right now?",
        helper: "Optional. Contact and closeness are different, and you can leave this unmarked.",
        about: "g-now",
        aboutLabel: "Which person or group?",
        chips: ["Close", "In the middle", "At the edge", "Not sure"],
        optional: true,
      },
      { id: "g-before", branch: "Groups from before", text: "Are there groups you used to be part of?", list: true, optional: true },
      {
        id: "g-left",
        branch: "What's left of it",
        text: "Is any of that worth reconnecting with, or is it better left where it is?",
        about: "g-before",
        aboutLabel: "Which group?",
        chips: ["Worth reconnecting", "Changed, but still part of me", "Leaving it where it is", "Not sure"],
        retired: true,
      },
      {
        id: "g-curious",
        branch: "Groups I'm curious about",
        text: "Is there a group, place, or kind of people you've wondered about joining, or just seeing?",
        helper: "This is a possibility, not present involvement.",
        list: true,
        optional: true,
      },
      {
        id: "g-take",
        branch: "What I would need to know",
        text: "If you wanted to find out more, what would you need to know first? Is there any support or access you already know you would need?",
        section: "barriers",
        about: "g-curious",
        aboutLabel: "Which group?",
        optional: true,
      },
    ],
  },
  {
    key: "part-3",
    title: "Observations",
    section: "energy",
    intro:
      "Optional. Choose one entry and describe one recent time, or one thing you notice about that entry. Nothing here is a score, and one answer does not become a permanent description.",
    questions: [
      { id: "p3-energy", branch: "Energy observation", text: ENERGY_QUESTION, energyControl: true },
      { id: "p3-plus", branch: "Gives me energy", text: "What gives you energy?", retired: true },
      { id: "p3-minus", branch: "Drains me", text: "What drains you?", retired: true },
      {
        id: "p3-star",
        branch: "What matters to me",
        text: "What, if anything, matters to you about this entry?",
        context: "entry",
        optional: true,
      },
      {
        id: "p3-question",
        branch: "Curiosity",
        text: "Is there anything about this entry you would like to understand better?",
        helper: "“Nothing comes to mind” is an answer.",
        context: "entry",
        optional: true,
      },
      {
        id: "p3-dollar",
        branch: "Money or resources",
        text: "What role, if any, do money or resources play in doing this?",
        context: "entry",
        optional: true,
      },
      {
        id: "p3-bang",
        branch: "Attention",
        text: "What part, if any, holds your attention?",
        helper: "Can you remember a recent example?",
        context: "entry",
        optional: true,
      },
    ],
  },
  {
    key: "part-4",
    title: "What's missing",
    section: "barriers",
    intro:
      "Something can be absent without being missed, and a difficulty does not prove you want to pursue the activity. Add only what you want to add.",
    questions: [
      {
        id: "p4-used-to",
        branch: "Used to be part of my life",
        text: "Is there an activity or place you remember spending time on before that isn't part of your life now? Add it only if you want to.",
        optional: true,
      },
      {
        id: "p5-miss",
        branch: "Something I miss",
        text: "Something I miss is…",
        starter: true,
        about: "p4-used-to",
        aboutLabel: "Which former activity or place?",
        helper: "Optional. Something can be absent without being missed.",
        optional: true,
      },
      {
        id: "p4-rarely",
        branch: "Wanted, but have not had the chance",
        text: "Is there something you have wanted to do recently but haven't had the chance to do?",
        optional: true,
      },
      {
        id: "p4-in-the-way",
        branch: "What gets in the way",
        text: "What, if anything, made it difficult to do this or get there? “I don’t know” is an answer.",
        helper: "Money, transportation, time, childcare, fear, paperwork, health, or something else might be relevant. A difficulty is not a plan.",
        aboutQuestions: ["p4-rarely"],
        aboutLabel: "Which desired activity?",
      },
      {
        id: "p4-else",
        branch: "Something else missing",
        text: "Is there something else missing from this map that you want to add?",
        optional: true,
      },
      {
        id: "p4-barrier",
        branch: "If nothing was stopping me",
        text: "Where would I go if money, transportation, time, childcare, fear, paperwork, health, or another barrier weren't stopping me?",
        retired: true,
      },
      {
        id: "p4-circumstances",
        branch: "If things were different",
        text: "Who or what would be on this map if my circumstances were different?",
        retired: true,
      },
    ],
  },
  {
    key: "part-5",
    title: "Possible threads",
    section: "threads",
    menu: true,
    intro:
      "Optional. Look across the entries you can already see. A repeated detail might be worth noticing. It does not tell you yet why it repeats, whether you like it, or whether you want more of it.",
    note: "Choose one prompt if you want to. You do not need a discovery for every prompt.",
    questions: [
      {
        id: "p5-ending-up",
        branch: "Shows up more than once",
        text: "Looking across your entries, does any activity, place, or kind of situation appear more than once? Which entries?",
        legacyStarters: ["I keep ending up around"],
        multi: true,
      },
      {
        id: "p5-more-time",
        branch: "Took a lot of time",
        text: "Which activities took up a lot of your time during the period you mapped, if any?",
        legacyStarters: ["I spend more time than I realized doing"],
        multi: true,
      },
      {
        id: "p5-lose-track",
        branch: "Longer than intended",
        text: "Can you remember a recent time you did something longer than you intended? What were you doing?",
        helper: "This does not by itself mean you enjoyed it.",
        legacyStarters: ["I lose track of time when"],
        multi: true,
      },
      {
        id: "p5-researching",
        branch: "Looked into recently",
        text: "What have you looked up, read about, watched, or asked questions about recently, if anything?",
        legacyStarters: ["I keep researching"],
        multi: true,
      },
      {
        id: "p5-weird-amount",
        branch: "Spent time learning",
        text: "Is there something you have spent time learning about or doing that you want to add?",
        legacyStarters: ["I seem to know a weird amount about"],
        multi: true,
      },
      {
        id: "p5-improve",
        branch: "Tried to change or improve",
        text: "Have you recently tried to change, fix, practise, or improve something? What did you do?",
        legacyStarters: ["I keep trying to improve"],
        multi: true,
      },
      {
        id: "p5-frustrated",
        branch: "Didn't work as wanted",
        text: "Was there a moment in one of these activities when something didn't work as you wanted? What happened?",
        legacyStarters: ["I get frustrated when"],
        multi: true,
      },
      { id: "p5-wish", branch: "Something I wish I had access to", text: "Something I wish I had access to is…", starter: true, retired: true },
      {
        id: "p5-bigger",
        branch: "One part I would make bigger",
        text: "One part of this map I would willingly make bigger is…",
        starter: true,
        retired: true,
      },
    ],
  },
];

/** Every map question by id, with the part and section it belongs to. */
export const QUESTIONS_BY_ID = Object.fromEntries(
  MAP_QUESTION_PARTS.flatMap((part, partIndex) =>
    part.questions.map((question) => [
      question.id,
      {
        ...question,
        branch: question.branch || question.text.replace(/…$/, "").trim(),
        partIndex,
        section: question.section || part.section,
      },
    ])
  )
);

/** Closing reflection. Field ids stay stable so saved text is not dropped. */
export const MAP_PAUSE_TEXT = "I'm not choosing something to explore right now.";

export const MAP_PICK_FIELDS = [
  { id: "one-thing", label: "One thing I might want to understand better is:" },
  { id: "noticed-because", label: "The entry or experience that brought this to my attention was:" },
  { id: "do-not-know", label: "I do NOT know yet:" },
  {
    id: "small-way",
    label: "One small way I could learn more about it:",
    hint: "For example: observing, asking a question, or looking up one practical detail. A plan is not a commitment.",
  },
  {
    id: "more-room",
    label: "Is there anything here you would like more room for, or would like to keep as it is?",
  },
  {
    id: "connection-now",
    label: "Do you want to do anything with a former connection right now, leave it as it is, or leave the question open?",
  },
];

export const MAP_PICK_KEY = "lifeMapPick";

/** A line on the map, or an explicit pause, means this step has been used. An empty map has not. */
export function lifeMapHasEntries(map, pick) {
  const sections = map && typeof map === "object" ? Object.values(map) : [];
  const hasLine = sections.some(
    (items) => Array.isArray(items) && items.some((item) => String(item?.text || item?.label || "").trim())
  );
  return hasLine || Boolean(pick && pick.nothing_yet);
}

/**
 * A follow-up that belongs to one earlier entry (a place, a group, a former
 * activity). The guide asks it once per entry, so the answer always lands on
 * the entry it is about.
 */
export function isPerEntryQuestion(question) {
  return Boolean(question && (question.aboutPlace || question.about || (question.aboutQuestions || []).length));
}

/** Entries a per-entry follow-up can be asked about, in the order they were added. */
export function followUpTargets(question, nodes) {
  const list = nodes || [];
  if (question.about) return list.filter((node) => node.question_id === question.about);
  if (question.aboutPlace) return list.filter((node) => node.question_id === "p1-places" || (node.section === "places" && !node.question_id));
  if ((question.aboutQuestions || []).length) return list.filter((node) => question.aboutQuestions.includes(node.question_id));
  return [];
}

/** The question whose answers a follow-up is asked about, so the guide can point back to it. */
export function sourceQuestionId(question) {
  if (question.about) return question.about;
  if (question.aboutPlace) return "p1-places";
  return (question.aboutQuestions || [])[0] || "";
}

/** Questions the guide shows. Retired prompts and the energy control stay addressable by id. */
export function guideQuestions(part) {
  return (part?.questions || []).filter((question) => !question.retired && !question.energyControl);
}

/**
 * The closing reflection is not a line in the lifeMap store. It lives under
 * lifeMapPick, one field per prompt. Only filled answers are drawn. Choosing not
 * to explore right now hides those fields on the map without deleting them.
 */
export function exploreLines(pick) {
  const value = pick || {};
  if (value.nothing_yet) {
    return [
      {
        id: "pick:nothing",
        fieldId: "nothing_yet",
        label: "",
        text: MAP_PAUSE_TEXT,
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
function starterPrefixes(question) {
  if (!question) return [];
  const raw = [];
  if (question.starter) raw.push(question.text);
  raw.push(...(question.legacyStarters || []));
  return raw.map((item) => String(item || "").replace(/…$/, "").trim()).filter(Boolean);
}

export function answerText(question, text) {
  const value = String(text || "").trim();
  const prefixes = starterPrefixes(question);
  if (!value || !prefixes.length) return value;
  for (const prefix of prefixes) {
    const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:[\\s….:,;\\-–—]+)`, "i");
    const matched = value.match(pattern);
    if (!matched) continue;
    const rest = value.slice(matched[0].length).trim();
    return rest || value;
  }
  return value;
}

/**
 * Where an explicit "Add to map" places a line. Uncommitted draft text must not
 * call this. One selected entry becomes the parent. Several selected entries stay
 * connected without pretending one of them proves a pattern. A missing-section
 * answer with no parent stays in What's missing.
 */
export function placementForAnswer(question, { links = [], separate = false } = {}) {
  const chosen = separate ? [] : [...new Set(links.filter(Boolean))];
  const missing = (question?.section || "") === "barriers";
  if (chosen.length === 1) {
    return { links: chosen, parent_id: chosen[0], parent_choice: "chosen", branch_group: "" };
  }
  if (chosen.length > 1) {
    return {
      links: chosen,
      parent_id: "",
      parent_choice: missing ? "" : "standalone",
      branch_group: missing ? "barriers" : "",
    };
  }
  if (separate || missing) {
    return {
      links: [],
      parent_id: "",
      parent_choice: missing ? "" : "standalone",
      branch_group: missing ? "barriers" : "",
    };
  }
  return { links: [], parent_id: "", parent_choice: "", branch_group: "" };
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
  const existing = energy.find((item) => item.question_id === "p3-energy" && (item.links || []).includes(sourceId));
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
      text: answerText(QUESTIONS_BY_ID[item.question_id], item.text || ""),
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
