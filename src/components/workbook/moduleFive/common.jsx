import React from "react";
import { Link } from "react-router-dom";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import StepReading from "../StepReading";
import { journalStepHref } from "@/lib/journal";
import { plainValue } from "@/lib/moduleOne";
import { P, Panel, Quote } from "../moduleOne/parts";
import {
  EARLIER_M5,
  JOURNAL_INTRO,
  PATTERN_CARDS,
  PATTERN_OTHER,
  earlierMapLines,
  mapLines,
  patternTitle,
  readM5,
} from "@/lib/moduleFive";

const PATTERN_LESSON = {
  code: "M5-L1",
  title: "Understand the Sequence Before You Map It",
};

/** One Conversation Journal box. Follow-ups stay in the prompt list, not separate fields. */
export function JournalStage({ lesson, kicker, prompt, followUps }) {
  return (
    <div className="space-y-4">
      <p className="workbook-label">Conversation Journal · {kicker}</p>
      <P>{JOURNAL_INTRO}</P>
      <div className="space-y-2">
        <p className="text-[15px] font-medium text-foreground">If you want to go further</p>
        <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-muted-foreground">
          {followUps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-[14px] text-muted-faint">These are optional. They all go in the same box. You don't have to answer each one, and there's no minimum length.</p>
      </div>
      <PromptField
        lessonCode={lesson.code}
        lessonTitle={lesson.title}
        index="journal"
        label={prompt}
        variant="inline"
      />
      <PrivacyNote>Saved to your account and your private Conversation Journal. It stays private unless you choose to share it.</PrivacyNote>
      <Link to={journalStepHref(lesson.code)} className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Open this in your Conversation Journal
      </Link>
    </div>
  );
}

/** Selectable pattern cards. Choosing again clears the selection. */
export function PatternPicker({ answers, onChange }) {
  const selected = readM5(answers, "M5-L1", "pattern");
  return (
    <fieldset className="min-w-0">
      <legend className="text-[17px] font-medium leading-snug text-foreground">Which pattern do you want to look at?</legend>
      <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
        Pick one, or describe your own. This doesn't label you. You can change it later.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {PATTERN_CARDS.map((card) => {
          const active = selected === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : card.id)}
              className={`flex min-h-[48px] w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-[16px] font-medium">{card.title}</span>
              <span className={`text-[15px] leading-snug ${active ? "text-primary-foreground/90" : "text-muted-foreground"}`}>{card.example}</span>
              <span className={`text-[13px] font-medium uppercase tracking-wide ${active ? "text-primary-foreground" : "text-accent-ink"}`}>
                {active ? "Selected" : "Select"}
              </span>
            </button>
          );
        })}
      </div>
      {selected === PATTERN_OTHER ? (
        <div className="mt-4">
          <PromptField
            lessonCode={PATTERN_LESSON.code}
            lessonTitle={PATTERN_LESSON.title}
            index="pattern-other"
            label="What pattern have you noticed?"
            variant="inline"
          />
        </div>
      ) : null}
    </fieldset>
  );
}

/** The saved pattern and map. Empty sections are left out. */
export function SavedPattern({ answers }) {
  const title = patternTitle(answers);
  const lines = mapLines(answers);
  const stood = readM5(answers, "M5-L1", "stands-out");
  const earlier = lines.length ? [] : earlierMapLines(answers);
  if (!title && !lines.length && !stood && !earlier.length) {
    return (
      <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
        Nothing is saved from the pattern map yet. You can go back and add a line, or leave it blank.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {title ? (
        <Panel tone="yours" label="The pattern">
          <p className="text-[16px] font-medium text-foreground">{title}</p>
        </Panel>
      ) : null}
      {lines.length ? (
        <Panel tone="yours" label="The sequence">
          {lines.map((line) => (
            <Quote key={line.key} label={line.label}>
              {line.value}
            </Quote>
          ))}
        </Panel>
      ) : null}
      {earlier.length ? (
        <Panel tone="yours" label="From the map you saved earlier">
          {earlier.map((line) => (
            <Quote key={line.label} label={line.label}>
              {line.value}
            </Quote>
          ))}
        </Panel>
      ) : null}
      {stood ? (
        <Panel tone="yours" label="What stood out">
          <Quote>{stood}</Quote>
        </Panel>
      ) : null}
    </div>
  );
}

/** Answers from the earlier version of this lesson. Read-only. */
export function EarlierM5({ code, answers }) {
  const rows = (EARLIER_M5[code] || [])
    .map((item) => ({ ...item, value: plainValue((answers || {})[item.key]).trim() }))
    .filter((item) => item.value);
  if (!rows.length) return null;
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer text-[15px] font-medium text-foreground">
        Answers you saved in an earlier version of this lesson ({rows.length})
      </summary>
      <div className="mt-3 space-y-3">
        {rows.map((row) => (
          <Quote key={row.key} label={row.label}>
            {row.value}
          </Quote>
        ))}
        <p className="text-[14px] text-muted-faint">Kept as you wrote them. They're also in your journal.</p>
      </div>
    </details>
  );
}

export function LongerReading({ readings }) {
  if (!readings || !readings.length) return null;
  return (
    <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <summary className="cursor-pointer text-[16px] font-medium text-foreground">Read the longer version (optional)</summary>
      <div className="mt-4 divide-y divide-border">
        {readings.map((reading) => (
          <div key={reading.id} className="py-4 first:pt-0 last:pb-0">
            <StepReading title={reading.title} body={reading.body} />
          </div>
        ))}
      </div>
    </details>
  );
}
