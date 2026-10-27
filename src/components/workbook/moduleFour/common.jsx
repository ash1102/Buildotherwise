import React from "react";
import { plainValue } from "@/lib/moduleOne";
import { EARLIER_M4, GO_DEEPER, JOURNAL_INTRO } from "@/lib/moduleFour";
import GoDeeperJournal from "../GoDeeperJournal";
import { FinishControl, Quote } from "../moduleOne/parts";

/** Answers from the earlier version of Module 4. Read-only, never moved or rewritten. */
export function EarlierM4({ code, answers }) {
  const rows = (EARLIER_M4[code] || [])
    .map((item) => ({ ...item, value: plainValue((answers || {})[item.key]).trim() }))
    .filter((item) => item.value && !item.value.startsWith("{") && !item.value.startsWith("["));
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
        <p className="text-[14px] text-muted-faint">Kept as you wrote them. They’re also in your journal.</p>
      </div>
    </details>
  );
}

/** The last part of every Module 4 lesson: the Go Deeper journal, earlier answers, and a way to finish. */
export function PartGoDeeper({ lesson, answers }) {
  const deeper = GO_DEEPER[lesson.code];
  return (
    <div className="space-y-5">
      <GoDeeperJournal lesson={lesson} prompt={deeper.prompt} followUps={deeper.followUps} intro={JOURNAL_INTRO} />
      <EarlierM4 code={lesson.code} answers={answers} />
      <FinishControl code={lesson.code} answers={answers} />
    </div>
  );
}

/** A tappable row that copies a suggestion into a field. */
export function UseRow({ text, onUse, label = "Use this" }) {
  return (
    <li className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <span className="text-[15px] leading-relaxed text-foreground">{text}</span>
      <button
        type="button"
        onClick={() => onUse(text)}
        className="min-h-[44px] shrink-0 self-start text-[14px] font-medium text-accent-ink underline underline-offset-2"
      >
        {label}
      </button>
    </li>
  );
}
