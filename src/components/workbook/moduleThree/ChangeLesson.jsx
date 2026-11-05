import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, Check } from "lucide-react";
import PromptField from "../PromptField";
import { Chip, ChipGroup } from "../TryChips";
import { useAnswers } from "@/lib/workbook";
import { useStore } from "@/lib/store";
import { REMINDER_OPTIONS, buildReminderIcs, downloadIcs, reminderDate } from "@/lib/afterTry";
import {
  AS_PLANNED,
  CONDITIONS,
  EXAMPLE_ADJUSTMENT,
  EXAMPLE_LOOKED,
  EXAMPLE_TASK,
  EXAMPLE_USES,
  L2_TITLE,
  LIMIT_CHIPS,
  OUTCOMES,
  OUTCOME_NOT_YET,
  TASK_CONTINUE,
  TASK_EXAMPLE,
  TASK_MODES,
  TASK_OTHER,
  checkinSentences,
  experimentHasPlan,
  planSentences,
  readExperiment,
  readKey,
  recordM3,
  setQuiet,
  taskFromL1,
} from "@/lib/moduleThree";
import { FinishControl, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import { EarlierM3, ExamplePanel, ExperimentCard, Feedback, FullReading } from "./common";

const CODE = "M3-L2";
const RECORD_PART = 3;

function record(key, value, label) {
  recordM3(CODE, L2_TITLE, key, value, label);
}

/** Keeps the plain-sentence plan and result in step with the answers they summarize. */
function useSummaries(answers) {
  useEffect(() => {
    const x = readExperiment(answers);
    const touched = readKey(answers, CODE, "task-mode") || readKey(answers, CODE, "task") || readKey(answers, CODE, "condition") || x.adjustment || x.limit;
    const plan = touched ? planSentences(x) : "";
    if (plan !== readKey(answers, CODE, "plan")) record("plan", plan, "My changed-setup plan");
    const checkin = checkinSentences(x);
    if (checkin !== readKey(answers, CODE, "checkin")) record("checkin", checkin, "What happened when I changed the setup");
  }, [answers]);
}

/** Optional calendar reminder. Nothing is sent anywhere. */
function Reminder() {
  const [when, setWhen] = useState("");
  const [added, setAdded] = useState("");
  const add = () => {
    if (!when) return;
    const date = reminderDate(when);
    const url = typeof window !== "undefined" ? `${window.location.origin}/lesson/${CODE}` : "";
    downloadIcs(`come-back-${CODE}.ics`, buildReminderIcs({ when: date, stepTitle: L2_TITLE, url }));
    setAdded(date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
  };
  return (
    <div className="rounded-xl border border-border bg-secondary p-4">
      <ChipGroup label="Want a reminder? (optional)" hint="This downloads a calendar file for your own calendar. Nothing is sent to anyone.">
        {REMINDER_OPTIONS.map((option) => (
          <Chip key={option.id} active={when === option.id} onClick={() => setWhen(option.id)}>
            {option.label}
          </Chip>
        ))}
      </ChipGroup>
      <button
        type="button"
        onClick={add}
        disabled={!when}
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        Add it to my calendar
      </button>
      {added ? (
        <p role="status" className="mt-2 text-[15px] text-foreground">
          Calendar file downloaded for {added}. Open it to add it.
        </p>
      ) : null}
    </div>
  );
}

/** Stage 1 · Choose a task. */
function PartTask({ lesson, answers, rev, bump }) {
  const carried = taskFromL1(answers);
  const hasCarried = Boolean(carried.text) && carried.origin !== "example";
  const mode = readKey(answers, CODE, "task-mode");
  const task = readKey(answers, CODE, "task");
  const modes = hasCarried ? TASK_MODES : [TASK_OTHER, TASK_EXAMPLE];
  const autoValues = [carried.text, EXAMPLE_TASK].filter(Boolean);

  const choose = (next) => {
    record("task-mode", next, "Which task I’m using");
    // Fill the task box only when it is empty or still holds a value this lesson filled in.
    if (!task || autoValues.includes(task)) {
      const fill = next === TASK_CONTINUE ? carried.text : next === TASK_EXAMPLE ? EXAMPLE_TASK : "";
      record("task", fill, "The task I’ll use");
      bump();
    }
  };

  return (
    <div className="space-y-6">
      {hasCarried ? (
        <Panel tone="yours" label={carried.origin === "m2" ? "From Module 2" : "From the last lesson"}>
          <Quote>{carried.text}</Quote>
        </Panel>
      ) : carried.origin === "example" ? (
        <p className="text-[15px] text-muted-foreground">In the last lesson you used the provided example.</p>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          No task is saved from earlier. Choose an everyday task or use the provided example.
        </p>
      )}

      <SingleChoice legend="Which task will you use?" options={modes} value={mode} onChange={choose} />

      {mode === TASK_EXAMPLE ? <ExamplePanel lesson={lesson} /> : null}

      {mode && mode !== TASK_EXAMPLE ? (
        <div className="space-y-2" aria-live="polite">
          <p className="text-[15px] text-muted-foreground">For example: “Learning how to use a new computer program.”</p>
          <PromptField key={`task-${rev}`} lessonCode={CODE} lessonTitle={L2_TITLE} index="task" label="The task you’ll use (you can edit this)" variant="inline" />
        </div>
      ) : null}
    </div>
  );
}

/** Stage 2 · Choose one condition to change. */
function PartCondition({ answers }) {
  const x = readExperiment(answers);
  return (
    <div className="space-y-5">
      <fieldset className="min-w-0">
        <legend className="text-[17px] font-medium leading-snug text-foreground">Which one condition will you change?</legend>
        {x.conditionFrom === "l1" ? (
          <p className="mt-1 text-[15px] text-muted-foreground">Picked from the last lesson. Change it if you like.</p>
        ) : x.conditionFrom === "example" ? (
          <p className="mt-1 text-[15px] text-muted-foreground">The provided example changes the instructions. You can pick something else.</p>
        ) : null}
        <div className="mt-3 flex flex-col gap-2" role="group">
          {CONDITIONS.map((condition) => {
            const active = x.condition === condition.id;
            return (
              <button
                key={condition.id}
                type="button"
                aria-pressed={active}
                onClick={() => record("condition", condition.id, "The condition I’ll change")}
                className={`flex min-h-[56px] w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
                }`}
              >
                <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-primary-foreground" : "border-input"}`}>
                  {active ? <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" /> : null}
                </span>
                <span>
                  <span className="block text-[16px] font-medium">{condition.option}</span>
                  <span className={`block text-[15px] ${active ? "opacity-90" : "text-muted-foreground"}`}>{condition.change}</span>
                </span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={x.condition === "unsure"}
            onClick={() => record("condition", "unsure", "The condition I’ll change")}
            className={`min-h-[56px] w-full rounded-lg border px-4 py-3 text-left text-[16px] font-medium ${x.condition === "unsure" ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"}`}
          >
            Not sure yet — keep looking
          </button>
          {x.condition === "unsure" ? <p className="text-[15px] text-muted-foreground">You can continue without choosing a condition or doing another experiment.</p> : null}
        </div>
      </fieldset>
      <Panel tone="note">
        <P>
          Keep the task itself as similar as you reasonably can. Then, if something changes, the comparison tells you more.
        </P>
        <P>
          Changing one condition can raise a useful question. It can’t prove the change caused what happened. Practice,
          familiarity, energy, and other things can matter too.
        </P>
      </Panel>
    </div>
  );
}

/** Stage 3 · Plan a manageable adjustment. */
function PartPlan({ answers, rev, bump, goRecord, readings }) {
  const x = readExperiment(answers);
  const saved = Boolean(x.planSaved);
  const fill = (key, text, label) => {
    record(key, text, label);
    bump();
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[15px] text-muted-foreground">
          For example: “Follow a short demonstration instead of written instructions.”
        </p>
        <PromptField key={`adj-${rev}`} lessonCode={CODE} lessonTitle={L2_TITLE} index={0} label="What will you try differently?" variant="inline" />
        {x.example && x.adjustment !== EXAMPLE_ADJUSTMENT ? (
          <button
            type="button"
            onClick={() => fill(0, EXAMPLE_ADJUSTMENT, "What I’ll try differently")}
            className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Use the example’s change: checklist instead of paragraph
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <ChipGroup label="A reasonable limit or stopping point" hint="Tap one to start, or write your own. Keep the try small enough that you can still choose.">
          {LIMIT_CHIPS.map((chip) => (
            <Chip key={chip} active={x.limit === chip} onClick={() => fill(2, x.limit === chip ? "" : chip, "My limit or stopping point")}>
              {chip}
            </Chip>
          ))}
        </ChipGroup>
        <PromptField key={`limit-${rev}`} lessonCode={CODE} lessonTitle={L2_TITLE} index={2} label="In your own words (optional)" variant="inline" compact />
      </div>

      <ExperimentCard x={x} label="Your plan so far" />

      {saved ? (
        <div aria-live="polite" className="space-y-4">
          <Feedback>
            <span className="inline-flex items-center gap-2 font-medium">
              <Check className="h-4 w-4 text-accent-ink" aria-hidden="true" />
              Your plan is saved.
            </span>{" "}
            Try it when it fits your week, then come back to this lesson to record what happened. Not getting to it is a
            result you can record too.
          </Feedback>
          <Reminder />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link to="/" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90">
              Back to the workbook
            </Link>
            <button type="button" onClick={goRecord} className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
              I’m back: record what happened
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => setQuiet(CODE, "plan-saved", new Date().toISOString())}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save my plan and come back after trying it
          </button>
          <button type="button" onClick={goRecord} className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
            I’ve already tried it: record what happened
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <p className="text-[14px] text-muted-faint">You don’t have to try it right away. A plan on its own is a complete place to stop.</p>
      <FullReading readings={readings} />
    </div>
  );
}

/** Stage 4 · Record what happened. */
function PartRecord({ answers }) {
  const x = readExperiment(answers);
  const lookedOnly = x.example && x.exampleUse === EXAMPLE_LOOKED;
  const outcome = OUTCOMES.find((item) => item.label === x.outcome);
  const tried = x.outcome && x.outcome !== OUTCOME_NOT_YET && !lookedOnly;
  return (
    <div className="space-y-6">
      {experimentHasPlan(x) ? (
        <ExperimentCard x={x} label="Your saved task and adjustment" />
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          No plan is saved yet. You can go back and make one, or record what happened anyway.
        </p>
      )}

      {x.example ? (
        <div className="space-y-3">
          <SingleChoice
            legend="How did you use the example?"
            options={EXAMPLE_USES}
            value={x.exampleUse}
            onChange={(next) => record("example-use", next, "How I used the provided example")}
          />
          {lookedOnly ? (
            <Feedback>
              Looking at two setups is a fair way to explore. It shows what each format asks for. It isn’t a result from
              trying them, so no outcome is recorded.
            </Feedback>
          ) : x.exampleUse === EXAMPLE_USES[0] ? (
            <Feedback>
              The second time is often easier because you already know what you want to say. That familiarity is another
              possible explanation for any difference.
            </Feedback>
          ) : null}
        </div>
      ) : null}

      {!lookedOnly ? (
        <div className="space-y-3">
          <SingleChoice
            legend="What happened when you changed the setup?"
            options={OUTCOMES.map((item) => item.label)}
            value={x.outcome}
            onChange={(next) => record("outcome", next, "What happened when I changed the setup")}
          />
          {outcome ? <Feedback>{outcome.feedback}</Feedback> : null}
        </div>
      ) : null}

      {tried ? (
        <SingleChoice
          legend="Did you try it the way you planned? (optional)"
          options={AS_PLANNED}
          value={x.asPlanned}
          onChange={(next) => record("as-planned", next, "Did I try it as planned?")}
        />
      ) : null}

      <PromptField
        lessonCode={CODE}
        lessonTitle={L2_TITLE}
        index={4}
        label={
          x.outcome === OUTCOME_NOT_YET
            ? "Anything you want to note, such as what got in the way? (optional)"
            : "In your own words, what happened? (optional)"
        }
        variant="inline"
      />

      {x.outcome === OUTCOME_NOT_YET ? (
        <div className="space-y-3">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Not having the time, money, support, or opportunity isn’t a sign of low motivation. Your plan stays saved.
          </p>
          <Reminder />
        </div>
      ) : null}

      <EarlierM3 code={CODE} answers={answers} />
      <FinishControl code={CODE} answers={answers} />
    </div>
  );
}

/** M3-L2 · Try changing one part of the setup. */
export default function ChangeLesson({ lesson, readings }) {
  const answers = useAnswers();
  const [rev, setRev] = useState(0);
  const bump = () => setRev((value) => value + 1);
  // Same device-only key PartFlow uses, so a button can open the "Record" part.
  const [, setPart] = useStore(`m1Part.${CODE}`, 0);
  useSummaries(answers);
  const goRecord = () => {
    setPart(RECORD_PART);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const parts = [
    { id: "task", short: "Task", title: "Choose a task", content: <PartTask lesson={lesson} answers={answers} rev={rev} bump={bump} /> },
    { id: "condition", short: "Condition", title: "Choose one condition to change", content: <PartCondition answers={answers} /> },
    { id: "plan", short: "Plan", title: "Plan a manageable adjustment", content: <PartPlan answers={answers} rev={rev} bump={bump} goRecord={goRecord} readings={readings} /> },
    { id: "record", short: "Record", title: "Record what happened", content: <PartRecord answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
