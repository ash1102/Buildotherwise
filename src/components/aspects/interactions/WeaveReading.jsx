import React, { useState } from "react";

/** Reading and activity as they arrive in the workbook: paired, never separate. */
const PAIRS = [
  {
    reading: "A stop rule is written before you start, not after.",
    step: "Write the first line of your stop rule.",
  },
  {
    reading: "Small and reversible beats big and final.",
    step: "Name the smallest version of this you could try this week.",
  },
  {
    reading: "You are allowed to learn nothing conclusive.",
    step: "Say what would still be unknown afterwards.",
  },
];

export default function WeaveReading() {
  const [woven, setWoven] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          {woven
            ? "Woven: each reading sits against the activity it belongs to."
            : "Separate: reading on one side, activity on the other."}
        </p>
        <button
          type="button"
          onClick={() => setWoven((current) => !current)}
          className="inline-flex items-center rounded-full border border-natural bg-white px-4 py-1.5 text-[13px] text-teal-deep transition hover:border-teal-deep/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          {woven ? "Pull them apart" : "Weave them together"}
        </button>
      </div>

      {woven ? (
        <ol className="mt-5 space-y-4">
          {PAIRS.map((pair, index) => (
            <li
              key={pair.reading}
              className="rounded-md border border-natural bg-ivory/50 p-4 sm:grid sm:grid-cols-[1.1fr_1fr] sm:gap-5"
            >
              <p className="font-heading text-[15.5px] leading-relaxed text-teal-deep">{pair.reading}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft sm:mt-0 sm:border-l sm:border-copper/30 sm:pl-5">
                <span className="workbook-label mr-2">Step {index + 1}</span>
                {pair.step}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {["Reading", "The activity"].map((side, column) => (
            <div key={side} className="rounded-md border border-dashed border-natural-deep bg-ivory/40 p-4">
              <p className="workbook-label">{side}</p>
              <ul className="mt-3 space-y-3 text-[14px] leading-relaxed text-ink-soft">
                {PAIRS.map((pair) => (
                  <li key={pair.reading}>{column === 0 ? pair.reading : pair.step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}