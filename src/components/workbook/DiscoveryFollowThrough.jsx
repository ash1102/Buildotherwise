import React from "react";
import { Link } from "react-router-dom";
import { useAnswers, answerKey, setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { BARRIERS, WAY_KINDS, waysFor, wayForRoute } from "@/lib/discoveryWays";
import { AskHelp, CARD_SLOT, OPTIONS, WAY_SLOT } from "./DiscoverySampler";
import PromptField from "./PromptField";

/** Stored answer slots for the "can't get to it yet" route on M2-L2. */
export const BARRIER_SLOTS = { barriers: 30, smallest: 31, around: 32 };

function splitList(value) {
  return String(value || "").split(/\s*;\s*/).map((item) => item.trim()).filter(Boolean);
}

/**
 * Can't get to it yet: what's in the way, the smallest version that doesn't need
 * it, and who might know a way around. A complete result for this step.
 */
function NotYetFlow({ lesson, selected }) {
  const answers = useAnswers();
  const picked = splitList((answers || {})[answerKey("M2-L2", BARRIER_SLOTS.barriers)]);
  const ways = waysFor(selected?.id);
  const toggle = (item) => {
    const next = picked.includes(item) ? picked.filter((value) => value !== item) : [...picked, item];
    const text = next.join("; ");
    setAnswer("M2-L2", BARRIER_SLOTS.barriers, text);
    saveAnswer({
      lessonCode: "M2-L2",
      lessonTitle: lesson?.title || "",
      promptKey: answerKey("M2-L2", BARRIER_SLOTS.barriers),
      promptLabel: "What got in the way?",
      body: text,
    });
  };
  const freeWays = WAY_KINDS.filter((kind) => kind.id !== "notYet" && ways[kind.id] && !ways[kind.id].needs.length);

  return (
    <div className="space-y-5">
      <p className="rounded-md bg-secondary p-3 text-[16px] leading-relaxed text-foreground">
        Not being able to get to something yet is a real result. It tells you about conditions, not about you. Here you
        record what got in the way, so it can be planned around later or treated as a reason to look elsewhere.
      </p>
      <fieldset>
        <legend className="text-[16px] font-medium text-foreground">What got in the way? Pick any that fit.</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BARRIERS.map((item) => {
            const active = picked.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(item)}
                className={`rounded-md border px-3 py-1.5 text-[14px] transition ${active ? "border-accent-ink bg-accent-ink text-white" : "border-input bg-card text-foreground hover:bg-secondary"}`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">No explanation needed. Pick none if you’d rather not say.</p>
      </fieldset>

      {freeWays.length ? (
        <div className="rounded-lg border border-border p-3">
          <p className="text-[15px] font-medium text-foreground">Ways in that need nothing extra</p>
          <ul className="mt-2 space-y-2">
            {freeWays.map((kind) => (
              <li key={kind.id} className="text-[14.5px] leading-relaxed text-foreground">
                <strong>{kind.label}:</strong> {ways[kind.id].text}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-muted-foreground">You don’t have to do any of these now. They’re here in case one fits.</p>
        </div>
      ) : null}

      <PromptField
        lessonCode="M2-L2"
        lessonTitle={lesson?.title || ""}
        index={BARRIER_SLOTS.smallest}
        label="What’s the smallest version you could do without the thing that got in the way? “Nothing yet” counts."
        variant="inline"
      />
      <PromptField
        lessonCode="M2-L2"
        lessonTitle={lesson?.title || ""}
        index={BARRIER_SLOTS.around}
        label="Optional: who or what might know a way around it? A library desk, a program, someone who’s done it."
        variant="inline"
      />
    </div>
  );
}

export default function DiscoveryFollowThrough({ lesson, route = "" }) {
  const answers = useAnswers();
  const choice = (answers || {})[answerKey("M2-L1", CARD_SLOT)];
  const selected = OPTIONS.find((item) => item.id === choice);
  const plannedWay = (answers || {})[answerKey("M2-L1", WAY_SLOT)] || "";
  const routeWay = wayForRoute(route);
  const way = routeWay || plannedWay;
  const kind = WAY_KINDS.find((item) => item.id === way);
  const wayText = selected && kind ? waysFor(selected.id)[kind.id]?.text : "";

  if (routeWay === "notYet") {
    return (
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="When you couldn't get to it yet">
        <h3 className="text-[20px] font-semibold text-foreground">Couldn’t get to it yet</h3>
        {selected ? <p className="text-[15px] text-muted-foreground">What you were planning to explore: <strong className="text-foreground">{selected.field}</strong>.</p> : null}
        <NotYetFlow lesson={lesson} selected={selected} />
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Your guided exploration">
      <h3 className="text-[20px] font-semibold text-foreground">Work with something concrete</h3>
      {selected ? (
        <>
          <p className="text-[15px] text-muted-foreground">
            Your starting point from Lesson 1: <strong className="text-foreground">{selected.field}</strong>
            {plannedWay && kind && plannedWay === kind.id ? <> · planned way in: <strong className="text-foreground">{kind.label}</strong></> : null}.
            Picking it doesn’t mean you’ve done it, and you can change it.
          </p>
          {wayText ? (
            <div className="rounded-lg bg-secondary p-4">
              <p className="font-medium text-foreground">{kind.label}</p>
              <p className="mt-2 text-[16px] leading-relaxed text-foreground">{wayText}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-secondary p-4">
              <p className="font-medium text-foreground">An encounter you can choose</p>
              <p className="mt-2 text-[16px] leading-relaxed text-foreground">{selected.task}</p>
            </div>
          )}
          {way === "ask" || (way === "watch" && /spoke|ask/i.test(route)) ? <AskHelp /> : null}
          <p className="text-[15px] text-foreground">As you explore, keep <strong>what you actually did, saw, or heard</strong> separate from <strong>what you’re guessing</strong>. Notice which parts pull your attention and what you still want to find out.</p>
          {selected.source ? <a href={selected.source} target="_blank" rel="noopener noreferrer" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Open the source ↗</a> : null}
        </>
      ) : (
        <>
          <p className="text-[16px] leading-relaxed text-foreground">You haven’t picked a starting point in Lesson 1 yet. That’s fine. Go back and pick one, or use something you’ve already come across.</p>
          <Link to="/lesson/M2-L1" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Go to Lesson 1</Link>
        </>
      )}
      <p className="text-[14px] text-muted-foreground">Below, record only what actually happened. Say whether you read, watched, talked with someone, visited, or did it yourself. Each one tells you something different.</p>
    </section>
  );
}
