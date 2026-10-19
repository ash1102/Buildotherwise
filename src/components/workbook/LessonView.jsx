import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
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
import DiscoverySampler, { OPTIONS as DISCOVERY_OPTIONS } from "./DiscoverySampler";
import DiscoveryFollowThrough from "./DiscoveryFollowThrough";
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
      <Textarea
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

function Module3ExperienceBridge({ lessonCode }) {
  const answers = useAnswers();
  const choice = DISCOVERY_OPTIONS.find((item) => item.id === answers[answerKey("M2-L1", 20)]);
  const notes = [0, 1, 2, 3, 4].map((i) => answers[answerKey("M2-L2", i)]).filter((v) => String(v || "").trim());
  const firstNote = String(answers[answerKey("M2-L2", 1)] || "").trim();
  return (
    <div className="space-y-3">
      <p className="text-[16px] leading-relaxed text-foreground">
        Module 3 examines the <strong>conditions around a task</strong>—instructions, time, noise, help, and choice. You can work with something from Module 2, or use the self-contained task below.
      </p>
      {choice ? <div className="rounded-lg bg-secondary p-3">
        <p className="text-[14px] text-muted-foreground">A possibility you explored in Module 2</p>
        <p className="mt-1 font-medium text-foreground">{choice.field}</p>
        <p className="mt-1 text-[15px] text-foreground">{choice.task}</p>
        <p className="mt-2 text-[14px] text-muted-foreground">This suggests a subject to investigate, not proof you completed the task.</p>
      </div> : null}
      {firstNote ? <div className="rounded-lg border border-border p-3">
        <p className="text-[14px] text-muted-foreground">What you recorded doing or observing</p>
        <p className="mt-1 whitespace-pre-wrap text-[15px] text-foreground">{firstNote}</p>
      </div> : notes.length ? <p className="text-[14px] text-muted-foreground">You saved other observations in Module 2, but did not describe a completed activity.</p> : <p className="text-[14px] text-muted-foreground">No Module 2 observations are recorded. You can still complete this lesson without inventing a past experience.</p>}
      <div className="rounded-lg border border-border p-3">
        <p className="text-[15px] font-medium text-foreground">A task you can do here, without materials</p>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground">Find the information in this notice: “Community workshop — Saturday 11 a.m. Free entry. Bring a notebook. Registration closes Friday at 5 p.m.”</p>
        <p className="mt-2 text-[15px] text-foreground">First, identify the deadline using the paragraph. Then read it as a checklist: <strong>When:</strong> Saturday 11 a.m. · <strong>Cost:</strong> Free · <strong>Bring:</strong> notebook · <strong>Register by:</strong> Friday 5 p.m.</p>
        <p className="mt-2 text-[14px] text-muted-foreground">Both formats have the same facts. Compare how easily you locate the deadline, not which answer is correct. This is a constructed formatting exercise, not a real workshop listing.</p>
      </div>
      {lessonCode === "M3-L2" ? <p className="text-[15px] text-foreground">To compare conditions, use the same notice with different formats—or choose a real task you already know. Keep the task similar, and remember that familiarity from the first attempt could affect the second.</p> : null}
    </div>
  );
}

