import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Check, PauseCircle } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { AskHelp } from "../DiscoverySampler";
import { useAnswers } from "@/lib/workbook";
import { writeStore } from "@/lib/store";
import { REMINDER_OPTIONS, buildReminderIcs, downloadIcs, reminderDate } from "@/lib/afterTry";
import {
  BARRIERS,
  BARRIER_MOVES,
  METHODS,
  METHOD_BY_ID,
  METHOD_USED,
  NOTICED,
  NOT_YET_MOVES,
  OUTCOMES,
  TRIED_OUTCOMES,
  checkinSentences,
  joinMulti,
  planHasContent,
  readKey,
  readPlan,
  recordM2,
  splitMulti,
  syncSummary,
} from "@/lib/moduleTwo";
import { FinishControl, MultiChoice, P, Panel, PartFlow, SingleChoice } from "../moduleOne/parts";
import { EarlierM2, PlanCard, usePlanSync } from "./common";

const CODE = "M2-L2";
const PLAN_CODE = "M2-L1";
const PLAN_TITLE = "Find Something to Try";
/** The plan part of M2-L1 (0-based), so "Change my plan" opens it directly. */
const PLAN_PART_INDEX = 4;

function openPlan() {
  writeStore(`m1Part.${PLAN_CODE}`, PLAN_PART_INDEX);
}

function ChangePlanLink({ children = "Review or change my plan" }) {
  return (
    <Link
      to={`/lesson/${PLAN_CODE}`}
      onClick={openPlan}
      className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-accent-ink underline underline-offset-2"
    >
      {children}
    </Link>
  );
}

function PartPlan({ answers }) {
  const plan = readPlan(answers);
  if (planHasContent(plan)) {
    return (
      <div className="space-y-4">
        <P>Here’s the plan you saved in Lesson 1.</P>
        <PlanCard plan={plan} empty="" />
        <ChangePlanLink />
        <p className="text-[15px] text-muted-foreground">Plans change. If you’ve already done something different, that’s fine. You can say so in Part 3.</p>
      </div>
    );
  }
  const method = plan.method;
  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
        There’s no saved plan from Lesson 1. You can make a quick one here, go back to Lesson 1, or simply keep going.
      </p>
      <PromptField lessonCode={PLAN_CODE} lessonTitle={PLAN_TITLE} index={0} label="What will you explore? (optional)" variant="inline" />
      <SingleChoice
        legend="How will you explore it? (optional)"
        options={METHODS.map((item) => `${item.label}: ${item.short}`)}
        value={method ? `${METHOD_BY_ID[method].label}: ${METHOD_BY_ID[method].short}` : ""}
        onChange={(next) => {
          const picked = METHODS.find((item) => next.startsWith(`${item.label}:`));
          recordM2(PLAN_CODE, PLAN_TITLE, "method", picked ? picked.id : "", "How I'll explore it");
        }}
      />
      <ChangePlanLink>Make a fuller plan in Lesson 1</ChangePlanLink>
    </div>
  );
}

