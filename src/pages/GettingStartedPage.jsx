import React from "react";
import { Link } from "react-router-dom";
import useCurriculum from "@/hooks/useCurriculum";
import { isOpenerLesson } from "@/lib/curriculum";
import StepList from "@/components/workbook/StepList";

/**
 * Getting Started keeps its own container rather than living inside the module
 * machinery: its own page, its own heading, and no module number anywhere.
 */
export default function GettingStartedPage() {
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const gettingStarted = modules.find((module) => module.kind === "orientation");

  if (loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening Getting Started…</p>;
  }

  if (!gettingStarted) {
    return (
      <div className="py-10">
        <h1>Getting Started isn’t part of this build.</h1>
        <Link to="/" className="mt-4 inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the program list
        </Link>
      </div>
    );
  }

  /** The opening move stands before this sequence, so it is not one of its steps. */
  const lessons = (lessonsByOrder[gettingStarted.order] || []).filter((lesson) => !isOpenerLesson(lesson));

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Getting Started</p>
        <h1 className="mt-2">{gettingStarted.title}</h1>
        {gettingStarted.purpose ? (
          <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">{gettingStarted.purpose}</p>
        ) : null}
        <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          A short sequence before Module 1. Nothing here is scored, and one line in any Try or Reflect box is what a
          step asks for: Module 1 opens once every step here holds a line.
        </p>
      </header>

      <StepList lessons={lessons} scopeLabel="before the modules" />

      <Link to="/" className="inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
        Back to the program list
      </Link>
    </div>
  );
}