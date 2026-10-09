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
import { participationRoutesFor } from "@/lib/workbook";

function Section({ label, children, tone = "plain" }) {
  const tones = {
    plain: "border-natural bg-white",
    show: "border-natural bg-teal-deep-wash/50",
    out: "border-dashed border-teal-deep/40 bg-white",
    boundary: "border-natural bg-ivory-deep/60",
  };
  return (
    <section className={`rounded-lg border p-5 sm:p-6 ${tones[tone]}`}>
      <p className="workbook-label">{label}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

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

      {lesson.readings_note ? (
        <Section label="Reference for this step" tone="out">
          <Prose text={lesson.readings_note} className="text-[13.5px]" />
        </Section>
      ) : null}

      {lesson.teach ? (
        <Section label="Teach">
          <Prose text={lesson.teach} />
        </Section>
      ) : null}

      {lesson.show ? (
        <Section label="Show — a neutral example, never a participant story" tone="show">
          <Prose text={lesson.show} />
        </Section>
      ) : null}

      {lesson.type === "tool" ? (
        <Section label="Work in the tool">
          <Link
            to="/map"
            className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2 text-[13px] text-ivory transition hover:bg-teal-deep/90"
          >
            Open the Life Map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Section>
      ) : null}

      <RouteChips routes={routes} value={route} onChange={onRouteChange} />

      {carrySources && carrySources.length ? (
        <CarryForward sources={carrySources} selected={carried} onChange={onCarriedChange} />
      ) : null}

      {tryPrompts.length ? (
        <Section label="Try — or pass">
          <div className="space-y-4">
            {tryPrompts.map((prompt, index) => (
              <PromptField
                key={index}
                lessonCode={lesson.code}
                lessonTitle={lesson.title}
                index={index}
                label={prompt}
                route={route}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {reflectPrompts.length ? (
        <Section label="Reflect">
          <div className="space-y-4">
            {reflectPrompts.map((prompt, index) => (
              <PromptField
                key={`reflect-${index}`}
                lessonCode={lesson.code}
                lessonTitle={lesson.title}
                index={tryPrompts.length + index}
                label={prompt}
                route={route}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {lesson.has_decision ? (
        <DecisionPicker value={decisions[lesson.code] || ""} onChange={onDecisionChange} />
      ) : null}

      {lesson.what_comes_out ? (
        <Section label="What comes out" tone="out">
          <p className="text-[15px] leading-relaxed text-ink-soft">{lesson.what_comes_out}</p>
          <div className="mt-4 flex items-start gap-2">
            <DashedMotif size="sm" />
            <p className="text-[13px] leading-relaxed text-ink-faint">
              Saved here and in your journal. Carry forward only what you choose.
            </p>
          </div>
        </Section>
      ) : null}

      {lesson.boundary ? (
        <Section label="Source and boundaries" tone="boundary">
          <Prose text={lesson.boundary} className="text-[13.5px]" />
        </Section>
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