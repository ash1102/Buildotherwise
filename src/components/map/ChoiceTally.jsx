import React from "react";
import { Link } from "react-router-dom";

/**
 * The choices the workbook recorded: Next Decisions, and how each step was taken.
 * Recorded as plain labels — never as a bar, a score or a gap.
 */
function Tally({ title, note, rows, empty }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="workbook-label">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{note}</p>

      {rows.length ? (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
              <p className="text-[16px] font-medium text-foreground">{row.label}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {row.steps.map((step) => (
                  <Link
                    key={step.code}
                    to={`/lesson/${step.code}`}
                    className="text-[14px] font-medium text-accent-ink underline underline-offset-2"
                  >
                    {step.title || step.code}
                  </Link>
                ))}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[16px] leading-relaxed text-muted-faint">{empty}</p>
      )}
    </section>
  );
}

export default function ChoiceTally({ decisionRows, routeRows }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Tally
        title="Next Decisions you recorded"
        note="Each one is a complete answer, and any of them can be changed later."
        rows={decisionRows}
        empty="No Next Decision has been recorded yet. They appear here as you make them."
      />
      <Tally
        title="How you took part"
        note="Every route counts the same. Recorded as a choice, never as a gap."
        rows={routeRows}
        empty="No route chosen yet. Whichever one you pick on a step shows up here."
      />
    </div>
  );
}