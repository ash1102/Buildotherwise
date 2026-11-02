import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { answerKey } from "@/lib/workbook";
import { EARLIER_ANSWERS, FINISHED, markFinished, plainValue } from "@/lib/moduleOne";
import GoDeeperJournal from "../GoDeeperJournal";
import { partFlowAddsGoDeeper } from "@/lib/journalPrompts";

/**
 * Module 1 lessons are a short sequence of parts. Every part can be opened from the
 * list at the top at any time, answers are saved as they change, and going back
 * never clears anything. The part someone was on is remembered on this device only.
 */
export function PartFlow({ lessonCode, parts }) {
  const [stored, setStored] = useStore(`m1Part.${lessonCode}`, 0);
  const index = Math.min(Math.max(Number(stored) || 0, 0), parts.length - 1);
  const headingRef = useRef(null);
  const topRef = useRef(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    if (topRef.current) topRef.current.scrollIntoView({ block: "start" });
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, [index]);

  const go = (next) => {
    moved.current = true;
    setStored(next);
  };
  const part = parts[index];

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-5">
      <nav aria-label="Parts of this lesson">
        <ol className={parts.length > 5 ? "flex gap-2 overflow-x-auto pb-2" : "flex gap-1.5"} role="list">
          {parts.map((item, i) => (
            <li key={item.id} className={parts.length > 5 ? "min-w-[90px] flex-1" : "min-w-0 flex-1"}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={`Part ${i + 1} of ${parts.length}: ${item.short}`}
                className="group block w-full min-h-[44px] text-left"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full ${i === index ? "bg-primary" : i < index ? "bg-primary/45" : "bg-border"}`}
                />
                <span
                  aria-hidden="true"
                  className={`mt-1.5 block text-[12px] font-semibold uppercase leading-snug tracking-wide ${parts.length > 5 ? "whitespace-normal" : "truncate"} ${i === index ? "text-accent-ink" : "text-muted-faint group-hover:text-muted-foreground"}`}
                >
                  {item.short}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section aria-labelledby={`part-${lessonCode}-${part.id}`} className="space-y-5">
        <div>
          <p className="text-[13px] text-muted-faint">
            Part {index + 1} of {parts.length}
          </p>
          <h2
            id={`part-${lessonCode}-${part.id}`}
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-[clamp(1.35rem,1.1rem+1vw,1.75rem)] leading-tight outline-none"
          >
            {part.title}
          </h2>
        </div>
        {part.content}
        {/* Conversation Journal: Go Deeper sits on the last part, after the lesson's main activity. */}
        {index === parts.length - 1 && partFlowAddsGoDeeper(lessonCode) ? <GoDeeperJournal lessonCode={lessonCode} /> : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}
        {index < parts.length - 1 ? (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Continue
            <span className="sr-only">to {parts[index + 1].short}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** One tap per option. Tapping the chosen one again clears it. */
export function SingleChoice({ legend, hint, options, value, onChange, idPrefix }) {
  return (
    <fieldset className="min-w-0">
      {legend ? <legend className="text-[17px] font-medium leading-snug text-foreground">{legend}</legend> : null}
      {hint ? <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      <div className="mt-3 flex flex-col gap-2" role="group">
        {options.map((option) => {
          const label = typeof option === "string" ? option : option.label;
          const active = value === label;
          return (
            <button
              key={`${idPrefix || ""}${label}`}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : label)}
              className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-[16px] transition-colors ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  active ? "border-primary-foreground" : "border-input"
                }`}
              >
                {active ? <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" /> : null}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** More than one is fine. `only` is an option that clears the others (and is cleared by them). */
export function MultiChoice({ legend, hint, options, values, onChange, only }) {
  const toggle = (option) => {
    if (values.includes(option)) return onChange(values.filter((item) => item !== option));
    if (option === only) return onChange([option]);
    return onChange([...values.filter((item) => item !== only), option]);
  };
  return (
    <fieldset className="min-w-0">
      {legend ? <legend className="text-[17px] font-medium leading-snug text-foreground">{legend}</legend> : null}
      {hint ? <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      <div className="mt-3 flex flex-col gap-2" role="group">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-[16px] transition-colors ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                  active ? "border-primary-foreground" : "border-input"
                }`}
              >
                {active ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const PANEL_TONES = {
  reading: { label: "Reading", className: "border-border bg-card" },
  example: { label: "Example", className: "border-border bg-secondary" },
  yours: { label: "Your words", className: "border-primary/40 bg-card" },
  note: { label: "", className: "border-dashed border-input bg-card" },
};

/** Keeps examples, teaching, and the participant's own words visibly different. */
export function Panel({ tone = "note", label, title, children }) {
  const style = PANEL_TONES[tone] || PANEL_TONES.note;
  const tag = label ?? style.label;
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${style.className}`}>
      {tag ? <p className="workbook-label">{tag}</p> : null}
      {title ? <h3 className={`${tag ? "mt-1.5" : ""} font-heading text-[19px] leading-snug text-foreground`}>{title}</h3> : null}
      <div className={tag || title ? "mt-3 space-y-3" : "space-y-3"}>{children}</div>
    </div>
  );
}

export function P({ children }) {
  return <p className="max-w-[68ch] text-[17px] leading-relaxed text-foreground">{children}</p>;
}

/** The participant's own saved words, quoted back exactly. */
export function Quote({ label, children }) {
  return (
    <div className="border-l-2 border-primary/50 pl-3">
      {label ? <p className="text-[13px] text-muted-foreground">{label}</p> : null}
      <p className="mt-1 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

/** Answers written in an earlier version of this lesson. Read-only, never moved or rewritten. */
export function EarlierAnswers({ code, answers }) {
  const rows = (EARLIER_ANSWERS[code] || [])
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

/** A way to finish without writing. Answers aren't needed to move on. */
export function FinishControl({ code, answers }) {
  const done = Boolean(String((answers || {})[answerKey(code, FINISHED)] || "").trim());
  return done ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground">
        <Check className="h-4 w-4" aria-hidden="true" />
        Marked done
      </span>
      <Link to="/" className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-accent-ink underline underline-offset-2">Choose another lesson</Link>
      <button type="button" onClick={() => markFinished(code, false)} className="text-[14px] text-muted-foreground underline underline-offset-2">
        Undo
      </button>
    </div>
  ) : (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => markFinished(code, true)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-primary bg-card px-5 text-[15px] font-medium text-foreground hover:bg-secondary"
      >
        <Check className="h-4 w-4" aria-hidden="true" />
        I’m done with this lesson for now
      </button>
      <p className="text-[14px] text-muted-faint">You don’t need to answer anything to move on. You can come back and change answers anytime.</p>
    </div>
  );
}
