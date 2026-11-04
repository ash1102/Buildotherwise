import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { KIND_LABELS } from "@/lib/library";
import Prose from "@/components/workbook/Prose";

/** One reading. It opens in place, so revisiting never means leaving the page. */
export default function LibraryCard({ resource, autoOpen = false }) {
  const [open, setOpen] = useState(autoOpen);

  return (
    <article className="workbook-card p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="workbook-label">{KIND_LABELS[resource.kind] || "Reading"}</span>
        {resource.lesson_code ? (
          <Link
            to={`/lesson/${resource.lesson_code}`}
            className="text-[12px] text-teal-deep underline decoration-natural underline-offset-2 transition hover:decoration-copper"
          >
            From {resource.lesson_code}
          </Link>
        ) : null}
      </div>

      <h3 className="mt-2 font-heading text-[19px] leading-snug">{resource.title}</h3>
      {resource.summary ? (
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{resource.summary}</p>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-3 inline-flex items-center gap-2 text-[13px] text-teal-deep transition hover:text-copper"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        {open ? "Close the reading" : "Read it here"}
        {open ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      {open ? (
        <div className="mt-4 border-t border-natural pt-4">
          <Prose text={resource.body} />
          {resource.source_label ? <p className="mt-4 text-[12px] text-ink-faint">{resource.source_label}</p> : null}
        </div>
      ) : null}
    </article>
  );
}