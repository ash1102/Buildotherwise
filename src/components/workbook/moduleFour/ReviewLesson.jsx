import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { BridgeOut } from "../ModuleBridge";
import { useAnswers } from "@/lib/workbook";
import { writeStore } from "@/lib/store";
import { bridgeOut } from "@/lib/moduleBridges";
import {
  EVIDENCE_FIT,
  OTHER_EXPLANATIONS,
  OUTCOMES,
  REVISE_MODES,
  currentStatement,
  joinMulti,
  readKey,
  recordM4,
  splitMulti,
} from "@/lib/moduleFour";
import { MultiChoice, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import { PartGoDeeper } from "./common";

const CODE = "M4-L3";
const PLAN_CODE = "M4-L2";
const PLAN_TITLE = "Use One Small Action as Evidence";
const REVISED_LABEL = "Your revised statement";
/** The planner part of M4-L2 (0-based), so "Change my plan" opens it directly. */
const PLAN_PART_INDEX = 2;

function PartLookBack({ answers }) {
  const statement = currentStatement(answers);
  const action = readKey(answers, PLAN_CODE, 0);
  const lookFor = readKey(answers, PLAN_CODE, "look-for");
  const status = readKey(answers, PLAN_CODE, "plan-status");
  return (
    <div className="space-y-5">
      <P>This lesson looks at what happened and checks whether your statement still fits the evidence. Whatever happened, including nothing, counts as information.</P>
      {statement || action || lookFor ? (
        <Panel tone="yours" label="From Lessons 1 and 2">
          {statement ? <Quote label="Your statement or question">{statement}</Quote> : null}
          {action ? <Quote label="The small action you planned">{action}</Quote> : null}
          {lookFor ? <Quote label="What you planned to look for">{lookFor}</Quote> : null}
          {status ? <Quote label="What you decided">{status}</Quote> : null}
        </Panel>
      ) : (
        <div className="space-y-4">
          <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
            There’s no plan saved from Lesson 2. That’s fine. You can write the statement here, or go back to Lesson 2.
          </p>
          <PromptField lessonCode={PLAN_CODE} lessonTitle={PLAN_TITLE} index="statement" label="What statement are you reviewing? (optional)" variant="inline" compact />
        </div>
      )}
      <Link
        to={`/lesson/${PLAN_CODE}`}
        onClick={() => writeStore(`m1Part.${PLAN_CODE}`, PLAN_PART_INDEX)}
        className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-accent-ink underline underline-offset-2"
      >
        Review or change my plan
      </Link>
      <PrivacyNote />
    </div>
  );
}

function PartHappened({ lesson, answers }) {
  const outcome = readKey(answers, CODE, "outcome");
  const noAttempt = outcome === OUTCOMES[3] || outcome === OUTCOMES[4];
  return (
    <div className="space-y-5">
      <SingleChoice
        legend="What happened with the action?"
        options={OUTCOMES}
        value={outcome}
        onChange={(next) => recordM4(CODE, lesson.title, "outcome", next, "What happened with the action")}
      />
      {noAttempt ? (
        <Panel tone="note">
          <P>That’s a real result. Not attempting it doesn’t prove anything about your statement. It means the question is still open.</P>
        </Panel>
      ) : null}
      <PromptField
        lessonCode={CODE}
        lessonTitle={lesson.title}
        index={1}
        label={noAttempt ? "Anything you want to note about it? (optional)" : "Briefly, what happened? A few words is enough."}
        variant="inline"
      />
    </div>
  );
}

function PartExamine({ lesson, answers }) {
  const fit = splitMulti(readKey(answers, CODE, "evidence-fit"));
  const other = splitMulti(readKey(answers, CODE, "other-explanations"));
  return (
    <div className="space-y-6">
      <Panel tone="reading">
        {/* DRAFT (Claude): shortened from the published reading "Make the Claim the Size of the Evidence".
            The full reading stays in the Library. */}
        <P>It’s easy to swing from one extreme to the other. It goes badly: “See? I knew I couldn’t do it.” It goes well: “See? I’ve completely changed.” Neither follows from one attempt.</P>
        <P>
          You don’t have to turn a negative statement into a positive one. In one experiment, repeating very positive
          self-statements made some people with low self-esteem feel worse (Wood, Perunovic &amp; Lee, 2009). Unsupported
          positivity isn’t automatically better than accuracy.
        </P>
        <P>Difficult evidence still counts, and so does success. One success is evidence, not a coronation. If support or conditions made it possible, keep them in the conclusion.</P>
        <Link to="/program-library" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Read the full reading in the Library
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Panel>
      <MultiChoice
        legend="How does what happened relate to your statement?"
        hint="Pick any that fit."
        options={EVIDENCE_FIT}
        values={fit}
        only={EVIDENCE_FIT[4]}
        onChange={(next) => recordM4(CODE, lesson.title, "evidence-fit", joinMulti(next), "How the evidence relates to my statement")}
      />
      <PromptField
        lessonCode={CODE}
        lessonTitle={lesson.title}
        index={2}
        label="What does it support, what does it challenge, and what’s still uncertain? (optional)"
        variant="inline"
      />
      <MultiChoice
        legend="What else might explain what happened? (optional)"
        options={OTHER_EXPLANATIONS}
        values={other}
        onChange={(next) => recordM4(CODE, lesson.title, "other-explanations", joinMulti(next), "What else might explain it")}
      />
    </div>
  );
}

function PartRevise({ lesson, answers, rev, onSetRevised }) {
  const original = currentStatement(answers);
  const mode = readKey(answers, CODE, "revise-mode");
  const revised = readKey(answers, CODE, 4);
  const bridge = bridgeOut(4);
  const choose = (next) => {
    recordM4(CODE, lesson.title, "revise-mode", next, "What I did with my statement");
    if (next === REVISE_MODES[0] && original && !revised) onSetRevised(original);
  };
  return (
    <div className="space-y-6">
      <P>The goal isn’t nicer wording. It’s wording that’s the same size as the evidence. Keeping your original statement is a real option.</P>
      <SingleChoice legend="What would you like to do with your statement?" options={REVISE_MODES} value={mode} onChange={choose} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel tone="yours" label="Original">
          {original ? <Quote>{original}</Quote> : <p className="text-[15px] text-muted-foreground">No statement saved yet.</p>}
        </Panel>
        <div className="space-y-2">
          <PromptField key={`revised-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index={4} label={REVISED_LABEL} variant="inline" />
          {original && !revised ? (
            <button type="button" onClick={() => onSetRevised(original)} className="min-h-[44px] text-[14px] font-medium text-accent-ink underline underline-offset-2">
              Start from my original wording
            </button>
          ) : null}
        </div>
      </div>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer text-[15px] font-medium text-foreground">See an example revision (optional)</summary>
        <dl className="mt-2 space-y-2 text-[15px] text-foreground">
          <div>
            <dt className="text-muted-foreground">Original</dt>
            <dd>“I’m bad at explaining things.”</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Revised</dt>
            <dd>“I had trouble explaining an unfamiliar topic without preparation. I haven’t tested how I do with something I know well.”</dd>
          </div>
        </dl>
        <p className="mt-2 text-[13px] text-muted-faint">An example only. Yours can look completely different.</p>
      </details>
      {bridge ? (
        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">Optional: get a head start on Module 5</summary>
          <div className="mt-3">
            <BridgeOut bridge={bridge} lesson={lesson} />
          </div>
        </details>
      ) : null}
    </div>
  );
}

/** M4-L3 · Review the Evidence and Revise Your Statement. */
export default function ReviewLesson({ lesson }) {
  const answers = useAnswers();
  const [rev, setRev] = useState(0);
  const setRevised = (text) => {
    recordM4(CODE, lesson.title, 4, text, REVISED_LABEL);
    setRev((value) => value + 1);
  };
  const parts = [
    { id: "back", short: "Look back", title: "Bring forward your statement and plan", content: <PartLookBack answers={answers} /> },
    { id: "happened", short: "What happened", title: "What happened?", content: <PartHappened lesson={lesson} answers={answers} /> },
    { id: "examine", short: "Examine", title: "Examine the evidence", content: <PartExamine lesson={lesson} answers={answers} /> },
    { id: "revise", short: "Revise", title: "Revise your statement", content: <PartRevise lesson={lesson} answers={answers} rev={rev} onSetRevised={setRevised} /> },
    { id: "deeper", short: "Go deeper", title: "Go deeper", content: <PartGoDeeper lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
