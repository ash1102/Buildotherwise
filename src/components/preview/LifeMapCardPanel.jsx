import React from "react";
import { Input } from "@/components/ui/input";

/**
 * The panel for the selected card. Marks, movement, connections and removal all
 * live here, each with a real label and reachable by keyboard.
 */
export default function LifeMapCardPanel({
  block,
  card,
  cards,
  connections,
  onUpdate,
  onRemove,
  onToggleMark,
  onMove,
  onConnect,
  onDisconnect,
}) {
  if (!card) {
    return (
      <p className="rounded-lg border border-dashed border-input bg-secondary p-4 text-[15px] text-muted-faint">
        Select a card to edit it, mark it, or connect it to another card.
      </p>
    );
  }

  const others = cards.filter((item) => item.id !== card.id);
  const linked = connections.filter((pair) => pair.includes(card.id));
  const linkOptions = others.filter(
    (item) => !linked.some((pair) => pair.includes(item.id))
  );

  return (
    <div className="space-y-4 rounded-lg border border-border bg-secondary p-4">
      <div>
        <label htmlFor={`${card.id}-text`} className="block text-[15px] font-medium text-foreground">
          What this card says
        </label>
        <Input
          id={`${card.id}-text`}
          value={card.text || ""}
          onChange={(event) => onUpdate(card.id, { text: event.target.value })}
          className="mt-2"
        />
      </div>

      <fieldset>
        <legend className="text-[15px] font-medium text-foreground">Tags</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(block.marks || []).map((mark) => {
            const active = (card.marks || []).includes(mark.id);
            return (
              <button
                key={mark.id}
                type="button"
                aria-pressed={active}
                title={mark.meaning}
                onClick={() => onToggleMark(card.id, mark.id)}
                className={`rounded-md border px-2.5 py-1.5 text-[13px] transition ${
                  active ? "border-primary bg-primary-wash font-medium text-foreground" : "border-input bg-card text-foreground"
                }`}
              >
                <span className="font-semibold">{mark.label}</span>
                {mark.meaning ? <span className="ml-1.5 text-muted-foreground">{mark.meaning}</span> : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[15px] font-medium text-foreground">Move on the map</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => onMove(card.id, { x: card.x - 0.05 })} className="rounded-md border border-input bg-card px-3 py-1.5 text-[13px]">
            Left
          </button>
          <button type="button" onClick={() => onMove(card.id, { x: card.x + 0.05 })} className="rounded-md border border-input bg-card px-3 py-1.5 text-[13px]">
            Right
          </button>
          <button type="button" onClick={() => onMove(card.id, { y: card.y - 0.05 })} className="rounded-md border border-input bg-card px-3 py-1.5 text-[13px]">
            Up
          </button>
          <button type="button" onClick={() => onMove(card.id, { y: card.y + 0.05 })} className="rounded-md border border-input bg-card px-3 py-1.5 text-[13px]">
            Down
          </button>
        </div>
        <p className="mt-2 text-[13px] text-muted-faint">
          A card can also be dragged, or moved with the arrow keys while it is selected. Dragging is never required.
        </p>
      </fieldset>

      <div>
        <label htmlFor={`${card.id}-connect`} className="block text-[15px] font-medium text-foreground">
          Connect this card to another (optional)
        </label>
        <select
          id={`${card.id}-connect`}
          value=""
          onChange={(event) => event.target.value && onConnect(card.id, event.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-[15px] text-foreground"
        >
          <option value="">Choose a card…</option>
          {linkOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.text || "Untitled card"}
            </option>
          ))}
        </select>
        {linked.length ? (
          <ul className="mt-2 space-y-1">
            {linked.map((pair) => {
              const otherId = pair.find((id) => id !== card.id);
              const other = cards.find((item) => item.id === otherId);
              return (
                <li key={`${pair[0]}-${pair[1]}`} className="flex items-center justify-between gap-3 text-[14px] text-muted-foreground">
                  <span>Connected to {other ? other.text || "Untitled card" : "a removed card"}</span>
                  <button
                    type="button"
                    onClick={() => onDisconnect(card.id, otherId)}
                    className="font-medium text-accent-ink underline underline-offset-2"
                  >
                    Remove connection
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onRemove(card.id)}
        className="rounded-md border border-input bg-card px-3 py-2 text-[14px] text-foreground transition hover:bg-secondary"
      >
        Remove this card
      </button>
    </div>
  );
}