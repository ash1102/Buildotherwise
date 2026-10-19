import { MAP_SECTIONS } from "./lifeMap";

/**
 * What the hybrid map draws.
 * Areas are the map's own organization. A line between two entries exists only
 * when the person attached an answer to an entry, or connected two entries.
 * Nothing here pairs entries because the wording looks related.
 */
export function hybridScene(graph, tree, { focusId = "", showDetails = false } = {}) {
  const nodes = graph?.nodes || [];
  const byId = tree?.nodesById || {};
  const parentById = tree?.parentById || {};
  const childrenById = tree?.childrenById || {};
  const shown = new Set();

  if (showDetails) {
    nodes.forEach((node) => shown.add(node.id));
  } else {
    [...(tree?.roots || []), ...(tree?.missing || []), ...(tree?.unlinked || [])].forEach((id) => shown.add(id));
    if (focusId && byId[focusId]) {
      let cursor = focusId;
      while (cursor) {
        shown.add(cursor);
        cursor = parentById[cursor];
      }
      (childrenById[focusId] || []).forEach((id) => shown.add(id));
    }
  }

  const visible = nodes.filter((node) => shown.has(node.id));
  const hiddenById = {};
  visible.forEach((node) => {
    const hidden = (childrenById[node.id] || []).filter((id) => !shown.has(id)).length;
    if (hidden) hiddenById[node.id] = hidden;
  });

  const edges = MAP_SECTIONS.map((section) => ({
    kind: "area",
    from: "center",
    to: `section:${section.key}`,
  }));

  visible.forEach((node) => {
    const parent = parentById[node.id];
    if (parent && shown.has(parent)) {
      edges.push({ kind: "detail", from: parent, to: node.id });
      return;
    }
    edges.push({ kind: "area", from: `section:${node.section}`, to: node.id });
  });

  const seen = new Set();
  visible.forEach((node) => {
    (node.links || []).forEach((other) => {
      if (!shown.has(other) || other === node.id) return;
      if (parentById[node.id] === other || parentById[other] === node.id) return;
      const key = [node.id, other].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ kind: "chosen", from: node.id, to: other });
    });
  });

  return {
    sections: MAP_SECTIONS.map((section) => section.key),
    nodes: visible,
    edges,
    hiddenById,
  };
}
