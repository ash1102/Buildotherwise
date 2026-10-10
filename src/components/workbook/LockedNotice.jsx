import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";

/**
 * A module waiting on the journal. Wording here is deliberately unlike the
 * coming-later notice: this module is built and waiting, not unwritten. The steps
 * that need a line are listed with direct links, so nothing is implied as open.
 */
export default function LockedNotice({ module, blocking, missing }) {
  const steps = missing || [];
  const blockingName = blocking
    ? `Module ${blocking.order}${blocking.title ? ` — ${blocking.title}` : ""}`
    : "the module before this one";

  return (
    <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
      <p className="workbook-label">Not open yet</p>
      <h2 className="mt-2">
        {module ? `Module ${module.order} — ${module.title}` : "This module"} opens once the journal has your lines
      </h2>
      <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
        One line in any Try or Reflect box is all a step needs, and any length counts — “I don’t know yet” is a complete
        answer.{" "}
        {steps.length
          ? `${steps.length} ${steps.length === 1 ? "step still needs" : "steps still need"} a line in ${blockingName}.`
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