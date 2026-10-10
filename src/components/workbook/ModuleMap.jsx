import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isComingLater } from "@/lib/curriculum";
import { describeStep } from "@/lib/workbook";

/** Placeholder rows keep the list's height while the curriculum loads, so nothing jumps under a reaching cursor. */
const SKELETON_ROWS = 10;

function SkeletonRow() {
  return (
    <li className="py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="h-3.5 w-24 animate-pulse rounded bg-border" />
          <div className="mt-2.5 h-6 w-60 max-w-full animate-pulse rounded bg-border" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-border/70" />
          <div className="mt-2 h-4 w-2/3 max-w-xl animate-pulse rounded bg-border/70" />
        </div>
        <div className="mt-1 h-4 w-28 shrink-0 animate-pulse rounded bg-border/70 sm:mt-2" />
      </div>
    </li>
  );
}

export default function ModuleMap({ modules, lessonsByOrder, answers, decisions, states, loading }) {
  if (loading) {
    return (
      <ol aria-busy="true" className="divide-y divide-border border-y border-border">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </ol>
    );
  }

  return (
    <ol className="divide-y divide-border border-y border-border">
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
              <h3 className={`mt-1 font-heading text-xl ${coming ? "text-muted-faint" : "text-foreground"}`}>{module.title}</h3>
              <p className={`mt-1.5 max-w-2xl text-[13.5px] leading-relaxed ${coming ? "text-muted-faint" : "text-muted-foreground"}`}>
                {module.purpose}
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              {coming ? (
                <span className="inline-block rounded-full border border-dashed border-input px-3 py-1 text-[11.5px] uppercase tracking-[0.14em] text-muted-faint">
                  Coming later
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-[12.5px] text-primary">
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
                className="block rounded-lg transition hover:bg-card/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-ink"
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