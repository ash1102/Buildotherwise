import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { entryForPrompt, saveAnswer } from "@/lib/journal";
import { decisionFollowUp, decisionFollowUpKey } from "@/lib/connections";

/**
 * The prompt that changes with the decision someone picks. Answering is optional,
 * and the answer goes into the journal next to the decision.
 */
export default function DecisionFollowUp({ lessonCode, lessonTitle, decision }) {
  const question = decisionFollowUp(decision);
  const key = decisionFollowUpKey(lessonCode);
  const [value, setValue] = useState(() => entryForPrompt(lessonCode, key)?.body || "");
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => {
    setValue(entryForPrompt(lessonCode, key)?.body || "");
    setState("idle");
  }, [lessonCode, key]);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  if (!question) return null;

  const change = (next) => {
    setValue(next);
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      saveAnswer({
        lessonCode,
        lessonTitle,
        promptKey: key,
        promptLabel: `After choosing ${decision}`,
        body: next,
      });
      setState("saved");
    }, 650);
  };

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-5" aria-live="polite">
      <label htmlFor={`${lessonCode}-decision-followup`} className="block text-[16px] font-medium leading-snug text-foreground">
        {question}
      </label>
      <p className="mt-1 text-[14px] text-muted-foreground">Optional. It goes into your journal beside this decision.</p>
      <Textarea
        id={`${lessonCode}-decision-followup`}
        value={value}
        onChange={(event) => change(event.target.value)}
        rows={2}
        placeholder="One line is enough."
        className="mt-2 min-h-[3.5rem] resize-y bg-card text-[16px] leading-relaxed"
      />
      <p className="mt-1 text-right text-[14px] text-accent-ink">{state === "saved" ? "Saved" : state === "saving" ? "Saving…" : ""}</p>
    </div>
  );
}
