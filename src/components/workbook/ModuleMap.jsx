import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isComingLater } from "@/lib/curriculum";
import { describeStep } from "@/lib/workbook";

export default function ModuleMap({ modules, lessonsByOrder, answers, decisions, states }) {
  return (
    <ol className="divide-y divide-natural border-y border-natural">
      {modules.map((module) => {
        const lessons = lessonsByOrder[module.order] || [];
        const coming = isComingLater(module);
        const done = lessons.filter(
          (lesson) => describeStep(lesson.code, answers, decisions, states) !== "not answered"
        ).length;

        const body = (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0">
              <p className="workbook-label">
                {module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`}
              </p>
              <h3 className={`mt-1 font-heading text-xl ${coming ? "text-ink-faint" : "text-ink"}`}>{module.title}</h3>
              <p className={`mt-1.5 max-w-2xl text-[13.5px] leading-relaxed ${coming ? "text-ink-faint" : "text-ink-soft"}`}>
                {module.purpose}
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              {coming ? (
                <span className="inline-block rounded-full border border-dashed border-natural-deep px-3 py-1 text-[11.5px] uppercase tracking-[0.14em] text-ink-faint">
                  Coming later
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-[12.5px] text-teal-deep">
                  {lessons.length} steps{done ? ` · ${done} with something saved` : ""}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </div>
          </div>
        );

        return (
          <li key={module.id || module.slug} className={coming ? "py-5" : "py-5"}>
            {coming ? (
              <div aria-disabled="true">{body}</div>
            ) : (
              <Link
                to={`/module/${module.slug}`}
                className="block rounded-lg transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
              >
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}