import React, { useRef } from "react";

/**
 * The map itself: cards placed on a canvas, lines for the connections the person
 * made. Cards can be dragged, and can equally be moved with the arrow keys or
 * from the panel below, so dragging is never required.
 */
export default function LifeMapCanvas({ block, cards, connections, selectedId, onSelect, onMove }) {
  const dragRef = useRef(null);

  const position = (card, index) => ({
    x: typeof card.x === "number" ? card.x : 0.5,
    y: typeof card.y === "number" ? card.y : 0.5 + (index % 3) * 0.06,
  });

  const byId = {};
  cards.forEach((card, index) => {
    byId[card.id] = position(card, index);
  });

  const kindOf = (card) => (block.kinds || []).find((kind) => kind.id === card.kind) || {};
  const markOf = (id) => (block.marks || []).find((mark) => mark.id === id) || { label: id };

  const nudge = (card, event) => {
    const step = event.shiftKey ? 0.08 : 0.03;
    const current = byId[card.id];
    const moves = {
      ArrowLeft: { x: current.x - step, y: current.y },
      ArrowRight: { x: current.x + step, y: current.y },
      ArrowUp: { x: current.x, y: current.y - step },
      ArrowDown: { x: current.x, y: current.y + step },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onMove(card.id, {
      x: Math.min(0.94, Math.max(0.06, move.x)),
      y: Math.min(0.94, Math.max(0.06, move.y)),
    });
  };

  const handlePointerMove = (event, card) => {
    if (!dragRef.current || dragRef.current !== card.id) return;
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    onMove(card.id, {
      x: Math.min(0.94, Math.max(0.06, (event.clientX - rect.left) / rect.width)),
      y: Math.min(0.94, Math.max(0.06, (event.clientY - rect.top) / rect.height)),
    });
  };

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-border bg-background sm:h-[420px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {connections.map((pair, index) => {
          const a = byId[pair[0]];
          const b = byId[pair[1]];
          if (!a || !b) return null;
          return (
            <line
              key={`${pair[0]}-${pair[1]}-${index}`}
              x1={a.x * 100}
              y1={a.y * 100}
              x2={b.x * 100}
              y2={b.y * 100}
              stroke="hsl(var(--input))"
              strokeWidth="0.3"
              strokeDasharray="1.4 1.2"
            />
          );
        })}
      </svg>

      {cards.length === 0 ? (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-[15px] text-muted-faint">
          Nothing on the map yet. Add a card, or load the invented example.
        </p>
      ) : null}

      {cards.map((card) => {
        const spot = byId[card.id];
        const kind = kindOf(card);
        const active = selectedId === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            onKeyDown={(event) => nudge(card, event)}
            onPointerDown={(event) => {
              dragRef.current = card.id;
              if (event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => handlePointerMove(event, card)}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
            className={`absolute max-w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-2 text-left text-[13px] leading-snug transition ${
              kind.dashed ? "border-dashed" : ""
            } ${active ? "border-primary bg-primary-wash" : "border-input bg-card"} text-foreground`}
          >
            <span className="block">{card.text || "Untitled card"}</span>
            {(card.marks || []).length ? (
              <span className="mt-1 flex flex-wrap gap-1">
                {(card.marks || []).map((mark) => (
                  <span key={mark} className="rounded bg-secondary px-1 text-[11px] font-semibold text-muted-foreground">
                    {markOf(mark).label}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}