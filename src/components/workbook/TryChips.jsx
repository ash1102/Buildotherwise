import React from "react";

/** A tappable choice. Same look as the participation route chips. */
export function Chip({ active, onClick, children, block = false }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md border px-3.5 py-2 text-left text-[15px] transition ${block ? "w-full" : ""} ${
        active
          ? "border-accent-ink bg-accent-ink text-white"
          : "border-input bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

/** A labelled group of choices, with an optional quiet hint under the label. */
export function ChipGroup({ label, hint, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[16px] font-medium leading-snug text-foreground">{label}</legend>
      {hint ? <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}