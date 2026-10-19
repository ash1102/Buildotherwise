import React, { useMemo, useRef, useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLifeMap, useWorkbook } from "@/lib/workbook";
import { useJournalEntries } from "@/lib/journal";
import useCurriculum from "@/hooks/useCurriculum";
import { nextOpenStep } from "@/lib/progress";
import { downloadText } from "@/lib/download";
import { readStore, useStore } from "@/lib/store";
import { branchMarkdown } from "@/lib/lifeMapBranches";
import {
  MAP_PICK_FIELDS,
  MAP_PICK_KEY,
  MAP_SECTIONS,
  QUESTIONS_BY_ID,
  setLineParent,
  addLine,
  buildGraph,
  exploreLines,
  removeLine,
  savedAnswerOptions,
  updateLine,
} from "@/lib/lifeMap";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DashedMotif from "@/components/workbook/DashedMotif";
import LifeMapBoard from "@/components/map/LifeMapBoard";
import MapPickCard from "@/components/map/MapPickCard";
import LifeMapNodePanel from "@/components/map/LifeMapNodePanel";
import LifeMapList from "@/components/map/LifeMapList";
import BringInSavedAnswer from "@/components/map/BringInSavedAnswer";
import MapQuestions from "@/components/map/MapQuestions";
import StepNav from "@/components/workbook/StepNav";

export default function LifeMapPage() {
  const map = useLifeMap();
  const [pick] = useStore(MAP_PICK_KEY, {});
  const [step, setStep] = useState(0);
  const mapRef = useRef(null);
  const guideRef = useRef(null);
  const editorRef = useRef(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const entries = useJournalEntries();
  const { answers, states } = useWorkbook();
  const { lessons, orderedLessons } = useCurriculum();

  const [draft, setDraft] = useState("");
  const [draftSection, setDraftSection] = useState(MAP_SECTIONS[0].key);
  const [selectedId, setSelectedId] = useState(null);
  const [asList, setAsList] = useState(false);

  /** First unfinished Getting Started step, then the next unfinished workbook step. */
  const nextStep = useMemo(
    () => nextOpenStep({ lessons, workbookLessons: orderedLessons, answers, states }),
    [lessons, orderedLessons, answers, states]
  );
  const graph = useMemo(() => buildGraph(map), [map]);
  const explore = useMemo(() => exploreLines(pick), [pick]);
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
    const questionId = { places: "p1-places", placeless: "p2-placeless", groups: "g-now" }[draftSection] || "";
    addLine(draftSection, { text, question_id: questionId, parent_choice: "standalone" });
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
      updateLine(section.key, id, { links: (node.links || []).filter((link) => link !== other), parent_id: node.parent_id === other ? "" : node.parent_id, parent_choice: node.parent_id === other ? "standalone" : node.parent_choice });
    });
  };

  const showMap = () => {
    setAsList(false);
    requestAnimationFrame(() => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  /** One line that holds a list becomes one line per item, in the same area. */
  const splitSelected = (pieces) => {
    if (!selected || !selectedSection) return;
    const keep = {
      question_id: selected.question_id || "",
      source_label: selected.source_label || "",
      source_code: selected.source_code || "",
      parent_id: selected.parent_id || "",
      parent_choice: selected.parent_choice || "",
      links: selected.links || [],
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

  const openGuide = (index) => {
    setStep(index);
    setGuideOpen(true);
    requestAnimationFrame(() => guideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const selectEntry = (id) => {
    setSelectedId(id);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const download = () => {
    const body = branchMarkdown(graph, QUESTIONS_BY_ID, entries);
    const values = readStore(MAP_PICK_KEY, {}) || {};
    const fields = MAP_PICK_FIELDS.map((field) => ({ ...field, value: String(values[field.id] || "").trim() })).filter((field) => field.value);
    const actual = fields.filter((field) => !/^Fictional:/i.test(field.value));
    const examples = fields.filter((field) => /^Fictional:/i.test(field.value));
    const pickBlock = values.nothing_yet ? "\n## One thing worth exploring\nNothing on the map is worth exploring yet.\n" :
      actual.length ? "\n## One thing worth exploring\n" + actual.map((field) => field.label + " " + field.value).join("\n") + "\n" : "";
    const exampleBlock = examples.length ? "\n## Saved example text to review\nThese fields are explicitly labelled fictional examples.\n" + examples.map((field) => field.label + " " + field.value).join("\n") + "\n" : "";
    downloadText("entrepalooza-life-map.md", "# Map the Life You're Actually Living\n\n" + body + pickBlock + exampleBlock);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Your Life Map</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Map the life you’re actually living</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              Start with a place, activity, or group from your life. Open that entry to add what you do there, how you get there,
              and what you notice. Later answers unfold beneath the entry they describe.
            </p>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-faint">
              Expand or collapse a branch to follow it. You choose the connections; answers without a chosen connection stay available to place later.
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
            {asList ? "Show branches" : "Show all saved answers"}
          </Button>
          <PrivacyNote>
            {total ? `${total} ${total === 1 ? "line" : "lines"} on this map, saved to your account.` : "Saved to your account."}
          </PrivacyNote>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card p-5">
        <p className="workbook-label">Start a branch</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="What kind of starting entry?"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:w-56"
            value={draftSection}
            onChange={(event) => setDraftSection(event.target.value)}
          >
            {MAP_SECTIONS.map((section) => (
              <option key={section.key} value={section.key}>
                {{ places: "A place I go", placeless: "An activity without a set place", groups: "A person or group", barriers: "Something missing", threads: "Another observation", energy: "An energy observation" }[section.key]}
              </option>
            ))}
          </select>
          <Input
            aria-label="A starting entry for your map"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") quickAdd();
            }}
            placeholder={draftSection === "places" ? "Name a place you go" : draftSection === "placeless" ? "Name an activity" : "Add one starting entry"}
            className="border-border bg-background text-[14px] sm:flex-1"
          />
          <Button type="button" onClick={quickAdd} disabled={!draft.trim()} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </section>

      <div ref={mapRef} className="scroll-mt-4">
        {asList ? (
          <LifeMapList
            graph={graph}
            explore={explore}
            selectedId={selectedId}
            onSelect={selectEntry}
            onRemove={(node) => {
              removeLine(node.section, node.id);
              if (selectedId === node.id) setSelectedId(null);
            }}
          />
        ) : (
          <LifeMapBoard
            graph={graph}
            selectedId={selectedId}
            onSelect={selectEntry}
            onSetParent={setLineParent}
          />
        )}
        <MapPickCard pick={pick} onJumpToPart={openGuide} />
      </div>

      <div ref={editorRef} className="scroll-mt-4">
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
          onRemove={removeSelected}
          onSplit={splitSelected}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <p className="text-[13px] leading-relaxed text-muted-faint">
          Open an entry to see its branch, answer a follow-up, or edit its wording and connections.
        </p>
      )}
      </div>
      <details ref={guideRef} open={guideOpen} onToggle={(event) => setGuideOpen(event.currentTarget.open)} className="scroll-mt-4 rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer text-[17px] font-medium">Guided questions and reflection</summary>
        <div className="mt-4"><MapQuestions graph={graph} step={step} onStep={setStep} onShowMap={showMap} /></div>
      </details>
      <BringInSavedAnswer options={options} onAdd={bringIn} />

      <div>
        <PrivacyNote>
          The map is drawn from your saved lines and the links you choose. Downloading or printing it is yours to do.
        </PrivacyNote>
      </div>

      <StepNav prev={null} next={nextStep} workbookLink="/" endNote="" />
    </div>
  );
}
