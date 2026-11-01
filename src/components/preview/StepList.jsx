import React from "react";
import { Link } from "react-router-dom";

/** Which parts a step carries, so each lesson shows its reading, lesson and activity. */
export function partsFor(step) {
  const blocks = step.blocks || [];
  const parts = [];
  if ((step.readings || []).length) parts.push("Reading");
  if (step.sourceLesson || blocks.some((block) => block.part === "lesson")) parts.push("Lesson");
  if (blocks.some((block) => block.part === "activity")) parts.push("Activity");
  return parts;
}

/** The lesson list for one section. */
export default function StepList({ section }) {
  return (
    <div className="space-y-3">
      {section.steps.map((step, index) => (
        <article key={step.code} className="workbook-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-[18px]">
              <span className="text-muted-faint">{index + 1}. </span>
              {step.title}
            </h3>
            <span className="text-[13px] text-muted-faint">{step.code}</span>
          </div>
          <p className="mt-2 text-[14px] text-muted-faint">
            {partsFor(step).join(" · ") || "No parts yet"}
            {step.decision ? " · Next Decision" : ""}
            {step.closesPilot ? " · last open step" : ""}
          </p>
          <Link
            to={`/preview/step/${step.code}`}
            className="mt-3 inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Open this step
          </Link>
        </article>
      ))}
    </div>
  );
}