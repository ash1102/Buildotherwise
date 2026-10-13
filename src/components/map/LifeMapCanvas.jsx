import React, { useEffect, useMemo, useRef, useState } from "react";
import { layoutGraph } from "@/lib/lifeMap";

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
 * nothing lands on top of another line, a question, or the middle. Lines the
 * person placed stay exactly where they put them.
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
    const sx = clamp(start.x * box.w, size.w / 2 + 4, box.w - size.w / 2 - 4);
    const sy = clamp(start.y * box.h, size.h / 2 + 4, box.h - size.h / 2 - 4);
    if (fits(sx, sy)) best = { x: sx, y: sy };
    for (let ring = 1; !best && ring <= 30; ring += 1) {
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

const NUDGE_KEYS = {
  ArrowLeft: [-0.02, 0],
  ArrowRight: [0.02, 0],
  ArrowUp: [0, -0.02],
  ArrowDown: [0, 0.02],
};

/**
 * The Life Map as a connected map: a middle, one hub per question, and a node for
 * every line. Nodes can be dragged, nudged with the arrow keys, or moved with the
 * buttons in the panel — dragging is never the only way.
 */
export default function LifeMapCanvas({ graph, positions, selectedId, onSelect, onMove }) {
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
      lines.push({ id: `hub-${section.key}`, from: layout.hub, to: hub, chosen: false });
      section.nodes.forEach((node) => {
        lines.push({ id: `stem-${node.id}`, from: hub, to: spots[node.id] || hub, chosen: false });
      });
    });
    graph.links.forEach(([a, b]) => {
      if (!spots[a] || !spots[b]) return;
      lines.push({ id: `link-${a}-${b}`, from: spots[a], to: spots[b], chosen: true });
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
    <div
      ref={boxRef}
      role="group"
      aria-label="Life map. Move a line with the arrow keys, or open it to move it with buttons."
      className="relative h-[34rem] w-full overflow-hidden rounded-lg border border-border bg-card/60 sm:h-[38rem]"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.from.x * 100}
            y1={edge.from.y * 100}
            x2={edge.to.x * 100}
            y2={edge.to.y * 100}
            stroke={edge.chosen ? "hsl(var(--accent-ink))" : "hsl(var(--border))"}
            strokeWidth={edge.chosen ? 0.5 : 0.35}
            strokeDasharray={edge.chosen ? "2 1.4" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

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
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3 py-1.5"
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
        return (
          <button
            key={node.id}
            type="button"
            aria-pressed={selectedId === node.id}
            aria-label={`${nodesById[node.id]?.section || ""} line: ${node.text || "not written yet"}. Open it, or use the arrow keys to move it.`}
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
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border bg-background px-2.5 py-1 text-left shadow-sm transition ${
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
  );
}