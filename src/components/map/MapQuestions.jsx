import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import EnergyMarks from "./EnergyMarks";
import {
  MAP_PAUSE_TEXT,
  MAP_PICK_FIELDS,
  MAP_PICK_KEY,
  MAP_QUESTION_PARTS,
  QUESTIONS_BY_ID,
  addLine,
  followUpTargets,
  guideQuestions,
  isPerEntryQuestion,
  sourceQuestionId,
  linesFromAnswer,
  placementForAnswer,
} from "@/lib/lifeMap";

const PICK_STEP = MAP_QUESTION_PARTS.length;
const DRAFTS_KEY = "lifeMapGuideDrafts";
const FOCUS_KEY = "lifeMapGuideFocus";
const SEPARATE = "__separate";
const draftKey = (questionId, targetId) => (targetId ? `${questionId}::${targetId}` : questionId);
const TOTAL = PICK_STEP + 1;
const STEP_TITLES = [...MAP_QUESTION_PARTS.map((item) => item.title), "Choose whether to explore"];

function needsContext(question) {
  return Boolean(question.aboutPlace || question.about || (question.aboutQuestions || []).length || question.context === "entry");
}

/**
 * The questions that build the map, one part at a time. A line is added only when
 * the participant chooses Add to map. Moving between parts leaves a draft where it
 * was typed. Nothing has to be answered.
 */
