import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";

/** A small branching thread: each answer opens the question that follows it. */
const NODES = {
  start: {
    question: "What held your attention this week?",
    pulls: [
      { label: "Something at work", next: "work" },
      { label: "A conversation I keep replaying", next: "talk" },
      { label: "Something I used to love", next: "old" },
      { label: "Nothing stands out yet", next: "quiet" },
    ],
  },
  work: {
    question: "What is the smallest part of it you could try?",
    pulls: [
      { label: "A twenty-minute task", next: "end" },
      { label: "Ask one person about it", next: "end" },
    ],
  },
  talk: {
    question: "What was actually said, apart from how it felt?",
    pulls: [
      { label: "A question I could not answer", next: "end" },
      { label: "Something I disagreed with", next: "end" },
    ],
  },
  old: {
    question: "When did you last do it, even badly?",
    pulls: [
      { label: "Within the last year", next: "end" },
      { label: "Longer ago than I like", next: "end" },
    ],
  },
  quiet: {
    question: "What have you stopped noticing lately?",
    pulls: [{ label: "Let me sit with that", next: "end" }],
  },
};

export default function PullThread() {
  const [trail, setTrail] = useState([]);
  const current = NODES[trail.length === 0 ? "start" : trail[trail.length - 1].next];

  const pull = (option) => setTrail((current) => [...current, option]);

  if (!current) {
    return (
      <div>
        <p className="font-heading text-xl text-ink">That is a thread worth keeping.</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Nothing has to come of it yet. In the workbook, threads like this are the raw material for a small try — or
          for a deliberate pause.
        </p>
        <ol className="mt-4 space-y-1.5 text-[13.5px] text-ink-soft">
          {trail.map((option) => (
            <li key={option.label}>{option.label}</li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            to="/map"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[15px] text-primary-foreground transition hover:bg-teal-deep/90"
          >
            Open your Life Map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setTrail([])}
            className="inline-flex items-center gap-2 text-[13px] text-ink-faint transition hover:text-copper"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Pull another thread
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {trail.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {trail.map((option) => (
            <span
              key={option.label}
              className="rounded-full border border-natural bg-ivory/60 px-3 py-1 text-[12.5px] text-ink-faint"
            >
              {option.label}
            </span>
          ))}
        </div>
      ) : null}

      <h3 className={`font-heading text-xl ${trail.length > 0 ? "mt-4" : ""}`}>{current.question}</h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {current.pulls.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => pull(option)}
            className="rounded-full border border-natural bg-white px-4 py-2 text-[13.5px] text-ink-soft transition hover:border-copper/50 hover:text-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}