import React from "react";
import { MAP_PAUSE_TEXT, MAP_PICK_FIELDS, MAP_QUESTION_PARTS } from "@/lib/lifeMap";

/** Closing reflection: choose whether to explore, or leave that choice open. */
export default function MapPickCard({ pick, onJumpToPart }) {
  const values = pick || {};
  const nothingYet = Boolean(values.nothing_yet);
  const isExample = (value) => /^Fictional:/i.test(String(value || "").trim());
  const hasPick = MAP_PICK_FIELDS.some((field) => String(values[field.id] || "").trim() && !isExample(values[field.id]));
  const exampleFields = MAP_PICK_FIELDS.filter((field) => isExample(values[field.id]));

  return (
    <section className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Look over your map">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-medium shadow-sm"
          style={{ background: "hsl(var(--accent-ink-soft))", color: "hsl(277 34.3% 18%)" }}
        >
          Look over your map
        </span>
      </div>

      <div className="mt-3">
        {nothingYet ? (
          <div className="space-y-1">
            <p className="text-[13px] text-muted-foreground">{MAP_PAUSE_TEXT} That counts.</p>
            {hasPick ? (
              <p className="text-[13px] text-muted-foreground">Earlier reflection text is still saved. Open the reflection and uncheck the pause to see it.</p>
            ) : null}
          </div>
        ) : hasPick ? (
          <div
            className="max-w-md rounded-xl border bg-background px-4 py-3 shadow-sm"
            style={{ borderColor: "hsl(var(--accent-ink-soft))" }}
          >
            {MAP_PICK_FIELDS.map((field) => {
              const value = String(values[field.id] || "").trim();
              if (!value || isExample(value)) return null;
              return (
                <p key={field.id} className="text-[13px] leading-relaxed">
                  <span className="text-muted-faint">{field.label} </span>
                  <span className="text-foreground">{value}</span>
                </p>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onJumpToPart && onJumpToPart(MAP_QUESTION_PARTS.length)}
            className="text-[12px] text-muted-faint underline decoration-border underline-offset-2 hover:text-primary"
          >
            Nothing chosen yet. Open the reflection
          </button>
        )}
      </div>
      {exampleFields.length ? <details className="mt-4 rounded-lg border border-border p-3">
        <summary className="cursor-pointer text-[14px] font-medium">Saved example text to review</summary>
        <p className="mt-2 text-[14px] text-muted-foreground">These fields are explicitly labelled fictional examples. They are kept here separately from your reflection.</p>
        {exampleFields.map((field) => <p key={field.id} className="mt-2 text-[14px]"><span className="text-muted-foreground">{field.label} </span>{values[field.id]}</p>)}
        <button type="button" onClick={() => onJumpToPart?.(MAP_QUESTION_PARTS.length)} className="mt-3 text-[14px] text-accent-ink underline">Review or replace these fields</button>
      </details> : null}
    </section>
  );
}