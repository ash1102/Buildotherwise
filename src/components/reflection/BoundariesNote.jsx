import React from "react";

const ITEMS = [
  "No diagnosis, personality types, or guesses at hidden motives.",
  "No scoring of readiness, motivation, purpose, or potential.",
  "No action plan unless you ask for one.",
  "Only your entries, brought in by you. Never anyone else's journal.",
  "A carry-forward note is drafted for your approval, never saved for you.",
];

export default function BoundariesNote() {
  return (
    <section className="space-y-3">
      <p className="workbook-label">What this reflection will not do</p>
      <ul className="space-y-2 text-[13px] leading-relaxed text-ink-soft">
        {ITEMS.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}