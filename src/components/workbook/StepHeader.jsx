import React from "react";

export default function StepHeader({ moduleTitle, stepNumber, stepCount, title, duration, purpose, status }) {
  return (
    <header className="border-b border-border pb-5">
      <p className="workbook-label">
        {moduleTitle}
        {stepNumber ? ` · Step ${stepNumber} of ${stepCount}` : ""}
        {duration ? ` · About ${duration} min` : ""}
      </p>
      <h1 className="mt-2">{title}</h1>
      {purpose ? <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">{purpose}</p> : null}
      {status && status !== "not answered" ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[14px] text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          {status === "paused"
            ? "You wrote your line and paused this step. It stays here whenever you want it."
            : status === "decided"
              ? "You recorded a Next Decision here."
              : "You have something saved on this step."}
        </p>
      ) : null}
    </header>
  );
}