import MobileSelect from "@/components/ui/MobileSelect";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAP_SECTIONS } from "@/lib/lifeMap";

/**
 * A line already saved in a step can become a node here, so nobody types the same
 * thing twice. Which question it belongs to is the person's own choice.
 */
export default function BringInSavedAnswer({ options, onAdd }) {
  const [answerKey, setAnswerKey] = useState("");
  const [section, setSection] = useState(MAP_SECTIONS[0].key);
  /** Named so the answer to "did that do anything?" sits right where the click happened. */
  const [addedTo, setAddedTo] = useState("");

  const add = () => {
    const option = options.find((item) => item.key === answerKey);
    if (!option) return;
    onAdd(option, section);
    setAnswerKey("");
    setAddedTo((MAP_SECTIONS.find((item) => item.key === section) || {}).label || section);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <p className="workbook-label">Add a line from your saved answers</p>
      {options.length ? (
        <>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Answers you already wrote in a Try or Reflect box. Bringing one in creates a node, and does not copy anything
            back into the step.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <MobileSelect
              aria-label="Saved answer to bring in"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:flex-1"
              value={answerKey}
              onChange={(event) => {
                setAnswerKey(event.target.value);
                setAddedTo("");
              }}
            >
              <option value="">Choose a saved answer…</option>
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.lessonTitle}, {option.stepLabel}: {option.value.slice(0, 50)}
                </option>
              ))}
            </MobileSelect>
            <MobileSelect
              aria-label="Which question this line answers"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13.5px] sm:w-56"
              value={section}
              onChange={(event) => setSection(event.target.value)}
            >
              {MAP_SECTIONS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </MobileSelect>
            <Button type="button" onClick={add} disabled={!answerKey} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Bring it in
            </Button>
          </div>
          {addedTo ? (
            <p className="mt-2 text-[13px] leading-relaxed text-accent-ink">
              Added to {addedTo}. It is on the map above, opened for you so you can rename or move it.
            </p>
          ) : (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-faint">
              {answerKey
                ? "Bring it in adds it to the map above as its own line."
                : "Pick a saved answer from the list first. Bring it in adds the one you choose."}
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-[13px] leading-relaxed text-muted-faint">
          Nothing saved in the steps yet. Once you write a line in any Try or Reflect box, it can be brought in here
          without typing it again.
        </p>
      )}
    </section>
  );
}