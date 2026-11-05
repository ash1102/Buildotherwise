import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PromptField from "../PromptField";
import { BridgeOut } from "../ModuleBridge";
import { bridgeOut } from "@/lib/moduleBridges";
import { useAnswers } from "@/lib/workbook";
import { DIRECTIONS, KEEP_KINDS, OUTCOMES, readKey, readPlan, recordM2, splitMulti } from "@/lib/moduleTwo";
import { FinishControl, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import { EarlierM2, PlanCard, usePlanSync } from "./common";
import { TRIED_OUTCOMES } from "@/lib/moduleTwo";

const CODE = "M2-L3";
const KEEP_LABEL = "What do you want to remember?";

function readTry(answers) {
  return {
    outcome: readKey(answers, "M2-L2", "outcome"),
    used: splitMulti(readKey(answers, "M2-L2", "method-used")),
    did: readKey(answers, "M2-L2", 1),
    barriers: splitMulti(readKey(answers, "M2-L2", 30)),
    move: readKey(answers, "M2-L2", "next-move"),
    smallest: readKey(answers, "M2-L2", 31),
    noticed: splitMulti(readKey(answers, "M2-L2", "noticed")),
    words: readKey(answers, "M2-L2", 2),
  };
}

function PartLook({ answers }) {
  const plan = readPlan(answers);
  const happened = readTry(answers);
  const anything = happened.outcome || happened.did || happened.barriers.length || happened.noticed.length || happened.words;
  return (
    <div className="space-y-5">
      <P>Here’s what you planned and what you recorded, exactly as you saved it. Nothing needs to be entered again.</P>
      <PlanCard plan={plan} label="What you planned" empty="No plan was saved in Lesson 1. That’s fine." />
      {anything ? (
        <Panel tone="yours" label="What happened">
          {happened.outcome ? <p className="text-[16px] font-medium text-foreground">{happened.outcome}</p> : null}
          {happened.used.length ? <Quote label="Kind of encounter">{happened.used.join(", ")}</Quote> : null}
          {happened.did ? <Quote label="What you actually did or observed">{happened.did}</Quote> : null}
          {happened.barriers.length ? <Quote label="What got in the way">{happened.barriers.join(", ")}</Quote> : null}
          {happened.move ? <Quote label="What you decided to do about it">{happened.move}</Quote> : null}
          {happened.smallest ? <Quote label="A smaller version">{happened.smallest}</Quote> : null}
          {happened.noticed.length ? <Quote label="What you noticed">{happened.noticed.join(", ")}</Quote> : null}
          {happened.words ? <Quote label="In your words">{happened.words}</Quote> : null}
        </Panel>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          Nothing is recorded from Lesson 2 yet. You can{" "}
          <Link to="/lesson/M2-L2" className="text-accent-ink underline underline-offset-2">
            go back to Lesson 2
          </Link>{" "}
          or use this lesson to think about what you’d want to find out.
        </p>
      )}
      {happened.outcome === OUTCOMES[3] || happened.outcome === OUTCOMES[4] ? (
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <p className="text-[15px] text-muted-foreground">You haven’t had the experience yet, and that’s fine. You can review your plan, choose a different way to explore, or continue with what you know so far. No experience is being assumed.</p>
          <Link to="/lesson/M2-L1" className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">Go back to my plan</Link>
        </div>
      ) : null}
    </div>
  );
}

function PartReading() {
  return (
    <div className="space-y-4">
      <Panel tone="reading">
        {/* DRAFT (Claude): built from the published M2-L2 reading "What Did the Experience Really Show?"
            and the points in the Module 2 instructions. */}
        <P>
          One experience can raise useful questions. It can’t reliably tell you whether you have a lasting interest, an
          ability, or the right direction for your life or work.
        </P>
        <P>
          Context shapes every experience. Access, money, support, timing, how unfamiliar something was, and what else was
          going on that day all affect how it went. A difficult first try might point to a poor fit, a hard setup, or simply
          a need for better information. An exciting first try doesn’t guarantee lasting interest either.
        </P>
        <P>
          It helps to separate <strong>what you observed</strong> from <strong>what you’re assuming</strong>. “I needed help
          following the instructions” describes something that happened. “I’m not good at this” is a much bigger conclusion
          that one experience may not support.
        </P>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Panel tone="example" label="Example: observed">
          <ul className="space-y-1.5 text-[15px] leading-relaxed text-foreground">
            <li>I lost track of time while sketching.</li>
            <li>The video moved faster than I could follow.</li>
            <li>The person I asked said the first year was hard.</li>
          </ul>
        </Panel>
        <Panel tone="example" label="Example: assumed">
          <ul className="space-y-1.5 text-[15px] leading-relaxed text-foreground">
            <li>I’m meant to be an artist.</li>
            <li>I’m not smart enough for this.</li>
            <li>I’d hate doing this work.</li>
          </ul>
        </Panel>
      </div>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Source: Entrepalooza Module 2 reading, “What Did the Experience Really Show?”{" "}
        <Link to="/program-library" className="inline-flex items-center gap-1 text-accent-ink underline underline-offset-2">
          Read it in the Library
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}

function PartWhere({ lesson, answers }) {
  const direction = readKey(answers, CODE, "direction");
  return (
    <div className="space-y-5">
      <P>Whether you tried something, observed from a distance, or have not tried it yet, where would you like to go from here? None of these is better than the others.</P>
      <SingleChoice
        legend="Where from here?"
        options={DIRECTIONS}
        value={direction}
        onChange={(next) => recordM2(CODE, lesson.title, "direction", next, "Where I'd like to go from here")}
      />
      <PromptField
        lessonCode={CODE}
        lessonTitle={lesson.title}
        index="direction-why"
        label="Anything you want to add about that choice? (optional)"
        variant="inline"
      />
      <p className="text-[14px] text-muted-foreground">You can change this anytime. It’s a next step, not a verdict.</p>
    </div>
  );
}

function PartKeep({ lesson, answers }) {
  const kind = readKey(answers, CODE, "keep-kind");
  const plan = readPlan(answers);
  const happened = readTry(answers);
  const [rev, setRev] = useState(0);
  const starters = [
    { label: "What you wrote in Lesson 2", value: happened.words },
    { label: "What you actually did or observed", value: happened.did },
    { label: "What you set out to explore", value: plan.explore },
  ].filter((item) => item.value);
  const bridge = bridgeOut(2);
  return (
    <div className="space-y-5">
      <P>Pick one thing worth remembering from Module 2: something you noticed, a question you still have, or a possibility.</P>
      <SingleChoice
        legend="What kind of thing is it?"
        options={KEEP_KINDS}
        value={kind}
        onChange={(next) => recordM2(CODE, lesson.title, "keep-kind", next, "What I'm taking forward is")}
      />
      {starters.length ? (
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">Start from something you already wrote (optional)</summary>
          <ul className="mt-2 space-y-2">
            {starters.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => {
                    recordM2(CODE, lesson.title, 9, item.value, KEEP_LABEL);
                    setRev((value) => value + 1);
                  }}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-left hover:bg-secondary"
                >
                  <span className="block text-[13px] text-muted-foreground">{item.label}</span>
                  <span className="block text-[15px] text-foreground">{item.value}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <PromptField key={rev} lessonCode={CODE} lessonTitle={lesson.title} index={9} label={`${KEEP_LABEL} One line is enough.`} variant="inline" />
      <p className="text-[15px] text-muted-foreground">Later modules can bring this back when it’s relevant. You can change it anytime.</p>
      {bridge ? (
        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">Get a head start on Module 3 (optional)</summary>
          <div className="mt-3">
            <BridgeOut bridge={bridge} lesson={lesson} />
          </div>
        </details>
      ) : null}
      <EarlierM2 code={CODE} answers={answers} />
      {TRIED_OUTCOMES.includes(happened.outcome) ? (
        <FinishControl code={CODE} answers={answers} />
      ) : (
        <Panel tone="note" label="Your experiment is still open">
          <P>Module 2 counts as completed after you attempt at least one real-world experiment. Doing, observing, asking, or investigating can all count. A small attempt is enough; you do not need proof or a successful outcome.</P>
          <P>You can still explore other lessons and modules, pause, or change your plan. Your progress is saved.</P>
          <Link to="/lesson/M2-L2" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">Return to your experiment</Link>
        </Panel>
      )}
    </div>
  );
}

/** M2-L3 · What did you discover? */
export default function DiscoverLesson({ lesson }) {
  const answers = useAnswers();
  usePlanSync(answers);
  const parts = [
    { id: "look", short: "Look back", title: "Look at what happened", content: <PartLook answers={answers} /> },
    { id: "read", short: "Read", title: "What does one experience tell you?", content: <PartReading /> },
    { id: "where", short: "Where next", title: "Where from here?", content: <PartWhere lesson={lesson} answers={answers} /> },
    { id: "keep", short: "Keep", title: "Take something forward", content: <PartKeep lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
