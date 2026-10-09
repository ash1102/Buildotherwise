import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { describeStep, stepStatusLabel, useWorkbook } from "@/lib/workbook";
import { isComingLater } from "@/lib/curriculum";
import DashedMotif from "@/components/workbook/DashedMotif";

export default function ModulePage() {
  const { slug } = useParams();
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const { answers, decisions, states } = useWorkbook();

  const module = modules.find((item) => item.slug === slug);

  if (loading) {
    return <p className="py-10 text-[14px] text-ink-faint">Opening the module…</p>;
  }

  if (!module) {
    return (
      <div className="py-10">
        <h1 className="font-heading text-2xl">That module isn’t part of Pilot 1.</h1>
        <Link to="/" className="mt-4 inline-block text-[14px] text-teal-deep underline decoration-natural underline-offset-4">
          Back to the program list
        </Link>
      </div>
    );
  }

  const lessons = lessonsByOrder[module.order] || [];
  const coming = isComingLater(module);

  return (
    <div className="space-y-10">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">
              {module.kind === "orientation" ? "Getting Started" : `Module ${module.order}`}
            </p>
            <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">{module.title}</h1>
          </div>
        </div>
        <p className="mt-5 max-w-2xl font-heading text-[17px] italic leading-relaxed text-teal-deep">{module.purpose}</p>
      </header>

      {coming ? (
        <section className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6">
          <p className="workbook-label">Coming later</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
            This module is written but not built into Pilot 1. Nothing here is marked complete, and no steps from it can
            be opened yet. When it is added, it arrives as content — the workbook itself doesn’t change shape.
          </p>
          <Link to="/" className="mt-4 inline-block text-[14px] text-teal-deep underline decoration-natural underline-offset-4">
            Back to the program list
          </Link>
        </section>
      ) : (
        <>
          {module.kind === "orientation" ? (
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-natural bg-white p-5 sm:col-span-2">
                <p className="workbook-label">The Conversation Journal</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  The journal is beside you on every page — the small button in the corner. Write at any moment, mid-reading
                  or mid-activity, without losing your place. Everything you save here joins it.
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
          ) : null}

          <section>
            <div className="flex items-baseline justify-between">
              <p className="workbook-label">Steps</p>
              <span className="text-[12.5px] text-ink-faint">{lessons.length} steps {module.kind === "orientation" ? "before the modules" : "in this module"}</span>
            </div>
            <ol className="mt-4 divide-y divide-natural border-y border-natural">
              {lessons.map((lesson) => {
                const status = describeStep(lesson.code, answers, decisions, states);
                return (
                  <li key={lesson.id || lesson.code}>
                    <Link
                      to={`/lesson/${lesson.code}`}
                      className="flex items-start gap-4 py-4 transition hover:bg-white/60"
                    >
                      <span className="mt-0.5 font-heading text-[15px] text-copper">
                        {String(lesson.order).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-heading text-[18px] leading-snug text-ink">{lesson.title}</span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
                          {lesson.purpose}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-ink-faint">
                          <span>{lesson.duration_min ? `About ${lesson.duration_min} min` : lesson.type}</span>
                          <span
                            className={
                              status === "not answered" ? "text-ink-faint" : "text-teal-deep"
                            }
                          >
                            {stepStatusLabel(status)}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-natural-deep" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {module.order === 5 ? (
            <section className="rounded-lg border border-dashed border-copper/40 bg-copper-wash/50 p-6">
              <p className="workbook-label text-copper">Pilot 1 closes at the end of this module</p>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
                The last step closes the pilot: one piece of evidence, one thing worth keeping, one support that mattered,
                one Next Decision, and one optional question for later. No readiness judgement, no next-module pitch.
              </p>
              <Link
                to="/record"
                className="mt-4 inline-flex items-center gap-2 text-[14px] text-teal-deep underline decoration-natural underline-offset-4"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Look at your Discovery Record
              </Link>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}