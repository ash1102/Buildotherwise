import React from "react";
import { NEXT_DECISIONS } from "@/lib/workbook";

function offersUnknown(options) {
  return options.some((option) => /^i don[’']t know yet$/i.test(String(option).trim()));
}

/** Tappable choices. A lesson can name its own list. Otherwise all eight are offered. */
export default function DecisionPicker({ value, onChange, options }) {
  const choices = options && options.length ? options : NEXT_DECISIONS;

  return (
    <div className="rounded-xl border border-border bg-secondary p-4 sm:p-5">
      <p className="workbook-label">Next decision</p>
      <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        {offersUnknown(choices) ? "Pick one. “I don’t know yet” is fine." : "Pick one."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {choices.map((decision) => {
          const active = value === decision;
          return (
            <button
              key={decision}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : decision)}
              className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                active
                  ? "border-accent-ink bg-accent-ink text-primary-foreground"
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
