import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LOOP = [
  { name: "Notice", body: "what keeps holding your attention" },
  { name: "Try", body: "one small, reversible step in real life" },
  { name: "Reflect", body: "on what actually happened and what it cost" },
  { name: "Decide", body: "what comes next, on your terms" },
];

const DECISIONS = ["Keep", "Change", "Test again", "Pause", "Stop", "Another direction", "Keep looking"];

export default function Programs() {
  return (
    <article className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Build Otherwise</p>
        <h1 className="mt-2">Programs</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          What Build Otherwise does today, and what we’re building toward.
        </p>
      </header>

      <section className="workbook-section space-y-4">
        <div>
          <p className="workbook-label">Flagship program</p>
          <h2 className="mt-1 text-[22px]">Entrepalooza</h2>
          <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
            A self-paced online workbook for adults in the middle of a change who want to test what comes next in real
            life, not just plan it on paper. It’s written for people navigating a transition, including people in
            recovery or reentry. You don’t need a business idea, a passion or a personal story to start.
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-foreground">How it works</h3>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LOOP.map((step, index) => (
              <li key={step.name} className="border-t-2 border-border pt-3">
                <span className="text-[13px] text-muted-faint">0{index + 1}</span>
                <span className="block text-[17px] font-semibold text-foreground">{step.name}</span>
                <span className="block text-[15px] leading-snug text-muted-foreground">{step.body}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-foreground">Every decision counts</h3>
          <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
            Across the workbook, you can make choices like these. Not every lesson uses the same options, and you can pause or skip without explaining:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {DECISIONS.map((decision) => (
              <li
                key={decision}
                className="rounded-md border border-input bg-card px-2.5 py-1 text-[14px] text-foreground"
              >
                {decision}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-foreground">What’s included</h3>
          <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-muted-foreground">
            <li>Getting Started and Modules 1–5 are available in the current pilot. Later modules are still in development.</li>
            <li>A private journal and a Life Map to see your own patterns.</li>
            <li>Tribe Threads, group discussions where you post only if you choose to.</li>
            <li>No grades, scores or streaks.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-foreground">Format</h3>
          <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
            Online and self-paced. The current pilot includes Getting Started and five modules. The pilot tests the program, not you: whether it’s clear,
            doable and worth your time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/getting-started"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Start the workbook
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
          >
            More about Entrepalooza
          </Link>
        </div>
      </section>

      <section className="workbook-section">
        <p className="workbook-label">In development</p>
        <h2 className="mt-1 text-[18px]">Working with community organizations</h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          We’re talking with community organizations about running Entrepalooza alongside the work they already do. If
          your organization supports adults in transition, we’d like to hear from you.
        </p>
        <div className="mt-4">
          <Link
            to="/get-involved"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
          >
            Talk about partnering
          </Link>
        </div>
      </section>

      <section id="where-we-draw-the-line" className="workbook-section scroll-mt-24">
        <h2 className="text-[18px]">Where we draw the line</h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">Entrepalooza is education. We don’t:</p>
        <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-muted-foreground">
          <li>Offer therapy, treatment, diagnosis or crisis support.</li>
          <li>Promise a job, an income or business success.</li>
          <li>Decide your direction for you.</li>
          <li>Test whether you’re ready.</li>
        </ul>
      </section>
    </article>
  );
}
