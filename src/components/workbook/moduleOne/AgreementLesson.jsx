import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { BridgeOut } from "../ModuleBridge";
import { bridgeOut } from "@/lib/moduleBridges";
import { useAnswers } from "@/lib/workbook";
import { AGREEMENT_PERMISSION, readAgreement } from "@/lib/gettingStarted";
import {
  APPROACH_OPTIONS,
  CARRY_MODES,
  REVISIT_OPTIONS,
  SUPPORT_NONE,
  SUPPORT_OPTIONS,
  WHAT_MAKES_IT_WORK,
  WILLING_OPTIONS,
  joinMulti,
  readAnswer,
  recordAnswer,
  splitMulti,
} from "@/lib/moduleOne";
import { EarlierAnswers, FinishControl, MultiChoice, P, Panel, PartFlow, Quote, SingleChoice } from "./parts";

const CARRY_LABEL = "What observation or question would you like to bring into Module 2? (optional)";

/** What Lesson 1 left behind, exactly as saved. */
function lessonOneWords(answers) {
  return {
    route: readAnswer(answers, "M1-L1", "notice-route"),
    text: readAnswer(answers, "M1-L1", "notice-text"),
    map: readAnswer(answers, "M1-L1", "map-context"),
    encounter: readAnswer(answers, "M1-L1", "encounter"),
    carry: readAnswer(answers, "M1-L1", "carry-choice"),
  };
}

function PartLookBack({ lesson, answers }) {
  const one = lessonOneWords(answers);
  const mode = readAnswer(answers, lesson.code, "carry-mode");
  const ownWords = readAnswer(answers, lesson.code, 1);
  const anything = one.text || one.map || one.encounter || one.carry;
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <P>In the first lesson, you noticed something that caught your attention—or recognized that you’re still looking.</P>
        <P>In the second, you considered how curiosity, responsibility, enjoyment, and pressure can overlap.</P>
        <P>Now let’s decide how you want to approach what comes next.</P>
      </div>
      {anything ? (
        <Panel tone="yours" label="From Lesson 1">
          {one.text ? <Quote label={one.route || "What you noticed"}>{one.text}</Quote> : null}
          {one.map ? <Quote label="From your Life Map">{one.map}</Quote> : null}
          {one.encounter ? <Quote label="A possibility you selected">{one.encounter}</Quote> : null}
          {one.carry ? <Quote label="What you wanted to carry into Module 2">{one.carry}</Quote> : null}
        </Panel>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          You didn’t save an observation in Lesson 1. Still looking is a real starting point.
        </p>
      )}
      <SingleChoice
        legend="What would you like to do with your starting point?"
        options={CARRY_MODES}
        value={mode}
        onChange={(next) => recordAnswer(lesson, "carry-mode", next, "My Module 1 starting point")}
      />
      {mode === "Change it" || ownWords ? (
        <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index={1} label={CARRY_LABEL} variant="inline" />
      ) : null}
      <PrivacyNote />
    </div>
  );
}

