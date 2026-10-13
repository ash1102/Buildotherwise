import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import {
  MAP_PICK_FIELDS,
  MAP_PICK_KEY,
  MAP_QUESTION_PARTS,
  MAP_SECTIONS,
  addLine,
  linesFromAnswer,
} from "@/lib/lifeMap";

const sectionLabel = (key) => (MAP_SECTIONS.find((item) => item.key === key) || {}).label || key;
const PICK_STEP = MAP_QUESTION_PARTS.length;

/**
 * The questions that find the lines for the map, one part at a time. Each answer is
 * added as its own line under the part's section. Nothing has to be answered.
 */
export default function MapQuestions({ graph, onAdded }) {
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [addedNote, setAddedNote] = useState({});
  const [pick, setPick] = useStore(MAP_PICK_KEY, {});

  const countFor = (questionId) => graph.nodes.filter((node) => node.question_id === questionId).length;

  const add = (part, question) => {
    const lines = linesFromAnswer(question, drafts[question.id]);
    if (!lines.length) return;
    const items = lines.map((text) => addLine(part.section, { text, question_id: question.id, source_label: question.text }));
    setDrafts((current) => ({ ...current, [question.id]: "" }));
    const added = items.length === 1 ? "1 line" : `${items.length} lines`;
    setAddedNote((current) => ({ ...current, [question.id]: `Added ${added} to ${sectionLabel(part.section)}.` }));
    if (onAdded) items.forEach((item) => onAdded(item));
  };

  const part = step < PICK_STEP ? MAP_QUESTION_PARTS[step] : null;
  const steps = [...MAP_QUESTION_PARTS.map((item) => item.title), "Pick one thing worth exploring"];

  return (
    <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="map-questions-title">
      <p className="workbook-label" id="map-questions-title">
        Questions that build your map
      </p>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
        Answer what fits. Each answer becomes a line on the map. You can add more than one answer to a question, skip any
        of them, and come back later. You do not have to answer every prompt.
      </p>

      <ol className="mt-4 flex flex-wrap gap-2" aria-label="Parts">
        {steps.map((title, index) => (
          <li key={title}>
            <button
              type="button"
              onClick={() => setStep(index)}
              aria-current={index === step ? "step" : undefined}
              className={`rounded-full border px-3 py-1 text-[12.5px] transition ${
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
        <div className="mt-5">
          <h3 className="font-heading text-xl">
            Part {step + 1}: {part.title}
          </h3>
          <p className="mt-1 text-[12.5px] text-muted-faint">Answers go under {sectionLabel(part.section)}.</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{part.intro}</p>
          {part.examples ? (
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-faint">Could include: {part.examples}</p>
          ) : null}

          <div className="mt-4 space-y-5">
            {part.questions.map((question) => {
              const count = countFor(question.id);
              const value = drafts[question.id] || "";
              return (
                <div key={question.id}>
                  <label htmlFor={`mapq-${question.id}`} className="block text-[15px] font-medium text-foreground">
                    {question.text}
                  </label>
                  <p className="mt-1 text-[12.5px] text-muted-faint">
                    {question.list
                      ? "Separate them with commas or put each on its own line. Each one becomes its own spot on the map."
                      : "Put each answer on its own line to add more than one."}
                  </p>
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
        <div className="mt-5">
          <h3 className="font-heading text-xl">Part {PICK_STEP + 1}: Pick one thing worth exploring</h3>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            You are not choosing a career. You are not committing to a business. You are not announcing your life's
            purpose. Pick one thread that makes you curious enough to look again.
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

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        {step < PICK_STEP ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setStep((value) => Math.min(PICK_STEP, value + 1))}
          >
            Next part
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
