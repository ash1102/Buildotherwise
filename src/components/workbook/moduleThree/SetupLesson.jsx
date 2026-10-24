import React, { useState } from "react";
import { ChevronDown, Clock, Home, ListChecks, SlidersHorizontal, Users } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { useAnswers } from "@/lib/workbook";
import {
  CONDITIONS,
  CONDITION_BY_ID,
  FOCUS_UNSURE,
  INFLUENCE_OPTIONS,
  L1_TITLE,
  NOT_SURE,
  SOURCES,
  SOURCE_EXAMPLE,
  SOURCE_M2,
  SOURCE_OTHER,
  joinMulti,
  moduleTwoRecap,
  readKey,
  recordM3,
  splitMulti,
} from "@/lib/moduleThree";
import { FinishControl, MultiChoice, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import { EarlierM3, ExamplePanel, Feedback, FullReading } from "./common";

const CODE = "M3-L1";
const ICONS = { time: Clock, environment: Home, instructions: ListChecks, support: Users, choice: SlidersHorizontal };

function record(key, value, label) {
  recordM3(CODE, L1_TITLE, key, value, label);
}

/** Stage 1 · Start with an experience. */
function PartStart({ lesson, answers }) {
  const recap = moduleTwoRecap(answers);
  const source = readKey(answers, CODE, "source");
  return (
    <div className="space-y-6">
      <P>Module 3 looks at the conditions around something you did. Start with an experience you already have.</P>

      {recap.length ? (
        <Panel tone="yours" label="From Module 2">
          <div className="space-y-3">
            {recap.map((row) => (
              <Quote key={row.key} label={row.label}>
                {row.value}
              </Quote>
            ))}
          </div>
          <p className="text-[14px] text-muted-foreground">Already saved. You don’t need to write it again.</p>
        </Panel>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          Nothing is saved from Module 2 yet. You can use another ordinary activity or the provided example. There’s no
          need to make up an experience.
        </p>
      )}

      <SingleChoice
        legend="What would you like to use?"
        hint="You can change this anytime."
        options={SOURCES}
        value={source}
        onChange={(next) => record("source", next, "What I’m using for Module 3")}
      />

      {source === SOURCE_M2 ? (
        <div aria-live="polite">
          <PromptField
            lessonCode={CODE}
            lessonTitle={L1_TITLE}
            index={0}
            label={recap.length ? "Anything you want to add about it? (optional)" : "What was it? A few words are enough. (optional)"}
            variant="inline"
          />
        </div>
      ) : null}
      {source === SOURCE_OTHER ? (
        <div aria-live="polite" className="space-y-2">
          <p className="text-[15px] text-muted-foreground">
            Anything ordinary works: cooking a meal, filling out a form, learning a new app, fixing something, a class or
            shift.
          </p>
          <PromptField lessonCode={CODE} lessonTitle={L1_TITLE} index={0} label="What activity are you thinking of? (optional)" variant="inline" />
        </div>
      ) : null}
      {source === SOURCE_EXAMPLE ? (
        <div aria-live="polite" className="space-y-2">
          <ExamplePanel lesson={lesson} />
          <p className="text-[15px] text-muted-foreground">
            The example shows how to name a setup. It isn’t your experience, and nothing about you is concluded from it.
          </p>
        </div>
      ) : null}
      <PrivacyNote />
    </div>
  );
}

/** Stage 2 · Brief reading. DRAFT (Claude): condensed from "Maybe It’s Not Just You. Look at the Setup." */
function PartReading({ readings }) {
  return (
    <div className="space-y-4">
      <Panel tone="reading" title="Maybe it’s not just you. Look at the setup.">
        <P>
          Before you explain an experience entirely through your personality, motivation, or ability, there’s another part
          of the picture worth examining: the conditions around what you were doing.
        </P>
        <P>
          Nobody acts in a vacuum. What happens during an activity can be shaped by several conditions at once, and they
          can interact:
        </P>
        <ul className="list-disc space-y-1 pl-5 text-[17px] leading-relaxed text-foreground">
          <li>time and pace</li>
          <li>noise and interruptions</li>
          <li>how clear the instructions are</li>
          <li>what support is available</li>
          <li>how much choice and flexibility you have</li>
          <li>how familiar the activity is</li>
          <li>equipment, resources, and accessibility</li>
        </ul>
        <P>
          Imagine reading while three people are talking, your phone keeps buzzing, you’re hungry, and you have twenty
          minutes before you need to leave. Now imagine reading similar material somewhere quiet, after eating, with more
          time. Same person. Similar task. Different setup. Your experience might change. Or it might not.
        </P>
        <P>
          There’s a difference between you and the circumstances around your experience. Finding something difficult
          doesn’t automatically mean low motivation, low ability, or lack of interest. And one good experience doesn’t
          establish a permanent strength or the right setup for you.
        </P>
        <P>
          Looking at conditions isn’t an excuse, and it doesn’t erase responsibility. It gives you more to work with than
          “What’s wrong with me?” Look at the person, the task, and the situation together.
        </P>
        <div className="rounded-lg bg-secondary p-3 sm:p-4">
          <p className="text-[15px] leading-relaxed text-foreground">
            <strong>Research connection:</strong> Studies that follow people through their days find that the same person
            acts quite differently from one situation to the next, while still showing real patterns over time. Research on
            motivation also suggests that meaningful choice and clear structure can work together rather than against each
            other.
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Fleeson, W. (2001). Toward a structure- and process-integrated view of personality: Traits as density
            distributions of states. <em>Journal of Personality and Social Psychology, 80</em>(6), 1011–1027.
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
            Jang, H., Reeve, J., &amp; Deci, E. L. (2010). Engaging students in learning activities: It is not autonomy
            support or structure but autonomy support and structure. <em>Journal of Educational Psychology, 102</em>(3),
            588–600.
          </p>
        </div>
      </Panel>
      <FullReading readings={readings} />
    </div>
  );
}

function ConditionCard({ condition, open, onToggle }) {
  const Icon = ICONS[condition.id];
  const panelId = `m3-card-${condition.id}`;
  return (
    <li className={`rounded-xl border ${open ? "border-primary/50 bg-card" : "border-border bg-card"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[56px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-secondary"
      >
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-accent-ink">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-medium text-foreground">{condition.card}</span>
          <span className="block text-[14px] leading-snug text-muted-foreground">{condition.explain}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-5 w-5 shrink-0 text-muted-foreground ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div id={panelId} className="space-y-3 border-t border-border px-4 pb-4 pt-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-faint">Everyday example</p>
            <p className="mt-1 text-[16px] leading-relaxed text-foreground">{condition.example}</p>
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-faint">Ask yourself</p>
            <p className="mt-1 text-[16px] font-medium leading-relaxed text-foreground">{condition.question}</p>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** Stage 3 · Interactive condition explorer. Nothing to write here. */
function PartExplore() {
  const [open, setOpen] = useState([]);
  const toggle = (id) => setOpen((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  return (
    <div className="space-y-5">
      <P>Tap a condition to see what it can look like. Open as many as you like.</P>
      <ul className="grid gap-3" role="list">
        {CONDITIONS.map((condition) => (
          <ConditionCard key={condition.id} condition={condition} open={open.includes(condition.id)} onToggle={() => toggle(condition.id)} />
        ))}
      </ul>
      <p className="text-[15px] text-muted-foreground">There’s nothing to write here. The questions are for thinking.</p>
    </div>
  );
}

/** Stage 4 · Identify a condition worth testing. */
function PartIdentify({ answers }) {
  const influences = splitMulti(readKey(answers, CODE, "influences"));
  const focus = readKey(answers, CODE, "focus");
  const focusOptions = [...CONDITIONS.map((item) => item.card), "Not sure yet"];
  const focusLabel = CONDITION_BY_ID[focus] ? CONDITION_BY_ID[focus].card : focus === FOCUS_UNSURE ? "Not sure yet" : "";
  const setFocus = (label) => {
    const match = CONDITIONS.find((item) => item.card === label);
    record("focus", match ? match.id : label ? FOCUS_UNSURE : "", "A condition I might look at more closely");
  };
  return (
    <div className="space-y-6">
      <MultiChoice
        legend="Was there anything about the setup that might have influenced your experience?"
        hint="Choose any that fit, or say you’re not sure."
        options={INFLUENCE_OPTIONS}
        values={influences}
        only={NOT_SURE}
        onChange={(next) => record("influences", joinMulti(next), "Parts of the setup that might have influenced it")}
      />
      <PromptField
        lessonCode={CODE}
        lessonTitle={L1_TITLE}
        index={1}
        label="Anything about the setup you want to describe in your own words? (optional)"
        variant="inline"
      />
      <SingleChoice
        legend="Is there one condition you might want to look at more closely?"
        hint="It will be waiting in the next lesson. You can change it there."
        options={focusOptions}
        value={focusLabel}
        onChange={setFocus}
      />
      {focusLabel ? (
        <Feedback>
          {focus === FOCUS_UNSURE
            ? "That’s fine. You can pick a condition in the next lesson, or keep looking."
            : "Choosing a condition doesn’t mean it caused what happened. It’s something worth looking at more closely."}
        </Feedback>
      ) : null}
      <EarlierM3 code={CODE} answers={answers} />
      <FinishControl code={CODE} answers={answers} />
    </div>
  );
}

/** M3-L1 · Understand the setup around a task. */
export default function SetupLesson({ lesson, readings }) {
  const answers = useAnswers();
  const parts = [
    { id: "start", short: "Start", title: "Start with an experience", content: <PartStart lesson={lesson} answers={answers} /> },
    { id: "read", short: "Read", title: "Why the setup matters", content: <PartReading readings={readings} /> },
    { id: "explore", short: "Explore", title: "Explore five conditions", content: <PartExplore /> },
    { id: "identify", short: "Identify", title: "Name a condition worth testing", content: <PartIdentify answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
