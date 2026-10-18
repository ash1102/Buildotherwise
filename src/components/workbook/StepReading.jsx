import React, { useState } from "react";
import Prose from "./Prose";
import { readingPreview } from "@/lib/stepReadings";

const SHORT_LINE = 120;

/**
 * Layout only: consecutive short lines inside a section become one block with a
 * line break between them. Headings, quotes, list items and longer paragraphs keep
 * their own spacing. No words are added, removed or reordered.
 */
function groupReadingLines(text) {
  const blocks = String(text || "").split(/\n{2,}/);
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push(run.join("  \n"));
    run = [];
  };
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const isPlain = !/^(#|>|[-*+]\s|\d+[.)]\s|---)/.test(block) && block.length <= SHORT_LINE && !block.includes("\n");
    if (isPlain) run.push(block);
    else {
      flush();
      out.push(block);
    }
  }
  flush();
  return out.join("\n\n");
}

/** One reading, in the words it was stored with. A long one stays short until Read more. */
export default function StepReading({ title, body }) {
  const { preview, long } = readingPreview(body);
  const [open, setOpen] = useState(false);
  const text = groupReadingLines(long && !open ? preview : body);

  return (
    <div>
      {title ? <h4 className="font-heading text-[18px] leading-snug text-foreground">{title}</h4> : null}
      <div className={title ? "mt-3" : ""}>
        <Prose text={text} />
      </div>
      {long ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mt-3 text-[14px] font-medium text-accent-ink underline underline-offset-2"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
