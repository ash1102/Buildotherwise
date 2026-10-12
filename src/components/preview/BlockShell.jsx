import React, { useState } from "react";
import ContentTag from "./ContentTag";

const PART_LABELS = {
  reading: "Reading",
  lesson: "Lesson",
  activity: "Activity",
  takeaway: "Take-away",
};

/**
 * One block of the lesson. The part it belongs to, where its words came from and
 * a plain-text version are always visible, so the interaction is never the only
 * way to reach the content.
 */
export default function BlockShell({ block, children }) {
  const [skipped, setSkipped] = useState(false);
  const [plainOpen, setPlainOpen] = useState(false);
  const asksForInput = block.part === "activity" && block.type !== "teaching";

  return (
    <section className="workbook-section" aria-labelledby={`${block.id}-title`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="workbook-label">{PART_LABELS[block.part] || "Lesson"}</span>
        {block.tag ? <ContentTag tag={block.tag} /> : null}
        {block.invented ? (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] text-muted-faint">
            Invented example
          </span>
        ) : null}
        {block.swappable ? (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] text-muted-faint">
            Swappable block
          </span>
        ) : null}
      </div>

      {block.title ? (
        <h3 id={`${block.id}-title`} className="mt-2">
          {block.title}
        </h3>
      ) : null}

      {skipped ? (
        <div className="mt-3 rounded-md border border-dashed border-input bg-secondary p-3">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            No response. Nothing was saved, and nothing needs a reason.
          </p>
          <button
            type="button"
            onClick={() => setSkipped(false)}
            className="mt-2 text-[14px] font-medium text-accent-ink underline underline-offset-2"
          >
            Show this part again
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3">{children}</div>

          <div className="no-print mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {block.plain ? (
              <button
                type="button"
                onClick={() => setPlainOpen((open) => !open)}
                aria-expanded={plainOpen}
                className="text-[14px] font-medium text-accent-ink underline underline-offset-2"
              >
                {plainOpen ? "Hide the plain version" : "Read this part as plain text"}
              </button>
            ) : null}
            {asksForInput ? (
              <button
                type="button"
                onClick={() => setSkipped(true)}
                className="text-[14px] font-medium text-muted-faint underline underline-offset-2"
              >
                Skip this
              </button>
            ) : null}
          </div>

          {plainOpen && block.plain ? (
            <p className="mt-3 max-w-[68ch] border-l-2 border-border pl-4 text-[16px] leading-relaxed text-muted-foreground">
              {block.plain}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}