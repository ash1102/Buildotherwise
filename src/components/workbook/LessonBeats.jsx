import React from "react";
import { Link } from "react-router-dom";

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
/**
 * Display the lesson as a continuous reading experience.
 * Sections appear only when populated; no invented part-count or forced paging.
 * Keep saved answers and navigation managed by the parent LessonView.
 */
export default function LessonBeats({ beats, journalHref = "" }) {
  return (
    <div className="space-y-5">
      {beats.map((beat) =>
        beat.bare ? (
          <div key={beat.key} id={`section-${beat.key}`}>{beat.content}</div>
        ) : (
          <section
            key={beat.key}
            id={`section-${beat.key}`}
            aria-label={beat.label}
            className={`rounded-xl border p-4 sm:p-5 ${TONES[beat.tone || "plain"]}`}
          >
            <h3 className="workbook-label">{beat.label}</h3>
            {beat.reopen ? (
              <a href={`#section-${beat.reopen.key}`} className="mt-1 block text-[14px] text-accent-ink underline underline-offset-2">
                {beat.reopen.label}
              </a>
            ) : null}
            <div className="mt-3">{beat.content}</div>
          </section>
        )
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
        <p className="text-[14px] text-muted-faint">Saved as you type.</p>
        {journalHref ? (
          <Link to={journalHref} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
            See it in your journal
          </Link>
        ) : null}
      </div>
    </div>
  );
}
