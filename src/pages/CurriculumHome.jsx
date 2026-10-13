import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { useWorkbook } from "@/lib/workbook";
import { useAuth } from "@/lib/AuthContext";
import ModuleMap from "@/components/workbook/ModuleMap";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import OpenerCard from "@/components/workbook/OpenerCard";
import { OPENER_LESSON_CODE, isOpenerLesson } from "@/lib/curriculum";

const CYCLE = [
  { label: "Notice", line: "What keeps holding your attention, without turning it into identity." },
  { label: "Try", line: "One small, bounded, reversible try with a stop rule written before you start." },
  { label: "Reflect", line: "What actually happened, what it cost, and what is still unknown." },
  { label: "Decide", line: "Keep, change, test again, pause, stop, another direction, or continue looking." },
];

const INTEREST_FORM = "https://link.jotform.com/EhQXbmRwbk";

const FIT = [
  "You know you want something different but do not know what yet.",
  "You have several possible directions and do not know which deserves your attention.",
  "You keep trying things but struggle to tell what actually fits.",
  "You have an interest but are not ready to turn it into a career or business.",
  "You want a practical next step instead of another personality test.",
];

const EXAMPLE = [
  { label: "Notice", line: "“I keep watching furniture-restoration videos.”" },
  { label: "Try", line: "Spend one Saturday helping refinish a small piece." },
  { label: "Reflect", line: "“I liked the hands-on work, hated the fumes, and lost track of time.”" },
  { label: "Decide", line: "Learn more, but next time test it in a ventilated workshop." },
];

const PATHS = ["Job", "Training", "Collaboration", "Project", "Entrepreneurship", "Keep Looking", "Pause"];

