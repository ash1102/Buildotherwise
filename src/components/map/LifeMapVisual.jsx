import React, { useMemo } from "react";

const SECTION_LABELS = {
  places: "Place",
  placeless: "Activity",
  groups: "Person or group",
  barriers: "What’s missing",
  threads: "Possible thread",
  energy: "Energy observation",
};

const CARD_W = 190;
const CARD_H = 58;
const COL_W = 250;
const ROW_H = 80;
const PAD = 24;

/**
 * The Life Map as a mind map: each starting entry sits on the left and its
 * answers branch out to the right. Curved lines run from a parent's edge to
 * each child's edge, so they never cross the cards. Clicking a card opens the
 * same editor the branch view uses.
 */
export default function LifeMapVisual({ graph, selectedId, onSelect }) {
  const layout = useMemo(() => {
    const nodes = graph.nodes || [];
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
    const childrenOf = {};
    const roots = [];

    nodes.forEach((node) => {
      const parent = node.parent_id && byId[node.parent_id] && node.parent_id !== node.id ? node.parent_id : "";
      if (parent) {
        (childrenOf[parent] = childrenOf[parent] || []).push(node.id);
      } else {
        roots.push(node.id);
      }
    });

    const pos = {};
    const seen = new Set();
    let row = 0;
    let maxDepth = 0;

    const place = (id, depth) => {
      if (seen.has(id)) return null;
      seen.add(id);
      maxDepth = Math.max(maxDepth, depth);
      const kids = (childrenOf[id] || []).map((kid) => place(kid, depth + 1)).filter((y) => y !== null);
      const y = kids.length ? kids.reduce((sum, value) => sum + value, 0) / kids.length : (row++) * ROW_H;
      pos[id] = { x: depth * COL_W, y };
      return y;
    };

    roots.forEach((id) => {
      place(id, 0);
      row += 0.5;
    });

    const edges = nodes
      .filter((node) => node.parent_id && pos[node.id] && pos[node.parent_id])
      .map((node) => ({ from: node.parent_id, to: node.id }));

    return {
      byId,
      pos,
      edges,
      width: (maxDepth + 1) * COL_W + CARD_W + PAD * 2,
      height: Math.max(row, 1) * ROW_H + CARD_H + PAD * 2,
    };
  }, [graph]);

  if (!(graph.nodes || []).length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-[15px] text-muted-foreground">
        Add a place or activity to start your map.
      </p>
    );
  }

  const { byId, pos, edges, width, height } = layout;

  return (
    <section className="rounded-xl border border-border bg-secondary/30 p-3 sm:p-5" aria-label="Your life map as a mind map">
      <p className="mb-4 text-[14px] text-muted-foreground">
        Starting entries sit on the left. Their answers branch out to the right. Select a card to edit it.
      </p>
      <div className="overflow-auto rounded-lg">
        <div className="relative" style={{ width: width + PAD, height, minWidth: "100%" }}>
          <svg className="absolute left-0 top-0" width={width + PAD} height={height} viewBox={`0 0 ${width + PAD} ${height}`} aria-hidden="true">
            {edges.map(({ from, to }) => {
              const a = pos[from];
              const b = pos[to];
              const sx = PAD + a.x + CARD_W;
              const sy = PAD + a.y + CARD_H / 2;
              const ex = PAD + b.x;
              const ey = PAD + b.y + CARD_H / 2;
              const mid = (ex - sx) / 2;
              return (
                <path
                  key={`${from}-${to}`}
                  d={`M ${sx} ${sy} C ${sx + mid} ${sy}, ${ex - mid} ${ey}, ${ex} ${ey}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
              );
            })}
          </svg>

          {Object.keys(pos).map((id) => {
            const node = byId[id];
            const spot = pos[id];
            const active = selectedId === id;
            const isRoot = !node.parent_id || !byId[node.parent_id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-pressed={active}
                className={`absolute flex flex-col justify-center overflow-hidden rounded-xl border px-3 py-2 text-left leading-snug shadow-sm ${
                  active ? "border-primary bg-primary-wash ring-2 ring-primary/20" : isRoot ? "border-primary/50 bg-card" : "border-border bg-card"
                } text-foreground`}
                style={{ left: PAD + spot.x, top: PAD + spot.y, width: CARD_W, height: CARD_H }}
              >
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {SECTION_LABELS[node.section] || node.section}
                </span>
                <span className="line-clamp-2 break-words text-[13.5px]">{node.label || node.text || "Untitled"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
