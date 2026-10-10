import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import DashedMotif from "@/components/workbook/DashedMotif";
import StepList from "@/components/workbook/StepList";

/**
 * Getting Started has its own container rather than living inside the module machinery:
 * its own page, its own heading, and no module number anywhere.
 */
export default function GettingStartedPage() {
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const gettingStarted = modules.find((module) => module.kind === "orientation");

  if (loading) {
    return <p className="py-10 text-[14px] text-ink-faint">Opening Getting Started…</p>;
  }

  if (!gettingStarted) {
    return (
      <div className="py-10">
        <h1 className="font-heading text-2xl">Getting Started isn’t part of this build.</h1>
        <Link
          to="/"
          className="mt-4 inline-block text-[14px] text-teal-deep underline decoration-natural underline-offset-4"
        >
          Back to the program list
        </Link>
      </div>
    );
  }

  const lessons = lessonsByOrder[gettingStarted.order] || [];

  return (
    <div className="space-y-10">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">{gettingStarted.subtitle || "Before the modules"}</p>
            <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">{gettingStarted.title}</h1>
          </div>
        </div>
        <p className="mt-5 max-w-2xl font-heading text-[17px] italic leading-relaxed text-teal-deep">
          {gettingStarted.purpose}
        </p>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          This is its own short sequence, not a numbered module. It sits before Module 1 and stays open to you at any
          time: nothing here is scored, and none of it has to be finished before you begin Module 1.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-natural bg-white p-5 sm:col-span-2">
          <p className="workbook-label">The Conversation Journal</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            The journal is beside you on every page — the small button in the corner. Write at any moment, mid-reading or
            mid-activity, without losing your place. Everything you save here joins it.
          </p>
        </div>
        <Link
          to="/map"
          className="flex flex-col justify-between rounded-lg border border-natural bg-teal-deep-wash/60 p-5 transition hover:border-teal-deep/50"
        >
          <span className="workbook-label">
            <Map className="mb-2 h-4 w-4" aria-hidden="true" />
            Life Map
          </span>
          <span className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            Map the life you are actually living — places, activity, energy, barriers, threads.
          </span>
          <ArrowRight className="mt-4 h-4 w-4 text-teal-deep" aria-hidden="true" />
        </Link>
      </section>

      <StepList lessons={lessons} scopeLabel="before the modules" />

      <Link
        to="/"
        className="inline-block text-[14px] text-teal-deep underline decoration-natural underline-offset-4"
      >
        Back to the program list
      </Link>
    </div>
  );
}