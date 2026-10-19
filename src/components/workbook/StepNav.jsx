import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * The end of a step. This is where the whole lesson/module moves on, which is a
 * different action from the section-by-section controls inside the step.
 */
function nextDestination(next, nextIsModule) {
  if (!next) return "";
  return nextIsModule ? `Module ${next.module_order}: ${next.title}` : next.title;
}

export default function StepNav({
  prev,
  next,
  nextIsModule = false,
  workbookLink = "/",
  backLabel = "Back to the workbook",
  forward = null,
  endNote,
  nextLabel = "",
  nameNext = false,
  journalHref = "",
  backEqual = false,
}) {
  const destination = nextDestination(next, nextIsModule);
  const journal = journalHref ? (
    <Link to={journalHref} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
      See it in your journal
    </Link>
  ) : null;

  const nextControl = next ? (
    <Link
      to={`/lesson/${next.code}`}
      aria-label={nameNext ? `Next: ${destination}` : nextLabel ? `${nextLabel}: ${next.title}` : undefined}
      className="inline-flex max-w-full items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      {nameNext ? (
        <span className="min-w-0 text-left">
          <span className="block text-[13px] text-primary-foreground/80">Next</span>
          <span className="block truncate">{destination}</span>
        </span>
      ) : nextLabel ? (
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
      className="inline-flex max-w-full items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      <span className="min-w-0">
        <span className="block text-[13px] text-primary-foreground/80">{forward.kicker || "Next"}</span>
        <span className="block truncate">{forward.title}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </Link>
  ) : endNote === "" ? null : (
    <span className="text-[15px] text-muted-faint">{endNote || "This is the last step in Pilot 1."}</span>
  );

  return (
    <nav className="no-print flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Link
          to={workbookLink}
          className={
            backEqual
              ? "inline-flex items-center justify-center gap-2 self-start rounded-md border border-primary bg-card px-4 py-2.5 text-[15px] font-medium text-foreground transition hover:bg-secondary"
              : "inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
          }
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

      {journal || nextControl ? (
        <div className="flex flex-col items-start gap-3 sm:ml-auto sm:flex-row sm:items-center">
          {journal}
          {nextControl}
        </div>
      ) : null}
    </nav>
  );
}