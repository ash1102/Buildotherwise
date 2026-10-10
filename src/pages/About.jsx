import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DashedMotif from "@/components/workbook/DashedMotif";

export default function About() {
  return (
    <article className="space-y-10">
      <header>
        <div className="flex items-center gap-4">
          <DashedMotif size="lg" />
          <p className="workbook-label">ABOUT · BUILD OTHERWISE · PILOT 1</p>
        </div>
        <h1 className="mt-4 max-w-3xl font-heading text-3xl leading-[1.15] sm:text-4xl">
          About Entrepalooza
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          A self-paced workbook for adults who are in the middle of a change and want to test what comes next in real
          life, rather than plan it in theory.
        </p>
      </header>

      <div className="workbook-prose max-w-2xl space-y-4">
        <p>
          Entrepalooza is a guided workbook built around four moves: Notice, Try, Reflect and Decide. You start with a
          question, an ordinary task or simply “I don’t know yet.” You notice what keeps holding your attention. If you
          choose, you take one small, bounded, reversible step. You look honestly at what actually happened and what it
          cost. Then you decide what is next.
        </p>
        <p>
          The program is Getting Started plus ten modules, and each step follows the same shape: a short teaching block,
          a neutral worked example, a choice of how you want to take part, somewhere to write, and a Next Decision. There
          are no grades, no scores and no streak to keep. One written line counts as taking part. Writing stays in your
          own browser and joins your private journal, and it only leaves that browser if you deliberately share a
          specific entry.
        </p>
        <p>
          It is written for adults navigating a transition: a job that has ended or worn thin, training you are weighing
          up, a project or creative idea you want to test, a pause you need to protect, or a period of not knowing what
          interests you yet. You do not need a business idea, a passion or a personal story to begin. Employment,
          training, further study, a project or venture, a pause and continuing to look are all complete answers here.
          Entrepreneurship is one possibility, not the goal.
        </p>
        <p>
          Entrepalooza is built by the team at Build Otherwise. Pilot 1 is the current release: Getting Started and
          Modules 1–5, with Modules 6–10 still in development and named plainly so you can see where the program is
          going. Nothing in the workbook promises a job, an income, recovery or business success. It is an educational
          workbook, not therapy, treatment or diagnosis, and it is not a readiness test.
        </p>
      </div>

      <div className="rounded-lg border border-natural bg-white p-5 sm:p-6">
        <p className="workbook-label">Reach the program team</p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Questions about the workbook, the pilot, or how your writing is stored are welcome. There is a contact form on
          the contact page, and every step also carries a separate feedback box.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2 text-[13px] text-ivory transition hover:bg-teal-deep/90"
          >
            Contact the program team
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-natural bg-white px-4 py-2 text-[13px] text-teal-deep transition hover:border-teal-deep/50"
          >
            Start the workbook
          </Link>
        </div>
      </div>
    </article>
  );
}