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
import LessonView from "@/components/workbook/LessonView";
import { useJournalContext } from "@/components/journal/JournalContext";

export default function LessonPage() {
  const { code } = useParams();
  const { modules, lessonsByOrder, lessonsByCode, orderedLessons, loading } = useCurriculum();
  const { answers, decisions } = useWorkbook();
  const states = useStepState();
  const carriedMap = useCarried();
  const decisionsMap = useDecisions();
  const { setLesson } = useJournalContext();

  const lesson = lessonsByCode[code];
  const module = lesson ? modules.find((item) => item.order === lesson.module_order) : null;

  useEffect(() => {
    if (lesson) setLesson({ code: lesson.code, title: lesson.title });
    return () => setLesson(null);
  }, [lesson, setLesson]);

  const position = orderedLessons.findIndex((item) => item.code === code);
  const prev = position > 0 ? orderedLessons[position - 1] : null;
  const next = position >= 0 && position < orderedLessons.length - 1 ? orderedLessons[position + 1] : null;

  const siblings = lesson ? lessonsByOrder[lesson.module_order] || [] : [];
  const stepIndex = siblings.findIndex((item) => item.code === code) + 1;

  const carrySources = useMemo(
    () => buildCarrySources(lesson ? lesson.carry_forward : [], lessonsByCode),
    [lesson, lessonsByCode]
  );

  if (loading) {
    return <p className="py-10 text-[14px] text-ink-faint">Opening the step…</p>;
  }

  if (!lesson || !module) {
    return (
      <div className="py-10">
        <h1 className="font-heading text-2xl">That step isn’t part of Pilot 1.</h1>
        <Link to="/" className="mt-4 inline-block text-[14px] text-teal-deep underline decoration-natural underline-offset-4">
          Back to the program list
        </Link>
      </div>
    );
  }

  const status = describeStep(lesson.code, answers, decisionsMap, states);

  return (
    <LessonView
      lesson={lesson}
      moduleTitle={module.kind === "orientation" ? "Getting Started" : `Module ${module.order} — ${module.title}`}
      stepNumber={stepIndex}
      stepCount={siblings.length}
      prev={prev}
      next={next}
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