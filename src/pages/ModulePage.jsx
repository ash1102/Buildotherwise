import React from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { isComingLater } from "@/lib/curriculum";
import LockedNotice from "@/components/workbook/LockedNotice";
import ComingLaterNotice from "@/components/workbook/ComingLaterNotice";
import StepList from "@/components/workbook/StepList";
import { useWorkbook } from "@/lib/workbook";
import { buildProgress } from "@/lib/progress";

export default function ModulePage() {
  const { slug } = useParams();
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const { answers, states } = useWorkbook();

  const module = modules.find((item) => item.slug === slug);
  const progress = buildProgress({ modules, lessonsByOrder, answers, states });

  if (loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening the module…</p>;
  }

  if (!module) {
    return (
      <div className="py-10">
        <h1>That module isn’t part of Pilot 1.</h1>
        <Link to="/" className="mt-4 inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
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

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">{`Module ${module.order}`}</p>
        <h1 className="mt-2">{module.title}</h1>
        {module.purpose ? (
          <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">{module.purpose}</p>
        ) : null}
      </header>

      {coming ? (
        <ComingLaterNotice module={module} />
      ) : locked ? (
        <LockedNotice module={module} blocking={blocker} missing={blocker ? blocker.missing : []} />
      ) : (
        <>
          <StepList lessons={lessons} scopeLabel="in this module" />

          {module.order === 5 ? (
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <p className="workbook-label">Pilot 1 closes at the end of this module</p>
              <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
                The last step closes the pilot: one piece of evidence, one thing worth keeping, one support that mattered,
                one Next Decision, and one optional question for later. No readiness judgement, no next-module pitch.
              </p>
              <Link
                to="/record"
                className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-accent-ink underline underline-offset-2"
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