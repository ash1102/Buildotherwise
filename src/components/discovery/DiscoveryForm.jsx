import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DISCOVERY_CONTEXT_FIELDS, emptyDiscovery, hasContext } from "@/lib/discoveries";
import DecisionChips from "./DecisionChips";

/**
 * One writing area first, deeper questions folded away.
 * Every field is optional, and no decision is chosen unless the person chooses it.
 */
export default function DiscoveryForm({
  initial,
  sourceNote,
  showDecision = true,
  submitLabel = "Add to Discovery Record",
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({
    ...emptyDiscovery(),
    ...(initial || {}),
    context: { ...(initial?.context || {}) },
  }));
  const [openContext, setOpenContext] = useState(() => hasContext(initial?.context));

  const set = (patch) => setValues((current) => ({ ...current, ...patch }));
  const setContext = (key, value) =>
    setValues((current) => ({ ...current, context: { ...current.context, [key]: value } }));

  const submit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-natural bg-card p-5 sm:p-6">
      {sourceNote ? (
        <p className="mb-3 border-b border-natural pb-3 text-[12.5px] leading-relaxed text-teal-deep">
          {sourceNote}
        </p>
      ) : null}

      <label htmlFor="discovery-body" className="block font-heading text-[17px] leading-snug text-ink">
        What would you like to keep?
      </label>
      <Textarea
        id="discovery-body"
        value={values.body}
        onChange={(event) => set({ body: event.target.value })}
        rows={4}
        placeholder="A few words is enough. “I don’t know yet” is a complete answer."
        className="mt-3 min-h-[6rem] resize-y border-natural bg-ivory/60 text-[14px] leading-relaxed"
      />

      <div className="mt-4">
        <label htmlFor="discovery-title" className="block text-[12.5px] text-ink-faint">
          A few words to name it (optional)
        </label>
        <Input
          id="discovery-title"
          value={values.title}
          onChange={(event) => set({ title: event.target.value })}
          placeholder="Left blank, the entry is dated instead."
          className="mt-1 h-9 border-natural bg-ivory/60 text-[13.5px]"
        />
      </div>

      <button
        type="button"
        aria-expanded={openContext}
        onClick={() => setOpenContext(!openContext)}
        className="mt-4 inline-flex items-center gap-1.5 rounded text-[12.5px] text-teal-deep underline decoration-natural underline-offset-2 transition hover:text-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition ${openContext ? "rotate-180" : ""}`} aria-hidden="true" />
        Optional: add context
      </button>

      {openContext ? (
        <div className="mt-3 space-y-3">
          {DISCOVERY_CONTEXT_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-[12.5px] text-ink-faint" htmlFor={`discovery-${field.key}`}>
                {field.label}
              </label>
              <Textarea
                id={`discovery-${field.key}`}
                value={values.context[field.key] || ""}
                onChange={(event) => setContext(field.key, event.target.value)}
                rows={2}
                className="mt-1 min-h-[3.5rem] resize-y border-natural bg-ivory/60 text-[13.5px] leading-relaxed"
              />
            </div>
          ))}
          <p className="text-[12px] leading-relaxed text-ink-faint">
            These can stay empty. An observation, a question, a plan, or nothing final are all complete entries.
          </p>
        </div>
      ) : null}

      {showDecision ? (
        <div className="mt-5 border-t border-natural pt-4">
          <p className="workbook-label text-copper">Optional: next decision</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Nothing is selected for you. Pausing, stopping, and “not sure yet” are complete answers.
          </p>
          <DecisionChips className="mt-3" value={values.decision} onChange={(decision) => set({ decision })} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-full border-natural bg-card">
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}