import React, { useState } from "react";
import { Link } from "react-router-dom";
import PromptField from "../PromptField";
import { useAnswers } from "@/lib/workbook";
import {
  COST_NONE,
  COST_OPTIONS,
  HELPED_OPTIONS,
  L3_TITLE,
  NEXT_OPTIONS,
  UNCERTAIN_OPTIONS,
  carrySuggestions,
  hasResult,
  joinMulti,
  readExperiment,
  readKey,
  recordM3,
  splitMulti,
} from "@/lib/moduleThree";
import { FinishControl, MultiChoice, P, Panel, PartFlow, SingleChoice } from "../moduleOne/parts";
import { EarlierM3, ExperimentCard, FullReading } from "./common";

const CODE = "M3-L3";

function record(key, value, label) {
  recordM3(CODE, L3_TITLE, key, value, label);
}

/** Stage 1 · Bring forward the experiment. */
function PartBring({ answers }) {
  const x = readExperiment(answers);
  const anything = x.task || x.condition || x.adjustment || x.limit || x.outcome || x.exampleUse || x.observation;
  return (
    <div className="space-y-5">
      {anything ? (
        <ExperimentCard x={x} label="What you recorded in the last lesson" showResult />
      ) : (
        <div className="rounded-lg border border-dashed border-input p-4">
          <p className="text-[15px] text-muted-foreground">
            Nothing is saved from the last lesson yet. You can go back and plan or record an experiment, or continue here
            with what you remember. Nothing will be filled in for you.
          </p>
          <Link to="/lesson/M3-L2" className="mt-2 inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
            Open “Try changing one part of the setup”
          </Link>
        </div>
      )}
      <P>A plan isn’t a result, and an observation doesn’t prove what caused it. This lesson keeps those apart.</P>
    </div>
  );
}

/** Stage 2 · Brief reading. DRAFT (Claude): condensed from "One Result Is a Clue, Not a Personality." */
function PartReading({ readings }) {
  return (
    <div className="space-y-4">
      <Panel tone="reading" title="One result is a clue, not a personality">
        <P>
          After one try, it’s tempting to be certain: “That worked. I need this.” “That failed. This doesn’t work for me.”
          Slow down.
        </P>
        <P>
          A single experience is limited evidence. It can add to a pattern. It usually can’t establish a permanent trait
          by itself.
        </P>
        <P>
          A change to the setup can help, make things harder, or do both at once. A deadline might get more done and add
          pressure. Working beside someone might help you start and make concentrating harder.
        </P>
        <P>
          Other things may have changed too. If the second attempt went better, you may simply have practiced, known what
          to expect, slept better, or had more energy.
        </P>
        <P>
          A condition that helped with one task, at one time, may not help with every task. Tasks differ, skills develop,
          and circumstances change.
        </P>
        <P>
          Support belongs in the description. If someone helped you, the accurate version isn’t “it doesn’t count” or “I
          proved I can do it alone.” It’s “I did this under conditions that included support.” Needing support or an
          accommodation isn’t a weakness. It’s part of what happened.
        </P>
        <P>
          Words like <em>seemed</em>, <em>this time</em>, and <em>under these conditions</em> aren’t weak. They match the
          amount of evidence you have.
        </P>
      </Panel>
      <FullReading readings={readings} />
    </div>
  );
}