export default function CurriculumHome() {
  const { modules, lessonsByOrder, loading } = useCurriculum();
  const { answers, decisions, states } = useWorkbook();
  const { isAuthenticated } = useAuth();
  /** Getting Started is the doorway, not a module, so it sits apart from the numbered list. */
  const gettingStarted = modules.find((module) => module.kind === "orientation");
  /** The opener stands before Getting Started, so it is not counted as one of those steps. */
  const orientationLessons = gettingStarted ? lessonsByOrder[gettingStarted.order] || [] : [];
  const openerLesson = orientationLessons.find(isOpenerLesson) || null;
  const gettingStartedSteps = orientationLessons.filter((lesson) => !isOpenerLesson(lesson)).length;

  return (
    <div className="space-y-10">
      <section className="max-w-[68ch]">
        <p className="workbook-label">Build Otherwise · Entrepalooza · Pilot 1</p>
        <h1 className="mt-2">Want something different? Start with something you can try.</h1>
        <p className="mt-3 text-[18px] leading-relaxed text-muted-foreground">
          Start with a question, an ordinary task, or “I don’t know yet.” Explore what holds your attention, try something
          small if you choose, and decide what comes next. A job, training, a project, a pause, or continued exploration
          are all valid directions. Entrepreneurship is a real option, and the business-building skills are useful even if you
          never start one, but it is not a requirement.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            to={`/lesson/${OPENER_LESSON_CODE}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Start here: map your life
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2.5 text-[15px] font-medium text-foreground transition hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Open your Journal
              </Link>
              <Link to="/map" className="inline-flex items-center gap-2 text-[15px] font-medium text-accent-ink underline underline-offset-2">
                <Map className="h-4 w-4" aria-hidden="true" />
                View your Life Map
              </Link>
              <Link
                to="/aspects"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-accent-ink underline underline-offset-2"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                How the workbook works
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2.5 text-[15px] font-medium text-foreground transition hover:bg-secondary"
            >
              Log in
            </Link>
          )}
        </div>
        <a
          href={INTEREST_FORM}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          Express interest in Pilot 1
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-muted-faint">
          Expressing interest is not enrollment. Researchers, educators, facilitators, workforce organizations and
          community partners can use the same form and pick the partner option.
        </p>
        {isAuthenticated ? null : (
          <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
            The journal, the maps and the numbered modules open once you log in. Getting Started is open to everyone.
          </p>
        )}
        <div className="mt-5">
          <PrivacyNote />
        </div>
      </section>

      <OpenerCard lesson={openerLesson} />

      <section className="max-w-[68ch]">
        <h2 className="workbook-label">Who this may fit</h2>
        <h2 className="mt-1.5">You do not need a business idea to start.</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[17px] leading-relaxed text-muted-foreground">
          {FIT.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="workbook-label">The cycle you will use again and again</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CYCLE.map((step, index) => (
            <div key={step.label} className="rounded-xl border border-border bg-card p-4">
              <span className="text-[14px] font-semibold text-accent-ink">{`0${index + 1}`}</span>
              <h3 className="mt-1.5 text-[18px]">{step.label}</h3>
              <p className="mt-1.5 text-[16px] leading-relaxed text-muted-foreground">{step.line}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-border bg-secondary p-4 sm:p-5">
          <p className="workbook-label">One small example</p>
          <div className="mt-2 space-y-1.5 text-[16px] leading-relaxed text-foreground">
            {EXAMPLE.map((step) => (
              <p key={step.label}>
                <strong className="font-semibold">{step.label}:</strong> {step.line}
              </p>
            ))}
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            That does not mean “become a furniture restorer.” It means you know more than you did before.
          </p>
        </div>
      </section>

      <section className="max-w-[68ch]">
        <h2 className="workbook-label">Where this can lead</h2>
        <h2 className="mt-1.5">There isn’t one acceptable ending.</h2>
        <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">
          The point is to make a more informed next choice.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PATHS.map((path) => (
            <span key={path} className="rounded-full border border-input bg-card px-3 py-1 text-[15px] text-foreground">
              {path}
            </span>
          ))}
        </div>
      </section>

      {loading || gettingStarted ? (
        <section>
          <h2 className="workbook-label">Start here · its own short sequence</h2>
          {loading ? (
            <div aria-busy="true" className="mt-3 min-h-[120px] rounded-xl border border-border bg-card p-5">
              <div className="h-6 w-52 animate-pulse rounded bg-border" />
              <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-border/70" />
              <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded bg-border/70" />
            </div>
          ) : (
            <Link
              to="/getting-started"
              className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:bg-secondary sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            >
              <span className="min-w-0">
                <span className="block text-[19px] font-semibold text-foreground">
                  {gettingStarted.subtitle || "Getting Started"}
                </span>
                {gettingStarted.purpose ? (
                  <span className="mt-1 block max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
                    {gettingStarted.purpose}
                  </span>
                ) : null}
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-accent-ink">
                {gettingStartedSteps} steps
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          )}
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="workbook-label">The program</h2>
            <h2 className="mt-1.5">Getting Started, then ten modules</h2>
          </div>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted-faint">
            Pilot 1 covers Getting Started and Modules 1–5. Modules 6–10 are still being built, and they are listed
            plainly so you can see where the program is going. They open one at a time: Getting Started first, then each
            module once every step before it holds a line.
          </p>
        </div>
        <div className="mt-5">
          <ModuleMap
            loading={loading}
            modules={modules}
            lessonsByOrder={lessonsByOrder}
            answers={answers}
            decisions={decisions}
            states={states}
          />
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
        <h2 className="workbook-label">How your writing is treated</h2>
        <div className="mt-3 space-y-3 text-[17px] leading-relaxed text-muted-foreground">
          <p>
            <strong className="font-semibold text-foreground">Saving</strong> keeps your words on this device, attached to the
            step where you wrote them. Clearing this browser's site data or switching devices removes them, so use Export on
            a journal entry if you want a copy.
          </p>
          <p>
            <strong className="font-semibold text-foreground">Sharing</strong> is separate, voluntary, and per entry. You
            choose exactly what the program creator receives.
          </p>
        </div>
      </section>
    </div>
  );
}