import React from "react";
import { activityCount, lessonCount, pilotLabel, readingCount } from "@/lib/preview/course";

/** The top of a section: what it is, which pilot it belongs to, and how much is in it. */
export default function SectionHeader({ section }) {
  const pilot = pilotLabel(section);
  return (
    <header className="border-b border-border pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="workbook-label">{section.order ? `Module ${section.order}` : "Before you start"}</span>
        {pilot ? (
          <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
            {pilot}
          </span>
        ) : (
          <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] text-muted-faint">
            Not a numbered module
          </span>
        )}
      </div>

      <h1 className="mt-3">{section.title}</h1>
      <p className="workbook-prose mt-2">{section.purpose}</p>

      <p className="mt-3 text-[15px] text-muted-faint">
        {readingCount(section)} {readingCount(section) === 1 ? "reading" : "readings"} · {lessonCount(section)}{" "}
        {lessonCount(section) === 1 ? "lesson" : "lessons"} · {activityCount(section)}{" "}
        {activityCount(section) === 1 ? "activity" : "activities"}
      </p>
    </header>
  );
}