import React from "react";
export function SingleChoice({ legend, hint, options, value, onChange, idPrefix }) {
  return (
    <fieldset className="min-w-0">
      {legend ? <legend className="text-[17px] font-medium leading-snug text-foreground">{legend}</legend> : null}
      {hint ? <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      <div className="mt-3 flex flex-col gap-2" role="group">
        {options.map((option) => {
          const label = typeof option === "string" ? option : option.label;
          const active = value === label;
          return (
            <button
              key={`${idPrefix || ""}${label}`}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : label)}
              className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-[16px] transition-colors ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  active ? "border-primary-foreground" : "border-input"
                }`}
              >
                {active ? <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" /> : null}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const PANEL_TONES = {
  reading: { label: "Reading", className: "border-border bg-card" },
  example: { label: "Example", className: "border-border bg-secondary" },
  yours: { label: "Your words", className: "border-primary/40 bg-card" },
  note: { label: "", className: "border-dashed border-input bg-card" },
};

/** Keeps examples, teaching, and the participant's own words visibly different. */
export function Panel({ tone = "note", label, title, children }) {
  const style = PANEL_TONES[tone] || PANEL_TONES.note;
  const tag = label ?? style.label;
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${style.className}`}>
      {tag ? <p className="workbook-label">{tag}</p> : null}
      {title ? <h3 className={`${tag ? "mt-1.5" : ""} font-heading text-[19px] leading-snug text-foreground`}>{title}</h3> : null}
      <div className={tag || title ? "mt-3 space-y-3" : "space-y-3"}>{children}</div>
    </div>
  );
}

export function P({ children }) {
  return <p className="max-w-[68ch] text-[17px] leading-relaxed text-foreground">{children}</p>;
}

