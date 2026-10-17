import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { setAnswer, useAnswers } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import {
  CONDITION_CHIPS,
  EMPTY_PLAN,
  NOTICE_CHIPS,
  PLAN_KEY,
  STOP_RULES,
  TRY_CARDS,
  EXPLORATION_MENU,
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
  const previous = useAnswers();
  const priorNotes = ["own-caught", "own-dont-know", "possibility"].map((key) => previous[`M1-L1#${key}`]).filter((value) => value && String(value).trim());
  const [draft, setDraft] = useState(() => (saved ? { ...EMPTY_PLAN, ...saved } : EMPTY_PLAN));
  const [editing, setEditing] = useState(!saved);

  const change = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const needsOwn = draft.card === "own" || draft.card === "reject";
  const route = draft.route || (draft.experiment ? "menu" : draft.card === "own" ? "own" : "");
  const available = EXPLORATION_MENU.find((group) => group.category === draft.category)?.items || [];
  const chooseExperiment = (item) => change({ route: "menu", experiment: item.id, card: "", own: "" });

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

      <ChipGroup label="Where would you like to start?" hint="You can change your mind. You are exploring, not choosing a career.">
        {[
          ["thread", "Something caught my attention"],
          ["menu", "Show me what's out there"],
          ["unsure", "I have absolutely no idea"],
        ].map(([key, label]) => (
          <Chip key={key} active={route === key} onClick={() => change({ route: key, card: "", experiment: "", category: "" })}>{label}</Chip>
        ))}
      </ChipGroup>

      {route === "thread" ? (
        <div className="space-y-3 rounded-lg bg-secondary p-4">
          <p className="text-[15px] font-medium">Things you noticed in Module 1</p>
          {priorNotes.length ? priorNotes.map((note, index) => (
            <button key={index} type="button" onClick={() => change({card: "own", own: String(note), experiment: ""})}
              className="block w-full rounded-md border border-input bg-card p-3 text-left text-[15px]">{String(note)}</button>
          )) : <p className="text-[15px]">Nothing saved here yet. You can name something now or browse the menu instead.</p>}
          <label className="block text-[15px]">What could you try or find out?
            <Input className="mt-2" value={draft.own} onChange={(event) => change({card: "own",own:event.target.value})} placeholder="A few words are enough." />
          </label>
        </div>
      ) : null}

      {(route === "menu" || route === "unsure") ? (
        <div className="space-y-4">
          <p className="text-[15px] text-muted-foreground">{route === "unsure" ? "Not knowing is a valid starting point. Browse, or let the menu suggest something." : "Pick a category, then one small experience. All are suggestions, not promises of a local opportunity."}</p>
          <div className="flex flex-wrap gap-2">
            {EXPLORATION_MENU.map((group) => <Chip key={group.category} active={draft.category === group.category}
              onClick={() => change({category:group.category,experiment:"",card:""})}>{group.category}</Chip>)}
          </div>
          {route === "unsure" ? <button type="button" className="rounded-md border border-input px-3 py-2 text-[15px] font-medium"
            onClick={() => { const all = EXPLORATION_MENU.flatMap((group)=>group.items); const item=all[Math.floor(Math.random()*all.length)]; const group=EXPLORATION_MENU.find((g)=>g.items.some((i)=>i.id===item.id)); change({category:group.category, experiment:item.id, card:""}); }}>Surprise me</button> : null}
          <div className="grid gap-2">
            {available.map((item) => (
              <button key={item.id} type="button" onClick={() => chooseExperiment(item)}
                className={`rounded-lg border p-3 text-left ${draft.experiment===item.id ? "border-accent-ink bg-secondary":"border-input bg-card"}`}>
                <span className="block font-medium">{item.label}</span>
                <span className="block text-[14px] text-muted-foreground">{item.minutes} · {item.cost}</span>
                <span className="block text-[14px] text-muted-foreground">{item.alternative}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {route === "menu" || route === "unsure" ? (
        <label className="block text-[15px]">Something else you'd rather explore?
          <Input value={draft.own} onChange={(event) => change({card:"own",experiment:"",own:event.target.value})} className="mt-2" placeholder="Add your own possibility" />
        </label>
      ) : null}

      <details className="rounded-lg border border-input p-3">
        <summary className="cursor-pointer text-[15px] font-medium">Other starting options (optional)</summary>
      <ChipGroup label="What will you try?">
        <div className="flex w-full flex-col gap-2">
          {TRY_CARDS.map((card) => (
            <Chip key={card.id} block active={draft.card === card.id} onClick={() => change({ card: card.id })}>
              {card.label}
            </Chip>
          ))}
        </div>
      </ChipGroup>

      </details>
      {draft.card && route !== "thread" && route !== "menu" && route !== "unsure" ? (
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
          disabled={!(draft.experiment || (draft.card === "own" && draft.own.trim()) || (draft.card && draft.card !== "own"))}
          className="rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save my plan
        </button>
        {!(draft.card || draft.experiment) ? <span className="text-[15px] text-muted-foreground">Pick one try to save a plan.</span> : null}
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