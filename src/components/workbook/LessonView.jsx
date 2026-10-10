import React from "react";
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
import DashedMotif from "./DashedMotif";
import FeedbackForm from "./FeedbackForm";
import LessonBeats from "./LessonBeats";
import { participationRoutesFor, routeGuidanceFor } from "@/lib/workbook";

export default function LessonView({
  lesson,
  moduleTitle,
  stepNumber,
  stepCount,
  prev,
  next,
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

  // 1: every prompt keeps its writing field in the flow, shaped by the chosen route
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
      <div className="rounded-md border border-dashed border-teal-deep/40 bg-teal-deep-wash/40 p-3">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Paused after one line. That line is saved, and this step stays here until you want it again.
        </p>
      </div>
    ) : null;

  // 2: the step is a set of beats, unfolded one at a time
  const beats = [];

  if (lesson.readings_note) {
    beats.push({
      key: "reference",
      label: "Reference for this step",
      tone: "out",
      teaser: "What to keep in view while you work.",
      content: <Prose text={lesson.readings_note} className="text-[13.5px]" />,
    });
  }

  if (lesson.teach) {
    beats.push({
      key: "teach",
      label: "Teach",
      teaser: lesson.purpose || "What this step is about.",
      content: <Prose text={lesson.teach} />,
    });
  }

  if (lesson.show) {
    beats.push({
      key: "show",
      label: "Show — a neutral example, never a participant story",
      tone: "show",
      teaser: "The worked example that goes with this step.",
      content: <Prose text={lesson.show} />,
    });
  }

  if (lesson.type === "tool") {
    beats.push({
      key: "tool",
      label: "Work in the tool",
      teaser: "Open the Life Map and work there.",
      content: (
        <Link
          to="/map"
          className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2 text-[13px] text-ivory transition hover:bg-teal-deep/90"
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
    teaser: "Choose a route and the writing below takes that shape.",
    content: <RouteChips routes={routes} value={route} onChange={onRouteChange} />,
  });

  const writing = [];

  if (tryPrompts.length) {
    writing.push({
      key: "try",
      label: "Try",
      teaser: "The doing part. A line is enough.",
      content: (
        <div className="space-y-6">
          {carrySources && carrySources.length ? (
            <CarryForward sources={carrySources} selected={carried} onChange={onCarriedChange} />
          ) : null}
          <div className="space-y-6">
            {tryPrompts.map((prompt, index) => promptField(prompt, index, `try-${index}`))}
          </div>
        </div>
      ),
    });
  }

  if (reflectPrompts.length) {
    writing.push({
      key: "reflect",
      label: "Reflect",
      teaser: "Looking back at how it went.",
      content: (
        <div className="space-y-6">
          {reflectPrompts.map((prompt, index) => promptField(prompt, tryPrompts.length + index, `reflect-${index}`))}
        </div>
      ),
    });
  }

  // 3: the pause route leaves its one line on the last writing beat
  if (writing.length && pauseNote) {
    const last = writing[writing.length - 1];
    last.content = (
      <div className="space-y-6">
        {last.content}
        {pauseNote}
      </div>
    );
  }

  beats.push(...writing);

  if (lesson.has_decision) {
    beats.push({
      key: "decision",
      label: "Next decision",
      bare: true,
      teaser: "What you want to do with this next.",
      content: <DecisionPicker value={decisions[lesson.code] || ""} onChange={onDecisionChange} />,
    });
  }

  if (lesson.what_comes_out) {
    beats.push({
      key: "out",
      label: "What comes out",
      tone: "out",
      teaser: "What this step leaves you with.",
      content: (
        <>
          <p className="text-[15px] leading-relaxed text-ink-soft">{lesson.what_comes_out}</p>
          <div className="mt-4 flex items-start gap-2">
            <DashedMotif size="sm" />
            <p className="text-[13px] leading-relaxed text-ink-faint">
              Saved here and in your journal. Carry forward only what you choose.
            </p>
          </div>
        </>
      ),
    });
  }

  if (lesson.boundary) {
    beats.push({
      key: "boundary",
      label: "Source and boundaries",
      tone: "boundary",
      teaser: "Where this step comes from and what it will not do.",
      content: <Prose text={lesson.boundary} className="text-[13.5px]" />,
    });
  }

  return (
    <article className="space-y-8">
      <StepHeader
        moduleTitle={moduleTitle}
        stepNumber={stepNumber}
        stepCount={stepCount}
        title={lesson.title}
        duration={lesson.duration_min}
        purpose={lesson.purpose}
        status={status}
      />

      {lesson.approval_state === "pending_approval" ? (
        <div className="rounded-lg border border-copper/40 bg-copper-wash/50 p-4 sm:p-5">
          <p className="workbook-label text-copper">Not for participant delivery</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {lesson.approval_note || "Lesson content pending approval—not ready for participant delivery."}
          </p>
        </div>
      ) : null}

      {/* Keyed by step so a new step always starts on its own first beat. */}
      <LessonBeats key={lesson.code} beats={beats} />

      {lesson.approval_state === "approved" && lesson.approved_source ? (
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Approved source: {lesson.approved_source}
          {lesson.approved_version ? ` · ${lesson.approved_version}` : ""}
        </p>
      ) : null}

      <div className="rounded-lg border border-natural bg-white/60 p-4">
        <PrivacyNote>
          Everything on this step is saved in this browser only, and joins your private journal. Nothing is submitted to
          Entrepalooza unless you use the feedback form below or choose to share an entry.
        </PrivacyNote>
      </div>

      <FeedbackForm moduleOrder={lesson.module_order} lessonCode={lesson.code} />

      <StepNav prev={prev} next={next} />
    </article>
  );
}