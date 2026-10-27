import React from "react";
import { NEXT_DECISIONS } from "@/lib/workbook";

/** The shared Next Decision words as plain chips. Nothing is selected by default. */
export default function DecisionChips({ value, onChange, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {NEXT_DECISIONS.map((decision) => {
        const active = value === decision;
        return (
          <button
            key={decision}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? "" : decision)}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
              active
                ? "border-copper bg-copper text-ivory"
                : "border-natural bg-card text-ink-soft hover:border-copper/60 hover:text-copper"
            }`}
          >
            {decision}
          </button>
        );
      })}
    </div>
  );
}