function ChoicePart({ lesson, answers, answerKeyName, legend, options, note, journalLabel }) {
  const value = readAnswer(answers, lesson.code, answerKeyName);
  return (
    <div className="space-y-4">
      <SingleChoice legend={legend} options={options} value={value} onChange={(next) => recordAnswer(lesson, answerKeyName, next, journalLabel)} />
      {note ? <p className="text-[15px] leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function PartSupport({ lesson, answers }) {
  const chosen = splitMulti(readAnswer(answers, lesson.code, "support"));
  const other = readAnswer(answers, lesson.code, "support-other");
  const earlier = WHAT_MAKES_IT_WORK.map((slot) => ({ ...slot, value: readAnswer(answers, slot.code, slot.index) })).filter((slot) => slot.value);
  const [rev, setRev] = useState(0);
  const bringIn = () => {
    const text = earlier.map((slot) => `${slot.label}: ${slot.value}`).join("\n");
    recordAnswer(lesson, "support-other", other ? `${other}\n${text}` : text, "What makes exploring workable, in my words");
    setRev((value) => value + 1);
  };
  return (
    <div className="space-y-6">
      {earlier.length ? (
        <Panel tone="yours" label="You wrote this earlier, in “What makes it work for you”">
          {earlier.map((slot) => (
            <Quote key={slot.index} label={slot.label}>
              {slot.value}
            </Quote>
          ))}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={bringIn}
              className="inline-flex min-h-[44px] items-center rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary"
            >
              Bring these words into My Way Forward
            </button>
            <Link to="/lesson/O.4" className="text-[15px] text-accent-ink underline underline-offset-2">
              Change them there
            </Link>
          </div>
          <p className="text-[14px] text-muted-faint">No need to answer the same questions again.</p>
        </Panel>
      ) : null}
      <MultiChoice
        legend="What would make exploring workable for you?"
        hint="Choose any that fit. These are your preferences, not a list of what the program already provides."
        options={SUPPORT_OPTIONS}
        values={chosen}
        only={SUPPORT_NONE}
        onChange={(next) => recordAnswer(lesson, "support", joinMulti(next), "What makes exploring workable for me")}
      />
      <PromptField
        key={rev}
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="support-other"
        label="Anything else, in your own words (optional)"
        variant="inline"
      />
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Some kinds of support may not be available yet. Entrepalooza will tell you plainly which support is available now
        and which is still being developed.
      </p>
    </div>
  );
}

function agreementLines(answers) {
  const one = lessonOneWords(answers);
  const mode = readAnswer(answers, "M1-L3", "carry-mode");
  const ownWords = readAnswer(answers, "M1-L3", 1);
  let start = "";
  if (mode === "Leave it open") start = "Left open for now";
  else if (ownWords) start = ownWords;
  else if (mode === "Keep it") start = one.text || one.map || one.encounter || one.carry || "";
  const support = [...splitMulti(readAnswer(answers, "M1-L3", "support"))];
  const supportOther = readAnswer(answers, "M1-L3", "support-other");
  const lines = [
    { label: "My starting point", value: start },
    { label: "What I’m willing to try", value: readAnswer(answers, "M1-L3", "willing") },
    { label: "How I’ll approach it", value: readAnswer(answers, "M1-L3", "approach") },
    { label: "What makes it workable", value: support.join(", ") },
    { label: "In my words", value: supportOther },
    { label: "When I’ll revisit this", value: readAnswer(answers, "M1-L3", "revisit") },
  ];
  return lines.filter((line) => line.value);
}

function PartAgreement({ answers }) {
  const lines = agreementLines(answers);
  const earlier = readAgreement(answers);
  const hasEarlier = earlier.why || earlier.approach || earlier.note;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = ["My Way Forward", ...lines.map((line) => `${line.label}: ${line.value}`)].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* copying isn't available here; the agreement is still saved */
    }
  };
  return (
    <div className="space-y-5">
      <Panel tone="yours" label="My Way Forward">
        {lines.length ? (
          <dl className="space-y-3">
            {lines.map((line) => (
              <div key={line.label}>
                <dt className="text-[13px] text-muted-foreground">{line.label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{line.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[15px] text-muted-foreground">Nothing chosen yet. Your agreement can stay open.</p>
        )}
        <p className="text-[14px] text-muted-faint">
          Built only from your choices. To change it, tap any part above. This isn’t a contract, a test, or a score.
        </p>
        {lines.length ? (
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy My Way Forward"}
          </button>
        ) : null}
      </Panel>
      {hasEarlier ? (
        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">What you wrote when you started (Getting Started)</summary>
          <div className="mt-3 space-y-3">
            {earlier.why ? <Quote label="Why I'm here">{earlier.why}</Quote> : null}
            {earlier.approach ? <Quote label="My approach">{earlier.approach}</Quote> : null}
            {earlier.note ? <Quote label="My note">{earlier.note}</Quote> : null}
            <p className="text-[15px] leading-relaxed text-foreground">{AGREEMENT_PERMISSION}</p>
          </div>
        </details>
      ) : null}
      <Panel tone="reading" label="" title="What you can expect from Entrepalooza">
        <P>
          The program offers possibilities you can explore without committing to them, questions and activities that help
          you learn from experience, and opportunities to adjust your approach.
        </P>
        <P>Your choices, boundaries, and privacy matter.</P>
        <P>We’ll distinguish support that is available from support that is still being developed.</P>
        <P>You can revise My Way Forward, change direction, pause, or decide something isn’t for you.</P>
      </Panel>
    </div>
  );
}

function PartClose({ lesson, answers }) {
  const bridge = bridgeOut(1);
  return (
    <div className="space-y-6">
      <Panel tone="note" label="Optional">
        <PromptField
          lessonCode={lesson.code}
          lessonTitle={lesson.title}
          index={4}
          label="What’s one thing you believe about yourself that you haven’t had the opportunity to test?"
          variant="inline"
        />
        <p className="text-[14px] leading-relaxed text-muted-faint">
          Kept in your words and private. If you answer, you’ll be offered it again in Module 4. You can leave it blank.
        </p>
      </Panel>
      <div className="space-y-3">
        <P>
          You’ve started noticing possibilities, considered what might be behind your attention, and decided how you’d
          like to approach exploration.
        </P>
        <P>In Module 2, you’ll have opportunities to encounter something more directly.</P>
        <P>You can start with the question you brought here, choose something unfamiliar, or keep looking.</P>
        <P>The next step is to find out what happens when you explore.</P>
      </div>
      <Link
        to="/lesson/M2-L1"
        className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-5 text-[16px] font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to Module 2
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      {bridge ? (
        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">Get a head start on Module 2 (optional)</summary>
          <div className="mt-3">
            <BridgeOut bridge={bridge} lesson={lesson} />
          </div>
        </details>
      ) : null}
      <EarlierAnswers code={lesson.code} answers={answers} />
      <FinishControl code={lesson.code} answers={answers} />
    </div>
  );
}

/** M1-L3 · My Way Forward. */
export default function AgreementLesson({ lesson }) {
  const answers = useAnswers();
  const parts = [
    { id: "look", short: "Look back", title: "You’ve already started exploring.", content: <PartLookBack lesson={lesson} answers={answers} /> },
    {
      id: "try",
      short: "Try",
      title: "What are you willing to try?",
      content: (
        <ChoicePart
          lesson={lesson}
          answers={answers}
          answerKeyName="willing"
          legend="Pick the one that fits best for now."
          options={WILLING_OPTIONS}
          note="This is a starting approach, not a promise of an outcome."
          journalLabel="What I'm willing to try"
        />
      ),
    },
    {
      id: "approach",
      short: "Approach",
      title: "How will you approach the experience?",
      content: (
        <ChoicePart
          lesson={lesson}
          answers={answers}
          answerKeyName="approach"
          legend="Pick the one that fits best for now."
          options={APPROACH_OPTIONS}
          note="Observing first is as valid as trying something hands-on."
          journalLabel="How I'll approach the experience"
        />
      ),
    },
    { id: "support", short: "Support", title: "What makes exploration workable?", content: <PartSupport lesson={lesson} answers={answers} /> },
    {
      id: "revisit",
      short: "Revisit",
      title: "When would you like to revisit My Way Forward?",
      content: (
        <ChoicePart
          lesson={lesson}
          answers={answers}
          answerKeyName="revisit"
          legend="Pick one."
          options={REVISIT_OPTIONS}
          journalLabel="When I want to revisit My Way Forward"
        />
      ),
    },
    { id: "agreement", short: "My Way Forward", title: "My Way Forward", content: <PartAgreement answers={answers} /> },
    { id: "close", short: "Next", title: "You don’t need to have it figured out.", content: <PartClose lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
