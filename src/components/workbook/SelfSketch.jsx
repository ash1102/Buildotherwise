import React from "react";
import PromptField from "./PromptField";
import { answerKey, useAnswers } from "@/lib/workbook";

/** Where the Module 1 baseline answer is stored (M1-L3, optional reflect question). */
export const BASELINE_SLOT = { code: "M1-L3", index: 4 };
/** Answer slots this piece writes on M4-L1. Kept clear of the lesson's own boxes (0–5). */
export const SKETCH_SLOTS = { sketch: 20, chosen: 21 };

/**
 * M4-L1, optional way to begin: a short self-characterization sketch,
 * adapted from George Kelly's personal construct psychology.
 * It explores how someone describes themselves. It does not hunt for
 * "wrong" beliefs, and nothing here is scored or required.
 */
export default function SelfSketch({ lesson, route }) {
  const answers = useAnswers();
  const baseline = String((answers || {})[answerKey(BASELINE_SLOT.code, BASELINE_SLOT.index)] || "").trim();

  return (
    <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <summary className="cursor-pointer text-[16px] font-medium text-foreground">
        Optional: start from a short sketch of yourself
      </summary>
      <div className="mt-4 space-y-4">
        <p className="max-w-[68ch] text-[16px] leading-relaxed text-foreground">
          Write about three sentences describing yourself the way someone who knows you well, and is on your side,
          might describe you to a person who has never met you. Use your name, “they,” or “I.” Whichever feels
          more natural is fine.
        </p>
        <p className="max-w-[68ch] text-[16px] leading-relaxed text-foreground">
          Then pick one sentence to look at with the questions below. You’re not looking for what’s wrong with how
          you see yourself. A sentence can turn out accurate, partly accurate, or still unknown.
        </p>
        {baseline ? (
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-[14px] text-muted-foreground">What you wrote in Module 1, if you want to use it</p>
            <p className="mt-1 whitespace-pre-wrap text-[15px] text-foreground">{baseline}</p>
          </div>
        ) : null}
        <PromptField
          lessonCode={lesson.code}
          lessonTitle={lesson.title}
          index={SKETCH_SLOTS.sketch}
          label="Your sketch (about three sentences)"
          route={route}
          variant="inline"
        />
        <PromptField
          lessonCode={lesson.code}
          lessonTitle={lesson.title}
          index={SKETCH_SLOTS.chosen}
          label="The one sentence you’ll look at"
          route={route}
          variant="inline"
          compact
        />
        <p className="text-[13px] text-muted-faint">
          Adapted from psychologist George Kelly’s self-characterization sketch. Skip this and start from Module 2 or 3
          if you’d rather.
        </p>
      </div>
    </details>
  );
}
