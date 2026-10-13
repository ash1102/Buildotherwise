import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import {
  MAP_PICK_FIELDS,
  MAP_PICK_KEY,
  MAP_QUESTION_PARTS,
  QUESTIONS_BY_ID,
  addLine,
  linesFromAnswer,
} from "@/lib/lifeMap";

const PICK_STEP = MAP_QUESTION_PARTS.length;
const TOTAL = PICK_STEP + 1;
const STEP_TITLES = [...MAP_QUESTION_PARTS.map((item) => item.title), "Pick one thing worth exploring"];

/**
 * The questions that build the map, one Part at a time. Each answer becomes a line on
 * the branch of the question it answers. Moving on never loses what was typed: any
 * answer still in a box is added to the map first. Nothing has to be answered.
 */
export default function MapQuestions({ graph, step, onStep, onShowMap }) {
  const cardRef = useRef(null);
  const firstRender = useRef(true);
  const [drafts, setDrafts] = useState({});
  const [placeFor, setPlaceFor] = useState({});
  const [addedNote, setAddedNote] = useState({});
  const [pick, setPick] = useStore(MAP_PICK_KEY, {});

  const places = graph.nodes.filter((node) => node.question_id === "p1-places");
  const countFor = (questionId) => graph.nodes.filter((node) => node.question_id === questionId).length;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const add = (part, question) => {
    const lines = linesFromAnswer(question, drafts[question.id]);
    if (!lines.length) return 0;
    const placeId = question.aboutPlace ? placeFor[question.id] : "";
    lines.forEach((text) =>
      addLine(part.section, {
        text,
        question_id: question.id,
        source_label: question.text,
        links: placeId ? [placeId] : [],
      })
    );
    setDrafts((current) => ({ ...current, [question.id]: "" }));
    const added = lines.length === 1 ? "1 line" : `${lines.length} lines`;
    setAddedNote((current) => ({
      ...current,
      [question.id]: `Added ${added} to “${QUESTIONS_BY_ID[question.id].branch}”.`,
    }));
    return lines.length;
  };

  /** Anything still typed in this Part goes onto the map before moving on. */
  const flush = () => {
    const part = step < PICK_STEP ? MAP_QUESTION_PARTS[step] : null;
    if (!part) return;
    part.questions.forEach((question) => add(part, question));
  };

  const go = (next) => {
    flush();
    onStep(Math.max(0, Math.min(PICK_STEP, next)));
  };

  const part = step < PICK_STEP ? MAP_QUESTION_PARTS[step] : null;
  const pending = part ? part.questions.some((question) => String(drafts[question.id] || "").trim()) : false;

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

          <div className="mt-5 space-y-6">
            {part.questions.map((question) => {
              const count = countFor(question.id);
              const value = drafts[question.id] || "";
              const branch = QUESTIONS_BY_ID[question.id].branch;
              return (
                <div key={question.id}>
                  <label htmlFor={`mapq-${question.id}`} className="block text-[15px] font-medium text-foreground">
                    {question.text}
                  </label>
                  <p className="mt-1 text-[12.5px] text-muted-faint">
                    {question.list
                      ? "List as many as fit, separated by commas or new lines. Each one becomes its own line on the map."
                      : "One answer at a time. It shows up on the map under this question."}{" "}
                    On the map: <span className="text-accent-ink">{branch}</span>.
                  </p>

                  {question.aboutPlace && places.length ? (
                    <select
                      aria-label="Which place this answer is about (optional)"
                      value={placeFor[question.id] || ""}
                      onChange={(event) => {
                        const next = event.target.value;
                        setPlaceFor((current) => ({ ...current, [question.id]: next }));
                      }}
                      className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:w-72"
                    >
                      <option value="">Which place? (optional)</option>
                      {places.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.label || place.text}
                        </option>
                      ))}
                    </select>
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
                      disabled={!value.trim()}
                      className="rounded-full sm:mt-1"
                    >
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Add to map
                    </Button>
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted-faint" aria-live="polite">
                    {addedNote[question.id] ? (
                      <span className="text-accent-ink">{addedNote[question.id]} </span>
                    ) : null}
                    {count ? `${count} ${count === 1 ? "line" : "lines"} on the map from this question.` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h3 className="font-heading text-xl">Part {TOTAL}: Pick one thing worth exploring</h3>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            You are not choosing a career. You are not committing to a business. You are not announcing your life's
            purpose. Pick one thread that makes you curious enough to look again.
          </p>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-faint">
            These are single answers, not lists. They show up at the end of your map as “Worth exploring.”
          </p>
          <div className="mt-4 space-y-4">
            {MAP_PICK_FIELDS.map((field) => (
              <div key={field.id}>
                <label htmlFor={`mappick-${field.id}`} className="block text-[15px] font-medium text-foreground">
                  {field.label}
                </label>
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
                Nothing on the map is worth exploring yet.
                <span className="block text-[13px] text-muted-faint">That counts as a complete answer. Your answer can change.</span>
              </span>
            </label>
            <p className="text-[12.5px] text-muted-faint">Saved on this device as you type.</p>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-5">
        {pending ? (
          <p className="mb-3 text-[12.5px] text-muted-faint">
            Anything still typed above will be added to your map when you move on.
          </p>
        ) : null}
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
