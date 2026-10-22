import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { MAP_SECTIONS, layoutGraph, settleLines, usePositions } from "@/lib/lifeMap";
import { buildBranches } from "@/lib/lifeMapBranches";
import { hybridScene } from "@/lib/lifeMapHybrid";

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.2;
const RESET_VIEW = { x: 0, y: 0, scale: 1 };

/**
 * One map of the life already entered: areas around "My life", entries near
 * the area they belong to, and a connection only where the person made one.
 * Attached answers stay closed until that entry is opened.
 */
export default function HybridMap({ graph, selectedId, highlightSection, onSelect, onMove }) {
  const saved = usePositions();
  const layout = useMemo(() => layoutGraph(graph, saved), [graph, saved]);
  const tree = useMemo(() => buildBranches(graph), [graph]);
  const scene = useMemo(
    () => hybridScene(graph, tree, { focusId: selectedId || "" }),
    [graph, tree, selectedId]
  );
  const [box, setBox] = useState({ w: 0, h: 0 });
  const positions = useMemo(() => settleLines(graph, layout, saved, box), [graph, layout, saved, box]);
  const [view, setView] = useState(RESET_VIEW);
  const viewportRef = useRef(null);
  const worldRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const measure = () => {
      const rect = viewport.getBoundingClientRect();
      setBox({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    const onWheel = (event) => {
      event.preventDefault();
      const next = event.deltaY > 0 ? -0.08 : 0.08;
      setView((current) => ({
        ...current,
        scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale + next)),
      }));
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      viewport.removeEventListener("wheel", onWheel);
    };
  }, []);

  const spot = (id) => {
    if (id === "center") return layout.hub;
    if (String(id).startsWith("section:")) return layout.sections[id.slice("section:".length)];
    return positions[id];
  };

  const zoom = (delta) => {
    setView((current) => ({
      ...current,
      scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale + delta)),
    }));
  };

  const onBackgroundPointerDown = (event) => {
    if (event.target !== event.currentTarget) return;
    dragRef.current = { kind: "pan", x: event.clientX, y: event.clientY, origin: view };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "pan") {
      setView({
        ...drag.origin,
        x: drag.origin.x + event.clientX - drag.x,
        y: drag.origin.y + event.clientY - drag.y,
      });
      return;
    }
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) movedRef.current = true;
    const rect = drag.world?.getBoundingClientRect();
    if (!rect) return;
    if (!rect.width || !rect.height) return;
    onMove(drag.id, {
      x: Math.min(0.94, Math.max(0.06, (event.clientX - rect.left) / rect.width)),
      y: Math.min(0.92, Math.max(0.08, (event.clientY - rect.top) / rect.height)),
    });
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.kind === "node" && !movedRef.current) onSelect(drag.id);
  };

  const nudge = (id, event) => {
    const step = event.shiftKey ? 0.06 : 0.03;
    const current = positions[id] || { x: 0.5, y: 0.5 };
    const moves = {
      ArrowLeft: { x: current.x - step, y: current.y },
      ArrowRight: { x: current.x + step, y: current.y },
      ArrowUp: { x: current.x, y: current.y - step },
      ArrowDown: { x: current.x, y: current.y + step },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onMove(id, {
      x: Math.min(0.94, Math.max(0.06, move.x)),
      y: Math.min(0.92, Math.max(0.08, move.y)),
    });
  };

  return (
    <section className="min-w-0" aria-label="Your life map">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          Areas keep the map readable. A line between two entries appears only when you connect them. Open an entry to see the answers attached to it.
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-full border border-border bg-card p-2" aria-label="Zoom out" onClick={() => zoom(-0.15)}>
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className="rounded-full border border-border bg-card p-2" aria-label="Zoom in" onClick={() => zoom(0.15)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className="rounded-full border border-border bg-card p-2" aria-label="Reset the view" onClick={() => setView(RESET_VIEW)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className="relative h-[70vh] min-h-[520px] touch-none overflow-hidden rounded-xl border border-border bg-secondary/40"
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={worldRef}
          className="absolute inset-0 origin-center"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
          onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;
            dragRef.current = { kind: "pan", x: event.clientX, y: event.clientY, origin: view };
            viewportRef.current?.setPointerCapture?.(event.pointerId);
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {scene.edges.map((edge) => {
              const from = spot(edge.from);
              const to = spot(edge.to);
              if (!from || !to) return null;
              const chosen = edge.kind === "chosen";
              return (
                <line
                  key={`${edge.kind}-${edge.from}-${edge.to}`}
                  x1={from.x * 100}
                  y1={from.y * 100}
                  x2={to.x * 100}
                  y2={to.y * 100}
                  stroke="currentColor"
                  className={chosen ? "text-primary" : "text-muted-foreground/40"}
                  strokeWidth={chosen ? 0.45 : 0.22}
                  strokeDasharray={edge.kind === "detail" ? "1.2 0.9" : undefined}
                />
              );
            })}
          </svg>

          <div
            className="absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-card px-3 py-3 text-center"
            style={{ left: `${layout.hub.x * 100}%`, top: `${layout.hub.y * 100}%` }}
          >
            <p className="text-[13px] font-semibold text-foreground">My life</p>
          </div>

          {MAP_SECTIONS.map((section) => {
            const hub = layout.sections[section.key];
            if (!hub) return null;
            const active = highlightSection === section.key;
            const occupied = scene.nodes.some((node) => node.section === section.key);
            return (
              <div
                key={section.key}
                className={`absolute w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1.5 text-center text-[12px] font-medium ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                } ${occupied || active ? "" : "opacity-60"}`}
                style={{ left: `${hub.x * 100}%`, top: `${hub.y * 100}%` }}
              >
                {section.label}
              </div>
            );
          })}

          {scene.nodes.map((node) => {
            const at = positions[node.id];
            if (!at) return null;
            const hidden = scene.hiddenById[node.id] || 0;
            const active = selectedId === node.id;
            const label = node.label || node.text || "Untitled";
            return (
              <button
                key={node.id}
                type="button"
                aria-pressed={active}
                onKeyDown={(event) => nudge(node.id, event)}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  movedRef.current = false;
                  dragRef.current = { kind: "node", id: node.id, world: worldRef.current, x: event.clientX, y: event.clientY };
                  viewportRef.current?.setPointerCapture?.(event.pointerId);
                }}
                onClick={() => {
                  if (movedRef.current) {
                    movedRef.current = false;
                    return;
                  }
                  onSelect(node.id);
                }}
                className={`absolute w-40 -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-2 text-left ${
                  active ? "border-primary bg-card ring-2 ring-primary/30" : "border-border bg-card"
                }`}
                style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%` }}
              >
                <span className="line-clamp-3 text-[13px] leading-snug text-foreground">{label}</span>
                {hidden ? (
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {hidden} attached {hidden === 1 ? "answer" : "answers"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {graph.nodes.length === 0 ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[14px] text-muted-foreground">
            Answers show up here as you add them.
          </p>
        ) : null}
      </div>
    </section>
  );
}
