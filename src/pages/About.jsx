import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <article className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">About</p>
        <h1 className="mt-2">About Entrepalooza</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          A self-paced workbook for adults who are in the middle of a change and want to test what comes next in real
          life, rather than plan it in theory.
        </p>
      </header>

      <div className="workbook-prose space-y-4">
        <p>
          Entrepalooza is a guided workbook built around four moves: Notice, Try, Reflect and Decide. You start with a
          question, an ordinary task or simply “I don’t know yet.” You notice what keeps holding your attention. If you
          choose, you take one small, bounded, reversible step. You look honestly at what actually happened and what it
          cost. Then you decide what is next.
        </p>
        <p>
          The program is Getting Started plus ten modules, and each step follows the same shape: a short teaching block,
          a worked example, a choice of how you want to take part, somewhere to write, and a Next Decision. There are
          no grades, no scores and no streak to keep. Saved on this device only.
        </p>
        <p>
          It is written for adults navigating a transition: a job that has ended or worn thin, training you are weighing
          up, a project or creative idea you want to test, a pause you need to protect, or a period of not knowing what
          interests you yet. You do not need a business idea, a passion or a personal story to begin. Employment,
          training, further study, a project or venture, a pause and continuing to look are all complete answers here.
          Entrepreneurship is a real option, and the business-building skills are useful even if you never start one,
          but it is not the goal everyone has to reach.
        </p>
        <p>
          Entrepalooza is built by the team at Build Otherwise and grounded in Scars to Strategy, the Build Otherwise
          framework: the idea that hard-won experience, unconventional strengths and survival skills can sometimes become
          real assets. Not because hardship is good, and not because anyone owes a comeback story. Pilot 1 is the current release: Getting Started and
          Modules 1–5, with Modules 6–10 still in development and named plainly so you can see where the program is
          going. Nothing in the workbook promises a job, an income, recovery or business success. It is an educational
          workbook, not therapy, treatment or diagnosis, and it is not a readiness test.
        </p>
      </div>

      <div className="workbook-section">
        <h2 className="text-[18px]">Reach the program team</h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Questions about the workbook, the pilot, or how your writing is stored are welcome. There is a contact form on
          the contact page, and every step also carries a separate feedback box.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Contact the program team
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
          >
            Start the workbook
          </Link>
        </div>
      </div>
    </article>
  );
}