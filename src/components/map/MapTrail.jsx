import React from "react";
import { Link } from "react-router-dom";
import { isComingLater } from "@/lib/curriculum";
import { STATE_DOT, STATE_LABEL, STATE_ORDER, STATE_STYLE } from "@/lib/discoveryMap";
import DashedMotif from "@/components/workbook/DashedMotif";

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {STATE_ORDER.map((state) => (
        <li key={state} className="flex items-center gap-2 text-[12px] text-ink-faint">
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

      <div className="relative mt-6">
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[13px] top-6 border-l border-dashed border-natural-deep"
        />

        <ol className="space-y-5">
          {trail.map((row) => {
            const { module, steps, choices, carriedIn, written } = row;
            const coming = isComingLater(module);

            return (
              <li key={row.key} className="flex gap-4">
                {module.kind === "orientation" ? (
                  <span className="relative z-10 mt-0.5 shrink-0">
                    <DashedMotif size="sm" />
                  </span>
                ) : (
                  <span
                    className={`relative z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-ivory text-[12.5px] font-medium ${
                      coming ? "border-dashed border-natural-deep text-ink-faint" : "border-teal-deep/40 text-teal-deep"
                    }`}
                  >
                    {module.order}
                  </span>
                )}

                <div
                  className={`min-w-0 flex-1 rounded-lg border p-4 sm:p-5 ${
                    coming ? "border-dashed border-natural-deep bg-white/50" : "border-natural bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <div className="min-w-0">
                      <p className="workbook-label">
                        {module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`}
                      </p>
                      <h3
                        className={`mt-1 font-heading text-lg leading-snug ${
                          coming ? "text-ink-faint" : "text-ink"
                        }`}
                      >
                        {module.title}
                      </h3>
                    </div>
                    {steps.length ? (
                      <p className="text-[12.5px] text-ink-faint">
                        {written ? `${written} of ${steps.length} steps carry something you saved` : "Nothing saved here yet"}
                      </p>
                    ) : (
                      <p className="text-[12.5px] text-ink-faint">Coming later</p>
                    )}
                  </div>

                  {steps.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {steps.map((step) => (
                        <Link
                          key={step.code}
                          to={`/lesson/${step.code}`}
                          aria-label={`${step.title} — ${STATE_LABEL[step.status]}`}
                          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition hover:-translate-y-0.5 ${STATE_STYLE[step.status]}`}
                        >
                          <span className="font-medium">{step.order}</span>
                          <span className="truncate">{step.title}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {carriedIn.length ? (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
                      Carried forward into this module from {carriedIn.join(", ")}.
                    </p>
                  ) : null}

                  {choices.length ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-natural/70 pt-3">
                      <span className="workbook-label text-copper">Choices recorded here</span>
                      {choices.map((choice) => (
                        <Link
                          key={choice.code}
                          to={`/lesson/${choice.code}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-copper-wash px-2.5 py-1 text-[12px] text-copper transition hover:bg-copper-wash/70"
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