import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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
import { isComingLater, isLiveOnlyModule, isOpenerLesson, isWorkbookLesson } from "@/lib/curriculum";
import CarryForwardScreen from "@/components/records/CarryForwardScreen";
import {
  firstOpenGettingStartedStep,
  gettingStartedFinished,
  gettingStartedSteps,
  isGettingStartedLesson,
} from "@/lib/gettingStarted";
import { usePacedProgress } from "@/lib/pacing";
import LockedNotice from "@/components/workbook/LockedNotice";
import ComingLaterNotice from "@/components/workbook/ComingLaterNotice";
import LessonView from "@/components/workbook/LessonView";
import { GettingStartedRedirect, useWorkbookGate } from "@/components/WorkbookGate";
import { useJournalContext } from "@/components/journal/JournalContext";
import { useAuth } from "@/lib/AuthContext";
import LoginRedirect from "@/components/LoginRedirect";
import { loadStepReadings } from "@/lib/library";

export default function LessonPage() {
  const { code } = useParams();
  const { modules, lessons, lessonsByOrder, lessonsByCode, orderedLessons, loading } = useCurriculum();
  const { answers } = useWorkbook();
  const states = useStepState();
  const carriedMap = useCarried();
  const decisionsMap = useDecisions();
  const { setLesson } = useJournalContext();
  const { isAuthenticated, user } = useAuth();
  const admin = Boolean(isAuthenticated && user?.role === "admin");
  const [readingState, setReadingState] = useState({ code: "", items: [], ready: false });
  const gate = useWorkbookGate();

  const lesson = lessonsByCode[code];
  const module = lesson ? modules.find((item) => item.order === lesson.module_order) : null;
  /**
   * Getting Started is now just the welcome (O.1). It opens Module 1 directly.
   * The Life Map is an optional companion in its own tab, not a step before Module 1.
   */
  const gsLesson = isGettingStartedLesson(lesson);
  const opener = isOpenerLesson(lesson);
  const gsSteps = gettingStartedSteps(lessons);
  const bookLessons = orderedLessons.filter(isWorkbookLesson);

  useEffect(() => {
    if (lesson) setLesson({ code: lesson.code, title: lesson.title });
    return () => setLesson(null);
  }, [lesson, setLesson]);

  useEffect(() => {
    if (!code) return undefined;
    let active = true;
    setReadingState({ code, items: [], ready: false });
    loadStepReadings(code)
      .then((items) => {
        if (active) setReadingState({ code, items, ready: true });
      })
      .catch(() => {
        if (active) setReadingState({ code, items: [], ready: true });
      });
    return () => {
      active = false;
    };
  }, [code]);

  let prev = null;
  let next = null;
  let nextIsModule = false;
  if (gsLesson) {
    const index = gsSteps.findIndex((item) => item.code === lesson.code);
    prev = index > 0 ? gsSteps[index - 1] : null;
    next = index >= 0 && index < gsSteps.length - 1 ? gsSteps[index + 1] : null;
  } else if (opener) {
    next = bookLessons[0] || null;
    nextIsModule = Boolean(next);
  } else if (lesson) {
    const position = bookLessons.findIndex((item) => item.code === code);
    prev = position > 0 ? bookLessons[position - 1] : null;
    next = position >= 0 && position < bookLessons.length - 1 ? bookLessons[position + 1] : null;
    nextIsModule = Boolean(next && next.module_order !== lesson.module_order);
  }

  const siblings = lesson ? (lessonsByOrder[lesson.module_order] || []).filter(isWorkbookLesson) : [];
  const stepIndex = siblings.findIndex((item) => item.code === code) + 1;
  const gsIndex = gsSteps.findIndex((item) => item.code === code);

  const carrySources = useMemo(
    () => buildCarrySources(lesson ? lesson.carry_forward : [], lessonsByCode),
    [lesson, lessonsByCode]
  );

  const progress = usePacedProgress({ modules, lessonsByOrder, answers, states });

  if (loading || gate.pending) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening the step…</p>;
  }

  if (!lesson || (!module && !gsLesson)) {
    return (
      <div className="py-10">
        <h1>That step isn’t part of Pilot 1.</h1>
        <Link to="/" className="mt-4 inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the program list
        </Link>
      </div>
    );
  }

  // Workbook steps wait until Getting Started is done. The Getting Started steps themselves stay open.
  if (!gsLesson && !gate.finished) {
    return <GettingStartedRedirect to={gate.resumePath} />;
  }

  if (!gsLesson && (!module || module.kind !== "orientation") && !isAuthenticated) {
    return <LoginRedirect />;
  }

  const moduleTitle = gsLesson
    ? "Getting Started"
    : opener
      ? "Before Module 1"
      : module.kind === "orientation"
        ? "Getting Started"
        : `Module ${module.order}: ${module.title}`;
  const workbookLink = gsLesson || (module && module.kind === "orientation") ? "/getting-started" : opener ? "/" : `/module/${module.slug}`;
  const backLabel = gsLesson ? "Back to Getting Started" : "Back to the workbook";
  const stepsDone = gettingStartedFinished(lessons, answers, states);
  /**
   * The last Getting Started step never dead-ends.
   * Done (or an admin previewing): go straight into Module 1.
   * An earlier step still open: go to that step.
   * Only this step open: say what opens it.
   */
  const openGsStep = firstOpenGettingStartedStep(lessons, answers, states);
  const lastGs = gsLesson && !next;
  const firstBookLesson = bookLessons[0] || null;
  const firstPath = firstBookLesson ? `/lesson/${firstBookLesson.code}` : "/";
  let forward = null;
  let endNote;
  if (lastGs && (stepsDone || admin)) {
    forward = {
      to: isAuthenticated ? firstPath : `/login?returnTo=${encodeURIComponent(firstPath)}`,
      kicker: "Next: Module 1",
      title: firstBookLesson ? firstBookLesson.title : "Module 1",
    };
  } else if (lastGs && openGsStep && openGsStep.code !== lesson.code) {
    const openNumber = gsSteps.findIndex((item) => item.code === openGsStep.code) + 1;
    forward = {
      to: `/lesson/${openGsStep.code}`,
      kicker: `Step ${openNumber} is still open`,
      title: openGsStep.title,
    };
  } else if (lastGs) {
    endNote = "Tap “Let me in” and your dashboard opens next.";
  }

  // A live-only module has no self-paced steps in the app.
  if (!gsLesson && module && isLiveOnlyModule(module)) {
    return (
      <div className="space-y-6">
        <header className="border-b border-border pb-5">
          <p className="workbook-label">{moduleTitle}</p>
          <h1 className="mt-2">{lesson.title}</h1>
        </header>
        <CarryForwardScreen module={module} />
      </div>
    );
  }

  // A module that was never built into the pilot is a different state from one that is waiting on writing.
  if (!gsLesson && module && isComingLater(module)) {
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

  const row = module ? progress.byOrder[module.order] : null;
  if (!gsLesson && row && !row.unlocked) {
    const blocker = progress.blockingOrder === null ? null : progress.byOrder[progress.blockingOrder];
    return (
      <div className="space-y-6">
        <header className="border-b border-border pb-5">
          <p className="workbook-label">{moduleTitle}</p>
          <h1 className="mt-2">{lesson.title}</h1>
        </header>
        <LockedNotice module={module} row={row} blocking={blocker} missing={blocker ? blocker.missing : []} />
      </div>
    );
  }

  const status = describeStep(lesson.code, answers, decisionsMap, states);
  const readingsReady = readingState.code === code && readingState.ready;
  const readings = readingsReady ? readingState.items : [];

  if (!readingsReady) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening the step…</p>;
  }

  return (
    <LessonView
      lesson={lesson}
      moduleTitle={moduleTitle}
      stepNumber={gsLesson ? gsIndex + 1 : opener ? 0 : stepIndex}
      stepCount={gsLesson ? gsSteps.length : opener ? 0 : siblings.length}
      prev={prev}
      next={next}
      nextIsModule={nextIsModule}
      workbookLink={workbookLink}
      backLabel={backLabel}
      forward={forward}
      endNote={endNote}
      answers={answers}
      decisions={decisionsMap}
      states={states}
      status={status}
      route={states[lesson.code] || ""}
      onRouteChange={(route) => setStepState(lesson.code, route)}
      carried={carriedMap[lesson.code] || []}
      onCarriedChange={(keys) => setCarried(lesson.code, keys)}
      carrySources={carrySources}
      readings={readings}
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