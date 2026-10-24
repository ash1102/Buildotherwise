import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { answerKey, setAnswer, useAnswers } from "@/lib/workbook";
import { useStore } from "@/lib/store";
import { MAP_PICK_KEY } from "@/lib/lifeMap";
import { BRIDGES, bridgeSources, readable } from "@/lib/moduleBridges";
import {
  EXAMPLE_EXPERIENCE,
  L1_START,
  SKETCH_KINDS,
  SKETCH_PERSON,
  SORT_ITEMS,
  SORT_LABELS,
  readKey,
  readSort,
  recordM4,
} from "@/lib/moduleFour";
import { P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import { PartGoDeeper } from "./common";

const CODE = "M4-L1";
const LABELS = {
  0: "What happened?",
  1: "What explanation did you give it?",
  2: "Did it become a broader judgment about you?",
  3: "What remains unknown?",
};
const OWN_WORDS = "Something else, in my own words";
const AS_PHRASE = { Event: "an event", Story: "a story", Verdict: "a verdict", Uncertain: "uncertain" };

function earlierObservations(answers, pick) {
  const bridgeAnswer = readable((answers || {})[answerKey("BRIDGE-3-4", 0)]).trim();
  const tryAnswer = readKey(answers, "M2-L2", 1);
  const rows = [
    ...(bridgeAnswer ? [{ key: "bridge", label: "What you wrote at the end of Module 3", value: bridgeAnswer }] : []),
    ...bridgeSources(BRIDGES[3], answers, pick),
    ...(tryAnswer ? [{ key: "m2try", label: "What you did or observed in Module 2", value: tryAnswer }] : []),
  ];
  const seen = new Set();
  return rows.filter((row) => (seen.has(row.value) ? false : seen.add(row.value)));
}

function SketchBlock({ lesson, answers }) {
  const baseline = readKey(answers, "M1-L3", 4);
  const person = readKey(answers, CODE, "sketch-person");
  const kind = readKey(answers, CODE, "sketch-kind");
  return (
    <Panel tone="yours" label="Optional" title="A short sketch of yourself">
      {/* DRAFT (Claude), from the Module 4 instructions. */}
      <P>
        Write about three sentences introducing yourself to someone who doesn’t know you. Use “I,” or write about
        yourself as “they” or by your name. Either works. One isn’t better than the other.
      </P>
      <P>
        Then choose one statement from it to look at more closely. This isn’t an assessment, and nothing here is
        scored. A statement can turn out accurate, partly accurate, or still unknown.
      </P>
      {baseline ? <Quote label="What you wrote in Module 1, if you want to use it">{baseline}</Quote> : null}
      <SingleChoice
        legend="How would you like to write it? (optional)"
        options={SKETCH_PERSON}
        value={person}
        onChange={(next) => recordM4(CODE, lesson.title, "sketch-person", next, "How I wrote my sketch")}
      />
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index={20} label="Your sketch (about three sentences)" variant="inline" />
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index={21} label="The one statement you’ll look at" variant="inline" compact />
      <SingleChoice
        legend="Looking at that statement, what do you think it mostly is? (optional)"
        hint="Your call. There’s no right answer here."
        options={SKETCH_KINDS}
        value={kind}
        onChange={(next) => recordM4(CODE, lesson.title, "sketch-kind", next, "What I think my chosen statement mostly is")}
      />
      <p className="text-[13px] text-muted-faint">Adapted from psychologist George Kelly’s self-characterization sketch.</p>
    </Panel>
  );
}

function PartStart({ lesson, answers, rev, onUseEvent }) {
  const [pick] = useStore(MAP_PICK_KEY, {});
  const mode = readKey(answers, CODE, "start-mode");
  const earlier = earlierObservations(answers, pick);
  const event = readKey(answers, CODE, 0);
  const canReplace = !event || earlier.some((row) => row.value === event);
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <P>In Module 3 you looked at what happened when you changed part of the setup around an activity. This lesson slows down the next step: making sense of what happened.</P>
        <P>Bring forward one experience to work with. It doesn’t have to be important or difficult, and you don’t have to share anything you’d rather keep to yourself.</P>
      </div>
      <SingleChoice
        legend="What would you like to work with?"
        options={L1_START}
        value={mode}
        onChange={(next) => recordM4(CODE, lesson.title, "start-mode", next, "How I started Module 4")}
      />
      {mode === L1_START[0] ? (
        earlier.length ? (
          <div className="space-y-2">
            <p className="text-[15px] text-muted-foreground">Tap one to use it as “what happened.” You can change the wording later.</p>
            {earlier.map((row) => (
              <button
                key={row.key}
                type="button"
                aria-pressed={event === row.value}
                disabled={!canReplace && event !== row.value}
                onClick={() => onUseEvent(row.value)}
                className={`block w-full rounded-lg border px-4 py-3 text-left text-[15px] disabled:opacity-60 ${
                  event === row.value ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
                }`}
              >
                <span className={`block text-[13px] ${event === row.value ? "text-primary-foreground" : "text-muted-foreground"}`}>{row.label}</span>
                <span className="mt-0.5 block">{row.value}</span>
              </button>
            ))}
            {!canReplace ? <p className="text-[14px] text-muted-foreground">You’ve already written what happened in your own words. You can edit it in Part 4.</p> : null}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
            Nothing is saved from Module 2 or 3. That’s fine. You can use another ordinary experience, or the example.
          </p>
        )
      ) : null}
      {mode === L1_START[1] ? (
        <PromptField key={`event-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index={0} label="Briefly, what happened? A sentence is enough." variant="inline" />
      ) : null}
      {mode === L1_START[2] ? (
        <Panel tone="example">
          <Quote label="The example">{EXAMPLE_EXPERIENCE}</Quote>
          <p className="text-[15px] text-muted-foreground">You’ll sort this example in Part 3. Applying it to your own experience in Part 4 is optional.</p>
        </Panel>
      ) : null}
      {mode === L1_START[3] ? <SketchBlock lesson={lesson} answers={answers} /> : null}
      <PrivacyNote />
    </div>
  );
}

function PartReading() {
  return (
    <Panel tone="reading">
      {/* DRAFT (Claude): shortened from the published reading "What Happened Is Not the Same as What It Means".
          The full reading stays in the Library. "Uncertain" is added per the Module 4 instructions. */}
      <P>People interpret events. We explain them and connect them to things we already believe. Sometimes that helps us learn. Sometimes the explanation becomes bigger than the evidence.</P>
      <P>Entrepalooza uses four words as a teaching tool:</P>
      <ul className="max-w-[68ch] list-disc space-y-1.5 pl-5 text-[17px] leading-relaxed text-foreground">
        <li><strong>Event:</strong> what happened that can be observed or checked.</li>
        <li><strong>Story:</strong> the explanation or meaning attached to what happened.</li>
        <li><strong>Verdict:</strong> a broader judgment about what the event says about you.</li>
        <li><strong>Uncertain:</strong> what isn’t known yet.</li>
      </ul>
      <P>Real thinking is messier than four neat boxes. The point is to make enough space to ask: what do I actually know?</P>
      <P>The event happened. The story might be right, partly right, or wrong. The verdict makes an even larger claim, and the larger the claim, the more evidence it needs.</P>
      <P>Accuracy isn’t positive thinking. If you missed something important, the goal isn’t to turn it into “Actually, I’m amazing.” A more useful statement keeps responsibility and stays close to the evidence.</P>
      <P>And “I don’t know yet” can be the most accurate answer. Pretending to be certain doesn’t create better evidence.</P>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Source: Entrepalooza Module 4 reading, “What Happened Is Not the Same as What It Means,” which describes research
        on how people explain negative events. This lesson doesn’t diagnose anyone.
      </p>
      <Link to="/program-library" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Read the full reading in the Library
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Panel>
  );
}

function SortItem({ item, choice, onChoose }) {
  const matched = choice && choice === item.answer;
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <p className="font-heading text-[18px] leading-snug text-foreground">“{item.text}”</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={`Sort: ${item.text}`}>
        {SORT_LABELS.map((label) => {
          const active = choice === label;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => onChoose(active ? "" : label)}
              className={`min-h-[44px] rounded-full border px-3 text-[15px] font-medium ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {choice ? (
          <p className="mt-3 text-[15px] leading-relaxed text-foreground">
            <strong>{matched ? "That’s how we’d sort it too." : `We’d call this ${AS_PHRASE[item.answer]}.`}</strong>{" "}
            {item.explain}
            {matched ? "" : " You can change your answer anytime."}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function PartPractice({ answers }) {
  const sort = readSort(answers);
  const choose = (id, value) => {
    const next = { ...sort, [id]: value };
    if (!value) delete next[id];
    // Practice only: saved so it's still here later, but not added to the journal and never scored.
    setAnswer(CODE, "sort", JSON.stringify(next));
  };
  return (
    <div className="space-y-4">
      <Panel tone="example">
        <Quote label="The example">{EXAMPLE_EXPERIENCE}</Quote>
      </Panel>
      <P>Here are four things someone might say about it. Is each one an event, a story, a verdict, or uncertain?</P>
      <ol className="space-y-3" role="list">
        {SORT_ITEMS.map((item) => (
          <SortItem key={item.id} item={item} choice={sort[item.id] || ""} onChoose={(value) => choose(item.id, value)} />
        ))}
      </ol>
      <p className="text-[14px] text-muted-faint">This is practice. There’s no score, and you can change any answer.</p>
    </div>
  );
}

function PartApply({ lesson, answers, rev, onChooseStatement }) {
  const mode = readKey(answers, CODE, "start-mode");
  const statement = readKey(answers, CODE, "statement");
  const candidates = [
    { label: "My explanation", value: readKey(answers, CODE, 1) },
    { label: "The broader judgment", value: readKey(answers, CODE, 2) },
    { label: "What remains unknown", value: readKey(answers, CODE, 3) },
    { label: "The statement from my sketch", value: readKey(answers, CODE, 21) },
    { label: "From the example", value: SORT_ITEMS[1].text },
  ].filter((row) => row.value);
  const seen = new Set();
  const options = candidates.filter((row) => (seen.has(row.value) ? false : seen.add(row.value)));
  const usingOwn = Boolean(statement) && !options.some((row) => row.value === statement);
  const [own, setOwn] = useState(usingOwn);
  return (
    <div className="space-y-5">
      <P>Now try it with your own experience. Every question is optional. Skip any that don’t fit.</P>
      {mode === L1_START[2] ? (
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">See the example worked through (optional)</summary>
          <dl className="mt-2 space-y-1.5 text-[15px] text-foreground">
            <div><dt className="inline text-muted-foreground">What happened: </dt><dd className="inline">{SORT_ITEMS[0].text}</dd></div>
            <div><dt className="inline text-muted-foreground">Explanation: </dt><dd className="inline">{SORT_ITEMS[2].text}</dd></div>
            <div><dt className="inline text-muted-foreground">Broader judgment: </dt><dd className="inline">{SORT_ITEMS[1].text}</dd></div>
            <div><dt className="inline text-muted-foreground">Unknown: </dt><dd className="inline">{SORT_ITEMS[3].text}</dd></div>
          </dl>
        </details>
      ) : null}
      <PromptField key={`event-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index={0} label={LABELS[0]} variant="inline" />
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index={1} label={LABELS[1]} variant="inline" />
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index={2} label={`${LABELS[2]} If not, you can leave this empty.`} variant="inline" />
      <PromptField lessonCode={CODE} lessonTitle={lesson.title} index={3} label={LABELS[3]} variant="inline" />
      <fieldset className="min-w-0 space-y-2">
        <legend className="text-[17px] font-medium leading-snug text-foreground">Which statement would you like to look at more closely?</legend>
        <p className="text-[15px] text-muted-foreground">You’ll plan a small way to gather evidence about it in Lesson 2. Optional.</p>
        {options.map((row) => {
          const active = !own && statement === row.value;
          return (
            <button
              key={row.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setOwn(false);
                onChooseStatement(active ? "" : row.value);
              }}
              className={`block w-full rounded-lg border px-4 py-3 text-left text-[15px] ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <span className={`block text-[13px] ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>{row.label}</span>
              <span className="mt-0.5 block">{row.value}</span>
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={own}
          onClick={() => {
            if (!own && options.some((row) => row.value === statement)) onChooseStatement("");
            setOwn(!own);
          }}
          className={`block w-full rounded-lg border px-4 py-3 text-left text-[15px] ${
            own ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
          }`}
        >
          {OWN_WORDS}
        </button>
        {own ? (
          <PromptField key={`statement-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index="statement" label="The statement, in your words" variant="inline" compact />
        ) : null}
      </fieldset>
    </div>
  );
}

/** M4-L1 · Separate What Happened From What It Means. */
export default function SeparateLesson({ lesson }) {
  const answers = useAnswers();
  const [rev, setRev] = useState(0);
  const useEvent = (text) => {
    recordM4(CODE, lesson.title, 0, text, LABELS[0]);
    setRev((value) => value + 1);
  };
  const chooseStatement = (text) => {
    recordM4(CODE, lesson.title, "statement", text, "The statement I’ll look at more closely");
    setRev((value) => value + 1);
  };
  const parts = [
    { id: "start", short: "Start", title: "Bring forward an experience", content: <PartStart lesson={lesson} answers={answers} rev={rev} onUseEvent={useEvent} /> },
    { id: "read", short: "Read", title: "Event, story, verdict, uncertain", content: <PartReading /> },
    { id: "practice", short: "Practice", title: "Sort the example", content: <PartPractice answers={answers} /> },
    { id: "apply", short: "Apply", title: "Apply it", content: <PartApply lesson={lesson} answers={answers} rev={rev} onChooseStatement={chooseStatement} /> },
    { id: "deeper", short: "Go deeper", title: "Go deeper", content: <PartGoDeeper lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