function PartTry() {
  const [when, setWhen] = useState("");
  const [added, setAdded] = useState("");
  const addReminder = () => {
    if (!when) return;
    const date = reminderDate(when);
    const url = typeof window !== "undefined" ? `${window.location.origin}/lesson/${CODE}` : "";
    downloadIcs(`come-back-${CODE}.ics`, buildReminderIcs({ when: date, stepTitle: "Give It a Try—and Notice", url }));
    setAdded(date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
  };
  return (
    <div className="space-y-5">
      <P>This part happens out in your life, not on this screen.</P>
      <P>
        You can close the workbook now and come back after you’ve tried, watched, asked, or looked into something. Later
        today, next week, or whenever an opportunity comes up all work. Your plan and your place are saved.
      </P>
      <P>You don’t need photos, proof, or anyone’s sign-off. What you tell the workbook is enough.</P>
      <Panel tone="note" label="Pause here">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PauseCircle className="h-4 w-4" aria-hidden="true" />
            I’ll come back after my try
          </Link>
          <p className="text-[15px] text-muted-foreground">When you return, you’ll pick up right here. Tap Continue when you’re ready.</p>
        </div>
        <fieldset className="mt-2">
          <legend className="text-[15px] font-medium text-foreground">Want a reminder? (optional)</legend>
          <p className="mt-1 text-[14px] text-muted-foreground">This downloads a calendar file for your own calendar. Nothing is sent to anyone.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={when === option.id}
                onClick={() => setWhen(option.id)}
                className={`min-h-[44px] rounded-full border px-4 text-[15px] ${
                  when === option.id ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={addReminder}
            disabled={!when}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary disabled:opacity-50"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Add the reminder to my calendar
          </button>
          {added ? (
            <p role="status" className="mt-2 inline-flex items-center gap-1.5 text-[15px] text-foreground">
              <Check className="h-4 w-4 text-accent-ink" aria-hidden="true" />
              Calendar file downloaded for {added}.
            </p>
          ) : null}
        </fieldset>
      </Panel>
      <p className="text-[15px] text-muted-foreground">Already back, or ready now? Continue to say what happened. “I haven’t tried it yet” is one of the answers.</p>
    </div>
  );
}

function PartHappened({ lesson, answers }) {
  const outcome = readKey(answers, CODE, "outcome");
  const tried = TRIED_OUTCOMES.includes(outcome);
  const notYet = outcome === OUTCOMES[3];
  const barrier = outcome === OUTCOMES[4];
  const used = splitMulti(readKey(answers, CODE, "method-used"));
  const barriers = splitMulti(readKey(answers, CODE, 30));
  const move = readKey(answers, CODE, "next-move");
  return (
    <div className="space-y-6">
      <SingleChoice
        legend="What happened?"
        hint="Any of these is a real result."
        options={OUTCOMES}
        value={outcome}
        onChange={(next) => recordM2(CODE, lesson.title, "outcome", next, "What happened")}
      />
      {tried ? (
        <div className="space-y-5" aria-live="polite">
          <MultiChoice
            legend="What kind of encounter was it?"
            hint="Pick any that fit."
            options={METHOD_USED}
            values={used}
            onChange={(next) => recordM2(CODE, lesson.title, "method-used", joinMulti(next), "What kind of encounter it was")}
          />
          <PromptField
            lessonCode={CODE}
            lessonTitle={lesson.title}
            index={1}
            label={outcome === OUTCOMES[2] ? "What did you do instead? A sentence or two is enough." : "What did you actually do or observe? A sentence or two is enough."}
            variant="inline"
          />
          <p className="text-[14px] text-muted-foreground">Describe what happened, not what it says about you. The next part is for what you noticed.</p>
        </div>
      ) : null}
      {notYet ? (
        <div className="space-y-5" aria-live="polite">
          <Panel tone="note">
            <P>That’s fine. Life gets in the way, and opportunities don’t always line up. Not yet isn’t a failure.</P>
          </Panel>
          <SingleChoice
            legend="What would you like to do?"
            options={NOT_YET_MOVES}
            value={move}
            onChange={(next) => recordM2(CODE, lesson.title, "next-move", next, "What I'll do next")}
          />
          {move === "Adjust my plan" ? <ChangePlanLink>Change my plan in Lesson 1</ChangePlanLink> : null}
          {move === "Choose a smaller step" ? (
            <PromptField lessonCode={PLAN_CODE} lessonTitle={PLAN_TITLE} index="smaller" label="What’s a smaller or more accessible version?" variant="inline" />
          ) : null}
          {move === "Keep my plan and come back later" ? <p className="text-[15px] text-muted-foreground">Your plan is saved. Come back to this lesson whenever you’ve had a chance.</p> : null}
          {move === "Pause for now" ? <p className="text-[15px] text-muted-foreground">Pausing is a real choice. You can come back to this anytime.</p> : null}
        </div>
      ) : null}
      {barrier ? (
        <div className="space-y-5" aria-live="polite">
          <Panel tone="note">
            <P>A barrier tells you about conditions, not about you. Naming it can help you plan around it, or decide to look elsewhere.</P>
          </Panel>
          <MultiChoice
            legend="What got in the way?"
            hint="Pick any that fit. No explanation needed, and you can pick none."
            options={BARRIERS}
            values={barriers}
            onChange={(next) => recordM2(CODE, lesson.title, 30, joinMulti(next), "What got in the way?")}
          />
          <SingleChoice
            legend="What would you like to do about it?"
            options={BARRIER_MOVES}
            value={move}
            onChange={(next) => recordM2(CODE, lesson.title, "next-move", next, "What I'll do next")}
          />
          {move === "Adjust my plan" ? <ChangePlanLink>Change my plan in Lesson 1</ChangePlanLink> : null}
          {move === "Look for support" ? (
            <div className="space-y-4">
              <AskHelp />
              <PromptField lessonCode={CODE} lessonTitle={lesson.title} index={32} label="Who or what might know a way around it? (optional)" variant="inline" />
            </div>
          ) : null}
          {move === "Choose a smaller step" ? (
            <PromptField
              lessonCode={CODE}
              lessonTitle={lesson.title}
              index={31}
              label="What’s the smallest version you could do without the thing that got in the way? “Nothing yet” counts."
              variant="inline"
            />
          ) : null}
          {move === "Pause for now" ? <p className="text-[15px] text-muted-foreground">Pausing is a real choice. You can come back to this anytime.</p> : null}
        </div>
      ) : null}
      <PrivacyNote />
    </div>
  );
}

function PartNotice({ lesson, answers }) {
  const outcome = readKey(answers, CODE, "outcome");
  const noticed = splitMulti(readKey(answers, CODE, "noticed"));
  const skipped = outcome === OUTCOMES[3] || outcome === OUTCOMES[4];
  return (
    <div className="space-y-5">
      {skipped ? (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          If you haven’t had the experience yet, you can skip this part. If planning or trying to get there taught you
          something, you can note it here.
        </p>
      ) : (
        <P>Notice what happened without deciding what it means yet. All of this is optional.</P>
      )}
      <MultiChoice
        legend="What did you notice?"
        hint="Pick any that fit. Mixed reactions are common."
        options={NOTICED}
        values={noticed}
        onChange={(next) => recordM2(CODE, lesson.title, "noticed", joinMulti(next), "What I noticed")}
      />
      <PromptField
        lessonCode={CODE}
        lessonTitle={lesson.title}
        index={2}
        label="Anything you want to remember? What caught your attention, what surprised you, what felt difficult or satisfying, or what you’re still unsure about. (optional)"
        variant="inline"
      />
      <p className="text-[15px] text-muted-foreground">What you saved here will be waiting in Lesson 3.</p>
      <EarlierM2 code={CODE} answers={answers} />
      <FinishControl code={CODE} answers={answers} />
    </div>
  );
}

/** M2-L2 · Give it a try, and notice. */
export default function TryLesson({ lesson }) {
  const answers = useAnswers();
  usePlanSync(answers);
  // The plain-sentence check-in (records page: Try review) follows the answers above.
  useEffect(() => {
    const text = checkinSentences(answers);
    if (!text && !readKey(answers, CODE, "checkin")) return;
    syncSummary(CODE, lesson.title, "checkin", "What happened during my try", text, answers);
  }, [answers, lesson.title]);

  const parts = [
    { id: "plan", short: "Your plan", title: "Return to your plan", content: <PartPlan answers={answers} /> },
    { id: "try", short: "Try it", title: "Try it in the real world", content: <PartTry /> },
    { id: "happened", short: "What happened", title: "What happened?", content: <PartHappened lesson={lesson} answers={answers} /> },
    { id: "notice", short: "Notice", title: "Notice, without forcing a conclusion", content: <PartNotice lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
