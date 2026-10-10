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
      <div className="flex items-baseline justify-between">
        <p className="workbook-label">Steps</p>
        <span className="text-[12.5px] text-ink-faint">
          {lessons.length} steps {scopeLabel}
        </span>
      </div>

      {lessons.length ? (
        <ol className="mt-4 divide-y divide-natural border-y border-natural">
          {lessons.map((lesson) => {
            const status = describeStep(lesson.code, answers, decisions, states);
            const done = stepComplete(lesson, answers);
            return (
              <li key={lesson.id || lesson.code}>
                <Link to={`/lesson/${lesson.code}`} className="flex items-start gap-4 py-4 transition hover:bg-white/60">
                  <span className="mt-0.5 font-heading text-[15px] text-copper">
                    {String(lesson.order).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[18px] leading-snug text-ink">{lesson.title}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">{lesson.purpose}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-ink-faint">
                      <span>{lesson.duration_min ? `About ${lesson.duration_min} min` : lesson.type}</span>
                      <span className={done ? "text-teal-deep" : "text-ink-faint"}>
                        {done ? stepStatusLabel(status) : "One line still to write — any length"}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-natural-deep" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 text-[13.5px] text-ink-faint">No steps are published here yet.</p>
      )}
    </section>
  );
}