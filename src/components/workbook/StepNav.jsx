import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * The end of a step. This is where the whole lesson/module moves on, which is a
 * different action from the section-by-section controls inside the step.
 */
export default function StepNav({
  prev,
  next,
  nextIsModule = false,
  workbookLink = "/",
  backLabel = "Back to the workbook",
  forward = null,
  endNote,
  nextLabel = "",
}) {
  return (
    <nav className="no-print flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Link
          to={workbookLink}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
        {prev ? (
          <Link to={`/lesson/${prev.code}`} className="text-[15px] text-muted-foreground hover:text-foreground">
            Previous {(prev.module_order ?? 0) === (next?.module_order ?? 0) ? "lesson" : "step"}: {prev.title}
          </Link>
        ) : null}
      </div>

      {next ? (
        <Link
          to={`/lesson/${next.code}`}
          aria-label={nextLabel ? `${nextLabel}: ${next.title}` : undefined}
          className="inline-flex max-w-full items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 sm:ml-auto sm:self-auto"
        >
          {nextLabel ? (
            <span>{nextLabel}</span>
          ) : (
            <span className="min-w-0">
              <span className="block text-[13px] text-primary-foreground/80">
                {nextIsModule ? "Next module" : "Next lesson"}
              </span>
              <span className="block truncate">{next.title}</span>
            </span>
          )}
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : forward ? (
        <Link
          to={forward.to}
          className="inline-flex max-w-full items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 sm:ml-auto sm:self-auto"
        >
          <span className="min-w-0">
            <span className="block text-[13px] text-primary-foreground/80">{forward.kicker || "Next"}</span>
            <span className="block truncate">{forward.title}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <span className="text-[15px] text-muted-faint sm:ml-auto">{endNote || "This is the last step in Pilot 1."}</span>
      )}
    </nav>
  );
}