import React from "react";
import { Link } from "react-router-dom";
import { activityCount, lessonCount, pilotLabel, readingCount } from "@/lib/preview/course";

/** Every section in one list, with what each one holds and a way into it. */
export default function CourseOutline({ sections, activeKey }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const pilot = pilotLabel(section);
        return (
          <article
            key={section.key}
            className={`workbook-card p-5 ${activeKey === section.key ? "border-primary" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="workbook-label">
                  {section.order ? `Module ${section.order}` : section.label || "Before you start"}
                </p>
                <h2 className="mt-1 text-[20px]">{section.title}</h2>
              </div>
              {pilot ? (
                <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
                  {pilot}
                </span>
              ) : null}
            </div>

            <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{section.purpose}</p>

            <p className="mt-3 text-[14px] text-muted-faint">
              {readingCount(section)} readings · {lessonCount(section)} lessons · {activityCount(section)} activities
            </p>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {section.steps.map((step) => (
                <li key={step.code}>
                  <Link
                    to={`/preview/step/${step.code}`}
                    className="inline-flex rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground transition hover:bg-secondary"
                  >
                    {step.title}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to={`/preview/module/${section.slug}`}
              className="mt-4 inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2"
            >
              Open this section
            </Link>
          </article>
        );
      })}
    </div>
  );
}