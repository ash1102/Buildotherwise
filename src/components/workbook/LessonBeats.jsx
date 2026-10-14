import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Surfaces a section can use. Written as literal strings so Tailwind keeps them. */
const TONES = {
  plain: "border-border bg-card",
  show: "border-border bg-secondary",
  out: "border-dashed border-input bg-card",
  boundary: "border-border bg-card",
};

/**
 * A step opens one part at a time, so the teaching is met in order. Parts already
 * read collapse to a quiet line that can be reopened, and anyone who would rather
 * read straight through can open the whole step. Moving to another part brings its
 * heading into view below the sticky header and moves focus to that heading — never
 * into a writing box, and never while someone is writing.
 */
export default function LessonBeats({ beats, journalHref = "" }) {
  const [current, setCurrent] = useState(0);
  const [openAll, setOpenAll] = useState(false);
  const headingRefs = useRef([]);
  const firstRun = useRef(true);
  const total = beats.length;
  const next = beats[current + 1] || null;
  const prev = current > 0 ? beats[current - 1] : null;
  const last = current >= total - 1;
  const currentKey = beats[current] ? beats[current].key : null;

  // Keyed on the part itself, not on the beats array. A save landing while someone is
  // typing re-renders this step, and that must not move the page or take the caret.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    // Scroll the part itself: it carries the scroll offset that clears the sticky
    // header, then focus lands on the heading without scrolling again.
    const section = document.getElementById(`section-${currentKey}`);
    if (section) section.scrollIntoView({ block: "start" });
    const heading = headingRefs.current[current];
    if (heading) heading.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  const openBeat = (index) => {
    if (index < 0 || index >= total) return;
    setOpenAll(false);
    setCurrent(index);
  };

  const sectionCard = (beat, index) => {
    if (beat.bare) {
      return (
        <div key={beat.key} id={`section-${beat.key}`}>
          <h3 ref={(node) => (headingRefs.current[index] = node)} tabIndex={-1} className="sr-only">
            {beat.label}
          </h3>
          {beat.content}
        </div>
      );
    }

    const reopenIndex = beat.reopen ? beats.findIndex((item) => item.key === beat.reopen.key) : -1;

    return (
      <section
        key={beat.key}
        id={`section-${beat.key}`}
        aria-label={`${beat.label}, part ${index + 1} of ${total}`}
        className={`rounded-xl border p-4 sm:p-5 ${TONES[beat.tone || "plain"]}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 ref={(node) => (headingRefs.current[index] = node)} tabIndex={-1} className="workbook-label">
            {beat.label}
          </h3>
          <span className="text-[13px] text-muted-faint">
            Part {index + 1} of {total}
          </span>
        </div>
        {reopenIndex >= 0 ? (
          <button
            type="button"
            onClick={() => openBeat(reopenIndex)}
            className="mt-1 text-[14px] font-medium text-accent-ink underline underline-offset-2"
          >
            {beat.reopen.label}
          </button>
        ) : null}
        <div className="mt-3">{beat.content}</div>
      </section>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {beats.map((beat, index) => (
            <span
              key={beat.key}
              className={`h-1.5 rounded-full transition-all ${
                openAll || index <= current ? "w-6 bg-primary" : "w-3 bg-input"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span aria-live="polite" className="text-[13px] text-muted-faint">
            {openAll ? `All ${total} parts open` : `${beats[current].label.replace(/\.$/, "")} · part ${current + 1} of ${total}`}
          </span>
          <button
            type="button"
            onClick={() => setOpenAll((value) => !value)}
            className="text-[13px] font-medium text-accent-ink underline underline-offset-2"
          >
            {openAll ? "Back to one part at a time" : "Read the whole step"}
          </button>
        </div>
      </div>

      {openAll
        ? beats.map((beat, index) => sectionCard(beat, index))
        : beats.map((beat, index) => {
            if (index === current) return sectionCard(beat, index);
            if (index > current) return null;

            return (
              <button
                key={beat.key}
                type="button"
                onClick={() => openBeat(index)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-left transition hover:bg-secondary"
              >
                <span className="flex min-w-0 items-center gap-2 text-[14px] text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-input text-[11px] text-muted-faint">
                    {index + 1}
                  </span>
                  <span className="truncate">{beat.label}</span>
                </span>
                <span className="shrink-0 text-[13px] text-muted-faint">Reopen</span>
              </button>
            );
          })}

      {!openAll && !last ? (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {prev ? (
            <button
              type="button"
              onClick={() => openBeat(current - 1)}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3.5 py-2 text-[15px] text-foreground transition hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous part
            </button>
          ) : null}
          {next ? (
            <button
              type="button"
              onClick={() => openBeat(current + 1)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Next part · {next.label}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      {openAll || last ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <p className="text-[14px] text-muted-faint">Saved as you type.</p>
          {journalHref ? (
            <Link to={journalHref} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
              See it in your journal
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}