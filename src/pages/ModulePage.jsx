import React from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { isComingLater } from "@/lib/curriculum";
import DashedMotif from "@/components/workbook/DashedMotif";
import LockedNotice from "@/components/workbook/LockedNotice";
import StepList from "@/components/workbook/StepList";
import { useWorkbook } from "@/lib/workbook";
import { buildProgress } from "@/lib/progress";

export default function ModulePage() {
  const { slug } = useParams();
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const { answers } = useWorkbook();

  const module = modules.find((item) => item.slug === slug);
  const progress = buildProgress({ modules, lessonsByOrder, answers });

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
  const row = progress.byOrder[module.order];
  const locked = Boolean(row && !row.unlocked && !coming);
  const blocker = progress.blockingOrder === null ? null : progress.byOrder[progress.blockingOrder];

  if (locked) {
    return (
      <div className="space-y-10">
        <header className="border-b border-border pb-6">
          <div className="flex items-start gap-4">
            <DashedMotif size="lg" />
            <div>
              <p className="workbook-label">{`Module ${module.order}`}</p>
              <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">{module.title}</h1>
            </div>
          </div>
          <p className="mt-5 max-w-2xl font-heading text-[17px] italic leading-relaxed text-primary">{module.purpose}</p>
        </header>
        <LockedNotice module={module} blocking={blocker} missing={blocker ? blocker.missing : []} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">{`Module ${module.order}`}</p>
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
          <StepList lessons={lessons} scopeLabel="in this module" />

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