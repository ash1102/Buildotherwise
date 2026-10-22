import MobileSelect from "@/components/ui/MobileSelect";
import React, { useMemo, useRef, useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLifeMap, useWorkbook } from "@/lib/workbook";
import { useJournalEntries } from "@/lib/journal";
import useCurriculum from "@/hooks/useCurriculum";
import { nextStepAfterLifeMap } from "@/lib/progress";
import { downloadText } from "@/lib/download";
import { readStore, useStore } from "@/lib/store";
import { branchMarkdown, buildBranches, descendantsOf, freezePlacement } from "@/lib/lifeMapBranches";
import {
  MAP_PAUSE_TEXT,
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
import LifeMapTree from "@/components/map/LifeMapTree";
import MapPickCard from "@/components/map/MapPickCard";
import LifeMapNodePanel from "@/components/map/LifeMapNodePanel";
import LifeMapList from "@/components/map/LifeMapList";
import BringInSavedAnswer from "@/components/map/BringInSavedAnswer";
import MapQuestions from "@/components/map/MapQuestions";
import StepNav from "@/components/workbook/StepNav";

export default function LifeMapPage() {
  const map = useLifeMap();
  const [pick] = useStore(MAP_PICK_KEY, {});
  // Remember the part someone was on, so coming back picks up where they left off.
  const [step, setStep] = useStore("lifeMapGuideStep", 0);
  const mapRef = useRef(null);
  const guideRef = useRef(null);
  const editorRef = useRef(null);
  const entries = useJournalEntries();
  const { answers, states } = useWorkbook();
  const { lessons, orderedLessons } = useCurriculum();

  const [draft, setDraft] = useState("");
  const [draftSection, setDraftSection] = useState(MAP_SECTIONS[0].key);
  const [selectedId, setSelectedId] = useState(null);
  const [asList, setAsList] = useState(false);

  /** The Life Map comes after Getting Started, so next is the first unfinished workbook step (Module 1 onward). */
  const nextStep = useMemo(
    () => nextStepAfterLifeMap({ lessons, workbookLessons: orderedLessons, answers, states }),
    [lessons, orderedLessons, answers, states]
  );
  const graph = useMemo(() => buildGraph(map), [map]);
  const tree = useMemo(() => buildBranches(graph), [graph]);
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
  const parentOptions = selected
    ? (() => {
        const below = descendantsOf(selected.id, tree);
        return graph.nodes.filter((node) => node.id !== selected.id && !below.has(node.id));
      })()
    : [];
  const placement = selected
    ? tree.parentById[selected.id]
      ? tree.parentById[selected.id]
      : tree.missing.includes(selected.id)
        ? "__missing"
        : tree.unlinked.includes(selected.id)
          ? "__unplaced"
          : ""
    : "";
  const total = graph.nodes.length;

  const quickAdd = () => {
    const text = draft.trim();
    if (!text) return;
    const questionId = { places: "p1-places", placeless: "p2-placeless", groups: "g-now" }[draftSection] || "";
    addLine(draftSection, { text, question_id: questionId, parent_choice: "standalone", branch_group: draftSection === "barriers" ? "barriers" : "" });
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

  /**
   * Connections are made by hand, in both directions, so either line shows the link.
   * A connection never moves a line to another branch: where each line sits is
   * written down first, and only "Where this sits" changes it.
   */
  const connect = (otherId) => {
    if (!selected) return;
    [selected.id, otherId].forEach((id) => {
      const freeze = freezePlacement(nodesById[id], tree);
      const section = sectionOf(id);
      if (freeze && section) updateLine(section.key, id, freeze);
    });
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
      branch_group: selected.branch_group || "",
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
    const kept = actual.length ? actual.map((field) => field.label + " " + field.value).join("\n") + "\n" : "";
    const pickBlock = values.nothing_yet
      ? "\n## Look over your map\n" + MAP_PAUSE_TEXT + "\n" + (kept ? "\nEarlier reflection text is still saved:\n" + kept : "")
      : kept ? "\n## Look over your map\n" + kept : "";
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
              This step comes after Getting Started and before Module 1. Start with places and activities from a recent stretch you remember, then people you were in contact with.
              Observations and possible threads come after those entries are on the map. You choose what each connection means.
            </p>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-faint">
              The map is the picture. Areas organize it, and a line between entries appears only when you connect them. The list shows the same answers without the picture.
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
            {asList ? "Show the map" : "Show as a list"}
          </Button>
          <PrivacyNote>
            {total ? `${total} ${total === 1 ? "line" : "lines"} on this map. Saved on this device, then to your account.` : "Saved on this device, then to your account."}
          </PrivacyNote>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card p-5">
        <p className="workbook-label">Start a branch</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <MobileSelect
            aria-label="What kind of starting entry?"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:w-56"
            value={draftSection}
            onChange={(event) => setDraftSection(event.target.value)}
          >
            {MAP_SECTIONS.map((section) => (
              <option key={section.key} value={section.key}>
                {{ places: "A place I spent time", placeless: "An activity from that time", groups: "A person or group", barriers: "Something missing", threads: "A possible thread", energy: "An energy observation" }[section.key]}
              </option>
            ))}
          </MobileSelect>
          <Input
            aria-label="A starting entry for your map"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") quickAdd();
            }}
            placeholder={draftSection === "places" ? "Name a place, including home" : draftSection === "placeless" ? "Name an activity from that time" : "Add one starting entry"}
            className="border-border bg-background text-[14px] sm:flex-1"
          />
          <Button type="button" onClick={quickAdd} disabled={!draft.trim()} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div ref={mapRef} className="scroll-mt-4 min-w-0">
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
            <LifeMapTree graph={graph} tree={tree} selectedId={selectedId} onSelect={selectEntry} />
          )}
          <MapPickCard pick={pick} onJumpToPart={openGuide} />
        </div>
        <div ref={guideRef} className="scroll-mt-4 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <h2 className="text-[17px] font-medium">Questions</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            The question you are answering stays here. The map beside it shows where the answer lands, and it updates when you add the answer.
          </p>
          <div className="mt-4">
            <MapQuestions graph={graph} step={step} onStep={setStep} onShowMap={showMap} onPlaced={(id) => { setSelectedId(id); setAsList(false); showMap(); }} onOpen={selectEntry} />
          </div>
        </div>
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
          placement={placement}
          parentOptions={parentOptions}
          onPlace={(parentId) => setLineParent(selected.id, parentId)}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <p className="text-[13px] leading-relaxed text-muted-faint">
          Open an entry to see its branch, answer a follow-up, or edit its wording and connections.
        </p>
      )}
      </div>
      <BringInSavedAnswer options={options} onAdd={bringIn} />

      <div>
        <PrivacyNote>
          The map is saved on this device and copied to your account. In the app, only your account can open it. A Markdown download includes the full text of any journal entry linked to a line, not only that journal entry’s title. Downloading or printing is yours to do.
        </PrivacyNote>
      </div>

      <StepNav prev={null} next={nextStep} workbookLink="/" endNote="" />
    </div>
  );
}
