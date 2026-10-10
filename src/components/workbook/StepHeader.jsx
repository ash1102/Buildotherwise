import React from "react";
import DashedMotif from "./DashedMotif";

export default function StepHeader({ moduleTitle, stepNumber, stepCount, title, duration, purpose, status }) {
  return (
    <header className="border-b border-natural pb-6">
      <div className="flex items-start gap-4">
        <DashedMotif size="lg" />
        <div className="min-w-0">
          <p className="workbook-label">
            {moduleTitle}
            {stepNumber ? ` · Step ${stepNumber} of ${stepCount}` : ""}
            {duration ? ` · About ${duration} min` : ""}
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">{title}</h1>
        </div>
      </div>
      {purpose ? <p className="mt-5 font-heading text-[17px] italic leading-relaxed text-teal-deep">{purpose}</p> : null}
      {status && status !== "not answered" ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-natural bg-white px-3 py-1 text-[12px] text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
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