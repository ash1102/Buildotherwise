import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Prose from "./Prose";
import PrivacyNote from "./PrivacyNote";
import RouteChips from "./RouteChips";
import PromptField from "./PromptField";
import DecisionPicker from "./DecisionPicker";
import CarryForward from "./CarryForward";
import StepNav from "./StepNav";
import StepHeader from "./StepHeader";
import FeedbackForm from "./FeedbackForm";
import LessonBeats from "./LessonBeats";
import WorkedExample from "./WorkedExample";
import SourceDetails from "./SourceDetails";
import TryPlanner from "./TryPlanner";
import TryCheckIn from "./TryCheckIn";
import { interactionsFor } from "@/lib/interactions";
import { participationRoutesFor, routeGuidanceFor } from "@/lib/workbook";

export default function LessonView({
  lesson,
  moduleTitle,
  stepNumber,
  stepCount,
  prev,
  next,
  nextIsModule,
  workbookLink,
  answers,
  decisions,
  states,
  route,
  onRouteChange,
  onDecisionChange,
  carried,
  onCarriedChange,
  carrySources,
  status,
}) {
  const tryPrompts = lesson.try_prompts || [];
  const reflectPrompts = lesson.reflect_prompts || [];
  const routes = participationRoutesFor(lesson);
  const guidance = routeGuidanceFor(route);
  const oneLine = guidance ? guidance.field === "line" : false;
  const [showSource, setShowSource] = useState(false);

  // Optional tap-to-answer pieces for this step, set in src/lib/interactions.js.
  const interactions = interactionsFor(lesson.code);
  const hasPlanner = interactions.some((item) => item.type === "tryPlanner");
  const renderInteraction = (item) => {
    if (item.type === "tryPlanner") return <TryPlanner key="tryPlanner" lesson={lesson} />;
    if (item.type === "tryCheckIn") return <TryCheckIn key="tryCheckIn" lesson={lesson} planCode={item.planCode} />;
    return null;
  };

  // A decision is only asked for where there is something to decide about, and only
  // where the step itself calls for one. Saved decisions are never touched.
  const asksForDecision = lesson.has_decision !== false && (tryPrompts.length > 0 || reflectPrompts.length > 0);

  const promptField = (prompt, index, key) => (
    <PromptField
      key={key}
      lessonCode={lesson.code}
      lessonTitle={lesson.title}
      index={index}
      label={prompt}
      route={route}
      variant="inline"
      compact={oneLine}
    />
  );

  const pauseNote =
    guidance && guidance.paused ? (
      <div className="rounded-md border border-dashed border-input bg-secondary p-3">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Paused after one line. That line is saved, and this step stays here until you want it again.
        </p>
      </div>
    ) : null;

  const beats = [];

  if (lesson.readings_note) {
    beats.push({
      key: "reference",
      label: "Reference for this step",
      tone: "out",
      content: <Prose text={lesson.readings_note} />,
    });
  }

  if (lesson.teach) {
    beats.push({
      key: "teach",
      label: "Teaching",
      content: <Prose text={lesson.teach} />,
    });
  }

  if (lesson.show) {
    beats.push({
      key: "show",
      label: "See an example.",
      tone: "show",
      content: <WorkedExample text={lesson.show} />,
    });
  }

  if (lesson.type === "tool") {
    beats.push({
      key: "tool",
      label: "Work in the tool",
      content: (
        <Link
          to="/map"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Open the Life Map
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ),
    });
  }

  beats.push({
    key: "route",
    label: "How you'll write",
    content: (
      <div className="space-y-3">
        <RouteChips routes={routes} value={route} onChange={onRouteChange} />
        <PrivacyNote />
      </div>
    ),
  });

  const exampleAgain = lesson.show ? { key: "show", label: "See the example again" } : null;

  if (tryPrompts.length) {
    beats.push({
      key: "try",
      label: "Try",
      reopen: exampleAgain,
      content: (
        <div className="space-y-6">
          {carrySources && carrySources.length ? (
            <CarryForward sources={carrySources} selected={carried} onChange={onCarriedChange} />
          ) : null}
          {interactions.map(renderInteraction)}
          {hasPlanner ? (
            <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <summary className="cursor-pointer text-[16px] font-medium text-foreground">
                Add more detail (optional) · {tryPrompts.length} questions
              </summary>
              <div className="mt-4 space-y-6">
                {tryPrompts.map((prompt, index) => promptField(prompt, index, `try-${index}`))}
              </div>
            </details>
          ) : (
            <div className="space-y-6">
              {tryPrompts.map((prompt, index) => promptField(prompt, index, `try-${index}`))}
            </div>
          )}
          {pauseNote}
        </div>
      ),
    });
  }

  if (reflectPrompts.length) {
    beats.push({
      key: "reflect",
      label: "Reflect",
      reopen: exampleAgain,
      content: (
        <div className="space-y-6">
          {reflectPrompts.map((prompt, index) => promptField(prompt, index, `reflect-${index}`))}
        </div>
      ),
    });
  }

  if (!tryPrompts.length && !reflectPrompts.length && pauseNote) {
    beats.push({
      key: "pause",
      label: "Writing",
      content: pauseNote,
    });
  }

  if (asksForDecision) {
    beats.push({
      key: "decision",
      label: "Next decision",
      content: <DecisionPicker value={decisions[lesson.code] || ""} onChange={onDecisionChange} />,
    });
  }

  // The step ends in one compact section rather than another round of screens.
  beats.push({
    key: "ending",
    label: "Wrapping up",
    tone: "out",
    content: (
      <div className="space-y-4">
        {lesson.what_comes_out ? (
          <p className="max-w-[68ch] text-[17px] leading-relaxed text-foreground">{lesson.what_comes_out}</p>
        ) : null}
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          What makes this step count: one line in any Try or Reflect box. Short counts the same as long, and “I don’t know
          yet” is a complete answer.
        </p>
        <SourceDetails
          open={showSource}
          onToggle={() => setShowSource((value) => !value)}
          approvalState={lesson.approval_state}
          approvalNote={lesson.approval_note}
          approvedSource={lesson.approved_source}
          approvedVersion={lesson.approved_version}
          boundary={lesson.boundary}
        />
      </div>
    ),
  });

  return (
    <article className="space-y-6">
      <StepHeader
        moduleTitle={moduleTitle}
        stepNumber={stepNumber}
        stepCount={stepCount}
        title={lesson.title}
        duration={lesson.duration_min}
        purpose={lesson.purpose}
        status={status}
      />

      {/* Keyed by step so a new step always starts on its own first section. */}
      <LessonBeats key={lesson.code} beats={beats} />

      <FeedbackForm moduleOrder={lesson.module_order} lessonCode={lesson.code} />

      <StepNav prev={prev} next={next} nextIsModule={nextIsModule} workbookLink={workbookLink} />
    </article>
  );
}