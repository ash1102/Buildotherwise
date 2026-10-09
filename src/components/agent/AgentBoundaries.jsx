import React from "react";
import { Eye, Lock, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: Eye,
    title: "Only what is brought in",
    body: "The agent works with the words in the thread. It cannot open, search, or list journals or workbook answers on its own.",
  },
  {
    icon: Lock,
    title: "One person's own threads",
    body: "A conversation belongs to the token that started it, so a thread stays with the person who began it.",
  },
  {
    icon: ShieldCheck,
    title: "Reflection, not treatment",
    body: "It asks questions and offers language for thinking. It is not therapy, it is not a facilitator, and it does not decide anything for anyone.",
  },
];

/** What the reflection agent can and cannot reach, stated plainly. */
export default function AgentBoundaries() {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl">What the connection can reach</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {POINTS.map((point) => (
          <div key={point.title} className="workbook-card p-5">
            <point.icon aria-hidden="true" className="h-4 w-4 text-copper" />
            <h3 className="mt-3 font-heading text-base">{point.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{point.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}