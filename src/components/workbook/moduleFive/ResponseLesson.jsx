import React, { useState } from "react";
import { Link } from "react-router-dom";
import PromptField from "../PromptField";
import { useAnswers } from "@/lib/workbook";
import { FinishControl, MultiChoice, P, Panel, PartFlow } from "../moduleOne/parts";
import {
  ADJUST_FIELDS,
  JOURNAL_PROMPTS,
  OTHER_PATHS,
  STANCES,
  patternTitle,
  recordM5,
  savePatternChoice,
  selectedStances,
  stanceValue,
} from "@/lib/moduleFive";
import { EarlierM5, JournalStage, LongerReading, PatternPicker, SavedPattern } from "./common";

function PartReturn({ answers }) {
  const [open, setOpen] = useState(!patternTitle(answers));
  return (
    <div className="space-y-5">
      <P>This is the pattern and the notes you saved in the last lesson. You don't have to write them again.</P>
      <SavedPattern answers={answers} />
      <p>
        <Link to="/lesson/M5-L1" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Edit the map in the previous lesson
        </Link>
      </p>
      <div className="space-y-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          {open ? "Hide the pattern list" : "Change the pattern"}
        </button>
        {open ? (
          <PatternPicker
            answers={answers}
            onChange={savePatternChoice}
          />
        ) : null}
      </div>
    </div>
  );
}

function PartReading({ readings }) {
  return (
    <div className="space-y-5">
      <Panel tone="reading" title="Protect what works, or change one small thing">
        <P>
          Some patterns serve a useful purpose. Some create difficulties or costs. The same pattern can help in one
          situation and get in the way in another. Changing it can mean giving something up. Support, timing, and the
          setup around you can matter. Deciding not to change something is a real choice.
        </P>
        <P>
          You don't have to shut intensity down, and you don't have to get more done. Keeping what works and trying one
          small change count the same. A change after you try something doesn't prove the try caused it. Stopping, or
          leaving a working setup alone, is not a failure.
        </P>
        <P>If you try anything, use a moment that is already in your week. You don't need a setback or a made-up crisis.</P>
      </Panel>
      <LongerReading readings={readings} />
    </div>
  );
}

function PartStance({ lesson, answers }) {
  const selected = selectedStances(answers);
  const labels = STANCES.map((item) => item.label);
  return (
    <div className="space-y-5">
      <MultiChoice
        legend="What feels true about this pattern right now?"
        hint="More than one is fine. You can clear a choice by tapping it again."
        options={labels}
        values={labels.filter((label) => STANCES.some((item) => item.label === label && selected.includes(item.id)))}
        onChange={(next) => recordM5(lesson.code, lesson.title, "stance", stanceValue(STANCES.filter((item) => next.includes(item.label)).map((item) => item.id)), "What I might keep, adjust, protect, or understand")}
      />
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="stance-note"
        label="Anything you want to add about that? (optional)"
        variant="inline"
      />
    </div>
  );
}

function PartResponse({ lesson, answers }) {
  const selected = selectedStances(answers);
  const adjust = selected.includes("adjust");
  const others = OTHER_PATHS.filter((path) => selected.includes(path.id));
  if (!selected.length) {
    return (
      <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
        You haven't chosen keep, adjust, protect, or not sure yet. You can go back and choose, or leave this for now.
        You don't have to plan a change.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <P>Each choice you made has its own place. You can fill in one, skip one, or leave all of them.</P>
      {others.map((path) => (
        <div key={path.id} className="space-y-2">
          <p className="workbook-label">{path.title}</p>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{path.hint}</p>
          <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index={path.key} label={path.label} variant="inline" />
        </div>
      ))}
      {adjust ? (
        <div className="space-y-4">
          <div>
            <p className="workbook-label">Adjust</p>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
              A plan is enough. You don't have to carry it out. All four lines are optional.
            </p>
          </div>
          {ADJUST_FIELDS.map((field) => (
            <PromptField
              key={field.key}
              lessonCode={lesson.code}
              lessonTitle={lesson.title}
              index={field.key}
              label={field.label}
              variant="inline"
              compact
            />
          ))}
        </div>
      ) : null}
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

/** M5-L2 · Protect What Works or Try One Small Response. */
export default function ResponseLesson({ lesson, readings = [] }) {
  const answers = useAnswers();
  const parts = [
    { id: "return", short: "Pattern", title: "Return to the pattern", content: <PartReturn answers={answers} /> },
    { id: "read", short: "Read", title: "Protect what works", content: <PartReading readings={readings} /> },
    { id: "stance", short: "Choose", title: "Keep, adjust, protect, or not sure", content: <PartStance lesson={lesson} answers={answers} /> },
    { id: "response", short: "Response", title: "One manageable response", content: <PartResponse lesson={lesson} answers={answers} /> },
    { id: "journal", short: "Journal", title: "Go deeper", content: <PartJournal lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
