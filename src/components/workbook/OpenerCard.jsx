import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";
import { OPENER_LESSON_CODE } from "@/lib/curriculum";

/**
 * The life-mapping step, on its own. It sits after Getting Started and before Module 1.
 */
export default function OpenerCard({ lesson }) {
  if (!lesson) return null;

  return (
    <section>
      <h2 className="workbook-label">Before Module 1</h2>
      <Link
        to={`/lesson/${OPENER_LESSON_CODE}`}
        className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:bg-secondary sm:flex-row sm:items-center sm:justify-between sm:gap-8"
      >
        <span className="min-w-0">
          <span className="block text-[19px] font-semibold text-foreground">{lesson.title}</span>
          {lesson.purpose ? (
            <span className="mt-1 block max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
              {lesson.purpose}
            </span>
          ) : null}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-accent-ink">
          <Map className="h-4 w-4" aria-hidden="true" />
          Open this step
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
}