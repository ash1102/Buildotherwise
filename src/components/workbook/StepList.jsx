import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { describeStep, stepStatusLabel, useWorkbook } from "@/lib/workbook";
import { stepComplete } from "@/lib/progress";

/** The steps of one container — a module, or Getting Started when it is standing on its own. */
export default function StepList({ lessons, scopeLabel }) {
  const { answers, decisions, states } = useWorkbook();

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="workbook-label">Steps</h2>
        <span className="text-[14px] text-muted-faint">
          {lessons.length} steps {scopeLabel}
        </span>
      </div>

      {lessons.length ? (
        <ol className="mt-3 divide-y divide-border border-y border-border">
          {lessons.map((lesson) => {
            const status = describeStep(lesson.code, answers, decisions, states);
            const done = stepComplete(lesson, answers, states);
            return (
              <li key={lesson.id || lesson.code}>
                <Link
                  to={`/lesson/${lesson.code}`}
                  className="flex items-start gap-4 py-4 transition hover:bg-secondary"
                >
                  <span className="mt-0.5 shrink-0 text-[15px] font-semibold text-accent-ink">
                    {String(lesson.order).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold leading-snug text-foreground">{lesson.title}</span>
                    {lesson.purpose ? (
                      <span className="mt-1 block text-[15px] leading-relaxed text-muted-foreground">
                        {lesson.purpose}
                      </span>
                    ) : null}
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted-faint">
                      <span>{lesson.duration_min ? `About ${lesson.duration_min} min` : lesson.type}</span>
                      <span className={done ? "font-medium text-accent-ink" : undefined}>{stepStatusLabel(status)}</span>
                    </span>
                  </span>
                  <ArrowRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-faint" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 text-[16px] text-muted-faint">No steps are published here yet.</p>
      )}
    </section>
  );
}