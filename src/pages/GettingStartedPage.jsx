import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
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

  const lessons = lessonsByOrder[gettingStarted.order] || [];

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

      <Link
        to="/map"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-4 transition hover:bg-secondary sm:p-5"
      >
        <Map className="h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium text-foreground">Life Map</span>
          <span className="mt-0.5 block text-[15px] leading-relaxed text-muted-foreground">
            Map the life you are actually living — places, activity, energy, barriers, threads.
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-faint" aria-hidden="true" />
      </Link>

      <StepList lessons={lessons} scopeLabel="before the modules" />

      <Link to="/" className="inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
        Back to the program list
      </Link>
    </div>
  );
}