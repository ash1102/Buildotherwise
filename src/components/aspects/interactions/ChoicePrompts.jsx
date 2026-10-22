import React, { useState } from "react";

/** The decision menu, and the prompt each choice changes into. */
const CHOICES = [
  {
    label: "Keep",
    prompt: "What tells you it is worth continuing, and what would make you stop?",
  },
  {
    label: "Change",
    prompt: "What is the one thing you would change, and what stays the same?",
  },
  {
    label: "Test again",
    prompt: "What would a fairer second test look like, and when would it end?",
  },
  {
    label: "Pause",
    prompt: "What would you need to know before you pick this up again?",
  },
  {
    label: "Stop",
    prompt: "What did stopping give you back?",
  },
  {
    label: "Another direction",
    prompt: "Which thread are you leaving open on purpose?",
  },
  {
    label: "Keep looking",
    prompt: "What would make the next thing worth pulling on?",
  },
];

export default function ChoicePrompts() {
  const [selected, setSelected] = useState(null);
  const choice = CHOICES.find((item) => item.label === selected) || null;

  return (
    <div>
      <p className="text-[14px] leading-relaxed text-ink-soft">
        Seven choices, equal weight. Pick one and watch what the workbook asks next.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHOICES.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setSelected(item.label)}
            aria-pressed={selected === item.label}
            className={`rounded-full border px-4 py-2 text-[13.5px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
              selected === item.label
                ? "border-copper bg-copper-wash text-ink"
                : "border-natural bg-card text-ink-soft hover:border-teal-deep/50 hover:text-teal-deep"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-dashed border-teal-deep/40 bg-teal-deep-wash/50 p-4">
        {choice ? (
          <>
            <p className="workbook-label">You chose: {choice.label}</p>
            <p className="mt-2 font-heading text-[17px] leading-relaxed text-ink">{choice.prompt}</p>
          </>
        ) : (
          <p className="text-[14px] leading-relaxed text-ink-faint">
            The next prompt appears here once you choose.
          </p>
        )}
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
        A saved choice can be revisited later. Nothing here is locked in.
      </p>
    </div>
  );
}