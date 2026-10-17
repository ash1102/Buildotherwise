import React, { useCallback, useEffect, useRef, useState } from "react";
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
import StepReading from "./StepReading";
import DictateButton from "./DictateButton";
import TryPlanner from "./TryPlanner";
import TryCheckIn from "./TryCheckIn";
import NoticeFlow from "./NoticeFlow";
import ComeBackAfterTry from "./ComeBackAfterTry";
import { isAfterTryStep } from "@/lib/afterTry";
import { interactionsFor } from "@/lib/interactions";
import { journalStepHref, saveAnswer } from "@/lib/journal";
import DecisionFollowUp from "./DecisionFollowUp";
import { decisionOptionsFor, participationRoutesFor, routeGuidanceFor, setAnswer, useAnswers, answerKey } from "@/lib/workbook";
import { JOIN_CHOICES, joinChoiceText, splitChoice } from "@/lib/gettingStarted";

/** O.5's second box holds the join choice. On the step page it is a set of buttons, not a writing box. */
const JOIN_CHOICE_CODE = "O.5";
const JOIN_CHOICE_INDEX = 1;

function JoinChoicePicker({ lessonCode, lessonTitle, index, label }) {
  const answers = useAnswers();
  /** The choice is kept on the step and copied into the journal, like a typed answer. */
  const record = (text) => {
    setAnswer(lessonCode, index, text);
    saveAnswer({
      lessonCode,
      lessonTitle,
      promptKey: `${lessonCode}#${index}`,
      promptLabel: label,
      body: text,
    });
  };
  const { choice, note } = splitChoice((answers || {})[answerKey(lessonCode, index)]);
  const id = `${lessonCode}-${index}`;
  return (
    <fieldset>
      <legend className="block text-[16px] font-medium leading-snug text-foreground">{label}</legend>
      <p className="mt-1 text-[14px] text-muted-foreground">Pick one. No explanation needed.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {JOIN_CHOICES.map((option) => {
          const active = choice === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => record(joinChoiceText(active ? "" : option, note))}
              className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                active ? "border-accent-ink bg-accent-ink text-white" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <label htmlFor={id} className="mt-3 block text-[14px] text-muted-foreground">
        Add a note if you want (for example, the adjustments you'd like)
      </label>
      <textarea
        id={id}
        rows={2}
        value={note}
        onChange={(event) => record(joinChoiceText(choice, event.target.value))}
        placeholder="Optional."
        className="mt-1 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-[16px] leading-relaxed"
      />
    </fieldset>
  );
}

/** The full journal-minimum paragraph is shown on the first steps; after that, a one-line reminder. */
const JOURNAL_MINIMUM_FULL_ON = ["O.1", "O.6"];
const JOURNAL_MINIMUM_SHORT =
  "**Journal minimum:** Save at least one short note for this step. “I don’t know yet” counts. Saving is not sharing.";

function teachTextFor(lesson) {
  const text = String(lesson.teach || "");
  if (JOURNAL_MINIMUM_FULL_ON.includes(lesson.code)) return text;
  return text.replace(/\*\*Journal minimum:\*\*[^\n]*/, JOURNAL_MINIMUM_SHORT);
}

function TalkBar({ hasRoutes, talking, onSay, onWrite, onText, buttonRef }) {
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
      {talking ? <DictateButton onText={onText} buttonRef={buttonRef} /> : null}
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
  backLabel,
  forward,
  endNote,
  decisions,
  route,
  onRouteChange,
  onDecisionChange,
  carried,
  onCarriedChange,
  carrySources,
  status,
  readings = [],
}) {
  const decisionOptions = decisionOptionsFor(lesson);
  const optionNames = new Set(decisionOptions.map((option) => option.trim().toLowerCase()));
  const decisionStep = lesson.type === "next_decision";
  const rawTry = lesson.try_prompts || [];
  const rawReflect = lesson.reflect_prompts || [];
  // A step whose interaction owns its questions does not also print the generic prompt boxes.
  const ownsPrompts = interactionsFor(lesson.code).some((item) => item.type === "noticeFlow");
  const notAnOption = (prompt) => !ownsPrompts && !optionNames.has(String(prompt).trim().toLowerCase());
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
  const hasCheckIn = interactions.some((item) => item.type === "tryCheckIn");
  const renderInteraction = (item) => {
    if (item.type === "tryPlanner") return <TryPlanner key="tryPlanner" lesson={lesson} />;
    if (item.type === "tryCheckIn") return <TryCheckIn key="tryCheckIn" lesson={lesson} planCode={item.planCode} />;
    if (item.type === "noticeFlow") return <NoticeFlow key="noticeFlow" lesson={lesson} route={route} />;
    return null;
  };

  const [sayIt, setSayIt] = useState(false);
  const talking = hasRoutes ? Boolean(guidance && guidance.voice) : sayIt;
  const fieldApis = useRef({});
  const activeField = useRef(null);
  const talkButtonRef = useRef(null);
  const exampleRef = useRef(null);
  const detailRef = useRef(null);
  const routeIntent = useRef("");
  const writeTarget = useRef(null);
  const watching = /^watch$/i.test(String(route || "").trim());
  writeTarget.current = tryPrompts[0] || reflectPrompts[0] || null;

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

  // Reflection or reading questions do not implicitly require a decision.
  // Preserve explicit next-decision steps and deliberately configured decision choices.
  const asksForDecision =
    lesson.has_decision !== false &&
    (decisionStep || (lesson.decision_options || []).length > 0 ||
      (lesson.type !== "reading" && (rawTry.length > 0 || rawReflect.length > 0)));

  const promptField = (prompt, index, key) =>
    lesson.code === JOIN_CHOICE_CODE && index === JOIN_CHOICE_INDEX ? (
      <JoinChoicePicker key={key} lessonCode={lesson.code} lessonTitle={lesson.title} index={index} label={prompt} />
    ) : (
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

  const chooseRoute = (next) => {
    routeIntent.current = next;
    onRouteChange(next);
  };

  useEffect(() => {
    const intent = routeIntent.current;
    if (!intent || String(route || "") !== intent) return undefined;
    routeIntent.current = "";
    const action = intent.trim().toLowerCase();
    const frame = requestAnimationFrame(() => {
      if (action === "write it") {
        if (detailRef.current) detailRef.current.open = true;
        const target = writeTarget.current;
        const api = target ? fieldApis.current[target.fieldKey] : null;
        if (api && api.focus) api.focus();
        else if (target) {
          const node = document.getElementById(`${lesson.code}-${target.index}`);
          if (node) node.focus();
        }
      } else if (action === "say it" && talkButtonRef.current) {
        talkButtonRef.current.focus();
      } else if (action === "watch" && exampleRef.current) {
        exampleRef.current.scrollIntoView({ block: "nearest" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [route, lesson.code]);

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
        buttonRef={talkButtonRef}
      />
    ) : null;

  // Route choices sit at the top of the writing section and act on this step.
  // Part numbers follow the sections that remain.
  const answerChoices = hasRoutes ? (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p id={`answer-route-${lesson.code}`} className="text-[15px] font-medium text-foreground">
          How do you want to answer?
        </p>
        <RouteChips
          routes={routes}
          value={route}
          onChange={chooseRoute}
          labelledBy={`answer-route-${lesson.code}`}
        />
      </div>
      {/^pass$/i.test(String(route || "").trim()) ? (
        <p role="status" className="rounded-lg border border-border bg-secondary px-3 py-2 text-[15px] text-foreground">
          Passed. That counts as an answer. You can still write something below if you change your mind.
        </p>
      ) : null}
      {watching ? (
        <p role="status" className="rounded-lg border border-border bg-secondary px-3 py-2 text-[15px] text-foreground">
          Watching counts as taking part. Writing below is optional.
        </p>
      ) : null}
      {watching && lesson.show ? (
        <div ref={exampleRef} className="rounded-lg border border-border bg-secondary p-3 sm:p-4">
          <WorkedExample text={lesson.show} />
        </div>
      ) : null}
    </div>
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
      label: "What to know",
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

  if (tryPrompts.length) {
    beats.push({
      key: "try",
      label: "Try",
      content: (
        <div className="space-y-6">
          {answerChoices}
          {talkControl}
          <PrivacyNote />
          {carrySources && carrySources.length ? (
            <CarryForward sources={carrySources} selected={carried} onChange={onCarriedChange} />
          ) : null}
          {interactions.map(renderInteraction)}
          {hasPlanner || hasCheckIn ? (
            <details ref={detailRef} className="rounded-xl border border-border bg-card p-4 sm:p-5">
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
  } else if (hasRoutes && !reflectPrompts.length) {
    beats.push({
      key: "try",
      label: "Try",
      content: (
        <div className="space-y-6">
          {answerChoices}
          {interactions.length ? <PrivacyNote /> : null}
          {interactions.map(renderInteraction)}
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
          {tryPrompts.length ? null : answerChoices}
          {tryPrompts.length ? null : talkControl}
          {tryPrompts.length ? null : <PrivacyNote />}
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
        <div>
          <DecisionPicker
            value={decisions[lesson.code] || ""}
            onChange={onDecisionChange}
            options={decisionOptions}
          />
          {decisions[lesson.code] ? (
            <DecisionFollowUp
              key={decisions[lesson.code]}
              lessonCode={lesson.code}
              lessonTitle={lesson.title}
              decision={decisions[lesson.code]}
            />
          ) : null}
        </div>
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
          {lesson.module_order === 1 ? (
            <div className="space-y-2">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Your response is already saved. You don't need to answer the same question again.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
                <Link
                  to={`/tribe-threads?lesson=${encodeURIComponent(lesson.code)}#lesson-thread`}
                  className="font-medium text-accent-ink underline underline-offset-2"
                >
                  Explore the related Tribe Thread (optional)
                </Link>
                <Link to={journalHref} className="text-accent-ink underline underline-offset-2">
                  Revisit or expand your private note
                </Link>
              </div>
              <p className="text-[14px] text-muted-faint">
                Tribe replies are shared with other participants. Your journal stays private unless you choose to share.
              </p>
            </div>
          ) : (
            <Link to={journalHref} className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
              See it in your journal
            </Link>
          )}
        </div>
      ),
    });
  }

  if (readings.length) {
    const readingBeat = {
      key: "reading",
      label: readings.length > 1 ? "Readings" : "Reading",
      content: (
        <div className="divide-y divide-border">
          {readings.map((reading) => (
            <div key={reading.id} className="py-5 first:pt-0 last:pb-0">
              <StepReading title={reading.title} body={reading.body} />
            </div>
          ))}
        </div>
      ),
    };
    const tryAt = beats.findIndex((beat) => beat.key === "try");
    const reflectAt = beats.findIndex((beat) => beat.key === "reflect");
    const decisionAt = beats.findIndex((beat) => beat.key === "decision");
    const endingAt = beats.findIndex((beat) => beat.key === "ending");
    const at = [tryAt, reflectAt, decisionAt, endingAt].find((index) => index >= 0);
    if (at >= 0) beats.splice(at, 0, readingBeat);
    else beats.push(readingBeat);
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

      {next && isAfterTryStep(lesson.code) ? (
        <ComeBackAfterTry lesson={lesson} next={next} workbookLink={workbookLink} backLabel={backLabel} />
      ) : (
        <StepNav
          prev={prev}
          next={next}
          nextIsModule={nextIsModule}
          workbookLink={workbookLink}
          backLabel={backLabel}
          forward={forward}
          endNote={endNote}
          nextLabel="Next"
        />
      )}
    </article>
  );
}