export default function MapQuestions({ graph, step, onStep, onShowMap, onPlaced, onOpen }) {
  const cardRef = useRef(null);
  const firstRender = useRef(true);
  // Drafts stay on this device (not synced), so leaving the page doesn't lose them.
  const [drafts, setDrafts] = useStore(DRAFTS_KEY, {});
  const [linksFor, setLinksFor] = useState({});
  // Part 3: the one entry being looked at. Every question in that part attaches to it.
  const [focusId, setFocusId] = useStore(FOCUS_KEY, "");
  const [showSeparate, setShowSeparate] = useState({});
  const [menuFor, setMenuFor] = useState({});
  const [addedNote, setAddedNote] = useState({});
  const [lastAdded, setLastAdded] = useState(null);
  const [pick, setPick] = useStore(MAP_PICK_KEY, {});

  const nodeById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
  const targetsFor = (question) => {
    if (isPerEntryQuestion(question)) return followUpTargets(question, graph.nodes);
    if (question.context === "entry" || question.multi) {
      return graph.nodes.filter((node) => {
        const questionId = String(node.question_id || "");
        if (questionId === "p1-how" || questionId.startsWith("p3-") || questionId.startsWith("p5-")) return false;
        return ["places", "placeless", "groups", "barriers"].includes(node.section);
      });
    }
    return [];
  };
  const countFor = (questionId) => graph.nodes.filter((node) => node.question_id === questionId).length;
  const answersFor = (questionId, parentId) =>
    graph.nodes.filter((node) => node.question_id === questionId && (parentId === undefined || node.parent_id === parentId));
  const partCount = (item) => item.questions.reduce((sum, question) => sum + countFor(question.id), 0);
  const setDraft = (key, value) => {
    setDrafts((current) => ({ ...(current || {}), [key]: value }));
    setAddedNote((current) => ({ ...current, [key]: "" }));
  };
  const focus = focusId && nodeById[focusId] ? nodeById[focusId] : null;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  /**
   * Add one answer. `targetId` is the entry it belongs to (a per-entry follow-up,
   * or the Part 3 focus), SEPARATE to keep it on its own, or empty for questions
   * that start their own entries. Only ids still on the map are used.
   */
  const add = (part, question, targetId = "") => {
    const key = draftKey(question.id, targetId);
    const lines = linesFromAnswer(question, (drafts || {})[key]);
    if (!lines.length) return 0;
    const full = QUESTIONS_BY_ID[question.id];
    const contextual = needsContext(question);
    let chosen = [];
    if (question.multi) chosen = (linksFor[question.id] || []).filter((id) => nodeById[id]);
    else if (targetId && targetId !== SEPARATE && nodeById[targetId]) chosen = [targetId];
    const separate = (contextual || question.multi) && chosen.length === 0;
    const placement = contextual || question.multi
      ? placementForAnswer(full, { links: chosen, separate })
      : placementForAnswer(full, { links: [], separate: false });
    const section = full.section || part.section;
    let firstId = "";
    lines.forEach((text) => {
      const item = addLine(section, {
        text,
        question_id: question.id,
        source_label: question.text,
        ...placement,
        branch_group: placement.parent_id ? "" : placement.branch_group || (section === "barriers" ? "barriers" : ""),
      });
      if (!firstId) firstId = item.id;
    });
    setDrafts((current) => ({ ...(current || {}), [key]: "" }));
    if (question.multi) setLinksFor((current) => ({ ...current, [question.id]: [] }));
    const names = chosen.map((id) => nodeById[id]).filter(Boolean).map((node) => node.label || node.text);
    const where = names.length
      ? ` Attached to “${names.join("”, “")}”.`
      : contextual || question.multi
        ? " Kept as its own entry."
        : "";
    const added = lines.length === 1 ? "1 line" : `${lines.length} lines`;
    setAddedNote((current) => ({ ...current, [key]: `Added ${added} under “${full.branch}”.${where}` }));
    setLastAdded({ key, id: firstId });
    return lines.length;
  };

  const go = (next) => {
    onStep(Math.max(0, Math.min(PICK_STEP, next)));
  };

  const part = step < PICK_STEP ? MAP_QUESTION_PARTS[step] : null;
  const visible = part ? guideQuestions(part) : [];
  const menuId = part?.menu ? menuFor[part.key] || visible[0]?.id || "" : "";
  const shown = part?.menu ? visible.filter((question) => question.id === menuId) : visible;
  const pending = part ? part.questions.some((question) => String(drafts[question.id] || "").trim()) : false;
  const keptReflection = MAP_PICK_FIELDS.some((field) => String((pick || {})[field.id] || "").trim());

  return (
    <section
      ref={cardRef}
      className="scroll-mt-4 rounded-lg border border-border bg-card p-5"
      aria-labelledby="map-questions-title"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="workbook-label" id="map-questions-title">
          Questions that build your map
        </p>
        <p className="text-[12.5px] font-medium text-accent-ink">
          Part {step + 1} of {TOTAL}
        </p>
      </div>

      <div className="mt-3 flex gap-1" aria-hidden="true">
        {STEP_TITLES.map((title, index) => (
          <span
            key={title}
            className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <p className="mt-4 text-[12px] text-muted-faint">Jump to any part:</p>
      <ol className="-mx-1 mt-1.5 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" aria-label="Parts">
        {STEP_TITLES.map((title, index) => (
          <li key={title}>
            <button
              type="button"
              onClick={() => go(index)}
              aria-current={index === step ? "step" : undefined}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] transition ${
                index === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              {index + 1}. {title}
            </button>
          </li>
        ))}
      </ol>

      {part ? (
        <div className="mt-6">
          <h3 className="font-heading text-xl">
            Part {step + 1}: {part.title}
          </h3>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{part.intro}</p>
          {part.examples ? (
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-faint">Could include: {part.examples}</p>
          ) : null}
          {part.note ? (
            <p className="mt-2 max-w-2xl text-[13px] font-medium leading-relaxed text-accent-ink">{part.note}</p>
          ) : null}

          {part.key === "part-3" ? <EnergyMarks graph={graph} onEarlierPart={() => go(0)} /> : null}
          {part.menu && visible.length ? (
            <label className="mt-5 block text-[14px] font-medium" htmlFor={`menu-${part.key}`}>
              Choose one prompt
              <select
                id={`menu-${part.key}`}
                value={menuId}
                onChange={(event) => setMenuFor((current) => ({ ...current, [part.key]: event.target.value }))}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-[14px]"
              >
                {visible.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.text}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="mt-5 space-y-6">
            {shown.map((question) => {
              const count = countFor(question.id);
              const value = drafts[question.id] || "";
              const targets = targetsFor(question);
              const contextual = needsContext(question);
              const selectedLinks = linksFor[question.id] || [];
              const awaitingChoice = contextual && targets.length > 0 && !placeFor[question.id];
              return (
                <div key={question.id}>
                  <label htmlFor={`mapq-${question.id}`} className="block text-[15px] font-medium text-foreground">
                    {question.text}
                    {question.optional ? <span className="ml-2 text-[12px] font-normal text-muted-faint">Optional</span> : null}
                  </label>
                  {question.helper ? <p className="mt-1 text-[13px] text-muted-foreground">{question.helper}</p> : null}
                  <p className="mt-1 text-[12.5px] text-muted-faint">
                    {question.list
                      ? "List as many as fit, separated by commas or new lines. Each one becomes its own line when you add it."
                      : "One answer at a time. It stays a draft until you add it."}{" "}
                    {value.trim() ? "Draft — not on the map yet." : "Nothing is added by leaving this box."}
                  </p>

                  {contextual && targets.length ? (
                    <select
                      aria-label={`${question.aboutLabel || "Which earlier entry does this describe?"} ${question.text}`}
                      value={placeFor[question.id] || ""}
                      onChange={(event) => {
                        const next = event.target.value;
                        setPlaceFor((current) => ({ ...current, [question.id]: next }));
                      }}
                      className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:w-72"
                    >
                      <option value="">{question.aboutLabel || "Which earlier entry does this describe?"}</option>
                      <option value="__separate">Keep this as a separate answer</option>
                      {targets.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.label || place.text}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  {contextual && !targets.length ? (
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      There is no matching entry yet. You can add this as its own line, or add that entry first.
                    </p>
                  ) : null}

                  {question.multi && targets.length ? (
                    <fieldset className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-3">
                      <legend className="px-1 text-[13px] text-muted-foreground">
                        If this refers to entries already on the map, select them. More than one is allowed. Leave them unchecked to keep this separate.
                      </legend>
                      {targets.map((place) => (
                        <label key={place.id} className="flex items-start gap-2 text-[14px]">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedLinks.includes(place.id)}
                            onChange={() => {
                              setLinksFor((current) => {
                                const list = current[question.id] || [];
                                const next = list.includes(place.id) ? list.filter((id) => id !== place.id) : [...list, place.id];
                                return { ...current, [question.id]: next };
                              });
                            }}
                          />
                          <span>{place.label || place.text}</span>
                        </label>
                      ))}
                    </fieldset>
                  ) : null}

                  {placeFor[question.id] && placeFor[question.id] !== "__separate" ? (
                    <p className="mt-2 rounded-md bg-secondary p-3 text-[15px]">
                      Answering about: <strong>{targets.find((node) => node.id === placeFor[question.id])?.text || "the entry you selected"}</strong>
                    </p>
                  ) : null}

                  {question.chips ? (
                    <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Quick answers">
                      {question.chips.map((chip) => {
                        const active = value.trim() === chip;
                        return (
                          <button
                            key={chip}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              setDrafts((current) => ({ ...current, [question.id]: chip }));
                              setAddedNote((current) => ({ ...current, [question.id]: "" }));
                            }}
                            className={`rounded-full border px-3 py-1 text-[13px] transition ${
                              active
                                ? "border-primary bg-primary-wash font-medium text-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
                    <Textarea
                      id={`mapq-${question.id}`}
                      value={value}
                      rows={2}
                      onChange={(event) => {
                        const next = event.target.value;
                        setDrafts((current) => ({ ...current, [question.id]: next }));
                        setAddedNote((current) => ({ ...current, [question.id]: "" }));
                      }}
                      className="min-h-[60px] sm:flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => add(part, question)}
                      disabled={!value.trim() || awaitingChoice}
                      className="rounded-full sm:mt-1"
                    >
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Add to map
                    </Button>
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted-faint" aria-live="polite">
                    {addedNote[question.id] ? <span className="text-accent-ink">{addedNote[question.id]} </span> : null}
                    {lastAdded?.questionId === question.id && lastAdded.id ? (
                      <button type="button" className="text-accent-ink underline" onClick={() => onPlaced?.(lastAdded.id)}>
                        Show it on the map
                      </button>
                    ) : null}{" "}
                    {count ? `${count} ${count === 1 ? "line" : "lines"} on the map from this question.` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h3 className="font-heading text-xl">Look over your map and choose whether to explore</h3>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            Look over the entries on your map. You can name one thing you might want to understand better, or leave that
            choice for later. This is not a career, a business, or a purpose you have to announce.
          </p>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-faint">
            These save as you type. They are not added by moving between parts. While you are not choosing, the text stays
            saved and is hidden on the map.
          </p>
          <div className="mt-4 space-y-4">
            {MAP_PICK_FIELDS.map((field) => (
              <div key={field.id}>
                <label htmlFor={`mappick-${field.id}`} className="block text-[15px] font-medium text-foreground">
                  {field.label}
                </label>
                {field.hint ? <p className="mt-1 text-[13px] text-muted-foreground">{field.hint}</p> : null}
                <Textarea
                  id={`mappick-${field.id}`}
                  rows={2}
                  value={(pick || {})[field.id] || ""}
                  disabled={Boolean((pick || {}).nothing_yet)}
                  onChange={(event) => {
                    const next = event.target.value;
                    setPick((current) => ({ ...(current || {}), [field.id]: next }));
                  }}
                  className="mt-2 min-h-[60px]"
                />
              </div>
            ))}
            <label className="flex items-start gap-2 text-[14px] text-foreground">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean((pick || {}).nothing_yet)}
                onChange={(event) => {
                  const next = event.target.checked;
                  setPick((current) => ({ ...(current || {}), nothing_yet: next }));
                }}
              />
              <span>
                {MAP_PAUSE_TEXT}
                <span className="block text-[13px] text-muted-faint">
                  That is a complete way to pause. Your answer can change.
                  {keptReflection ? " Text already in the fields stays saved. Uncheck this to edit it again." : ""}
                </span>
              </span>
            </label>
            <p className="text-[12.5px] text-muted-faint">Saved to your account as you type. On this device first, then copied to your account.</p>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-5">
        {pending ? (
          <p className="mb-3 text-[12.5px] text-muted-faint">
            Text still in a box is a draft. Back and Next leave it here and do not add it to the map.
          </p>
        ) : (
          <p className="mb-3 text-[12.5px] text-muted-faint">You can skip any part. Empty questions are not added.</p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          {step < PICK_STEP ? (
            <Button
              type="button"
              size="lg"
              className="h-auto whitespace-normal rounded-full py-3 text-left"
              onClick={() => go(step + 1)}
            >
              Next: Part {step + 2} · {STEP_TITLES[step + 1]}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="button" size="lg" className="rounded-full" onClick={onShowMap}>
              See it on your map
              <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
