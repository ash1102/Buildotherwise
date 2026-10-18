import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, PenLine } from "lucide-react";
import { formatOpenDate } from "@/lib/pacing";

/**
 * A module waiting on the journal. Wording here is deliberately unlike the
 * coming-later notice: this module is built and waiting, not unwritten. The steps
 * that need a line are listed with direct links, so nothing is implied as open.
 */
export default function LockedNotice({ module, blocking, missing, row }) {
  if (row && row.lockReason === "week") return <WeekNotice module={module} row={row} />;
  const steps = missing || [];
  const blockingName = blocking
    ? blocking.kind === "orientation"
      ? "Getting Started"
      : `Module ${blocking.order}${blocking.title ? `: ${blocking.title}` : ""}`
    : "the section before this one";

  return (
    <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
      <p className="workbook-label">Not open yet</p>
      <h2 className="mt-2">
        {module ? `Module ${module.order}: ${module.title}` : "This module"} opens once the earlier steps are done
      </h2>
      <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
        {steps.length
          ? `${steps.length} ${steps.length === 1 ? "step is" : "steps are"} still open in ${blockingName}.`
          : null}
      </p>

      {steps.length ? (
        <ul className="mt-4 space-y-2">
          {steps.map((step) => (
            <li key={step.code}>
              <Link
                to={`/lesson/${step.code}`}
                className="inline-flex items-start gap-2 text-[16px] font-medium text-accent-ink underline underline-offset-2"
              >
                <PenLine className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  {step.title}
                  {step.prompts && step.prompts.length ? (
                    <span className="block text-[14px] font-normal text-muted-faint">
                      Write in {step.prompts[0].kind}: {step.prompts[0].label}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Back to the workbook
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/journal" className="text-[15px] text-muted-foreground hover:text-foreground">
          Open the journal
        </Link>
      </div>
    </section>
  );
}

/**
 * Weekly pacing. The earlier steps are done; this module simply opens next week.
 * Nothing here suggests the person is behind or has done something wrong.
 */
function WeekNotice({ module, row }) {
  const date = formatOpenDate(row.opensAt);
  return (
    <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
      <p className="workbook-label inline-flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Opens {date ? date : "next week"}
      </p>
      <h2 className="mt-2">
        {module ? `Module ${module.order}: ${module.title}` : "This module"} opens a week after {row.previousLabel || "the last module"} did
      </h2>
      <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
        One new module opens each week. The week gives what you noticed or planned time to happen out in your life, and
        the aim is to keep the workbook to about 2–3 hours a week. You haven’t missed anything, and nothing is overdue.
      </p>
      <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        Until then, everything already open stays open. You can go back to a step, add to your journal, or work on
        your Life Map.
      </p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Back to the workbook
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/journal" className="text-[15px] text-muted-foreground hover:text-foreground">
          Open the journal
        </Link>
      </div>
    </section>
  );
}