import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { isComingLater, isLiveOnlyModule, isWorkbookLesson } from "@/lib/curriculum";
import CarryForwardScreen from "@/components/records/CarryForwardScreen";
import LockedNotice from "@/components/workbook/LockedNotice";
import ComingLaterNotice from "@/components/workbook/ComingLaterNotice";
import StepList from "@/components/workbook/StepList";
import WorkbookGate from "@/components/WorkbookGate";
import LoginRedirect from "@/components/LoginRedirect";
import { useAuth } from "@/lib/AuthContext";

/** From Module 5, returning to the module continues into Module 6's first lesson. */
export function ModuleFiveContinue({ lesson }) {
  if (!lesson) return null;
  return (
    <Link
      to={`/lesson/${lesson.code}`}
      className="mt-4 inline-flex max-w-full items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      Continue into Module 6
      <span className="truncate font-normal">{lesson.title}</span>
    </Link>
  );
}
import { useWorkbook } from "@/lib/workbook";
import { usePacedProgress } from "@/lib/pacing";

export default function ModulePage() {
  return (
    <WorkbookGate>
      <ModuleBody />
    </WorkbookGate>
  );
}

function ModuleBody() {
  const { slug } = useParams();
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const { answers, states } = useWorkbook();
  const { isAuthenticated } = useAuth();

  const module = modules.find((item) => item.slug === slug);
  const progress = usePacedProgress({ modules, lessonsByOrder, answers, states });

  if (loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening the module…</p>;
  }

  if (!isAuthenticated) {
    return <LoginRedirect />;
  }

  if (!module) {
    return (
      <div className="py-10">
        <h1>That module isn’t part of the workbook.</h1>
        <Link to="/" className="mt-4 inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the workbook
        </Link>
      </div>
    );
  }

  if (module.kind === "orientation") {
    return <Navigate to="/" replace />;
  }

  const lessons = (lessonsByOrder[module.order] || []).filter(isWorkbookLesson);
  const moduleSixStart = module.order === 5 ? (lessonsByOrder[6] || []).filter(isWorkbookLesson)[0] : null;
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

      {isLiveOnlyModule(module) ? (
        <CarryForwardScreen module={module} />
      ) : coming ? (
        <ComingLaterNotice module={module} />
      ) : locked ? (
        <LockedNotice module={module} row={row} blocking={blocker} missing={blocker ? blocker.missing : []} />
      ) : (
        <>
          <StepList lessons={lessons} scopeLabel="in this module" />

          {module.order === 5 ? (
            <section id="continue" className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <p className="workbook-label">The halfway point</p>
              <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
                Modules 1–5 end with this module. You can go back through the lessons or open your Conversation Journal
                anytime. Module 6 is in the app if you want to continue on your own. Moving on is optional. Nothing here
                signs you up for a group or follow-up support.
              </p>
              <ModuleFiveContinue lesson={moduleSixStart} />
              <Link
                to="/record"
                className="mt-4 flex items-center gap-2 text-[15px] font-medium text-accent-ink underline underline-offset-2"
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