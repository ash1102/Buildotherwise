import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { makeId } from "@/lib/store";
import { joinSummary, parseValues } from "@/lib/preview/responses";
import SaveRow from "./SaveRow";
import LifeMapCanvas from "./LifeMapCanvas";
import LifeMapListView from "./LifeMapListView";
import LifeMapCardPanel from "./LifeMapCardPanel";

const EMPTY = { cards: [], connections: [], fields: {}, nothingYet: false };

/**
 * The Life Map: the same data drawn as a map and read as a list. Nothing is
 * scored, nothing is interpreted, and no marker means anything about the person
 * who chose it.
 */
export default function LifeMapBlock({ block, record, onSave, saving, canSave }) {
  const [values, setValues] = useState(() => ({ ...EMPTY, ...parseValues(record) }));
  const [view, setView] = useState("map");
  const [selectedId, setSelectedId] = useState("");
  const [newKind, setNewKind] = useState((block.kinds || [{}])[0].id);
  const [newText, setNewText] = useState("");
  const [saved, setSaved] = useState(Boolean(record));

  const cards = values.cards || [];
  const connections = values.connections || [];
  const selected = cards.find((card) => card.id === selectedId) || null;

  const change = (changes) => {
    setSaved(false);
    setValues((current) => ({ ...current, ...changes }));
  };

  const addCard = () => {
    if (!newText.trim()) return;
    const id = makeId("card");
    change({
      cards: [...cards, { id, kind: newKind, text: newText.trim(), marks: [], x: 0.5, y: 0.55 }],
    });
    setNewText("");
    setSelectedId(id);
  };

  const updateCard = (id, changes) =>
    setValues((current) => ({
      ...current,
      cards: (current.cards || []).map((card) => (card.id === id ? { ...card, ...changes } : card)),
    }));

  const removeCard = (id) =>
    change({
      cards: cards.filter((card) => card.id !== id),
      connections: connections.filter((pair) => !pair.includes(id)),
    });

  const toggleMark = (id, markId) => {
    const card = cards.find((item) => item.id === id);
    const marks = card.marks || [];
    updateCard(id, { marks: marks.includes(markId) ? marks.filter((mark) => mark !== markId) : [...marks, markId] });
    setSaved(false);
  };

  const moveCard = (id, spot) => {
    const card = cards.find((item) => item.id === id);
    updateCard(id, {
      x: Math.min(0.94, Math.max(0.06, spot.x === undefined ? card.x : spot.x)),
      y: Math.min(0.94, Math.max(0.06, spot.y === undefined ? card.y : spot.y)),
    });
  };

  const connect = (a, b) => {
    if (!a || !b || a === b || connections.some((pair) => pair.includes(a) && pair.includes(b))) return;
    change({ connections: [...connections, [a, b]] });
  };

  const disconnect = (a, b) => change({ connections: connections.filter((pair) => !(pair.includes(a) && pair.includes(b))) });

  const loadExample = () => {
    change({
      cards: block.example.cards.map((card) => ({ ...card, marks: [...card.marks] })),
      connections: block.example.connections.map((pair) => [...pair]),
      nothingYet: false,
    });
    setSelectedId("");
  };

  const kindLabel = (id) => ((block.kinds || []).find((kind) => kind.id === id) || {}).label || id;
  const markLabel = (id) => ((block.marks || []).find((mark) => mark.id === id) || {}).label || id;

  const handleSave = async () => {
    const cardLines = cards.map(
      (card) => `${kindLabel(card.kind)}: ${card.text}${(card.marks || []).length ? ` [${(card.marks || []).map(markLabel).join(" ")}]` : ""}`
    );
    const connectionLines = connections.map((pair) => {
      const a = cards.find((card) => card.id === pair[0]);
      const b = cards.find((card) => card.id === pair[1]);
      return `Connected: ${a ? a.text : "a removed card"}, ${b ? b.text : "a removed card"}`;
    });
    const fieldLines = joinSummary(
      (block.fields || []).map((field) => ({ label: field.label, value: (values.fields || {})[field.id] }))
    );
    const nothing = values.nothingYet ? block.nothingYet.message : "";
    await onSave({
      values,
      text: [...cardLines, ...connectionLines, fieldLines, nothing].filter(Boolean).join("\n") || "No response",
    });
    setSaved(true);
  };

  return (
    <div>
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">{block.instruction}</p>

      <div className="no-print mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={view === "map"}
          onClick={() => setView("map")}
          className={`rounded-md border px-3.5 py-2 text-[14px] transition ${
            view === "map" ? "border-primary bg-primary-wash font-medium text-foreground" : "border-input bg-card text-foreground"
          }`}
        >
          Map view
        </button>
        <button
          type="button"
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
          className={`rounded-md border px-3.5 py-2 text-[14px] transition ${
            view === "list" ? "border-primary bg-primary-wash font-medium text-foreground" : "border-input bg-card text-foreground"
          }`}
        >
          List view
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-md border border-input bg-card px-3.5 py-2 text-[14px] text-foreground transition hover:bg-secondary"
        >
          {block.example.label}
        </button>
      </div>
      <p className="mt-2 text-[13px] text-muted-faint">{block.example.note}</p>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div>
          {view === "map" ? (
            <LifeMapCanvas
              block={block}
              cards={cards}
              connections={connections}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onMove={moveCard}
            />
          ) : (
            <LifeMapListView
              block={block}
              cards={cards}
              connections={connections}
              onUpdate={updateCard}
              onRemove={removeCard}
              onToggleMark={toggleMark}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary p-4">
            <label htmlFor={`${block.id}-new-card`} className="block text-[15px] font-medium text-foreground">
              Add a card
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(block.kinds || []).map((kind) => (
                <button
                  key={kind.id}
                  type="button"
                  aria-pressed={newKind === kind.id}
                  onClick={() => setNewKind(kind.id)}
                  className={`rounded-md border px-3 py-1.5 text-[13px] transition ${
                    newKind === kind.id ? "border-primary bg-primary-wash font-medium" : "border-input bg-card"
                  }`}
                >
                  {kind.label}
                </button>
              ))}
            </div>
            <Input
              id={`${block.id}-new-card`}
              value={newText}
              onChange={(event) => setNewText(event.target.value)}
              placeholder="One line about it"
              className="mt-2"
            />
            <button
              type="button"
              onClick={addCard}
              className="mt-2 rounded-md bg-primary px-3.5 py-2 text-[14px] font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Add this card
            </button>
          </div>

          <LifeMapCardPanel
            block={block}
            card={selected}
            cards={cards}
            connections={connections}
            onUpdate={updateCard}
            onRemove={removeCard}
            onToggleMark={toggleMark}
            onMove={moveCard}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {(block.fields || []).map((field) => (
          <div key={field.id}>
            <label htmlFor={`${block.id}-${field.id}`} className="block text-[15px] font-medium text-foreground">
              {field.label}
            </label>
            <Textarea
              id={`${block.id}-${field.id}`}
              value={(values.fields || {})[field.id] || ""}
              onChange={(event) => change({ fields: { ...(values.fields || {}), [field.id]: event.target.value } })}
              placeholder="Optional."
              className="mt-2"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-input bg-secondary p-4">
        <button
          type="button"
          onClick={() => change({ nothingYet: true })}
          className="rounded-md border border-input bg-card px-3.5 py-2 text-[14px] text-foreground transition hover:bg-secondary"
        >
          {block.nothingYet.label}
        </button>
        {values.nothingYet ? (
          <p aria-live="polite" className="mt-3 text-[16px] leading-relaxed text-foreground">
            {block.nothingYet.message}
          </p>
        ) : null}
      </div>

      <SaveRow
        onSave={handleSave}
        saving={saving}
        canSave={canSave}
        savedLabel={saved ? "Saved to your account." : "Not saved yet."}
        signedOutNote="Log in to save your own map in this preview."
      />
    </div>
  );
}