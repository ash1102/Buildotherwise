import React, { useCallback, useRef, useState } from "react";
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
import DictateButton from "./DictateButton";
import TryPlanner from "./TryPlanner";
import TryCheckIn from "./TryCheckIn";
import { interactionsFor } from "@/lib/interactions";
import { journalStepHref } from "@/lib/journal";
import { decisionOptionsFor, participationRoutesFor, routeGuidanceFor } from "@/lib/workbook";

/** The full journal-minimum paragraph is shown on the first steps; after that, a one-line reminder. */
const JOURNAL_MINIMUM_FULL_ON = ["O.1", "O.6"];
const JOURNAL_MINIMUM_SHORT =
  "**Journal minimum:** Save at least one short note for this step. “I don’t know yet” counts. Saving is not sharing.";

function teachTextFor(lesson) {
  const text = String(lesson.teach || "");
  if (JOURNAL_MINIMUM_FULL_ON.includes(lesson.code)) return text;
  return text.replace(/\*\*Journal minimum:\*\*[^\n]*/, JOURNAL_MINIMUM_SHORT);
}

function TalkBar({ hasRoutes, talking, onSay, onWrite, onText }) {
  if (hasRoutes && !talking) return null;

  const chip = (active) =>
    `rounded-md border px-3.5 py-2 text-[15px] transition ${
      active ? "border-accent-ink bg-accent-ink text-white" : "border-input bg-card text-foreground hover:bg-secondary"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasRoutes ? null : (
        <>
          <button type="button" aria-pressed={talking} onClick={onSay} className={chip(talking)}>
            Say it
          </button>
          <button type="button" aria-pressed={!talking} onClick={onWrite} className={chip(!talking)}>
            Write it
          </button>
        </>
      )}
      {talking ? <DictateButton onText={onText} /> : null}
    </div>
  );
}

export default function LessonView({
  lesson,
  moduleTitle,
  stepNumber,
  stepCount,
  prev,
  next,
  nextIsModule,
  workbookLink,
  decisions,
  route,
  onRouteChange,
  onDecisionChange,
  carried,
  onCarriedChange,
  carrySources,
  status,
}) {
  const decisionOptions = decisionOptionsFor(lesson);
  const optionNames = new Set(decisionOptions.map((option) => option.trim().toLowerCase()));
  const decisionStep = lesson.type === "next_decision";
  const rawTry = lesson.try_prompts || [];
  const rawReflect = lesson.reflect_prompts || [];
  const notAnOption = (prompt) => !optionNames.has(String(prompt).trim().toLowerCase());
  // Try and Reflect questions are numbered in one run: the Reflect boxes start after the
  // Try ones. That way no two questions in a step share a stored answer, so nothing
  // written in one box can appear in, or overwrite, another. Same order the
  // carry-forward sources use, so a saved answer still reads back where it was written.
  const tryPrompts = rawTry
    .map((prompt, index) => ({ prompt, index, fieldKey: `try-${index}` }))
    .filter((item) => notAnOption(item.prompt));
  const reflectPrompts = rawReflect
    .map((prompt, index) => ({ prompt, index: rawTry.length + index, fieldKey: `reflect-${index}` }))
    .filter((item) => notAnOption(item.prompt));
  const routes = participationRoutesFor(lesson);
  const guidance = routeGuidanceFor(route);
  const hasRoutes = routes.length > 0;
  const oneLine = guidance ? guidance.field === "line" : false;

  // Optional tap-to-answer pieces for this step, set in src/lib/interactions.js.
  const interactions = interactionsFor(lesson.code);
  const hasPlanner = interactions.some((item) => item.type === "tryPlanner");
  const renderInteraction = (item) => {
    if (item.type === "tryPlanner") return <TryPlanner key="tryPlanner" lesson={lesson} />;
    if (item.type === "tryCheckIn") return <TryCheckIn key="tryCheckIn" lesson={lesson} planCode={item.planCode} />;
    return null;
  };

  const [sayIt, setSayIt] = useState(false);
  const talking = hasRoutes ? Boolean(guidance && guidance.voice) : sayIt;
  const fieldApis = useRef({});
  const activeField = useRef(null);

  const bindField = useCallback((key, api) => {
    if (api) fieldApis.current[key] = api;
    else delete fieldApis.current[key];
  }, []);

  const currentApi = () => {
    const key = activeField.current;
    if (key && fieldApis.current[key]) return fieldApis.current[key];
    const first = Object.keys(fieldApis.current)[0];
    return first ? fieldApis.current[first] : null;
  };

  const asksForDecision =
    lesson.has_decision !== false &&
    (decisionStep || (lesson.decision_options || []).length > 0 || rawTry.length > 0 || rawReflect.length > 0);

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
      fieldKey={key}
      onBind={bindField}
      onActivate={(fieldKey) => {
        activeField.current = fieldKey;
      }}
    />
  );

  const talkControl =
    tryPrompts.length || reflectPrompts.length ? (
      <TalkBar
        hasRoutes={hasRoutes}
        talking={talking}
        onSay={() => setSayIt(true)}
        onWrite={() => setSayIt(false)}
        onText={(heard, previousTail) => {
          const api = currentApi();
          if (api) api.insertText(heard, previousTail);
        }}
      />
    ) : null;

  const beats = [];

  if (lesson.readings_note) {
    beats.push({
      key: "reference",
      label: "Look at this",
      tone: "out",
      content: <Prose text={lesson.readings_note} />,
    });
  }

  if (lesson.teach) {
    beats.push({
      key: "teach",
      label: "Try this",
      content: <Prose text={teachTextFor(lesson)} />,
    });
  }

  if (lesson.show) {
    beats.push({
      key: "show",
      label: "See the example",
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

  if (hasRoutes) {
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
  }

  if (tryPrompts.length) {
    beats.push({
      key: "try",
      label: "Try",
      content: (
        <div className="space-y-6">
          {talkControl}
          {hasRoutes ? null : <PrivacyNote />}
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
                {tryPrompts.map((item) => promptField(item.prompt, item.index, item.fieldKey))}
              </div>
            </details>
          ) : (
            <div className="space-y-6">
              {tryPrompts.map((item) => promptField(item.prompt, item.index, item.fieldKey))}
            </div>
          )}
        </div>
      ),
    });
  }

  if (reflectPrompts.length) {
    beats.push({
      key: "reflect",
      label: "Reflect",
      content: (
        <div className="space-y-6">
          {tryPrompts.length ? null : talkControl}
          {tryPrompts.length || hasRoutes ? null : <PrivacyNote />}
          {reflectPrompts.map((item) => promptField(item.prompt, item.index, item.fieldKey))}
        </div>
      ),
    });
  }

  if (asksForDecision) {
    beats.push({
      key: "decision",
      label: "Next decision",
      content: (
        <DecisionPicker
          value={decisions[lesson.code] || ""}
          onChange={onDecisionChange}
          options={decisionOptions}
        />
      ),
    });
  }

  const journalHref = journalStepHref(lesson.code);
  const savesToJournal =
    tryPrompts.length > 0 || reflectPrompts.length > 0 || asksForDecision || interactions.length > 0;
  const closingJournalHref = lesson.what_comes_out || !savesToJournal ? "" : journalHref;

  if (lesson.what_comes_out) {
    beats.push({
      key: "ending",
      label: "Wrapping up",
      tone: "out",
      content: (
        <div className="space-y-3">
          <p className="max-w-[68ch] text-[17px] leading-relaxed text-foreground">{lesson.what_comes_out}</p>
          <Link to={journalHref} className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
            See it in your journal
          </Link>
        </div>
      ),
    });
  }

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

      {beats.length ? (
        <LessonBeats key={lesson.code} beats={beats} journalHref={closingJournalHref} />
      ) : null}

      <FeedbackForm moduleOrder={lesson.module_order} lessonCode={lesson.code} />

      <StepNav prev={prev} next={next} nextIsModule={nextIsModule} workbookLink={workbookLink} nextLabel="Next" />
    </article>
  );
}
