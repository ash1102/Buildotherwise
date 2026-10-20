import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarPlus, Check } from "lucide-react";
import { REMINDER_OPTIONS, buildReminderIcs, downloadIcs, reminderDate } from "@/lib/afterTry";
import { Chip, ChipGroup } from "./TryChips";

/**
 * Shown in place of Next on a step that plans a real-world try.
 * Gives the try time to happen before the step that asks what happened.
 * The next step always stays reachable. Not trying is a valid result.
 */
export default function ComeBackAfterTry({
  lesson,
  next,
  workbookLink = "/",
  backLabel = "Back to the workbook",
  journalHref = "",
}) {
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState("");
  const [added, setAdded] = useState("");

  if (!next) return null;

  const addReminder = () => {
    if (!when) return;
    const date = reminderDate(when);
    const url = typeof window !== "undefined" ? `${window.location.origin}/lesson/${next.code}` : "";
    const ics = buildReminderIcs({ when: date, stepTitle: next.title, url });
    downloadIcs(`come-back-${next.code}.ics`, ics);
    setAdded(date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
  };

  if (!open) {
    return (
      <nav className="no-print flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={workbookLink}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
        <div className="flex flex-col items-start gap-3 sm:ml-auto sm:flex-row sm:items-center">
          {journalHref ? (
            <Link to={journalHref} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
              See it in your journal
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Next
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <section
      aria-labelledby={`after-try-${lesson.code}`}
      className="no-print rounded-2xl border border-border bg-card p-5 sm:p-7"
    >
      <p className="workbook-label">Between this step and the next</p>
      <h2 id={`after-try-${lesson.code}`} className="mt-2">
        Come back after your try
      </h2>
      <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
        The next step asks what happened. It works best once the try has had time to happen: later today, tomorrow, or
        whenever fits your week. Your plan is saved, so you can close this and pick it back up.
      </p>
      <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        Didn’t get to it, or something got in the way? That counts as a result. Come back and say so.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-secondary p-4 sm:p-5">
        <ChipGroup
          label="Want a reminder? (optional)"
          hint="This downloads a calendar file you can add to your own calendar. Nothing is sent to anyone."
        >
          {REMINDER_OPTIONS.map((option) => (
            <Chip key={option.id} active={when === option.id} onClick={() => setWhen(option.id)}>
              {option.label}
            </Chip>
          ))}
        </ChipGroup>
        <button
          type="button"
          onClick={addReminder}
          disabled={!when}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] font-medium text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Add the reminder to my calendar
        </button>
        {added ? (
          <p role="status" className="mt-3 inline-flex items-center gap-1.5 text-[15px] text-foreground">
            <Check className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            Calendar file downloaded for {added}. Open it to add it to your calendar.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          to={workbookLink}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          I’ll come back after my try
        </Link>
        <Link
          to={`/lesson/${next.code}`}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          I’m back, or I’m ready now: go to {next.title}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
