import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { useWorkbook } from "@/lib/workbook";
import { useAuth } from "@/lib/AuthContext";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import { isOpenerLesson } from "@/lib/curriculum";
import { buildProgress, stepComplete } from "@/lib/progress";

const INTEREST_FORM = "https://link.jotform.com/EhQXbmRwbk";

const STEPS = [
  {
    label: "Notice",
    does: "Pay attention to what keeps pulling at you.",
    example: "“I keep watching furniture-restoration videos.”",
  },
  {
    label: "Try",
    does: "Take one small step you can undo.",
    example: "Spend one Saturday refinishing a small table.",
  },
  {
    label: "Reflect",
    does: "Look at what actually happened, including what it cost.",
    example: "“Loved the hands-on work. Hated the fumes. Lost track of time.”",
  },
  {
    label: "Decide",
    does: "Choose your next move: keep going, change it, or drop it.",
    example: "Try it again, this time somewhere with ventilation.",
  },
];

const FIT = [
  "You want something different but can’t name it yet.",
  "You have too many directions and no way to choose.",
  "You keep trying things and can’t tell what fits.",
  "You have an interest you’re not ready to bet on.",
  "You’re done with personality tests and want an actual next step.",
];

const INCLUDES = [
  "Getting Started plus Modules 1–5, at your own pace",
  "Short lessons, each with a worked example",
  "Space to write, and one clear next decision at the end of every step",
  "No grades, scores or streaks",
  "Your writing stays on your device unless you choose to share it",
];

const PILOT_QUESTIONS = [
  "Does it make sense?",
  "Are the experiments realistic and safe to try?",
  "Do people learn something they can actually use?",
  "Do people stay in charge of their own decisions?",
  "Which parts help, and which get in the way?",
];

const marigoldButton =
  "inline-flex items-center gap-2 rounded-lg bg-primary-soft px-5 py-3 text-[15px] font-semibold text-foreground transition hover:brightness-95";

