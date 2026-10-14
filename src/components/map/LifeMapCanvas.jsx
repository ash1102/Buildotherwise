import React, { useEffect, useMemo, useRef, useState } from "react";
import { MAP_QUESTION_PARTS, QUESTIONS_BY_ID, SECTION_AREA_RADIUS, exploreLines, layoutGraph } from "@/lib/lifeMap";

/** Each question keeps its own colour, so a line is recognisable at a glance. */
const SECTION_DOT = {
  places: "bg-primary",
  placeless: "bg-accent-ink",
  energy: "bg-accent-soft",
  barriers: "bg-muted-foreground",
  threads: "bg-primary-soft",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Rough on-screen size of a pill, in pixels, so lines can be kept from covering each other. */
const pillSize = (text, maxWidth, height) => ({
  w: Math.min(maxWidth, String(text || "").length * 6.8 + 12) + 24,
  h: height,
});

const GAP = 6;
const overlaps = (a, b) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + GAP && Math.abs(a.y - b.y) * 2 < a.h + b.h + GAP;

/**
 * Lines nobody has moved get the nearest clear spot to where they would sit, so
 * nothing lands on top of another line or the middle. The search stays inside
 * the line's own area: a crowded area may overlap, and it does not spill into
 * the next one. Lines the person placed stay exactly where they put them.
 */
function settle(graph, layout, saved, box) {
  if (!box.w || !box.h) return layout.nodes;
  const taken = [];
  taken.push({ x: box.w / 2, y: box.h / 2, w: 230, h: 64 });
  graph.sections.forEach((section) => {
    const hub = layout.sections[section.key];
    if (hub) taken.push({ x: hub.x * box.w, y: hub.y * box.h, ...pillSize(section.label, 220, 34) });
  });

  const result = {};
  const unplaced = [];
  graph.nodes.forEach((node) => {
    const spot = layout.nodes[node.id];
    if (!spot) return;
    if ((saved || {})[node.id]) {
      result[node.id] = spot;
      taken.push({ x: spot.x * box.w, y: spot.y * box.h, ...pillSize(node.label || node.text, 152, 30) });
    } else {
      unplaced.push(node);
    }
  });

  unplaced.forEach((node) => {
    const start = layout.nodes[node.id];
    const size = pillSize(node.label || node.text, 152, 30);
    const fits = (x, y) => {
      const rect = { x, y, ...size };
      if (x - size.w / 2 < 4 || x + size.w / 2 > box.w - 4 || y - size.h / 2 < 4 || y + size.h / 2 > box.h - 4) return false;
      return !taken.some((other) => overlaps(rect, other));
    };

    let best = null;
    const sx = start.x * box.w;
    const sy = start.y * box.h;
    const hub = layout.sections[node.section];
    const inArea = (x, y) => {
      if (!hub) return true;
      return Math.hypot(x / box.w - hub.x, y / box.h - hub.y) <= SECTION_AREA_RADIUS;
    };
    const fitsHere = (x, y) => inArea(x, y) && fits(x, y);
    if (fitsHere(sx, sy)) best = { x: sx, y: sy };
    const maxRadius = Math.min(box.w, box.h) * 0.12;
    for (let ring = 1; !best && ring * 14 <= maxRadius; ring += 1) {
      const radius = ring * 14;
      const steps = 8 + ring * 2;
      for (let i = 0; i < steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2 + Math.PI / 2;
        const x = sx + Math.cos(angle) * radius;
        const y = sy + Math.sin(angle) * radius * 0.7;
        if (fitsHere(x, y)) {
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

/** Stable small number from a string, so each line keeps the same gentle bend. */
const bendFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 100) / 100 - 0.5) * 2; // -1 … 1
};

/** A slightly curved, hand-drawn path between two points (pixel space). */
const curve = (a, b, id, strength) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const offset = bendFor(id) * Math.min(len * strength, 40);
  const cx = mx + (-dy / len) * offset;
  const cy = my + (dx / len) * offset;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
};

const MAP_MOTION_CSS = `
.lm-grow { stroke-dasharray: 1; stroke-dashoffset: 1; animation: lm-grow 900ms cubic-bezier(.3,.7,.2,1) forwards; }
.lm-fade { opacity: 0; animation: lm-fade 700ms ease-out 350ms forwards; }
.lm-appear { animation: lm-fade 500ms ease-out both; }
@keyframes lm-grow { to { stroke-dashoffset: 0; } }
@keyframes lm-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .lm-grow { animation: none; stroke-dashoffset: 0; }
  .lm-fade, .lm-appear { animation: none; opacity: 1; }
}
`;

const NUDGE_KEYS = {
  ArrowLeft: [-0.02, 0],
  ArrowRight: [0.02, 0],
  ArrowUp: [0, -0.02],
  ArrowDown: [0, 0.02],
};

/**
 * The Life Map as a connected map: a middle, one area for each group of questions,
 * and a node for every line. A line sits in the area its question belongs to.
 * Nodes can be dragged, nudged with the arrow keys, or moved with the buttons
 * in the panel — dragging is never the only way.
 */
export default function LifeMapCanvas({ graph, positions, pick, selectedId, onSelect, onMove, onJumpToPart }) {
  const boxRef = useRef(null);
  const drag = useRef(null);
  const justDragged = useRef(false);
  const [preview, setPreview] = useState(null);

  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return undefined;
    const measure = () => setBox({ w: element.clientWidth, h: element.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => layoutGraph(graph, positions), [graph, positions]);
  const explore = useMemo(() => exploreLines(pick), [pick]);
  const sectionLabel = (key) => (graph.sections.find((section) => section.key === key) || {}).label || key;
  const settled = useMemo(() => settle(graph, layout, positions, box), [graph, layout, positions, box]);

  const spots = useMemo(() => {
    const resolved = {};
    Object.entries(settled).forEach(([id, spot]) => {
      resolved[id] = preview && preview.id === id ? { x: preview.x, y: preview.y } : spot;
    });
    return resolved;
  }, [settled, preview]);

  const nodesById = useMemo(() => {
    const map = {};
    graph.nodes.forEach((node) => {
      map[node.id] = node;
    });
    return map;
  }, [graph.nodes]);

  const edges = useMemo(() => {
    const lines = [];
    graph.sections.forEach((section) => {
      const hub = layout.sections[section.key];
      if (!hub) return;
      lines.push({ id: `hub-${section.key}`, from: layout.hub, to: hub, kind: "root" });
      section.nodes.forEach((node) => {
        lines.push({ id: `stem-${node.id}`, from: hub, to: spots[node.id] || hub, kind: "stem" });
      });
    });
    graph.links.forEach(([a, b]) => {
      if (!spots[a] || !spots[b]) return;
      lines.push({ id: `link-${a}-${b}`, from: spots[a], to: spots[b], kind: "chosen" });
    });
    return lines;
  }, [graph, layout, spots]);

  const startDrag = (event, id) => {
    if (event.button !== undefined && event.button !== 0) return;
    drag.current = { id, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event, id) => {
    if (!drag.current || drag.current.id !== id) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    drag.current.moved = true;
    setPreview({
      id,
      x: clamp((event.clientX - box.left) / box.width, 0.02, 0.98),
      y: clamp((event.clientY - box.top) / box.height, 0.02, 0.98),
    });
  };

  const endDrag = (id) => {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    if (current.moved && preview && preview.id === id) {
      onMove(id, { x: preview.x, y: preview.y });
      justDragged.current = true;
    }
    setPreview(null);
  };

  const nudge = (event, id) => {
    const delta = NUDGE_KEYS[event.key];
    if (!delta) return;
    event.preventDefault();
    const spot = spots[id] || { x: 0.5, y: 0.5 };
    onMove(id, { x: clamp(spot.x + delta[0], 0.02, 0.98), y: clamp(spot.y + delta[1], 0.02, 0.98) });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/60">
    <div
      ref={boxRef}
      role="group"
      aria-label="Life map. Move a line with the arrow keys, or open it to move it with buttons."
      style={{ minHeight: `${34 + Math.max(0, graph.nodes.length - 10) * 1.6}rem` }}
      className="relative h-[34rem] w-full overflow-hidden sm:h-[38rem]"
    >
      <style>{MAP_MOTION_CSS}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.07), transparent 60%), radial-gradient(ellipse at 80% 15%, hsl(var(--accent-ink-soft) / 0.08), transparent 45%)",
        }}
      />
      {box.w > 0 && box.h > 0 && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${box.w} ${box.h}`}
          aria-hidden="true"
        >
          {edges.map((edge) => {
            const a = { x: edge.from.x * box.w, y: edge.from.y * box.h };
            const b = { x: edge.to.x * box.w, y: edge.to.y * box.h };
            const d = curve(a, b, edge.id, edge.kind === "root" ? 0.12 : 0.22);
            if (edge.kind === "chosen") {
              return (
                <path
                  key={edge.id}
                  className="lm-fade"
                  d={d}
                  fill="none"
                  stroke="hsl(var(--accent-ink-soft))"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                />
              );
            }
            const root = edge.kind === "root";
            return (
              <g key={edge.id}>
                {root && (
                  <path d={d} fill="none" stroke="hsl(var(--primary) / 0.08)" strokeWidth={9} strokeLinecap="round" />
                )}
                <path
                  className="lm-grow"
                  pathLength={1}
                  d={d}
                  fill="none"
                  stroke={root ? "hsl(var(--primary) / 0.45)" : "hsl(var(--muted-foreground) / 0.45)"}
                  strokeWidth={root ? 2 : 1.25}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
      )}

      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-dashed border-primary/40 bg-background px-4 py-3 text-center"
        style={{ left: "50%", top: "50%" }}
      >
        <span className="font-heading text-[13px] leading-tight text-foreground">The life you’re actually living</span>
        <span className="text-[11px] text-muted-faint">questions and your lines</span>
      </div>

      {graph.sections.map((section) => {
        const hub = layout.sections[section.key];
        if (!hub) return null;
        return (
          <div
            key={section.key}
            className="lm-appear absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3 py-1.5 shadow-sm"
            style={{ left: `${hub.x * 100}%`, top: `${hub.y * 100}%` }}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${SECTION_DOT[section.key] || "bg-primary"}`} aria-hidden="true" />
            <span className="font-heading text-[12.5px] text-foreground">{section.label}</span>
            <span className="text-[11px] text-muted-faint">{section.nodes.length}</span>
          </div>
        );
      })}

      {graph.nodes.map((node) => {
        const spot = spots[node.id];
        if (!spot) return null;
        const label = node.label || node.text;
        const question = QUESTIONS_BY_ID[node.question_id];
        const area = sectionLabel(node.section);
        return (
          <button
            key={node.id}
            type="button"
            aria-pressed={selectedId === node.id}
            aria-label={`${area}${question ? `, ${question.branch}` : ""}: ${node.text || "not written yet"}. Open it, or use the arrow keys to move it.`}
            title={node.text}
            onPointerDown={(event) => startDrag(event, node.id)}
            onPointerMove={(event) => moveDrag(event, node.id)}
            onPointerUp={() => endDrag(node.id)}
            onPointerCancel={() => endDrag(node.id)}
            onKeyDown={(event) => nudge(event, node.id)}
            onClick={() => {
              if (justDragged.current) {
                justDragged.current = false;
                return;
              }
              onSelect(node.id);
            }}
            style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
            className={`lm-appear absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border bg-background px-2.5 py-1 text-left shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.25)] transition ${
              selectedId === node.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/60"
            }`}
          >
            <span className="block max-w-[9.5rem] truncate text-[12px] text-foreground">
              {label || "Not written yet"}
            </span>
          </button>
        );
      })}
    </div>
    {explore.length ? (
      <div className="border-t border-border px-4 py-3 sm:px-5">
        <p className="workbook-label">Worth exploring</p>
        <ul className="mt-2 space-y-1.5">
          {explore.map((line) => (
            <li key={line.id}>
              <button
                type="button"
                onClick={() => onJumpToPart && onJumpToPart(MAP_QUESTION_PARTS.length)}
                className="text-left text-[13px] leading-relaxed text-foreground hover:text-primary"
              >
                {line.label ? <span className="text-muted-faint">{line.label} </span> : null}
                {line.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    ) : null}
    </div>
  );
}