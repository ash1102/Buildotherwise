import React from "react";
import Prose from "../Prose";
import StepReading from "../StepReading";
import { Quote } from "../moduleOne/parts";
import { plainValue } from "@/lib/moduleOne";
import { CONDITION_BY_ID, EARLIER_M3, attemptedText, experimentHasPlan, hasResult } from "@/lib/moduleThree";

/** Answers saved in the earlier version of a Module 3 lesson. Read-only, never rewritten. */
export function EarlierM3({ code, answers }) {
  const rows = (EARLIER_M3[code] || [])
    .map((item) => ({ ...item, value: plainValue((answers || {})[item.key]).trim() }))
    .filter((item) => item.value);
  if (!rows.length) return null;
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer text-[15px] font-medium text-foreground">
        Answers you saved in an earlier version of this lesson ({rows.length})
      </summary>
      <div className="mt-3 space-y-3">
        {rows.map((row) => (
          <Quote key={row.key} label={row.label}>
            {row.value}
          </Quote>
        ))}
        <p className="text-[14px] text-muted-faint">Kept as you wrote them. They’re also in your journal.</p>
      </div>
    </details>
  );
}

/** The neutral example, in the lesson record's own words (the step's "show" text). */
export function ExamplePanel({ lesson }) {
  if (!lesson?.show) return null;
  return (
    <div className="rounded-xl border border-border bg-secondary p-4 sm:p-5">
      <p className="workbook-label">Provided example</p>
      <div className="mt-2">
        <Prose text={lesson.show} />
      </div>
    </div>
  );
}

/** The step's published reading, unchanged, folded away for anyone who wants all of it. */
export function FullReading({ readings }) {
  if (!readings?.length) return null;
  return (
    <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <summary className="cursor-pointer text-[16px] font-medium text-foreground">
        Read the full reading (optional)
      </summary>
      <div className="mt-4 divide-y divide-border">
        {readings.map((reading) => (
          <div key={reading.id} className="py-4 first:pt-0 last:pb-0">
            <StepReading title={reading.title} body={reading.body} startOpen />
          </div>
        ))}
      </div>
    </details>
  );
}

/**
 * The experiment, read back exactly as saved. Lines nobody filled in are left out.
 * A missing result is said plainly, never filled in.
 */
export function ExperimentCard({ x, label = "Your experiment", showResult = false }) {
  if (!experimentHasPlan(x) && !x.outcome && !x.exampleUse) return null;
  const rows = [
    { label: "Task", value: x.task },
    { label: "Condition", value: x.condition ? CONDITION_BY_ID[x.condition].option : "" },
    { label: "Planned adjustment", value: x.adjustment },
    { label: "Limit or stopping point", value: x.limit },
  ];
  if (showResult) {
    rows.push({ label: "What was actually attempted", value: attemptedText(x) });
    rows.push({ label: "Reported outcome", value: hasResult(x) ? x.outcome : "" });
    rows.push({ label: "Your observation", value: x.observation });
  }
  const shown = rows.filter((row) => row.value);
  return (
    <div className="rounded-xl border border-primary/40 bg-card p-4 sm:p-5">
      <p className="workbook-label">{label}</p>
      <dl className="mt-3 space-y-3">
        {shown.map((row) => (
          <div key={row.label}>
            <dt className="text-[13px] text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      {showResult && !hasResult(x) ? (
        <p className="mt-3 rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          No result has been recorded yet. This is your plan.
        </p>
      ) : null}
    </div>
  );
}

/** A note that appears under a choice. */
export function Feedback({ children }) {
  return (
    <div aria-live="polite" className="rounded-lg bg-secondary p-3 sm:p-4">
      <p className="text-[16px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
