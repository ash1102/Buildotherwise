import React, { useMemo } from "react";
import { buildBranches } from "@/lib/lifeMapBranches";

/**
 * The Life Map as a sideways tree. Starting entries sit on the left, grouped by
 * area; their answers branch to the right, one column per step. Layout is
 * automatic. Clicking a card only calls onSelect.
 */
const CARD_W = 216;
const CARD_H = 72;
const COL = 288; // card width + gap for the curves
const GAP = 20;
const PAD = 24;
const HEAD = 30;
const AREA_GAP = 22;

const AREAS = [
  { key: "places", label: "Your week" },
  { key: "placeless", label: "No set place" },
  { key: "groups", label: "People and groups" },
  { key: "barriers", label: "What’s missing" },
  { key: "threads", label: "Threads" },
  { key: "energy", label: "Energy" },
];

const SECTION_TYPE = {
  places: "Place",
  placeless: "Activity",
  groups: "Person or group",
  barriers: "What’s missing",
  threads: "Possible thread",
  energy: "Energy observation",
};

function typeLabel(node) {
  if (node.question_id === "p1-do" || node.question_id === "p1-how") return "Activity";
  return SECTION_TYPE[node.section] || "Entry";
}

function layoutTree(graph) {
  const tree = buildBranches(graph);
  const { nodesById, childrenById, parentById } = tree;
  // Nothing hidden: roots, "missing" and not-yet-placed answers all start branches.
  const starts = [...tree.roots, ...tree.missing, ...tree.unlinked];
  const pos = {};
  const areas = [];
  let y = PAD;
  let maxDepth = 0;
  let first = true;

  const place = (id, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    const kids = childrenById[id] || [];
    let top;
    if (!kids.length) {
      top = y;
      y += CARD_H + GAP;
    } else {
      kids.forEach((kid) => place(kid, depth + 1));
      top = (pos[kids[0]].y + pos[kids[kids.length - 1]].y) / 2;
    }
    pos[id] = { x: PAD + depth * COL, y: top };
  };

  AREAS.forEach((area) => {
    const group = starts.filter((id) => {
      const node = nodesById[id];
      const key = tree.missing.includes(id) ? "barriers" : node.section;
      return (AREAS.some((a) => a.key === key) ? key : "threads") === area.key;
    });
    if (!group.length) return;
    if (!first) y += AREA_GAP;
    first = false;
    areas.push({ key: area.key, label: area.label, y });
    y += HEAD;
    group.forEach((id, index) => {
      if (index) y += GAP / 2;
      place(id, 0);
    });
  });

  const width = PAD * 2 + maxDepth * COL + CARD_W;
  const height = y - GAP + PAD;
  const links = Object.entries(parentById)
    .filter(([child, parent]) => pos[child] && pos[parent])
    .map(([child, parent]) => {
      const p = pos[parent];
      const c = pos[child];
      const x1 = p.x + CARD_W;
      const y1 = p.y + CARD_H / 2;
      const x2 = c.x;
      const y2 = c.y + CARD_H / 2;
      const mx = (x1 + x2) / 2;
      return { key: `${parent}-${child}`, d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` };
    });

  return { pos, areas, links, width, height, nodesById, parentById };
}

export default function LifeMapTree({ graph, selectedId, onSelect }) {
  const layout = useMemo(() => layoutTree(graph), [graph]);
  const { pos, areas, links, width, height, nodesById, parentById } = layout;
  const name = (node) => node.label || node.text || "Not written yet";

  return (
    <section aria-labelledby="life-map-title" className="min-w-0 space-y-3">
      <h2 id="life-map-title" className="font-heading text-xl">Your map</h2>
      <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        Starting entries sit on the left. Their answers branch out to the right. Select a card to edit it.
      </p>

      <div
        role="region"
        aria-label="Life map, scrolls in both directions"
        tabIndex={0}
        className="relative max-h-[640px] overflow-auto rounded-xl border border-border bg-secondary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {graph.nodes.length === 0 ? (
          <p className="px-6 py-10 text-[14.5px] leading-relaxed text-muted-foreground">
            Nothing on the map yet. Add a place, an activity, or a group and it will start a branch here.
          </p>
        ) : (
          <div className="relative" style={{ width, height }}>
            <svg aria-hidden="true" width={width} height={height} className="pointer-events-none absolute left-0 top-0">
              {links.map((link) => (
                <path key={link.key} d={link.d} fill="none" strokeWidth={1.5} strokeLinecap="round" className="stroke-primary" />
              ))}
            </svg>

            {areas.map((area) => (
              <h3
                key={area.key}
                className="absolute m-0 flex items-center gap-2.5 whitespace-nowrap font-heading text-[16px] text-foreground"
                style={{ left: PAD, top: area.y, width: width - PAD * 2 }}
              >
                <span>{area.label}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </h3>
            ))}

            <ul aria-label="Map entries" className="m-0 list-none p-0">
              {Object.entries(pos).map(([id, at]) => {
                const node = nodesById[id];
                const parent = parentById[id] ? nodesById[parentById[id]] : null;
                const isStart = !parent;
                const selected = id === selectedId;
                const type = typeLabel(node);
                return (
                  <li key={id} className="absolute" style={{ left: at.x, top: at.y, width: CARD_W, height: CARD_H }}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${isStart ? "Starting entry" : "Answer"}, ${type}: ${name(node)}${parent ? `. Branches from ${name(parent)}` : ""}`}
                      title={name(node)}
                      onClick={() => onSelect(id)}
                      className={[
                        "flex h-full w-full flex-col justify-center gap-1 rounded-[10px] px-3 py-2 text-left text-foreground transition-colors",
                        "hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary",
                        selected
                          ? "border-2 border-primary bg-primary/25"
                          : isStart
                            ? "border-2 border-muted-foreground/70 bg-card"
                            : "border border-border bg-card",
                      ].join(" ")}
                    >
                      <span className="flex items-baseline gap-1.5 overflow-hidden whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        <span>{type}</span>
                        {isStart ? <span className="text-foreground">· Start</span> : null}
                      </span>
                      <span className="block min-w-0">
                        <span className="line-clamp-2 break-words text-[14px] leading-[1.35]">{name(node)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <p className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-3.5 w-[22px] rounded border-2 border-muted-foreground/70 bg-card" />
          Starting entry: heavier border, marked “Start”
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-3.5 w-[22px] rounded border border-border bg-card" />
          Answer to the entry on its left
        </span>
      </p>
    </section>
  );
}
