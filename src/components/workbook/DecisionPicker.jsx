import React from "react";
import { NEXT_DECISIONS } from "@/lib/workbook";

export default function DecisionPicker({ value, onChange, note }) {
  return (
    <div className="rounded-lg border border-copper/30 bg-copper-wash/60 p-4 sm:p-5">
      <p className="workbook-label text-copper">Next decision</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        {note ||
          "Every one of these is a complete answer. “I don't know yet” is always available and never needs a reason."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {NEXT_DECISIONS.map((decision) => {
          const active = value === decision;
          return (
            <button
              key={decision}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : decision)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${
                active
                  ? "border-copper bg-copper text-ivory"
                  : "border-natural bg-white text-ink-soft hover:border-copper/60 hover:text-copper"
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