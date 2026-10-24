import React from "react";
import useCurriculum from "@/hooks/useCurriculum";
import { answerKey, useAnswers } from "@/lib/workbook";
import { ALL_GS_CODES, useGettingStartedSubmitted } from "@/lib/gettingStarted";

/** Read-only: what someone wrote in Getting Started, and what was sent when they submitted. */
export default function MyGettingStarted() {
  const submitted = useGettingStartedSubmitted();
  const answers = useAnswers();
  const { lessons } = useCurriculum();
  if (!submitted) return null;

  // Every former Getting Started step, so answers saved before the flow was shortened still show.
  const steps = ALL_GS_CODES.map((code) => (lessons || []).find((lesson) => lesson.code === code)).filter(Boolean);
  const sent = submitted.sent || {};
  const when = submitted.at ? new Date(submitted.at).toLocaleDateString() : "";

  return (
    <section className="workbook-section">
      <h2 className="text-[19px]">My Getting Started</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Submitted{when ? ` on ${when}` : ""}. This is read-only. To pause or leave, email
        Start@buildotherwise.org. No reason needed.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-[13px] font-semibold text-accent-ink">Sent to Ashley</p>
        <p className="mt-1 text-[15px]">
          <span className="text-muted-foreground">Why I'm here: </span>
          {sent.join_choice || "Not chosen"}
        </p>
        {sent.choice_note ? (
          <p className="mt-1 text-[15px]">
            <span className="text-muted-foreground">My approach: </span>
            {sent.choice_note}
          </p>
        ) : null}
        {sent.change_help ? (
          <p className="mt-1 text-[15px]">
            <span className="text-muted-foreground">If I want to change it later: </span>
            {sent.change_help}
          </p>
        ) : null}
        {(sent.support_plan || []).map((row) => (
          <p key={row.question} className="mt-1 text-[15px]">
            <span className="text-muted-foreground">{row.question}: </span>
            {row.answer}
          </p>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {steps.map((lesson) => {
          const prompts = [...(lesson.try_prompts || []), ...(lesson.reflect_prompts || [])];
          const filled = prompts
            .map((label, index) => ({ label, value: String((answers || {})[answerKey(lesson.code, index)] || "").trim() }))
            .filter((row) => row.value);
          return (
            <div key={lesson.code}>
              <h3 className="text-[16px]">{lesson.title}</h3>
              {filled.length ? (
                <ul className="mt-1 space-y-1.5">
                  {filled.map((row) => (
                    <li key={row.label} className="border-l-2 border-primary/30 pl-3 text-[15px]">
                      <span className="block text-[13px] text-muted-faint">{row.label}</span>
                      {row.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[14px] text-muted-faint">Skipped.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
