import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isComingLater } from "@/lib/curriculum";
import { describeStep } from "@/lib/workbook";
import { buildProgress } from "@/lib/progress";

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
  // The gate is worked out from every container, Getting Started included, so the
  // numbered modules wait on it. Only the numbered modules are listed below.
  const progress = useMemo(
    () => buildProgress({ modules, lessonsByOrder, answers, states }),
    [modules, lessonsByOrder, answers, states]
  );
  const numbered = modules.filter((module) => module.kind !== "orientation");

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
      {numbered.map((module) => {
        const lessons = lessonsByOrder[module.order] || [];
        const coming = isComingLater(module);
        const row = progress.byOrder[module.order];
        const locked = Boolean(row && !row.unlocked && !coming);
        const blocker = locked && progress.blockingOrder !== null ? progress.byOrder[progress.blockingOrder] : null;
        const done = lessons.filter(
          (lesson) => describeStep(lesson.code, answers, decisions, states) !== "not answered"
        ).length;

        const body = (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0">
              <p className="workbook-label">
                {module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`}
              </p>
              <h3 className={`mt-1 text-[18px] ${coming ? "text-muted-faint" : "text-foreground"}`}>{module.title}</h3>
              <p className={`mt-1 max-w-[68ch] text-[15px] leading-relaxed ${coming ? "text-muted-faint" : "text-muted-foreground"}`}>
                {module.purpose}
              </p>
              {locked && blocker ? (
                <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-faint">
                  {/* The steps before this one are its own requirement. They are not named here, so no
                      earlier section reads as part of this module. */}
                  Opens when {blocker.label} is done. {blocker.missing.length}{" "}
                  {blocker.missing.length === 1 ? "step is" : "steps are"} still open.
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-left sm:text-right">
              {coming ? (
                <span className="inline-block rounded-md border border-input bg-card px-3 py-1 text-[14px] text-muted-faint">
                  Coming later
                </span>
              ) : locked ? (
                <span className="inline-block rounded-md border border-input bg-card px-3 py-1 text-[14px] text-foreground">
                  Not open yet
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-[14px] text-accent-ink">
                  {lessons.length} steps{done ? ` · ${done} done` : ""}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </div>
          </div>
        );

        return (
          <li key={module.id || module.slug} className="py-5">
            {coming || locked ? (
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