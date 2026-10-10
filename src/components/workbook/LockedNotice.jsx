import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";

/**
 * A module waiting on the journal. Wording here is deliberately unlike the
 * coming-later notice: this module is built and waiting, not unwritten.
 */
export default function LockedNotice({ module, blocking, missing }) {
  const steps = missing || [];
  const blockingName = blocking
    ? `Module ${blocking.order}${blocking.title ? ` — ${blocking.title}` : ""}`
    : "the module before this one";

  return (
    <section className="rounded-lg border border-dashed border-primary/35 bg-card/70 p-6">
      <p className="workbook-label">Not open yet</p>
      <h2 className="mt-2 font-heading text-xl">
        {module ? `Module ${module.order} — ${module.title}` : "This module"} opens once the journal has your lines
      </h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        One line in any Try or Reflect box is all a step needs, and any length counts — “I don’t know yet” is a complete
        answer. {steps.length ? `${steps.length} ${steps.length === 1 ? "step still needs" : "steps still need"} a line in ${blockingName}.` : null}
      </p>

      {steps.length ? (
        <ul className="mt-4 space-y-2">
          {steps.map((step) => (
            <li key={step.code}>
              <Link
                to={`/lesson/${step.code}`}
                className="inline-flex items-start gap-2 text-[14px] text-primary underline decoration-border underline-offset-4 transition hover:text-accent-ink"
              >
                <PenLine className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {step.title}
                  {step.prompts && step.prompts.length ? (
                    <span className="block text-[12.5px] text-muted-faint">
                      Write in {step.prompts[0].kind}: {step.prompts[0].label}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        to="/"
        className="mt-5 inline-flex items-center gap-2 text-[13.5px] text-muted-foreground transition hover:text-primary"
      >
        Back to the program list
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </section>
  );
}