function InterestButton({ children = "Join the Pilot 1 list" }) {
  return (
    <a href={INTEREST_FORM} target="_blank" rel="noopener noreferrer" className={marigoldButton}>
      {children}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

/** Before login: a front door that explains the program and collects interest. No module list. */
function PublicHome() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-primary px-5 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <p className="text-[13px] font-semibold text-primary-soft">Entrepalooza · Pilot 1 · from Build Otherwise</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,1.4rem+3.6vw,3.6rem)] leading-[1.05] tracking-tight text-primary-foreground">
          You don’t need your whole life figured out.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[18px] leading-relaxed text-primary-foreground/85">
          You need one thing worth testing. Entrepalooza helps you try it small, see what actually happened, and choose
          your next move.
        </p>
        <div className="mt-6">
          <InterestButton />
        </div>
      </section>

      <section>
        <p className="workbook-label">How it works</p>
        <h2 className="mt-1.5">Four moves. That’s the whole method.</h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.label} className="rounded-xl border border-border bg-card p-5">
              <p className="text-[13px] font-semibold text-accent-ink">
                {index + 1} · {step.label}
              </p>
              <p className="mt-1.5 text-[17px] font-semibold leading-snug text-foreground">{step.does}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/70">Example: </span>
                {step.example}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
          That isn’t “become a furniture restorer.” It’s knowing more than you did before you tried.
        </p>
      </section>

      <section className="max-w-[68ch]">
        <p className="workbook-label">Who it’s for</p>
        <h2 className="mt-1.5">Start where you actually are.</h2>
        <ul className="mt-4 grid gap-2">
          {FIT.map((line) => (
            <li key={line} className="rounded-xl border border-border bg-card px-4 py-3 text-[17px] leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[17px] leading-relaxed text-foreground">
          No business idea required. Building one is on the table, though. Entrepalooza teaches the skills behind it:
          testing ideas cheaply, reading what’s working, and making calls without all the answers. Those skills come with
          you whether you start something or not. A job, training, a project or a pause are real answers here too.
        </p>
      </section>

      <section className="rounded-2xl bg-accent px-5 py-8 sm:px-8">
        <p className="workbook-label">What you get</p>
        <h2 className="mt-1.5">A workbook, not a lecture.</h2>
        <ul className="mt-4 space-y-2.5">
          {INCLUDES.map((line) => (
            <li key={line} className="flex gap-3 text-[17px] leading-relaxed">
              <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-[68ch]">
        <p className="workbook-label">About Pilot 1</p>
        <h2 className="mt-1.5">The pilot tests the program, not you.</h2>
        <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">
          We’re checking whether Entrepalooza is clear, doable and worth your time. We’re not promising jobs, income or
          business results. What participants tell us shapes what changes. The questions we’re asking:
        </p>
        <ol className="mt-4 space-y-2.5">
          {PILOT_QUESTIONS.map((question, index) => (
            <li key={question} className="flex gap-3 text-[17px] leading-relaxed">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-wash text-[13px] font-bold text-accent-ink">
                {index + 1}
              </span>
              <span>{question}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl bg-primary px-5 py-9 text-primary-foreground sm:px-10">
        <h2 className="text-primary-foreground">Want in on Pilot 1?</h2>
        <p className="mt-2 max-w-[60ch] text-[17px] leading-relaxed text-primary-foreground/85">
          Joining the list isn’t enrolling. It takes a couple of minutes, and you’ll hear from us when Pilot 1 opens.
        </p>
        <div className="mt-5">
          <InterestButton />
        </div>
        <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-primary-foreground/80">
          Researcher, educator, facilitator, or with a workforce or community organization? Use the same form and choose
          the partner option.
        </p>
      </section>
    </div>
  );
}

/** After login: pick up where you left off, then the tools, then progress. No marketing. */
function MemberHome() {
  const { modules, lessonsByOrder, orderedLessons, loading } = useCurriculum();
  const { answers, states } = useWorkbook();

  const progress = useMemo(
    () => buildProgress({ modules, lessonsByOrder, answers, states }),
    [modules, lessonsByOrder, answers, states]
  );

  /** The opener comes first, then every live step in order. The next step is the first one without a saved line. */
  const next = useMemo(() => {
    const opener = orderedLessons.find(isOpenerLesson);
    const rest = orderedLessons.filter((lesson) => !isOpenerLesson(lesson));
    const sequence = opener ? [opener, ...rest] : rest;
    return sequence.find((lesson) => !stepComplete(lesson, answers, states)) || null;
  }, [orderedLessons, answers, states]);

  const started = Object.values(answers || {}).some((value) => String(value || "").trim());
  const liveModules = modules.filter((module) => module.status === "live");
  const nextModule = next ? modules.find((module) => module.order === next.module_order) : null;
  const nextLabel = nextModule
    ? nextModule.kind === "orientation"
      ? "Getting Started"
      : `Module ${nextModule.order}`
    : "";

  return (
    <div className="space-y-10">
      <section>
        <p className="workbook-label">{started ? "Welcome back" : "Welcome"}</p>
        {loading ? (
          <div aria-busy="true" className="mt-3 h-[140px] animate-pulse rounded-2xl bg-border/60" />
        ) : next ? (
          <div className="mt-3 rounded-2xl bg-primary px-5 py-7 text-primary-foreground sm:px-8">
            <p className="text-[13px] font-semibold text-primary-soft">
              {started ? "Pick up where you left off" : "Start here"}
            </p>
            <h1 className="mt-1.5 text-[clamp(1.5rem,1.1rem+1.6vw,2.1rem)] text-primary-foreground">
              {isOpenerLesson(next) ? next.title : `${nextLabel} · ${next.title}`}
            </h1>
            {next.purpose ? (
              <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/85">{next.purpose}</p>
            ) : null}
            <Link to={`/lesson/${next.code}`} className={`mt-5 ${marigoldButton}`}>
              {started ? "Continue" : "Begin"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl bg-primary px-5 py-7 text-primary-foreground sm:px-8">
            <h1 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.1rem)] text-primary-foreground">
              Every Pilot 1 step has a saved line.
            </h1>
            <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/85">
              You can go back to any step, add to your journal, or look over your maps.
            </p>
            <Link to="/discovery-map" className={`mt-5 ${marigoldButton}`}>
              See what you gathered
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link to="/journal" className="rounded-xl border border-border bg-card p-4 transition hover:bg-secondary">
            <BookOpen className="h-5 w-5 text-accent-ink" aria-hidden="true" />
            <span className="mt-2 block font-semibold">Your Journal</span>
            <span className="block text-[15px] text-muted-foreground">Notes you have saved.</span>
          </Link>
          <Link to="/map" className="rounded-xl border border-border bg-card p-4 transition hover:bg-secondary">
            <Map className="h-5 w-5 text-accent-ink" aria-hidden="true" />
            <span className="mt-2 block font-semibold">Your Life Map</span>
            <span className="block text-[15px] text-muted-foreground">Places, activities, energy, barriers, threads.</span>
          </Link>
          <Link to="/aspects" className="rounded-xl border border-border bg-card p-4 transition hover:bg-secondary">
            <Compass className="h-5 w-5 text-accent-ink" aria-hidden="true" />
            <span className="mt-2 block font-semibold">How the workbook works</span>
            <span className="block text-[15px] text-muted-foreground">The pieces you will use.</span>
          </Link>
        </div>
      </section>

      <section>
        <p className="workbook-label">Your progress · Pilot 1</p>
        <ol className="mt-3 grid gap-2">
          {liveModules.map((module) => {
            const row = progress.byOrder[module.order];
            if (!row) return null;
            const pct = row.stepCount ? Math.round((row.writtenCount / row.stepCount) * 100) : 0;
            const open = row.unlocked;
            const content = (
              <span className="flex items-center justify-between gap-4">
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-accent-ink">{row.label}</span>
                  <span className="block text-[16px] leading-snug text-foreground">{module.title}</span>
                </span>
                {open ? (
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="sr-only">
                      {row.writtenCount} of {row.stepCount} steps saved
                    </span>
                    <span aria-hidden="true" className="h-2 w-20 overflow-hidden rounded-full bg-secondary sm:w-28">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </span>
                  </span>
                ) : (
                  <span className="shrink-0 text-[13px] text-muted-faint">Not open yet</span>
                )}
              </span>
            );
            return (
              <li key={module.id || module.slug}>
                {open ? (
                  <Link
                    to={module.kind === "orientation" ? "/getting-started" : `/module/${module.slug}`}
                    className="block rounded-xl border border-border bg-card px-4 py-3 transition hover:bg-secondary"
                  >
                    {content}
                  </Link>
                ) : (
                  <div aria-disabled="true" className="rounded-xl border border-border bg-card px-4 py-3 opacity-80">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-faint">
          Modules open one at a time, once every step before them holds a saved line. Modules 6–10 are still being built.
        </p>
      </section>

      <PrivacyNote />
    </div>
  );
}

export default function CurriculumHome() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  /** Wait for the login check so a signed-in person never sees the front door flash first. */
  if (isLoadingAuth) return <div aria-busy="true" className="min-h-[60vh]" />;
  return isAuthenticated ? <MemberHome /> : <PublicHome />;
}
