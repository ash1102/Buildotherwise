import React from "react";
import { Link } from "react-router-dom";
import { isComingLater } from "@/lib/curriculum";
import { STATE_DOT, STATE_LABEL, STATE_ORDER, STATE_STYLE } from "@/lib/discoveryMap";

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {STATE_ORDER.map((state) => (
        <li key={state} className="flex items-center gap-2 text-[14px] text-muted-faint">
          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full border ${STATE_DOT[state]}`} />
          {STATE_LABEL[state]}
        </li>
      ))}
    </ul>
  );
}

/**
 * The trail: one station per module, its steps in order, and the choices
 * recorded inside them. Every mark opens the step it came from.
 */
export default function MapTrail({ trail }) {
  return (
    <div>
      <Legend />

      <div className="relative mt-5">
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[13px] top-6 border-l border-dashed border-input"
        />

        <ol className="space-y-4">
          {trail.map((row) => {
            const { module, steps, choices, carriedIn, written } = row;
            const coming = isComingLater(module);

            return (
              <li key={row.key} className="flex gap-4">
                <span
                  className={`relative z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-card text-[14px] font-medium ${
                    coming ? "border-dashed border-input text-muted-faint" : "border-input text-accent-ink"
                  }`}
                >
                  {module.kind === "orientation" ? "•" : module.order}
                </span>

                <div
                  className={`min-w-0 flex-1 rounded-xl border p-4 sm:p-5 ${
                    coming ? "border-dashed border-input bg-card" : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <div className="min-w-0">
                      <p className="workbook-label">
                        {module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`}
                      </p>
                      <h3 className={`mt-1 text-[18px] ${coming ? "text-muted-faint" : "text-foreground"}`}>
                        {module.title}
                      </h3>
                    </div>
                    {steps.length ? (
                      <p className="text-[14px] text-muted-faint">
                        {written ? `${written} of ${steps.length} steps carry something you saved` : "Nothing saved here yet"}
                      </p>
                    ) : (
                      <p className="text-[14px] text-muted-faint">Coming later</p>
                    )}
                  </div>

                  {steps.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {steps.map((step) => (
                        <Link
                          key={step.code}
                          to={`/lesson/${step.code}`}
                          aria-label={`${step.title} — ${STATE_LABEL[step.status]}`}
                          className={`inline-flex max-w-full items-center gap-2 rounded-md border px-3 py-1.5 text-[14px] transition hover:bg-secondary ${STATE_STYLE[step.status]}`}
                        >
                          <span className="font-medium">{step.order}</span>
                          <span className="truncate">{step.title}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {carriedIn.length ? (
                    <p className="mt-3 text-[14px] leading-relaxed text-muted-faint">
                      Carried forward into this module from {carriedIn.join(", ")}.
                    </p>
                  ) : null}

                  {choices.length ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <span className="workbook-label">Choices recorded here</span>
                      {choices.map((choice) => (
                        <Link
                          key={choice.code}
                          to={`/lesson/${choice.code}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-[14px] text-foreground"
                        >
                          <span className="font-medium">{choice.code}</span>
                          <span>{choice.decision || choice.route}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}