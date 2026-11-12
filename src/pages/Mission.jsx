import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BELIEFS = [
  {
    title: "You stay in charge",
    body: "People make their own decisions here. Support should never turn into control, and you can pass on anything.",
  },
  {
    title: "Hardship isn’t a requirement",
    body: "We don’t assume suffering is good for anyone, and nobody has to turn their story into something productive. Skills people built just to get through can still count.",
  },
  {
    title: "Many answers are complete",
    body: "A job, training, a project, a business, a pause, or still looking. Building a business is a real option, not the default.",
  },
  {
    title: "Evidence before claims",
    body: "We’re early. We test what we build, say what we don’t know yet, and don’t claim results we haven’t measured.",
  },
];

export default function Mission() {
  return (
    <article className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Build Otherwise</p>
        <h1 className="mt-2">Mission and vision</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Build Otherwise pushes back on the scripts that decide who gets taken seriously. We build hands-on
          learning in Houston for adults deciding what comes next.
        </p>
      </header>

      <section className="workbook-section">
        <h2 className="text-[18px]">The problem</h2>
        <div className="workbook-prose mt-2 max-w-[68ch]">
          <p>
            Many adults reach a point where the old path has ended or stopped fitting: after addiction, after
            incarceration, after a job ends, or after a long stretch of just getting through. Most of the help on offer
            either picks the next step for them or asks for a plan they don’t have yet.
          </p>
          <p>
            What’s often missing is room to find out. A safe way to try small things in real life, look honestly at what
            happened, and choose for yourself, with people around you who aren’t steering.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="workbook-section">
          <p className="workbook-label">Mission</p>
          <p className="mt-2 text-[17px] leading-relaxed text-foreground">
            We help adults in transition notice what holds their attention, test it through small real-world steps,
            reflect on what actually happened, and decide their own next direction.
          </p>
        </section>
        <section className="workbook-section">
          <p className="workbook-label">Vision</p>
          <p className="mt-2 text-[17px] leading-relaxed text-foreground">
            A world where people coming through hard stretches get the time, tools and community to build a life and
            work that fit them, instead of being handed a path.
          </p>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-[18px]">What we believe</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BELIEFS.map((belief) => (
            <div key={belief.title} className="workbook-section">
              <h3 className="text-[16px] font-semibold text-foreground">{belief.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{belief.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="workbook-section">
        <h2 className="text-[18px]">The framework</h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Our programs are built on Scars to Strategy, a framework for looking at difficult experiences, unconventional
          strengths and survival skills as possible assets. It never asks anyone to say their hardship was worth it.
        </p>
      </section>

      <section className="workbook-section">
        <h2 className="text-[18px]">Where we are now</h2>
        <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-muted-foreground">
          <li>Our first program, Entrepalooza, is in its first pilot. There are no results to report yet.</li>
          <li>Build Otherwise is not yet a registered nonprofit. We’re working toward fiscal sponsorship.</li>
          <li>We’re looking for partners, volunteers and reviewers to help shape the first pilot.</li>
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to="/get-involved"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Get involved
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
          >
            See our programs
          </Link>
        </div>
      </section>
    </article>
  );
}
