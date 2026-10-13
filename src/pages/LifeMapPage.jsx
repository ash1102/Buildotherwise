import React, { useMemo, useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLifeMap, useWorkbook } from "@/lib/workbook";
import { useJournalEntries } from "@/lib/journal";
import useCurriculum from "@/hooks/useCurriculum";
import { isOpenerLesson } from "@/lib/curriculum";
import { downloadText } from "@/lib/download";
import { readStore } from "@/lib/store";
import {
  MAP_PICK_FIELDS,
  MAP_PICK_KEY,
  MAP_SECTIONS,
  addLine,
  buildGraph,
  removeLine,
  savedAnswerOptions,
  setNodePosition,
  updateLine,
  usePositions,
} from "@/lib/lifeMap";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DashedMotif from "@/components/workbook/DashedMotif";
import LifeMapCanvas from "@/components/map/LifeMapCanvas";
import LifeMapNodePanel from "@/components/map/LifeMapNodePanel";
import LifeMapList from "@/components/map/LifeMapList";
import BringInSavedAnswer from "@/components/map/BringInSavedAnswer";
import MapQuestions from "@/components/map/MapQuestions";
import StepNav from "@/components/workbook/StepNav";

const clamp = (value) => Math.min(0.98, Math.max(0.02, value));

export default function LifeMapPage() {
  const map = useLifeMap();
  const positions = usePositions();
  const entries = useJournalEntries();
  const { answers } = useWorkbook();
  const { lessons, orderedLessons } = useCurriculum();

  const [draft, setDraft] = useState("");
  const [draftSection, setDraftSection] = useState(MAP_SECTIONS[0].key);
  const [selectedId, setSelectedId] = useState(null);
  const [asList, setAsList] = useState(false);

  /** The map is the opening move, so the step it hands over to is the first Getting Started step. */
  const nextStep = useMemo(() => orderedLessons.find((lesson) => !isOpenerLesson(lesson)) || null, [orderedLessons]);
  const graph = useMemo(() => buildGraph(map), [map]);
  const options = useMemo(() => savedAnswerOptions(lessons, answers), [lessons, answers]);
  const nodesById = useMemo(
    () => Object.fromEntries(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes]
  );

  const sectionOf = (id) => graph.sections.find((section) => section.nodes.some((node) => node.id === id)) || null;
  const selected = selectedId ? nodesById[selectedId] || null : null;
  const selectedSection = selected ? sectionOf(selected.id) : null;
  const connections = selected ? graph.links.filter((pair) => pair.includes(selected.id)) : [];
  const total = graph.nodes.length;

  const quickAdd = () => {
    const text = draft.trim();
    if (!text) return;
    addLine(draftSection, { text });
    setDraft("");
  };

  const bringIn = (option, sectionKey) => {
    const item = addLine(sectionKey, {
      text: option.value,
      source_code: option.code,
      source_index: option.index,
      source_label: `${option.lessonTitle} · ${option.stepLabel}`,
    });
    setSelectedId(item.id);
    setAsList(false);
  };

  const saveSelected = (patch) => {
    if (!selected || !selectedSection) return;
    updateLine(selectedSection.key, selected.id, patch);
  };

  /** Connections are made by hand, in both directions, so either line shows the link. */
  const connect = (otherId) => {
    if (!selected) return;
    [
      [selected.id, otherId],
      [otherId, selected.id],
    ].forEach(([id, other]) => {
      const section = sectionOf(id);
      const node = nodesById[id];
      if (!section || !node) return;
      updateLine(section.key, id, { links: [...new Set([...(node.links || []), other])] });
    });
  };

  const disconnect = (otherId) => {
    if (!selected) return;
    [
      [selected.id, otherId],
      [otherId, selected.id],
    ].forEach(([id, other]) => {
      const section = sectionOf(id);
      const node = nodesById[id];
      if (!section || !node) return;
      updateLine(section.key, id, { links: (node.links || []).filter((link) => link !== other) });
    });
  };

  const nudge = (dx, dy) => {
    if (!selected) return;
    const spot = positions[selected.id] || { x: 0.5, y: 0.5 };
    setNodePosition(selected.id, { x: clamp(spot.x + dx), y: clamp(spot.y + dy) });
  };

  /** One line that holds a list becomes one line per item, in the same area. */
  const splitSelected = (pieces) => {
    if (!selected || !selectedSection) return;
    const keep = {
      question_id: selected.question_id || "",
      source_label: selected.source_label || "",
      source_code: selected.source_code || "",
    };
    pieces.forEach((text) => addLine(selectedSection.key, { text, ...keep }));
    removeLine(selectedSection.key, selected.id);
    setSelectedId(null);
  };

  const removeSelected = () => {
    if (!selected || !selectedSection) return;
    removeLine(selectedSection.key, selected.id);
    setSelectedId(null);
  };

  const download = () => {
    const body = graph.sections
      .map((section) => {
        const lines = section.nodes.map((node) => {
          const entry = node.entry_id ? entries.find((item) => item.id === node.entry_id) : null;
          const links = (node.links || [])
            .map((id) => nodesById[id])
            .filter(Boolean)
            .map((other) => other.label || other.text);
          return [
            `- ${node.label || node.text}`,
            node.label ? `  - the line: ${node.text}` : null,
            node.source_label ? `  - from: ${node.source_label}` : null,
            entry ? `  - journal: ${entry.body}` : null,
            links.length ? `  - linked to: ${links.join("; ")}` : null,
          ]
            .filter(Boolean)
            .join("\n");
        });
        return `## ${section.label}\n${lines.length ? lines.join("\n") : "- (nothing yet)"}\n`;
      })
      .join("\n");
    const pick = readStore(MAP_PICK_KEY, {}) || {};
    const pickLines = pick.nothing_yet
      ? "Nothing on the map is worth exploring yet."
      : MAP_PICK_FIELDS.map((field) => `${field.label} ${(pick[field.id] || "").trim()}`).join("\n");
    const hasPick = pick.nothing_yet || MAP_PICK_FIELDS.some((field) => (pick[field.id] || "").trim());
    const pickBlock = hasPick ? `\n## One thing worth exploring\n${pickLines}\n` : "";
    downloadText("entrepalooza-life-map.md", `# Map the Life You're Actually Living\n\n${body}${pickBlock}`);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Getting Started · the connected map</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Map the life you’re actually living</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              Start with the questions below. Each answer becomes a line on the map, under the area it belongs to, joined
              to the middle and to anything you link it to. Nothing is guessed from what you wrote. You make the
              connections yourself.
            </p>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-faint">
              Come back and change any line, move it, or leave a question empty. Empty is honest too.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={download} className="rounded-full">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="rounded-full">
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-pressed={asList}
            onClick={() => setAsList((value) => !value)}
            className="rounded-full"
          >
            {asList ? "Show as a map" : "Show as a list"}
          </Button>
          <PrivacyNote>
            {total ? `${total} ${total === 1 ? "line" : "lines"} on this map, saved on this device only.` : "Saved on this device only."}
          </PrivacyNote>
        </div>
      </header>

      <MapQuestions graph={graph} />

      {asList ? (
        <LifeMapList graph={graph} selectedId={selectedId} onSelect={setSelectedId} />
      ) : (
        <LifeMapCanvas
          graph={graph}
          positions={positions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={(id, spot) => setNodePosition(id, spot)}
        />
      )}

      {selected && selectedSection ? (
        <LifeMapNodePanel
          node={selected}
          section={selectedSection}
          entries={entries}
          others={graph.nodes}
          connections={connections}
          onSave={saveSelected}
          onLinkEntry={(entryId) => saveSelected({ entry_id: entryId })}
          onConnect={connect}
          onDisconnect={disconnect}
          onNudge={nudge}
          onRemove={removeSelected}
          onSplit={splitSelected}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <p className="text-[13px] leading-relaxed text-muted-faint">
          Open a node to read the whole line, rename it, link it to a journal entry, or connect it to another line. Drag a
          node to move it, use the arrow keys while it is focused, or use the move buttons once it is open.
        </p>
      )}

      <section className="rounded-lg border border-border bg-card p-5">
        <p className="workbook-label">Add your own line</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="Which question this line answers"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:w-56"
            value={draftSection}
            onChange={(event) => setDraftSection(event.target.value)}
          >
            {MAP_SECTIONS.map((section) => (
              <option key={section.key} value={section.key}>
                {section.label}
              </option>
            ))}
          </select>
          <Input
            aria-label="A line to add to the map"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") quickAdd();
            }}
            placeholder={MAP_SECTIONS.find((section) => section.key === draftSection)?.prompt || "Add a line…"}
            className="border-border bg-background text-[14px] sm:flex-1"
          />
          <Button type="button" onClick={quickAdd} disabled={!draft.trim()} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </section>

      <BringInSavedAnswer options={options} onAdd={bringIn} />

      <div>
        <PrivacyNote>
          The map is drawn from lines on this device and the links you choose. Downloading or printing it is yours to do.
        </PrivacyNote>
      </div>

      <StepNav prev={null} next={nextStep} workbookLink="/" />
    </div>
  );
}