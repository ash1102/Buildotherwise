import React from "react";

const SECTION_LABELS = {
  places: "Places",
  placeless: "Activities",
  groups: "People or groups",
  barriers: "What’s missing",
  threads: "Possible threads",
  energy: "Energy observations",
};

const COL_W = 200;
const ROW_H = 96;
const CARD_W = 170;
const CARD_H = 60;
const TOP = 52;

/**
 * The Life Map as a picture: one column per section, one card per entry,
 * and a line for each connection you have made. Clicking a card opens the
 * same editor the branch view uses.
 */
export default function LifeMapVisual({ graph, selectedId, onSelect }) {
  const sections = (graph.sections || []).filter((section) => section.nodes && section.nodes.length);

  if (!sections.length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-4 text-[15px] text-muted-foreground">
        Add a place or activity to see it on the map.
      </p>
    );
  }

  const rows = Math.max(...sections.map((section) => section.nodes.length));
  const width = sections.length * COL_W;
  const height = TOP + rows * ROW_H;

  const pos = {};
  sections.forEach((section, col) => {
    section.nodes.forEach((node, row) => {
      pos[node.id] = { x: col * COL_W + COL_W / 2, y: TOP + row * ROW_H + CARD_H / 2 };
    });
  });

  return (
    <section className="rounded-xl border border-border bg-secondary/30 p-3 sm:p-5" aria-label="Your life map as a picture">
      <p className="mb-4 text-[14px] text-muted-foreground">
        Each column is a kind of entry. Lines show the connections you chose. Select a card to edit it.
      </p>
      <div className="overflow-x-auto">
        <div className="relative" style={{ width, height, minWidth: "100%" }}>
          {sections.map((section, col) => (
            <div
              key={section.key}
              className="absolute top-0 text-[13px] font-semibold text-muted-foreground"
              style={{ left: col * COL_W, width: COL_W, textAlign: "center" }}
            >
              {SECTION_LABELS[section.key] || section.key}
            </div>
          ))}

          <svg className="absolute left-0 top-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            {(graph.links || []).map((pair, index) => {
              const a = pos[pair[0]];
              const b = pos[pair[1]];
              if (!a || !b) return null;
              return (
                <line
                  key={`${pair[0]}-${pair[1]}-${index}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
              );
            })}
          </svg>

          {sections.flatMap((section) =>
            section.nodes.map((node) => {
              const spot = pos[node.id];
              const active = selectedId === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelect(node.id)}
                  aria-pressed={active}
                  className={`absolute overflow-hidden rounded-md border px-2.5 py-2 text-left text-[13px] leading-snug shadow-sm ${
                    active ? "border-primary bg-primary-wash ring-2 ring-primary/20" : "border-border bg-card"
                  } text-foreground`}
                  style={{ left: spot.x - CARD_W / 2, top: spot.y - CARD_H / 2, width: CARD_W, minHeight: CARD_H }}
                >
                  <span className="line-clamp-3 break-words">{node.label || node.text || "Untitled"}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
