/** Build a tree from explicit parent choices and unambiguous existing links. No text matching. */
const ROOT_QUESTIONS = new Set(["p1-places", "p2-placeless", "g-now", "g-before", "g-curious", "p5-come-to-me"]);
const isAnchor = (node) => ROOT_QUESTIONS.has(node.question_id) ||
  (!node.question_id && ["places", "placeless", "groups"].includes(node.section));

function candidatesFor(node, nodesById) {
  const linked = (node.links || []).map((id) => nodesById[id]).filter(Boolean);
  if (["p1-do", "p1-how"].includes(node.question_id)) return linked.filter((other) => other.question_id === "p1-places");
  const groupQuestion = { "g-close": "g-now", "g-left": "g-before", "g-take": "g-curious" }[node.question_id];
  if (groupQuestion) return linked.filter((other) => other.question_id === groupQuestion);
  if (isAnchor(node)) return [];
  return linked.filter((other) => isAnchor(other) || other.question_id === "p1-do");
}

export function wouldCycle(childId, parentId, parents) {
  const seen = new Set([childId]);
  let cursor = parentId;
  while (cursor) {
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = parents[cursor];
  }
  return false;
}

/**
 * Before a manual connection is saved, write down where a line sits now, so a
 * new connection never moves it to a different branch by itself. Only lines
 * whose place was never chosen (older saves) need this.
 */
export function freezePlacement(node, tree) {
  if (!node || node.parent_choice) return null;
  const parent = tree.parentById[node.id];
  if (parent) return { parent_id: parent, parent_choice: "chosen" };
  if (tree.roots.includes(node.id)) return isAnchor(node) ? null : { parent_choice: "standalone" };
  if (tree.missing.includes(node.id)) return null;
  return { parent_id: "", parent_choice: "chosen" };
}

/** Ids under a line, so a line can't be moved under its own branch. */
export function descendantsOf(id, tree) {
  const out = new Set();
  const walk = (current) => (tree.childrenById[current] || []).forEach((child) => {
    if (out.has(child)) return;
    out.add(child);
    walk(child);
  });
  walk(id);
  return out;
}

export function buildBranches(graph) {
  const nodesById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
  const parentById = {};
  for (const node of graph.nodes) {
    if (node.parent_id && nodesById[node.parent_id] && node.parent_id !== node.id && !wouldCycle(node.id, node.parent_id, parentById)) {
      parentById[node.id] = node.parent_id;
    }
  }
  for (const node of graph.nodes) {
    if (Object.prototype.hasOwnProperty.call(parentById, node.id) || node.parent_choice === "standalone" || node.parent_choice === "chosen" || node.branch_group === "barriers") continue;
    const candidates = candidatesFor(node, nodesById);
    if (candidates.length === 1 && !wouldCycle(node.id, candidates[0].id, parentById)) parentById[node.id] = candidates[0].id;
  }
  const childrenById = Object.fromEntries(graph.nodes.map((node) => [node.id, []]));
  const roots = [], unlinked = [], missing = [];
  for (const node of graph.nodes) {
    if (parentById[node.id]) childrenById[parentById[node.id]].push(node.id);
    else if (node.branch_group === "barriers" || (node.section === "barriers" && node.parent_choice !== "standalone")) missing.push(node.id);
    else if (isAnchor(node) || node.parent_choice === "standalone") roots.push(node.id);
    else unlinked.push(node.id);
  }
  return { nodesById, parentById, childrenById, roots, unlinked, missing };
}

export function branchMarkdown(graph, questionLabels = {}, journalEntries = []) {
  const tree = buildBranches(graph);
  const walk = (id, depth = 0) => {
    const node = tree.nodesById[id], indent = "  ".repeat(depth);
    const text = String(node.label || node.text).replace(/\n/g, "\n" + indent + "  ");
    const lines = [indent + "- " + text];
    if (node.label && node.text !== node.label) lines.push(indent + "  - Note: " + node.text.replace(/\n/g, "\n" + indent + "    "));
    const relation = questionLabels[node.question_id]?.branch || node.source_label;
    if (relation) lines.push(indent + "  - Answers: " + relation);
    const journal = node.entry_id ? journalEntries.find((entry) => entry.id === node.entry_id) : null;
    if (journal) lines.push(indent + "  - Journal: " + journal.body.replace(/\n/g, "\n" + indent + "    "));
    for (const child of tree.childrenById[id]) lines.push(walk(child, depth + 1));
    const extra = (node.links || []).filter((other) => tree.nodesById[other] && other !== tree.parentById[id] && tree.parentById[other] !== id);
    if (extra.length) lines.push(indent + "  - Also connected to: " + extra.map((other) => tree.nodesById[other].label || tree.nodesById[other].text).join("; "));
    return lines.join("\n");
  };
  const blocks = [tree.roots.map((id) => walk(id)).join("\n") || "(No starting entries yet.)"];
  if (tree.missing.length) blocks.push("## What’s missing\n" + tree.missing.map((id) => walk(id)).join("\n"));
  if (tree.unlinked.length) blocks.push("## Answers not yet placed in a branch\n" + tree.unlinked.map((id) => walk(id)).join("\n"));
  return blocks.join("\n\n");
}
