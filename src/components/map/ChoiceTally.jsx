import React from "react";
import { Link } from "react-router-dom";

const BAR = {
  copper: "bg-copper/70",
  teal: "bg-teal-deep/70",
};

function Tally({ title, note, rows, peak, tone, empty }) {
  return (
    <section className="rounded-lg border border-natural bg-white p-5">
      <p className="workbook-label">{title}</p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">{note}</p>

      {rows.length ? (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13.5px] text-ink">{row.label}</span>
                <span className="shrink-0 text-[12.5px] text-ink-faint">{row.steps.length}</span>
              </div>
              <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-ivory-deep">
                <span
                  className={`block h-full rounded-full ${BAR[tone]}`}
                  style={{ width: `${Math.round((row.steps.length / peak) * 100)}%` }}
                />
              </span>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {row.steps.map((step) => (
                  <Link
                    key={step.code}
                    to={`/lesson/${step.code}`}
                    className="text-[12px] text-teal-deep underline decoration-natural underline-offset-2"
                  >
                    {step.code}
                  </Link>
                ))}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13.5px] leading-relaxed text-ink-faint">{empty}</p>
      )}
    </section>
  );
}

/** The choices the workbook recorded: Next Decisions, and how each step was taken. */
export default function ChoiceTally({ decisionRows, routeRows }) {
  const peak = Math.max(
    1,
    ...decisionRows.map((row) => row.steps.length),
    ...routeRows.map((row) => row.steps.length)
  );

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Tally
        title="Next Decisions you recorded"
        note="Each one is a complete answer, and any of them can be changed later."
        rows={decisionRows}
        peak={peak}
        tone="copper"
        empty="No Next Decision has been recorded yet. They appear here as you make them."
      />
      <Tally
        title="How you took part"
        note="Every route counts the same. Recorded as a choice, never as a gap."
        rows={routeRows}
        peak={peak}
        tone="teal"
        empty="No route chosen yet. Whichever one you pick on a step shows up here."
      />
    </div>
  );
}