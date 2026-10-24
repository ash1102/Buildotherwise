import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, Check, PauseCircle } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { useAnswers } from "@/lib/workbook";
import { REMINDER_OPTIONS, buildReminderIcs, downloadIcs, reminderDate } from "@/lib/afterTry";
import {
  L2_EXAMPLE,
  L2_EXAMPLE_ACTIONS,
  LIMITS,
  LIMITS_NONE,
  PLAN_STATUS,
  STATEMENT_MODES,
  currentStatement,
  joinMulti,
  readKey,
  recordM4,
  splitMulti,
} from "@/lib/moduleFour";
import { MultiChoice, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import { PartGoDeeper, UseRow } from "./common";

const CODE = "M4-L2";
const ACTION_LABEL = "What small action could give you some evidence?";
const LOOK_FOR_LABEL = "What will you look for?";

function PartStatement({ lesson, answers, rev, onSetStatement }) {
  const fromL1 = readKey(answers, "M4-L1", "statement");
  const mode = readKey(answers, CODE, "statement-mode");
  const options = fromL1 ? STATEMENT_MODES : STATEMENT_MODES.slice(2);
  const choose = (next) => {
    recordM4(CODE, lesson.title, "statement-mode", next, "What I did with my statement");
    if (next === STATEMENT_MODES[0]) onSetStatement(fromL1);
    if (next === STATEMENT_MODES[1] && !readKey(answers, CODE, "statement")) onSetStatement(fromL1);
    if (next === STATEMENT_MODES[2] && [fromL1, L2_EXAMPLE].includes(readKey(answers, CODE, "statement"))) onSetStatement("");
    if (next === STATEMENT_MODES[3]) onSetStatement(L2_EXAMPLE);
  };
  return (
    <div className="space-y-5">
      <P>In Lesson 1 you separated what happened from what it might mean. This lesson plans one small action that could give you a little more evidence about a statement.</P>
      {fromL1 ? (
        <Panel tone="yours" label="From Lesson 1">
          <Quote label="The statement you chose to look at">{fromL1}</Quote>
        </Panel>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          There’s no statement saved from Lesson 1. You can write one here, or use the example.
        </p>
      )}
      <SingleChoice legend="What would you like to do with it?" options={options} value={mode} onChange={choose} />
      {mode === STATEMENT_MODES[1] || mode === STATEMENT_MODES[2] ? (
        <PromptField
          key={`statement-${rev}`}
          lessonCode={CODE}
          lessonTitle={lesson.title}
          index="statement"
          label={mode === STATEMENT_MODES[1] ? "Your revised statement" : "The statement or question you’d like to look into"}
          variant="inline"
          compact
        />
      ) : null}
      {mode === STATEMENT_MODES[3] ? (
        <Panel tone="example">
          <Quote label="The example">{L2_EXAMPLE}</Quote>
        </Panel>
      ) : null}
      <PrivacyNote />
    </div>
  );
}

function PartReading() {
  return (
    <Panel tone="reading">
      {/* DRAFT (Claude): shortened from the published reading "Don’t Just Argue With the Story. Gather Evidence."
          The last two paragraphs follow the Module 4 instructions. The full reading stays in the Library. */}
      <P>Once you notice a story about yourself, you could argue with it. “I never follow through.” “Yes I do.” Now there are two claims. What’s still missing is evidence.</P>
      <P>A small, safe action can give you new information. Depending on what happens, evidence can support a belief, challenge it, complicate it, or leave it unresolved. All four are useful.</P>
      <P>One experience rarely settles a broad claim about yourself. “I asked one question” doesn’t prove “I’m great at asking for help.” It might challenge “I never ask.”</P>
      <P>Using support doesn’t make it not count. A reminder, another person, a checklist, or extra time changes what the evidence says: “I did this with support.” That’s precise.</P>
      <P>
        Some beliefs aren’t suited to a quick experiment. Some involve other people, safety, or circumstances you don’t
        control, or would take far longer than one try. Don’t create a difficult situation just to test something. Keeping
        a belief as a question is a fine choice.
      </P>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Source: Entrepalooza Module 4 reading, “Don’t Just Argue With the Story. Gather Evidence.” It draws on the logic
        of behavioral experiments. This is an educational adaptation, not therapy.
      </p>
      <Link to="/program-library" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Read the full reading in the Library
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Panel>
  );
}

function PartPlanner({ lesson, answers, rev, onUseAction }) {
  const statement = currentStatement(answers);
  const limits = splitMulti(readKey(answers, CODE, "limits"));
  return (
    <div className="space-y-6">
      <P>Keep it small, safe, and realistic. One observable action is enough. Everything here is optional.</P>
      {statement ? (
        <Panel tone="yours" label="The statement or question">
          <Quote>{statement}</Quote>
        </Panel>
      ) : (
        <PromptField key={`statement-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index="statement" label="What statement or question are you looking into? (optional)" variant="inline" compact />
      )}
      <div className="space-y-3">
        <PromptField key={`action-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index={0} label={ACTION_LABEL} variant="inline" />
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">See example actions (optional)</summary>
          <p className="mt-2 text-[14px] text-muted-foreground">For the example “{L2_EXAMPLE}”</p>
          <ul className="mt-2 space-y-2">
            {L2_EXAMPLE_ACTIONS.map((text) => (
              <UseRow key={text} text={text} onUse={onUseAction} />
            ))}
          </ul>
        </details>
      </div>
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index="look-for" label={`${LOOK_FOR_LABEL} What would tell you something?`} variant="inline" />
      <MultiChoice
        legend="What limits or support matter?"
        hint="Pick any that fit. This is planning information, not a judgment."
        options={LIMITS}
        values={limits}
        only={LIMITS_NONE}
        onChange={(next) => recordM4(CODE, lesson.title, "limits", joinMulti(next), "Limits or support that matter")}
      />
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index="limits-note" label="Anything else about limits or support? (optional)" variant="inline" compact />
    </div>
  );
}

function Reminder() {
  const [when, setWhen] = useState("");
  const [added, setAdded] = useState("");
  const addReminder = () => {
    const date = reminderDate(when);
    if (!date) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/lesson/M4-L3` : "";
    downloadIcs("come-back-M4-L3.ics", buildReminderIcs({ when: date, stepTitle: "Review the evidence and revise your statement", url }));
    setAdded(date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
  };
  return (
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
  );
}

const STATUS_NOTES = {
  [PLAN_STATUS[0]]: "Your plan is saved. Lesson 3 will bring it back so you don’t have to write it again.",
  [PLAN_STATUS[1]]: "That’s fine. Your plan is saved for whenever it fits. In Lesson 3 you can say that you couldn’t attempt it. That’s a real result.",
  [PLAN_STATUS[2]]: "That’s a real choice. Not trying doesn’t prove anything about the statement. The question stays open, and Lesson 3 still works.",
  [PLAN_STATUS[3]]: "Keeping it as a question is enough. Some beliefs aren’t suited to a quick test.",
};

function PartSave({ lesson, answers }) {
  const status = readKey(answers, CODE, "plan-status");
  const statement = currentStatement(answers);
  const action = readKey(answers, CODE, 0);
  const lookFor = readKey(answers, CODE, "look-for");
  const limits = splitMulti(readKey(answers, CODE, "limits"));
  const hasPlan = statement || action || lookFor;
  return (
    <div className="space-y-5">
      {hasPlan ? (
        <Panel tone="yours" label="Your plan">
          {statement ? <Quote label="Statement or question">{statement}</Quote> : null}
          {action ? <Quote label="Small action">{action}</Quote> : null}
          {lookFor ? <Quote label="What you’ll look for">{lookFor}</Quote> : null}
          {limits.length ? <Quote label="Limits or support">{limits.join(", ")}</Quote> : null}
        </Panel>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">Nothing planned yet. That’s fine. You can tap “Plan” above, or keep going.</p>
      )}
      <SingleChoice
        legend="What would you like to do now?"
        options={PLAN_STATUS}
        value={status}
        onChange={(next) => recordM4(CODE, lesson.title, "plan-status", next, "What I decided about trying it")}
      />
      {status ? (
        <p aria-live="polite" className="text-[15px] leading-relaxed text-foreground">
          {STATUS_NOTES[status]}
        </p>
      ) : null}
      {status === PLAN_STATUS[0] ? (
        <Panel tone="note" label="Pause here">
          <P>This part happens out in your life, not on this screen. Come back to Lesson 3 whenever you’re ready. Your plan and your place are saved.</P>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PauseCircle className="h-4 w-4" aria-hidden="true" />
            I’ll come back after I try it
          </Link>
          <Reminder />
        </Panel>
      ) : null}
    </div>
  );
}

/** M4-L2 · Use One Small Action as Evidence. */
export default function ActionLesson({ lesson }) {
  const answers = useAnswers();
  const [rev, setRev] = useState(0);
  const setStatement = (text) => {
    recordM4(CODE, lesson.title, "statement", text, "The statement or question I’m looking into");
    setRev((value) => value + 1);
  };
  const useAction = (text) => {
    recordM4(CODE, lesson.title, 0, text, ACTION_LABEL);
    setRev((value) => value + 1);
  };
  const parts = [
    { id: "statement", short: "Statement", title: "Return to your statement", content: <PartStatement lesson={lesson} answers={answers} rev={rev} onSetStatement={setStatement} /> },
    { id: "read", short: "Read", title: "What counts as evidence", content: <PartReading /> },
    { id: "plan", short: "Plan", title: "Plan one small action", content: <PartPlanner lesson={lesson} answers={answers} rev={rev} onUseAction={useAction} /> },
    { id: "save", short: "Save", title: "Save it and come back", content: <PartSave lesson={lesson} answers={answers} /> },
    { id: "deeper", short: "Go deeper", title: "Go deeper", content: <PartGoDeeper lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
