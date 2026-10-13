import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import {
  CONDITION_CHIPS,
  EMPTY_PLAN,
  NOTICE_CHIPS,
  PLAN_KEY,
  STOP_RULES,
  TRY_CARDS,
  composePlan,
  toggleItem,
} from "@/lib/tryLoop";
import { Chip, ChipGroup } from "./TryChips";

/**
 * Plan one small try by tapping. Saving writes the plan as plain sentences into the
 * journal and into this step's answers, so the step counts as written and the
 * plan is there to come back to.
 */
export default function TryPlanner({ lesson }) {
  const [plans, setPlans] = useStore(PLAN_KEY, {});
  const saved = plans[lesson.code] || null;
  const [draft, setDraft] = useState(() => (saved ? { ...EMPTY_PLAN, ...saved } : EMPTY_PLAN));
  const [editing, setEditing] = useState(!saved);

  const change = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const needsOwn = draft.card === "own" || draft.card === "reject";

  const save = () => {
    const text = composePlan(draft);
    setPlans((current) => ({
      ...current,
      [lesson.code]: { ...draft, text, saved_at: new Date().toISOString() },
    }));
    setAnswer(lesson.code, "plan", text);
    saveAnswer({
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      promptKey: `${lesson.code}#plan`,
      promptLabel: "My try plan",
      body: text,
    });
    setEditing(false);
  };

  if (!editing && saved) {
    return (
      <section className="rounded-xl border border-border bg-secondary p-4 sm:p-5" aria-label="Your try plan">
        <p className="workbook-label">Your try plan</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{saved.text}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Saved to your journal. The next step will ask what happened.
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          Change my plan
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Plan a small try">
      <div>
        <p className="workbook-label">Plan a small try</p>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Tap to build a plan. These are examples, and none of them is promised as available. Watching or asking counts as
          a try.
        </p>
      </div>

      <ChipGroup label="What will you try?">
        <div className="flex w-full flex-col gap-2">
          {TRY_CARDS.map((card) => (
            <Chip key={card.id} block active={draft.card === card.id} onClick={() => change({ card: card.id })}>
              {card.label}
            </Chip>
          ))}
        </div>
      </ChipGroup>

      {draft.card ? (
        <div>
          <label htmlFor={`${lesson.code}-plan-own`} className="block text-[16px] font-medium leading-snug text-foreground">
            {draft.card === "own"
              ? "What would you try?"
              : draft.card === "reject"
              ? "What would make a better test?"
              : "In your own words (optional)"}
          </label>
          <Input
            id={`${lesson.code}-plan-own`}
            value={draft.own}
            onChange={(event) => change({ own: event.target.value })}
            placeholder={needsOwn ? "One line is enough." : "Add a detail if you want to."}
            className="mt-2"
          />
        </div>
      ) : null}

      <ChipGroup label="When will you stop?" hint="Set the limit before you start.">
        {STOP_RULES.map((rule) => (
          <Chip key={rule.id} active={draft.stop === rule.id} onClick={() => change({ stop: draft.stop === rule.id ? "" : rule.id })}>
            {rule.label}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label="What will you notice?" hint="Pick any that apply.">
        {NOTICE_CHIPS.map((item) => (
          <Chip key={item} active={draft.notice.includes(item)} onClick={() => change({ notice: toggleItem(draft.notice, item) })}>
            {item}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label="Anything that could get in the way? (optional)" hint="Pick any that apply.">
        {CONDITION_CHIPS.map((item) => (
          <Chip
            key={item}
            active={draft.conditions.includes(item)}
            onClick={() => change({ conditions: toggleItem(draft.conditions, item) })}
          >
            {item}
          </Chip>
        ))}
      </ChipGroup>

      {draft.conditions.length ? (
        <p className="rounded-md border border-dashed border-input bg-secondary p-3 text-[15px] leading-relaxed text-foreground">
          These are facts about the situation, not mindset problems. Choose something accessible, shrink the try, or
          record the barrier instead of forcing an attempt.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!draft.card}
          className="rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save my plan
        </button>
        {!draft.card ? <span className="text-[15px] text-muted-foreground">Pick one try to save a plan.</span> : null}
        {saved ? (
          <button
            type="button"
            onClick={() => {
              setDraft({ ...EMPTY_PLAN, ...saved });
              setEditing(false);
            }}
            className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Keep my saved plan
          </button>
        ) : null}
      </div>
    </section>
  );
}