import React, { useState } from "react";
import Prose from "./Prose";
import { readingPreview } from "@/lib/stepReadings";

/** One reading, in the words it was stored with. A long one stays short until Read more. */
export default function StepReading({ title, body }) {
  const { preview, long } = readingPreview(body);
  const [open, setOpen] = useState(false);
  const text = long && !open ? preview : body;

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