/** Stage 3 · Examine benefits and costs. */
function PartWeigh({ answers }) {
  const x = readExperiment(answers);
  const helped = splitMulti(readKey(answers, CODE, "helped"));
  const costs = splitMulti(readKey(answers, CODE, "costs"));
  const uncertain = splitMulti(readKey(answers, CODE, "uncertain"));
  return (
    <div className="space-y-6">
      {!hasResult(x) ? (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          No result is recorded yet, so there may be nothing to weigh. You can still think about what the plan would
          take, or skip ahead.
        </p>
      ) : null}
      <MultiChoice
        legend="What seemed to help, if anything?"
        hint="Choose any that fit."
        options={HELPED_OPTIONS}
        values={helped}
        onChange={(next) => record("helped", joinMulti(next), "What seemed to help")}
      />
      <PromptField lessonCode={CODE} lessonTitle={L3_TITLE} index={1} label="Anything else that seemed to help or change? (optional)" variant="inline" compact />
      <MultiChoice
        legend="What made it harder or less practical? What did it require?"
        hint="Time, money, equipment, effort, or someone else’s help all count."
        options={COST_OPTIONS}
        values={costs}
        only={COST_NONE}
        onChange={(next) => record("costs", joinMulti(next), "What it cost or required")}
      />
      <MultiChoice
        legend="What remains uncertain?"
        options={UNCERTAIN_OPTIONS}
        values={uncertain}
        onChange={(next) => record("uncertain", joinMulti(next), "What remains uncertain")}
      />
      <PromptField lessonCode={CODE} lessonTitle={L3_TITLE} index={3} label="A note on costs or unknowns (optional)" variant="inline" compact />
    </div>
  );
}

/** Stage 4 · Decide what to do next. No choice is better than another. */
function PartDecide({ answers }) {
  const next = readKey(answers, CODE, "next");
  return (
    <div className="space-y-5">
      <SingleChoice
        legend="What would you like to do next?"
        hint="Every option here is a reasonable choice."
        options={NEXT_OPTIONS}
        value={next}
        onChange={(value) => record("next", value, "What I want to do next with this experiment")}
      />
      <PromptField lessonCode={CODE} lessonTitle={L3_TITLE} index={4} label="Anything you want to add? For example, what could change your mind. (optional)" variant="inline" />
    </div>
  );
}

/** Stage 5 · Carry one observation or question forward. Saved where Module 4 reads it. */
function PartCarry({ answers }) {
  const [rev, setRev] = useState(0);
  const current = readKey(answers, CODE, 5);
  const suggestions = carrySuggestions(answers);
  const use = (text) => {
    record(5, current === text ? "" : text, "What I want to carry into Module 4");
    setRev((value) => value + 1);
  };
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-[17px] font-medium leading-snug text-foreground">Choose or write one observation or question to take into Module 4.</p>
        <p className="text-[15px] text-muted-foreground">Tap one to start from it, then change the words if you like.</p>
        <div className="flex flex-col gap-2">
          {suggestions.map((text) => (
            <button
              key={text}
              type="button"
              aria-pressed={current === text}
              onClick={() => use(text)}
              className={`min-h-[48px] rounded-lg border px-4 py-2.5 text-left text-[16px] transition-colors ${
                current === text ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      <PromptField key={`carry-${rev}`} lessonCode={CODE} lessonTitle={L3_TITLE} index={5} label="What I’m carrying into Module 4 (optional)" variant="inline" />
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        This will be waiting for you at the start of Module 4, so you won’t be asked for it again there.
      </p>
      <Panel tone="note">
        <P>
          <strong>The takeaway:</strong> For now, under these conditions, this is what you noticed. It tells you what to try
          or look at next. It doesn’t declare who you are.
        </P>
      </Panel>
      <EarlierM3 code={CODE} answers={answers} />
      <FinishControl code={CODE} answers={answers} />
    </div>
  );
}

/** M3-L3 · Review what helped and what it cost. */
export default function ReviewLesson({ lesson, readings }) {
  const answers = useAnswers();
  const parts = [
    { id: "bring", short: "Bring", title: "Bring forward your experiment", content: <PartBring answers={answers} /> },
    { id: "read", short: "Read", title: "One result is a clue", content: <PartReading readings={readings} /> },
    { id: "weigh", short: "Weigh", title: "What helped, and what it cost", content: <PartWeigh answers={answers} /> },
    { id: "decide", short: "Decide", title: "Decide what to do next", content: <PartDecide answers={answers} /> },
    { id: "carry", short: "Carry", title: "Carry one thing into Module 4", content: <PartCarry answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
