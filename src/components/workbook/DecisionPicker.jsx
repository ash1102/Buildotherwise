import React from "react";
import { NEXT_DECISIONS } from "@/lib/workbook";

/** Every decision is a complete answer, and "I don't know yet" is always offered. */
const OPTIONS = NEXT_DECISIONS.includes("I don't know yet") ? NEXT_DECISIONS : [...NEXT_DECISIONS, "I don't know yet"];

export default function DecisionPicker({ value, onChange, note }) {
  return (
    <div className="rounded-xl border border-border bg-secondary p-4 sm:p-5">
      <p className="workbook-label">Next decision</p>
      <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        {note || "Every one of these is a complete answer. “I don’t know yet” is always available and never needs a reason."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((decision) => {
          const active = value === decision;
          return (
            <button
              key={decision}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : decision)}
              className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                active
                  ? "border-accent-ink bg-accent-ink text-white"
                  : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {decision}
            </button>
          );
        })}
      </div>
    </div>
  );
}