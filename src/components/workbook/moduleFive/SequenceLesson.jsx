import React from "react";
import PromptField from "../PromptField";
import { BridgeIn } from "../ModuleBridge";
import { useAnswers } from "@/lib/workbook";
import { bridgeIn } from "@/lib/moduleBridges";
import { FinishControl, P, Panel, PartFlow } from "../moduleOne/parts";
import { JOURNAL_PROMPTS, MAP_SECTIONS, savePatternChoice } from "@/lib/moduleFive";
import { EarlierM5, JournalStage, LongerReading, PatternPicker, SavedPattern } from "./common";

function PartIntro({ lesson, readings }) {
  const incoming = bridgeIn(5);
  return (
    <div className="space-y-5">
      {incoming ? <BridgeIn bridge={incoming} lesson={lesson} /> : null}
      <Panel tone="reading" title="A pattern is a sequence">
        <P>
          A pattern can show up in your attention, your motivation, a decision, a reaction, a habit, or the way you
          respond. It might be getting deeply focused, avoiding a task, moving fast under pressure, losing interest when
          something gets hard, taking on too much, getting absorbed, reacting when things are uncertain, or staying with
          something even when it's frustrating. An ordinary pattern is enough.
        </P>
        <P>
          This lesson looks at the sequence: what was happening before, what happened while it was unfolding, and what
          happened afterward. Any part can be blank. You don't have to explain the cause, and you don't have to decide
          that the pattern is good or bad.
        </P>
        <P>
          Intensity can come with focus, energy, frustration, or pressure. It isn't automatically a problem, and it isn't
          automatically a strength. One stretch of it can't tell you what kind of person you are. Hard times don't have
          to produce a talent. You never have to describe addiction, hardship, or anything sensitive to finish this lesson.
        </P>
        <P>
          You don't have to close your eyes, change your breathing, or create a feeling. Calm is not a requirement. This
          is a learning exercise, not treatment or crisis care.
        </P>
      </Panel>
      <LongerReading readings={readings} />
    </div>
  );
}

function PartChoose({ lesson, answers }) {
  return (
    <div className="space-y-4">
      <P>Choose a pattern you already recognize. You can use one of the examples, or write your own.</P>
      <PatternPicker
        answers={answers}
        lessonTitle={lesson.title}
        onChange={(id) => savePatternChoice(id, lesson.title)}
      />
    </div>
  );
}

function PartMap({ lesson }) {
  return (
    <div className="space-y-6">
      <P>
        One box for each part of the sequence. The cues under each question are reminders, not extra questions. You can
        leave any box blank and come back to it.
      </P>
      {MAP_SECTIONS.map((section) => (
        <div key={section.key} className="space-y-2">
          <p className="text-[15px] leading-relaxed text-muted-foreground">You might notice: {section.cues}</p>
          <PromptField
            lessonCode={lesson.code}
            lessonTitle={lesson.title}
            index={section.key}
            label={section.label}
            variant="inline"
          />
        </div>
      ))}
    </div>
  );
}

function PartWhole({ lesson, answers }) {
  return (
    <div className="space-y-5">
      <P>Here's the sequence as you wrote it. The lesson won't explain it for you.</P>
      <SavedPattern answers={answers} />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="stands-out"
        label="What stands out when you look at the sequence?"
        variant="inline"
      />
      <p className="text-[14px] text-muted-faint">Optional. A few words are enough, and you can leave it blank.</p>
    </div>
  );
}

function PartJournal({ lesson, answers }) {
  const journal = JOURNAL_PROMPTS[lesson.code];
  return (
    <div className="space-y-6">
      <JournalStage lesson={lesson} kicker={journal.kicker} prompt={journal.prompt} followUps={journal.followUps} />
      <EarlierM5 code={lesson.code} answers={answers} />
      <FinishControl code={lesson.code} answers={answers} />
    </div>
  );
}

/** M5-L1. The lesson title comes from the Lesson record. */
export default function SequenceLesson({ lesson, readings = [] }) {
  const answers = useAnswers();
  const parts = [
    { id: "intro", short: "Read", title: "A pattern is a sequence", content: <PartIntro lesson={lesson} readings={readings} /> },
    { id: "choose", short: "Choose", title: "Choose a pattern", content: <PartChoose lesson={lesson} answers={answers} /> },
    { id: "map", short: "Map", title: "Map what happens", content: <PartMap lesson={lesson} /> },
    { id: "whole", short: "Whole", title: "Look at the whole pattern", content: <PartWhole lesson={lesson} answers={answers} /> },
    { id: "journal", short: "Journal", title: "Go deeper", content: <PartJournal lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
