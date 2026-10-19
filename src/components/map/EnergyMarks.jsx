import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { addLine, updateLine } from "@/lib/lifeMap";
import { ENERGY_CHOICES, energyLine, energyTargets } from "@/lib/mapEnergy";

const DRAFT_KEY = "lifeMapEnergyDrafts";

export default function EnergyMarks({ graph, onEarlierPart }) {
  const targets = energyTargets(graph);
  const [selectedId, setSelectedId] = useState("");
  const [drafts, setDrafts] = useStore(DRAFT_KEY, {});
  const [saved, setSaved] = useState("");
  const source = targets.find((node) => node.id === selectedId);
  const existing = source ? graph.nodes.find((node) => node.question_id === "p3-energy" && node.links.includes(source.id)) : null;
  const draft = drafts[selectedId] || { choice: existing?.energy_choice || "", note: existing?.energy_note || "" };
  const change = (patch) => {
    setSaved("");
    setDrafts((current) => ({ ...current, [selectedId]: { ...draft, ...patch } }));
  };
  const save = () => {
    const line = energyLine(source, draft.choice, draft.note);
    if (!line) return;
    if (existing) updateLine("energy", existing.id, line);
    else addLine("energy", line);
    setSaved("Saved for “" + (source.label || source.text) + "”.");
  };

  return (
    <section className="mt-5 space-y-4 rounded-xl border border-border bg-background p-4 sm:p-5" aria-label="Mark an existing map entry">
      <div>
        <h4 className="text-[18px] font-medium text-foreground">Which entry are you marking?</h4>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Choose a place or activity you already added. Your energy response will be linked to that exact entry.</p>
      </div>
      {targets.length ? <>
        <label htmlFor="energy-entry" className="block text-[15px] font-medium">Entry from your map</label>
        <select id="energy-entry" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setSaved(""); }}
          className="w-full rounded-md border border-input bg-card px-3 py-3 text-[16px]">
          <option value="">Choose an entry…</option>
          {targets.map((node) => <option key={node.id} value={node.id}>{node.label || node.text}{node.question_id === "p1-places" ? " (place)" : ""}</option>)}
        </select>
        {source ? <div className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-secondary p-4">
            <p className="text-[14px] text-muted-foreground">You are answering about:</p>
            <p className="mt-1 whitespace-pre-wrap text-[18px] font-medium text-foreground">{source.label || source.text}</p>
            {source.label && source.text !== source.label ? <p className="mt-1 text-[15px]">{source.text}</p> : null}
          </div>
          <fieldset>
            <legend className="text-[16px] font-medium">How does this affect your energy?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ENERGY_CHOICES.map((choice) => <button key={choice.id} type="button" aria-pressed={draft.choice === choice.id}
                onClick={() => change({ choice: choice.id })}
                className={`min-h-11 rounded-md border px-4 py-2 text-[15px] ${draft.choice === choice.id ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground"}`}>{choice.label}</button>)}
            </div>
          </fieldset>
          <div>
            <label htmlFor="energy-note" className="block text-[16px] font-medium">Anything you want to explain about this entry? (Optional)</label>
            <Textarea id="energy-note" aria-label={"Energy note about " + (source.label || source.text)} value={draft.note} onChange={(event) => change({ note: event.target.value })} rows={3} className="mt-2" />
          </div>
          <Button type="button" disabled={!draft.choice} onClick={save}>Save energy mark</Button>
          {saved ? <p role="status" className="text-[15px] text-accent-ink">{saved}</p> : null}
          <p className="text-[14px] text-muted-foreground">You can change this later. Select another entry to mark that one too.</p>
        </div> : null}
      </> : <div className="space-y-3">
        <p className="text-[15px] text-muted-foreground">There are no earlier places or activities to select yet. Add something from your week first, or leave this section for later.</p>
        <Button type="button" variant="outline" onClick={onEarlierPart}>Go to your week</Button>
      </div>}
    </section>
  );
}
