import React, { useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { QUESTIONS_BY_ID, addLine, saveEnergyMark } from "@/lib/lifeMap";
import { ENERGY_CHOICES } from "@/lib/mapEnergy";
import { buildBranches, wouldCycle } from "@/lib/lifeMapBranches";

const FOLLOW_UPS = [
  { id: "p1-do", label: "What I do here", prompt: "What do you do at this place?", placeOnly: true },
  { id: "p1-how", label: "Getting here", prompt: "How do you get to and from this place?", placeOnly: true },
  { id: "p3-energy", label: "Energy", prompt: "How does this affect your energy?" },
  { id: "p3-star", label: "What matters to me", prompt: "What matters to you about this?" },
  { id: "p3-question", label: "Curiosity", prompt: "What are you curious about here?" },
  { id: "p3-bang", label: "Attention", prompt: "What part, if any, holds your attention?" },
  { id: "p3-dollar", label: "Money or resources", prompt: "What role do money or resources play in doing this?" },
  { id: "p4-in-the-way", label: "What gets in the way", prompt: "What gets in the way of this activity or place?" }
];

function BranchAnswer({ node, onSaved, onCancel }) {
  const isPlace = node.question_id === "p1-places" || (node.section === "places" && !node.question_id);
  const options = FOLLOW_UPS.filter((item) => (!item.placeOnly || isPlace) && (item.id !== "p3-energy" || !node.question_id?.startsWith("p3-")));
  const [questionId, setQuestionId] = useState(isPlace ? "p1-do" : options[0].id);
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState("");
  const question = options.find((item) => item.id === questionId) || options[0];
  const [error, setError] = useState("");
  const save = () => {
    if (question.id === "p3-energy") {
      if (!saveEnergyMark(node.id, energy, text)) { setError("This entry is no longer available."); return; }
    } else {
      addLine(QUESTIONS_BY_ID[question.id].section, {
        text: text.trim(), question_id: question.id, source_label: question.prompt,
        parent_id: node.id, parent_choice: "chosen", links: [node.id]
      });
    }
    onSaved();
  };
  return <section className="mt-4 space-y-4 rounded-lg border border-primary/30 bg-secondary p-4" aria-label={"Answer about " + (node.label || node.text)}>
    <p className="text-[14px] text-muted-foreground">Answering about:</p>
    <p className="break-words text-[17px] font-medium">{node.label || node.text}</p>
    <label className="block text-[14px] font-medium" htmlFor={"followup-" + node.id}>What would you like to add?</label>
    <select id={"followup-" + node.id} value={question.id} onChange={(event) => { setQuestionId(event.target.value); setText(""); setEnergy(""); }}
      className="w-full rounded-md border border-input bg-card px-3 py-2 text-[16px]">
      {options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    <p className="text-[16px] font-medium">{question.prompt}</p>
    {question.id === "p3-energy" ? <div className="flex flex-wrap gap-2" role="group" aria-label="Energy response">
      {ENERGY_CHOICES.map((item) => <button key={item.id} type="button" aria-pressed={energy === item.id} onClick={() => setEnergy(item.id)}
        className={`rounded-md border px-3 py-2 text-[15px] ${energy === item.id ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}>{item.label}</button>)}
    </div> : null}
    <label htmlFor={"followup-note-" + node.id} className="block text-[14px]">{question.id === "p3-energy" ? "Your explanation (optional)" : "Your answer"}</label>
    <Textarea id={"followup-note-" + node.id} value={text} onChange={(event) => setText(event.target.value)} rows={3} />
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={save} disabled={question.id === "p3-energy" ? !energy : !text.trim()}>Add to this branch</Button>
      <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}

function BranchNode({ id, tree, depth, selectedId, onSelect, onSetParent, expanded, setExpanded }) {
  const node = tree.nodesById[id];
  const children = tree.childrenById[id];
  const [adding, setAdding] = useState(false);
  const energy = ENERGY_CHOICES.find((item) => item.id === node.energy_choice);
  const title = energy ? energy.label : node.label || node.text;
  const note = energy ? node.energy_note : node.label && node.text !== node.label ? node.text : "";
  const relation = QUESTIONS_BY_ID[node.question_id]?.branch || (node.section === "placeless" ? "Activity" : "");
  const open = expanded[id] ?? depth === 0;
  const otherLinks = (node.links || []).filter((other) => tree.nodesById[other] && other !== tree.parentById[id] && tree.parentById[other] !== id);
  const parentOptions = Object.values(tree.nodesById).filter((other) => other.id !== id && !wouldCycle(id, other.id, tree.parentById));
  return <li className="min-w-0">
    <details open={open} onToggle={(event) => {
      const next = event.currentTarget.open;
      if (next !== open) setExpanded((current) => ({ ...current, [id]: next }));
    }} className={`lm-branch min-w-0 rounded-xl border bg-card ${selectedId === id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
      <summary className="flex cursor-pointer list-none items-start gap-2 p-4 [&::-webkit-details-marker]:hidden">
        <ChevronRight aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="min-w-0 flex-1">
          {relation ? <span className="mb-1 block text-[12px] text-muted-foreground">{relation}</span> : null}
          <span className="block whitespace-pre-wrap break-words text-[17px] font-medium leading-snug">{title}</span>
          <span className="mt-1 block text-[12px] text-muted-foreground">{children.length ? children.length + (children.length === 1 ? " answer attached" : " answers attached") : "Open to add an answer"}</span>
        </span>
      </summary>
      <div className="px-4 pb-4">
        {note ? <p className="mb-4 whitespace-pre-wrap break-words text-[16px] leading-relaxed">{note}</p> : null}
        {children.length ? <ul className={`mb-4 space-y-3 border-l-2 border-primary/30 ${depth < 3 ? "ml-1 pl-3 sm:ml-2 sm:pl-4" : "pl-2"}`}>
          {children.map((child) => <BranchNode key={child} id={child} tree={tree} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onSetParent={onSetParent} expanded={expanded} setExpanded={setExpanded} />)}
        </ul> : null}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <button type="button" onClick={() => setAdding((value) => !value)} className="inline-flex items-center gap-1 text-[14px] font-medium text-accent-ink underline underline-offset-2"><Plus className="h-4 w-4" aria-hidden="true" />Answer about this entry</button>
          <button type="button" onClick={() => onSelect(id)} className="text-[14px] text-muted-foreground underline underline-offset-2">Edit entry or connections</button>
        </div>
        {adding ? <BranchAnswer node={node} onCancel={() => setAdding(false)} onSaved={() => { setAdding(false); setExpanded((current) => ({ ...current, [id]: true })); }} /> : null}
        {onSetParent ? <details className="mt-3">
          <summary className="cursor-pointer text-[13px] text-muted-foreground">Choose or change its branch</summary>
          <label htmlFor={"parent-" + id} className="mt-2 block text-[14px]">Attach this answer beneath:</label>
          <select id={"parent-" + id} value={tree.parentById[id] || "__separate"} onChange={(event) => onSetParent(id, event.target.value === "__separate" ? "" : event.target.value)}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-[16px]">
            <option value="__separate">Keep as a separate starting entry</option>
            {parentOptions.map((other) => <option key={other.id} value={other.id}>{other.label || other.text}</option>)}
          </select>
        </details> : null}
        {otherLinks.length ? <div className="mt-3 text-[13px] text-muted-foreground">
          Also connected to: {otherLinks.map((other) => <button key={other} type="button" onClick={() => onSelect(other)} className="mr-3 underline underline-offset-2">{tree.nodesById[other].label || tree.nodesById[other].text}</button>)}
        </div> : null}
      </div>
    </details>
  </li>;
}

/** Normal-flow branches grow around the entry they describe, so cards never overlap. */
export default function LifeMapBoard({ graph, selectedId, onSelect, onSetParent }) {
  const tree = useMemo(() => buildBranches(graph), [graph]);
  const [expanded, setExpanded] = useStore("lifeMapBranchExpansion", {});
  const all = (value) => setExpanded(Object.fromEntries(graph.nodes.map((node) => [node.id, value])));
  const renderNode = (id) => <BranchNode key={id} id={id} tree={tree} depth={0} selectedId={selectedId} onSelect={onSelect} onSetParent={onSetParent} expanded={expanded} setExpanded={setExpanded} />;
  return <section className="min-w-0 space-y-5 rounded-xl border border-border bg-secondary/30 p-3 sm:p-5" aria-label="Your unfolding Life Map">
    <style>{`@media print { .lm-branch > div { display: block !important; } .lm-branch { break-inside: avoid; } }`}</style>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-heading text-2xl">Your life, unfolding</h2><p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">Open a place or activity. Its answers unfold underneath it. Add a follow-up from that entry to keep the connection clear.</p></div>
      <div className="flex gap-3 text-[14px]"><button type="button" onClick={() => all(true)} className="underline underline-offset-2">Expand all</button><button type="button" onClick={() => all(false)} className="underline underline-offset-2">Collapse all</button></div>
    </div>
    {tree.roots.length ? <ul className="grid min-w-0 items-start gap-4 lg:grid-cols-2">{tree.roots.map(renderNode)}</ul> : <p className="rounded-lg border border-dashed border-border p-4 text-[15px] text-muted-foreground">Add a place or activity to start your first branch.</p>}
    {tree.unlinked.length ? <section className="space-y-3 border-t border-border pt-5" aria-label="Answers not yet placed">
      <h3 className="text-[17px] font-medium">Answers not yet placed in a branch</h3>
      <p className="text-[14px] text-muted-foreground">These answers are preserved. Open one and choose its branch, or keep it as a separate starting entry.</p>
      <ul className="space-y-3">{tree.unlinked.map(renderNode)}</ul>
    </section> : null}
  </section>;
}