function Module3ReviewBridge() {
  const answers = useAnswers();
  const previous = [
    { code: "M3-L1", labels: ["Task considered", "Condition identified"], indexes: [0, 1] },
    { code: "M3-L2", labels: ["Condition to change", "Task kept similar", "Time limit and stop rule", "Balance signal", "What happened or why it was not tried", "Effort or discomfort", "What might be tested again"], indexes: [0, 1, 2, 3, 4, 5, 6] },
  ];
  const entries = previous.flatMap((step) => step.indexes.map((index, i) => ({
    key: step.code + "-" + index,
    label: step.labels[i],
    value: String(answers[answerKey(step.code, index)] || "").trim(),
  }))).filter((item) => item.value);
  return (
    <div className="space-y-4">
      <p className="text-[16px] leading-relaxed text-foreground">Before reviewing your result, look at what you actually recorded. An intended change is not evidence it was tried. An observation does not automatically prove what caused it.</p>
      {entries.length ? (
        <div className="space-y-3">
          {entries.map((entry) => <div key={entry.key} className="border-l-2 border-border pl-3">
            <p className="text-[13px] text-muted-foreground">{entry.label}</p>
            <p className="mt-1 whitespace-pre-wrap text-[15px] text-foreground">{entry.value}</p>
          </div>)}
          <p className="text-[15px] text-muted-foreground">What does this support? What else could explain the result? What did the task cost in time, effort, or support?</p>
        </div>
      ) : <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">You haven't recorded a task-condition attempt yet. You may use the provided word-sorting example to check its correct order, or leave the outcome unknown. No made-up result is needed.</p>}
      <p className="text-[14px] text-muted-foreground">A useful takeaway can be a tentative observation, a condition to test again, or a question you cannot answer yet. The next module will examine how claims compare with available evidence.</p>
    </div>
  );
}

function DiscoveryReviewNotes() {
  const answers = useAnswers();
  const selected = DISCOVERY_OPTIONS.find((item) => item.id === answers[answerKey("M2-L1", 20)]);
  const questions = [
    "What caught your attention?",
    "What did you actually do or observe?",
    "What surprised, frustrated, or interested you?",
    "What helped or made participation difficult?",
    "What did it take in time, money, energy, or support?",
  ];
  const notes = [
    ...questions.map((label, index) => ({ label, value: answers[answerKey("M2-L2", index)] })),
    ...["What kind of encounter did you actually have: reading, watching, a conversation, a visit, doing an activity yourself, or a combination? If you did not have an opportunity, record that.","At what point did your attention change? Was there a particular part you wanted to understand better?","How did the people, setting, instructions, or available support affect the experience? What remains uncertain?"].map((label, index) => ({ label, value: answers[answerKey("M2-L2", 11 + index)] }))
  ]
    .filter((item) => String(item.value || "").trim());
  return (
    <div className="space-y-4">
      {selected ? <div className="rounded-lg bg-secondary p-4">
        <p className="text-[14px] text-muted-foreground">Your selected starting point from Lesson 1</p>
        <p className="mt-1 font-medium text-foreground">{selected.field}</p>
        <p className="mt-2 text-[15px] text-foreground">{selected.fact}</p>
        {selected.source ? <a className="mt-2 inline-block text-[14px] text-accent-ink underline" href={selected.source} target="_blank" rel="noopener noreferrer">Revisit the source</a> : null}
        <p className="mt-2 text-[14px] text-muted-foreground">Selecting this card does not establish that you completed the activity. Review what you actually recorded below.</p>
      </div> : <p className="text-[15px] text-muted-foreground">No sampler selection was saved. You may have explored something else.</p>}
      {notes.length ? <div className="space-y-3">
        <p className="text-[15px] font-medium">Your actual Lesson 2 observations</p>
        {notes.map((note) => <div key={note.label} className="border-l-2 border-border pl-3">
          <p className="text-[13px] text-muted-foreground">{note.label}</p>
          <p className="mt-1 whitespace-pre-wrap text-[15px]">{note.value}</p>
        </div>)}
        <p className="text-[15px] text-muted-foreground">Compare these notes with the source. What is established, and what still needs checking?</p>
      </div> : <p className="rounded-lg border border-border p-3 text-[15px] text-muted-foreground">No Lesson 2 observations are saved yet. You can review what the source taught you, return to try something later, or leave the question open.</p>}
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
  // Empty slots keep historic answer indices stable when curriculum questions are retired.
  const notAnOption = (prompt) => !ownsPrompts && Boolean(String(prompt || "").trim()) && !optionNames.has(String(prompt).trim().toLowerCase());
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
  const routes = participationRoutesFor(lesson).filter((option) => !/^(say it|write it|watch)$/i.test(option));
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

  const detailRef = useRef(null);

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
    />
  );

  const substantiveRoutes = routes.filter((option) => !/^pass$/i.test(option));
  const answerChoices = hasRoutes ? (
    <div className="space-y-3">
      {substantiveRoutes.length ? <>
        <p id={`answer-route-${lesson.code}`} className="text-[15px] font-medium text-foreground">Where would you like to start?</p>
        <RouteChips routes={substantiveRoutes} value={route} onChange={(next) => onRouteChange(next)} labelledBy={`answer-route-${lesson.code}`} />
      </> : null}
      {routes.some((option) => /^pass$/i.test(option)) ? (
        <button type="button" className="text-[14px] text-muted-foreground underline underline-offset-2"
          onClick={() => onRouteChange(/^pass$/i.test(String(route || "")) ? "" : "Pass")}>
          {/^pass$/i.test(String(route || "")) ? "Step skipped · Undo" : "Skip this step"}
        </button>
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

  if (lesson.code === "M3-L3") {
    beats.push({ key: "module-3-review", label: "Review what actually happened", content: <Module3ReviewBridge /> });
  }

  if (lesson.code === "M3-L1" || lesson.code === "M3-L2") {
    beats.push({
      key: "module-3-experience",
      label: "Work with a real observation or a provided task",
      content: <Module3ExperienceBridge lessonCode={lesson.code} />,
    });
  }

  if (lesson.code === "M2-L3") {
    beats.push({
      key: "review-discovery",
      label: "Review what you explored",
      content: <DiscoveryReviewNotes />,
    });
  }

  if (lesson.code === "M2-L2") {
    beats.push({ key: "guided-follow-through", label: "Explore what you encountered", content: <DiscoveryFollowThrough /> });
  }

  if (lesson.code === "M2-L1") {
    beats.push({
      key: "discovery-sampler",
      label: "Explore real possibilities",
      content: <DiscoverySampler />,
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
      hasInput: true,
      content: (
        <div className="space-y-6">
          {answerChoices}
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
      hasInput: true,
      content: (
        <div className="space-y-6">
          {tryPrompts.length ? null : answerChoices}
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
