import React from "react";
import { Input } from "@/components/ui/input";

/**
 * The same map, read as a list. Every card can be edited, marked, connected and
 * removed here, so nothing on this screen depends on dragging.
 */
export default function LifeMapListView({ block, cards, connections, onUpdate, onRemove, onToggleMark, onConnect, onDisconnect }) {
  if (!cards.length) {
    return (
      <p className="rounded-lg border border-dashed border-input bg-secondary p-4 text-[15px] text-muted-faint">
        Nothing on the map yet. Add a card, or load the invented example.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {(block.kinds || []).map((kind) => {
        const group = cards.filter((card) => card.kind === kind.id);
        if (!group.length) return null;
        return (
          <div key={kind.id}>
            <h4>{kind.label}</h4>
            <ul className="mt-3 space-y-4">
              {group.map((card) => {
                const linked = connections.filter((pair) => pair.includes(card.id));
                const linkOptions = cards.filter(
                  (item) => item.id !== card.id && !linked.some((pair) => pair.includes(item.id))
                );
                return (
                  <li key={card.id} className="rounded-lg border border-border bg-background p-4">
                    <label htmlFor={`list-${card.id}-text`} className="block text-[14px] font-medium text-foreground">
                      Card text
                    </label>
                    <Input
                      id={`list-${card.id}-text`}
                      value={card.text || ""}
                      onChange={(event) => onUpdate(card.id, { text: event.target.value })}
                      className="mt-2"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
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
                              active
                                ? "border-primary bg-primary-wash font-medium text-foreground"
                                : "border-input bg-card text-foreground"
                            }`}
                          >
                            <span className="font-semibold">{mark.label}</span>
                            <span className="ml-1.5 text-muted-foreground">{mark.meaning}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`list-${card.id}-connect`} className="block text-[14px] font-medium text-foreground">
                          Start a connection
                        </label>
                        <select
                          id={`list-${card.id}-connect`}
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
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-foreground">Connections</p>
                        {linked.length ? (
                          <ul className="mt-2 space-y-1">
                            {linked.map((pair) => {
                              const otherId = pair.find((id) => id !== card.id);
                              const other = cards.find((item) => item.id === otherId);
                              return (
                                <li key={`${pair[0]}-${pair[1]}`} className="flex items-center justify-between gap-3 text-[14px] text-muted-foreground">
                                  <span>{other ? other.text || "Untitled card" : "a removed card"}</span>
                                  <button
                                    type="button"
                                    onClick={() => onDisconnect(card.id, otherId)}
                                    className="font-medium text-accent-ink underline underline-offset-2"
                                  >
                                    Remove
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="mt-2 text-[14px] text-muted-faint">None yet. Connections are optional.</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(card.id)}
                      className="mt-3 rounded-md border border-input bg-card px-3 py-2 text-[14px] text-foreground transition hover:bg-secondary"
                    >
                      Remove this card
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}