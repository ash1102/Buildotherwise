import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import {
  CHECKIN_KEY,
  EMPTY_CHECKIN,
  OUTCOMES,
  PLAN_KEY,
  RECORD_CHIPS,
  composeCheckIn,
  toggleItem,
} from "@/lib/tryLoop";
import { Chip, ChipGroup } from "./TryChips";

/**
 * After the try: what happened, by tapping. Every outcome is a complete answer,
 * including "I didn't get to it". Saving writes plain sentences to the journal and
 * to this step's answers, so the step counts as written.
 */
export default function TryCheckIn({ lesson, planCode }) {
  const [plans] = useStore(PLAN_KEY, {});
  const [checkins, setCheckins] = useStore(CHECKIN_KEY, {});
  const plan = plans[planCode] || null;
  const saved = checkins[lesson.code] || null;
  const [draft, setDraft] = useState(() => (saved ? { ...EMPTY_CHECKIN, ...saved } : EMPTY_CHECKIN));
  const [editing, setEditing] = useState(!saved);

  const change = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const save = () => {
    const text = composeCheckIn({ plan, outcome: draft.outcome, record: draft.record, note: draft.note });
    setCheckins((current) => ({
      ...current,
      [lesson.code]: { ...draft, text, saved_at: new Date().toISOString() },
    }));
    setAnswer(lesson.code, "checkin", text);
    saveAnswer({
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      promptKey: `${lesson.code}#checkin`,
      promptLabel: "Check-in on my try",
      body: text,
    });
    setEditing(false);
  };

  if (!editing && saved) {
    return (
      <section className="rounded-xl border border-border bg-secondary p-4 sm:p-5" aria-label="Your check-in">
        <p className="workbook-label">Your check-in</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{saved.text}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Saved to your journal.</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          Change my check-in
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Check in on your try">
      <div>
        <p className="workbook-label">Check in on your try</p>
        <div className="mt-2 rounded-md border border-dashed border-input bg-secondary p-3">
          {plan && plan.text ? (
            <>
              <p className="text-[15px] font-medium text-foreground">What you planned</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-muted-foreground">
                {plan.text}
              </p>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              No plan was saved in the last step. That is fine. Say what happened below.
            </p>
          )}
        </div>
      </div>

      <ChipGroup label="What happened?" hint="Every one of these is a complete answer.">
        {OUTCOMES.map((item) => (
          <Chip key={item} active={draft.outcome === item} onClick={() => change({ outcome: draft.outcome === item ? "" : item })}>
            {item}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label="What belongs in the record?" hint="Pick any that apply. These are data, not a verdict on you.">
        {RECORD_CHIPS.map((item) => (
          <Chip key={item} active={draft.record.includes(item)} onClick={() => change({ record: toggleItem(draft.record, item) })}>
            {item}
          </Chip>
        ))}
      </ChipGroup>

      <div>
        <label htmlFor={`${lesson.code}-checkin-note`} className="block text-[16px] font-medium leading-snug text-foreground">
          One line about what caught your attention, bored you, or felt out of reach (optional)
        </label>
        <Input
          id={`${lesson.code}-checkin-note`}
          value={draft.note}
          onChange={(event) => change({ note: event.target.value })}
          placeholder="One line is enough."
          className="mt-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!draft.outcome}
          className="rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save my check-in
        </button>
        {!draft.outcome ? <span className="text-[15px] text-muted-foreground">Pick what happened to save.</span> : null}
        {saved ? (
          <button
            type="button"
            onClick={() => {
              setDraft({ ...EMPTY_CHECKIN, ...saved });
              setEditing(false);
            }}
            className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Keep my saved check-in
          </button>
        ) : null}
      </div>
    </section>
  );
}
