import React from "react";
import { Link } from "react-router-dom";
import PromptField from "../PromptField";
import { setDecision, useAnswers, useDecisions } from "@/lib/workbook";
import { splitMulti } from "@/lib/moduleOne";
import { FinishControl, MultiChoice, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import {
  CLOSING_PARAGRAPHS,
  JOURNEY_GROUPS,
  JOURNAL_PROMPTS,
  MODULE_FIVE_JOURNEY,
  NEXT_OPTIONS,
  THINKING_NONE,
  THINKING_NOW,
  journeyGroups,
  readM5,
  recordM5,
  reviewColumns,
} from "@/lib/moduleFive";
import { EarlierM5, JournalStage } from "./common";

function PartJourney({ answers }) {
  const saved = Object.fromEntries(journeyGroups(answers).map((group) => [group.module, group]));
  const sections = [...JOURNEY_GROUPS, MODULE_FIVE_JOURNEY];
  return (
    <div className="space-y-5">
      <P>Only what you actually saved. You don't have to rewrite any of it, and nothing is filled in for you.</P>
      {sections.map((section) => {
        const group = saved[section.module];
        return (
          <section key={section.module} className="space-y-3" aria-label={section.module}>
            <div>
              <p className="workbook-label">{section.module}</p>
              <h3 className="mt-1 text-[18px] leading-snug text-foreground">{section.about}</h3>
            </div>
            {group ? (
              group.items.map((item) => (
                <Quote key={item.key} label={item.label}>
                  {item.value}
                </Quote>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
                Nothing saved from {section.module} yet.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Column({ title, hint, items }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="workbook-label">{title}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{hint}</p>
      {items.length ? (
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <Quote key={item.key} label={item.label}>
              {item.value}
            </Quote>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[15px] text-muted-foreground">Nothing saved here yet.</p>
      )}
    </div>
  );
}

function PartReview({ lesson, answers }) {
  const columns = reviewColumns(answers);
  const saved = splitMulti(readM5(answers, lesson.code, "thinking-now"));
  return (
    <div className="space-y-5">
      <P>Three ways to look at the same pilot. The first two columns are your earlier words. The third is whatever you want to say now, including that nothing much has changed.</P>
      <div className="grid gap-3 md:grid-cols-3">
        <Column title="Where I started" hint="Earlier observations and questions." items={columns.started} />
        <Column title="What I experienced" hint="What you recorded along the way." items={columns.experienced} />
        <div className="rounded-xl border border-primary/40 bg-card p-4">
          <MultiChoice
            legend="What I'm thinking now"
            hint="Choose any that fit, or write your own. Nothing here is scored."
            options={THINKING_NOW}
            values={saved}
            only={THINKING_NONE}
            onChange={(next) =>
              recordM5(lesson.code, lesson.title, "thinking-now", next.join("; "), "What I'm thinking now")
            }
          />
          <div className="mt-4">
            <PromptField
              lessonCode={lesson.code}
              lessonTitle={lesson.title}
              index="thinking-note"
              label="Or write it in your own words (optional)"
              variant="inline"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PartImpression({ lesson, answers }) {
  const [adopted, setAdopted] = React.useState(0);
  const earlier = readM5(answers, lesson.code, 0);
  const current = readM5(answers, lesson.code, "impression");
  return (
    <div className="space-y-5">
      <Panel tone="reading" title="An impression can start a question">
        <P>
          An impression is a hunch. It can point at a question. Feeling sure doesn't make it evidence. "This could fit
          me," "something about this feels off," "I should keep going," and "I don't think this is for me" are all
          impressions. They can sit next to what you've actually seen.
        </P>
        <P>
          Pick one takeaway. Then, if you want, note what supports it, what might complicate it, and what is still
          uncertain. Leave any of them blank. One impression is not a trait, and it isn't a final conclusion.
        </P>
      </Panel>
      {earlier && earlier !== current ? (
        <Panel tone="yours" label="An impression you saved earlier">
          <Quote>{earlier}</Quote>
          <button
            type="button"
            onClick={() => {
              recordM5(lesson.code, lesson.title, "impression", earlier, "An impression I want to check");
              setAdopted((count) => count + 1);
            }}
            className="inline-flex min-h-[44px] items-center rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary"
          >
            Use this as the impression to check
          </button>
        </Panel>
      ) : null}
      <PromptField
        key={adopted}
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="impression"
        label="What impression do you want to look at?"
        variant="inline"
      />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="support"
        label="What experiences support this impression?"
        variant="inline"
        compact
      />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="complicate"
        label="What might complicate it?"
        variant="inline"
        compact
      />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="uncertain"
        label="What remains uncertain?"
        variant="inline"
        compact
      />
    </div>
  );
}

function PartJournal({ lesson }) {
  const journal = JOURNAL_PROMPTS[lesson.code];
  return (
    <div className="space-y-4">
      <P>You don't have to claim that you grew, changed, or found a passion. Disagreement counts. So does "nothing much."</P>
      <JournalStage lesson={lesson} kicker={journal.kicker} prompt={journal.prompt} followUps={journal.followUps} />
    </div>
  );
}

function PartNext({ lesson, answers }) {
  const decisions = useDecisions();
  const choice = readM5(answers, lesson.code, "next");
  const earlierDecision = String(decisions[lesson.code] || "").trim();
  const showEarlier = earlierDecision && earlierDecision !== choice && !NEXT_OPTIONS.includes(earlierDecision);
  const pick = (next) => {
    recordM5(lesson.code, lesson.title, "next", next, "What I want to do next");
    setDecision(lesson.code, next);
  };
  return (
    <div className="space-y-5">
      <P>
        This is a personal choice about what you might do next. It isn't a readiness score, and it doesn't point you
        toward a business.
      </P>
      {showEarlier ? (
        <Panel tone="note" label="An earlier choice">
          <Quote>{earlierDecision}</Quote>
          <p className="text-[14px] text-muted-foreground">Choosing one of the options below replaces that earlier choice.</p>
        </Panel>
      ) : null}
      <SingleChoice
        legend="What, if anything, do you want to do next?"
        hint="Pick one, or leave it open. Tap the same one again to clear it."
        options={NEXT_OPTIONS}
        value={choice}
        onChange={pick}
      />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="next-note"
        label="Anything you want to remember about that? (optional)"
        variant="inline"
        compact
      />
    </div>
  );
}

function PartClose({ lesson, answers }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {CLOSING_PARAGRAPHS.map((paragraph) => (
          <P key={paragraph}>{paragraph}</P>
        ))}
      </div>
      <div className="flex flex-col items-start gap-3">
        <Link to="/module/protect-what-works" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Return to the Module 5 lessons
        </Link>
        <Link to="/" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Return to earlier lessons
        </Link>
        <Link to="/journal" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Open your Conversation Journal
        </Link>
      </div>
      <EarlierM5 code={lesson.code} answers={answers} />
      <FinishControl code={lesson.code} answers={answers} />
    </div>
  );
}

/** M5-L3. The lesson title comes from the Lesson record. */
export default function CloseLesson({ lesson }) {
  const answers = useAnswers();
  const parts = [
    { id: "journey", short: "Journey", title: "Look back at your journey", content: <PartJourney answers={answers} /> },
    { id: "review", short: "Review", title: "What you're thinking now", content: <PartReview lesson={lesson} answers={answers} /> },
    { id: "impression", short: "Impression", title: "Check an impression", content: <PartImpression lesson={lesson} answers={answers} /> },
    { id: "journal", short: "Journal", title: "Looking back", content: <PartJournal lesson={lesson} /> },
    { id: "next", short: "Next", title: "Choose what comes next", content: <PartNext lesson={lesson} answers={answers} /> },
    { id: "close", short: "Close", title: "Where this leaves you", content: <PartClose lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
