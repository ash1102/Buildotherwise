import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const NUDGES = [
  { key: "left", label: "Move this line left", dx: -0.04, dy: 0, Icon: ArrowLeft },
  { key: "right", label: "Move this line right", dx: 0.04, dy: 0, Icon: ArrowRight },
  { key: "up", label: "Move this line up", dx: 0, dy: -0.04, Icon: ArrowUp },
  { key: "down", label: "Move this line down", dx: 0, dy: 0.04, Icon: ArrowDown },
];

/** One line on the map, opened: the original answer, a short label, its links. */
export default function LifeMapNodePanel({
  node,
  section,
  entries,
  others,
  connections,
  onSave,
  onLinkEntry,
  onConnect,
  onDisconnect,
  onNudge,
  onRemove,
  onClose,
  onSplit,
}) {
  const [label, setLabel] = useState(node.label || "");
  const [text, setText] = useState(node.text || "");

  useEffect(() => {
    setLabel(node.label || "");
    setText(node.text || "");
  }, [node.id, node.label, node.text]);

  const linked = connections
    .map((pair) => pair.find((id) => id !== node.id))
    .filter(Boolean)
    .map((id) => others.find((item) => item.id === id))
    .filter(Boolean);

  const journalEntry = node.entry_id ? entries.find((entry) => entry.id === node.entry_id) : null;
  const changed = label.trim() !== (node.label || "") || text.trim() !== (node.text || "");
  const pieces = String(node.text || "")
    .split(/[\n,;]+/)
    .map((piece) => piece.trim())
    .filter(Boolean);
  const canSplit = Boolean(onSplit) && pieces.length > 1;

  return (
    <section className="rounded-lg border border-primary/30 bg-card p-5" aria-label="The line you opened">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="workbook-label">{section ? section.label : "On the map"}</p>
          <h3 className="mt-1.5 font-heading text-lg">{label || text || "Not written yet"}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close this line"
          className="shrink-0 text-muted-faint transition hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="workbook-label block" htmlFor="map-node-label">
            Short label on the map
          </label>
          <Input
            id="map-node-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="A few words"
            className="mt-2 border-border bg-background text-[14px]"
          />
        </div>
        <div>
          <label className="workbook-label block" htmlFor="map-node-text">
            The line itself
          </label>
          <Textarea
            id="map-node-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            className="mt-2 min-h-[3rem] border-border bg-background text-[14px] leading-relaxed"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={!changed || !text.trim()}
          onClick={() => onSave({ label: label.trim(), text: text.trim() })}
          className="rounded-full"
        >
          Save this line
        </Button>
        {canSplit ? (
          <Button type="button" variant="outline" onClick={() => onSplit(pieces)} className="rounded-full">
            Split into {pieces.length} separate lines
          </Button>
        ) : null}
        <p className="text-[12.5px] text-muted-faint">
          {node.source_code ? "Corrections here change the map line, not the step answer." : "Saved to your account."}
        </p>
      </div>

      {onNudge ? (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] text-muted-foreground">Move it without dragging:</span>
        {NUDGES.map(({ key, label: nudgeLabel, dx, dy, Icon }) => (
          <button
            key={key}
            type="button"
            aria-label={nudgeLabel}
            onClick={() => onNudge(dx, dy)}
            className="rounded-full border border-border bg-background p-1.5 text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      ) : null}

      {node.source_code ? (
        <p className="mt-4 border-l-2 border-primary/30 pl-3 text-[13px] leading-relaxed text-muted-foreground">
          Brought in from {node.source_label || "a step"}.{" "}
          <Link to={`/lesson/${node.source_code}`} className="text-primary underline decoration-border underline-offset-4">
            open that step
          </Link>
        </p>
      ) : node.source_label ? (
        <p className="mt-4 border-l-2 border-primary/30 pl-3 text-[13px] leading-relaxed text-muted-foreground">
          Your answer to: {node.source_label}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="workbook-label block" htmlFor="map-node-journal">
            A journal line behind this
          </label>
          {entries.length ? (
            <select
              id="map-node-journal"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
              value={node.entry_id || ""}
              onChange={(event) => onLinkEntry(event.target.value)}
            >
              <option value="">No link</option>
              {entries.slice(0, 40).map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {(entry.lesson_title || "Written freely") + ": " + entry.body.slice(0, 50)}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-2 text-[13px] text-muted-faint">Your journal is empty, so there is nothing to link yet.</p>
          )}
          {journalEntry ? (
            <p className="mt-2 border-l-2 border-primary/30 pl-3 text-[13px] leading-relaxed text-muted-foreground">
              {journalEntry.body}
            </p>
          ) : null}
        </div>

        <div>
          <label className="workbook-label block" htmlFor="map-node-connect">
            Connect this line to another
          </label>
          {others.length > 1 ? (
            <select
              id="map-node-connect"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
              value=""
              onChange={(event) => {
                if (event.target.value) onConnect(event.target.value);
              }}
            >
              <option value="">Choose a line…</option>
              {others
                .filter((item) => item.id !== node.id && !linked.some((entry) => entry.id === item.id))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label || item.text}
                  </option>
                ))}
            </select>
          ) : (
            <p className="mt-2 text-[13px] text-muted-faint">One line so far. Connections appear once there are two.</p>
          )}

          {linked.length ? (
            <ul className="mt-3 space-y-2">
              {linked.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate text-muted-foreground">{item.label || item.text}</span>
                  <button
                    type="button"
                    onClick={() => onDisconnect(item.id)}
                    className="shrink-0 text-muted-faint underline underline-offset-2 transition hover:text-primary"
                  >
                    Unlink
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[12.5px] text-muted-faint">No connections chosen yet. You decide what links to what.</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-muted-faint transition hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Remove this line from the map
      </button>
    </section>
  );
}