import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import useCurriculum from "@/hooks/useCurriculum";
import {
  buildCarrySources,
  describeStep,
  setCarried,
  setDecision,
  setStepState,
  useCarried,
  useDecisions,
  useStepState,
  useWorkbook,
} from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { isComingLater, isOpenerLesson } from "@/lib/curriculum";
import { buildProgress } from "@/lib/progress";
import LockedNotice from "@/components/workbook/LockedNotice";
import ComingLaterNotice from "@/components/workbook/ComingLaterNotice";
import LessonView from "@/components/workbook/LessonView";
import { useJournalContext } from "@/components/journal/JournalContext";
import { useAuth } from "@/lib/AuthContext";
import LoginRedirect from "@/components/LoginRedirect";

export default function LessonPage() {
  const { code } = useParams();
  const { modules, lessonsByOrder, lessonsByCode, orderedLessons, loading } = useCurriculum();
  const { answers, decisions } = useWorkbook();
  const states = useStepState();
  const carriedMap = useCarried();
  const decisionsMap = useDecisions();
  const { setLesson } = useJournalContext();
  const { isAuthenticated } = useAuth();

  const lesson = lessonsByCode[code];
  const module = lesson ? modules.find((item) => item.order === lesson.module_order) : null;
  /** The opener stands first, so it opens the sequence rather than ending it. */
  const opener = isOpenerLesson(lesson);
  const firstStep = orderedLessons.find((item) => !isOpenerLesson(item)) || null;

  useEffect(() => {
    if (lesson) setLesson({ code: lesson.code, title: lesson.title });
    return () => setLesson(null);
  }, [lesson, setLesson]);

  const position = orderedLessons.findIndex((item) => item.code === code);
  const prev = opener ? null : position > 0 ? orderedLessons[position - 1] : null;
  const next = opener
    ? firstStep
    : position >= 0 && position < orderedLessons.length - 1
      ? orderedLessons[position + 1]
      : null;

  const siblings = lesson ? lessonsByOrder[lesson.module_order] || [] : [];
  const stepIndex = siblings.findIndex((item) => item.code === code) + 1;

  const carrySources = useMemo(
    () => buildCarrySources(lesson ? lesson.carry_forward : [], lessonsByCode),
    [lesson, lessonsByCode]
  );

  const progress = useMemo(
    () => buildProgress({ modules, lessonsByOrder, answers, states }),
    [modules, lessonsByOrder, answers, states]
  );

  if (loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening the step…</p>;
  }

  if (!lesson || !module) {
    return (
      <div className="py-10">
        <h1>That step isn’t part of Pilot 1.</h1>
        <Link to="/" className="mt-4 inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the program list
        </Link>
      </div>
    );
  }

  // The numbered modules are for participants. Getting Started's steps stay open to everyone.
  if (module.kind !== "orientation" && !isAuthenticated) {
    return <LoginRedirect />;
  }

  const moduleTitle = opener
    ? "Begin here"
    : module.kind === "orientation"
      ? "Getting Started"
      : `Module ${module.order}: ${module.title}`;
  const workbookLink = opener ? "/" : module.kind === "orientation" ? "/getting-started" : `/module/${module.slug}`;

  // A module that was never built into the pilot is a different state from one that is waiting on writing.
  if (isComingLater(module)) {
    return (
      <div className="space-y-6">
        <header className="border-b border-border pb-5">
          <p className="workbook-label">{moduleTitle}</p>
          <h1 className="mt-2">{lesson.title}</h1>
        </header>
        <ComingLaterNotice module={module} />
      </div>
    );
  }

  const row = progress.byOrder[module.order];
  if (row && !row.unlocked) {
    const blocker = progress.blockingOrder === null ? null : progress.byOrder[progress.blockingOrder];
    return (
      <div className="space-y-6">
        <header className="border-b border-border pb-5">
          <p className="workbook-label">{moduleTitle}</p>
          <h1 className="mt-2">{lesson.title}</h1>
        </header>
        <LockedNotice module={module} blocking={blocker} missing={blocker ? blocker.missing : []} />
      </div>
    );
  }

  const status = describeStep(lesson.code, answers, decisionsMap, states);

  return (
    <LessonView
      lesson={lesson}
      moduleTitle={moduleTitle}
      stepNumber={opener ? 0 : stepIndex}
      stepCount={opener ? 0 : siblings.length}
      prev={prev}
      next={next}
      nextIsModule={Boolean(next && module && next.module_order !== lesson.module_order)}
      workbookLink={workbookLink}
      answers={answers}
      decisions={decisionsMap}
      states={states}
      status={status}
      route={states[lesson.code] || ""}
      onRouteChange={(route) => setStepState(lesson.code, route)}
      carried={carriedMap[lesson.code] || []}
      onCarriedChange={(keys) => setCarried(lesson.code, keys)}
      carrySources={carrySources}
      onDecisionChange={(value) => {
        setDecision(lesson.code, value);
        saveAnswer({
          lessonCode: lesson.code,
          lessonTitle: lesson.title,
          promptKey: `${lesson.code}#decision`,
          promptLabel: "Next Decision",
          body: value || "Cleared",
        });
      }}
    />
  );
}