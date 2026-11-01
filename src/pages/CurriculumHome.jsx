import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Archive, ArrowRight, ArrowUpRight, BookOpen, Layers, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { useLifeMap, useWorkbook } from "@/lib/workbook";
import { MAP_PICK_KEY, lifeMapHasEntries } from "@/lib/lifeMap";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import { isWorkbookLesson } from "@/lib/curriculum";
import WorkbookGate from "@/components/WorkbookGate";
import DiscoveryStart from "@/components/discovery/DiscoveryStart";
import { stepComplete } from "@/lib/progress";
import { usePacedProgress } from "@/lib/pacing";
import { moduleProgressDescription, moduleProgressLabel } from "@/lib/progressLabel";

const INTEREST_FORM = "https://link.jotform.com/EhQXbmRwbk";

/** Public front door, "Option B" (bold plum), restored Oct 24 with facts updated to match the app today. */
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
  "Getting Started plus ten modules, at your own pace",
  "Short lessons, each with a worked example",
  "Space to write, and one clear next decision at the end of every step",
  "No grades, scores or streaks",
  "What you write is saved to your account. Other participants can’t see it, and sharing is always your choice.",
];

const PILOT_QUESTIONS = [
  "Does it make sense?",
  "Are the experiments realistic and safe to try?",
  "Do people learn something they can actually use?",
  "Do people stay in charge of their own decisions?",
  "Which parts help, and which get in the way?",
];

/**
 * Marigold buttons (member dashboard and public Start now). Fixed dark plum text so the label stays readable on marigold in dark mode,
 * where text-foreground turns light.
 */
const dashboardButton =
  "inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-soft px-5 py-3 text-[15px] font-semibold text-[hsl(277_34%_16%)] transition hover:brightness-95";

function StartButton() {
  return (
    <Link to="/getting-started" className={dashboardButton}>
      Start now
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/** Before login: a front door that explains the program. No module list. */
function PublicHome() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-primary px-5 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <p className="text-[13px] font-semibold text-primary-soft">Entrepalooza · Pilot 1 · online · from Build Otherwise</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,1.4rem+3.6vw,3.6rem)] leading-[1.05] tracking-tight text-primary-foreground">
          You don’t need your whole life figured out.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[18px] leading-relaxed text-primary-foreground/85">
          You need one thing worth testing. Entrepalooza helps you try it small, see what actually happened, and choose
          your next move.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <StartButton />
          <a
            href="#how"
            className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-primary-foreground underline underline-offset-4"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="how">
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
          Pilot 1 is online and open now. Begin whenever you like, and join the list if you want updates.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <StartButton />
          <a
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-primary-foreground underline underline-offset-4"
          >
            Join the list for updates
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-primary-foreground/80">
          Researcher, educator, facilitator, or with a workforce or community organization?{" "}
          <Link to="/get-involved" className="font-semibold text-primary-foreground underline underline-offset-2">
            Help shape the first pilot
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

/** After login, and after Getting Started: pick up where you left off, then the tools, then progress. */
function MemberHome() {
  const { modules, lessonsByOrder, orderedLessons, loading } = useCurriculum();
  const { answers, states } = useWorkbook();
  const map = useLifeMap();
  const [pick] = useStore(MAP_PICK_KEY, {});
  const mapPlaced = lifeMapHasEntries(map, pick);

  const progress = usePacedProgress({ modules, lessonsByOrder, answers, states });

  /** The welcome is done. Module 1 comes next. The Life Map is optional and never holds anything shut. */
  const next = useMemo(() => {
    return orderedLessons.find((lesson) => isWorkbookLesson(lesson) && !stepComplete(lesson, answers, states)) || null;
  }, [orderedLessons, answers, states]);

  const started = orderedLessons.some((lesson) => isWorkbookLesson(lesson) && stepComplete(lesson, answers, states));
  const liveModules = modules.filter((module) => module.status === "live" && module.kind !== "orientation");
  const nextModule = next ? modules.find((module) => module.order === next.module_order) : null;
  const nextLabel = nextModule ? `Module ${nextModule.order}` : "";

  /** "Skip discovery": go straight to the module list. Respects reduced motion and moves focus there. */
  const goToWorkbook = useCallback(() => {
    const target = document.getElementById("workbook");
    if (!target) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }, []);

  const toolLink = "flex min-h-[44px] items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <div className="dashboard-plum space-y-10">
      {loading ? (
        <div aria-busy="true" className="h-[220px] animate-pulse rounded-2xl bg-border/60" />
      ) : (
        <>
          {/* Discovery leads the page and holds the h1. "Continue where you left off" is a smaller, secondary card right below it. */}
          <div className="space-y-4">
            <DiscoveryStart onSkip={goToWorkbook} headingLevel="h1" />

            {started && next ? (
              <section aria-labelledby="continue-heading" className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
                  <div className="min-w-0 flex-1 basis-[16rem]">
                    <p className="text-[13px] font-semibold text-accent-ink">Continue where you left off</p>
                    <h2 id="continue-heading" className="mt-1 text-[17px] leading-snug text-foreground">
                      {nextLabel ? `${nextLabel} · ${next.title}` : next.title}
                    </h2>
                  </div>
                  <Link to={`/lesson/${next.code}`} className={dashboardButton}>
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </section>
            ) : null}
          </div>

          <nav aria-label="Your tools">
            <ul className="grid gap-3 sm:grid-cols-2">
              <li>
                <Link to="/journal" className={toolLink}>
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">Your Journal</span>
                    <span className="block text-[15px] text-muted-foreground">Notes you have saved.</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/map" className={toolLink}>
                  <Map className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">Your Life Map</span>
                    <span className="block text-[15px] text-muted-foreground">
                      {mapPlaced
                        ? "Recent places, activities, people, observations, and possible threads."
                        : "Optional. A way to look at where your time and energy go, whenever it’s useful."}
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <button type="button" onClick={goToWorkbook} className={`${toolLink} w-full`}>
                  <Layers className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">Explore the Workbook</span>
                    <span className="block text-[15px] text-muted-foreground">All five modules, open in any order.</span>
                  </span>
                </button>
              </li>
              <li>
                <Link to="/my-records" className={toolLink}>
                  <Archive className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">Records</span>
                    <span className="block text-[15px] text-muted-foreground">What you chose to keep.</span>
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}

      <section aria-labelledby="workbook">
        <p className="workbook-label">Your progress · Pilot 1</p>
        <h2 id="workbook" tabIndex={-1} className="mt-1 text-[22px] outline-none">
          Explore the Workbook
        </h2>
        <ol className="mt-3 grid gap-2">
          {liveModules.map((module) => {
            const row = progress.byOrder[module.order];
            if (!row) return null;
            const pct = row.stepCount ? Math.round((row.writtenCount / row.stepCount) * 100) : 0;
            const status = moduleProgressLabel(row);
            const content = (
              <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-accent-ink">{row.label}</span>
                  <span className="block text-[16px] leading-snug text-foreground">{module.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span aria-hidden="true" className={`text-[13px] font-medium ${status.muted ? "text-muted-faint" : "text-foreground"}`}>
                    {status.text}
                  </span>
                  <span className="sr-only">{moduleProgressDescription(row)}</span>
                  <span aria-hidden="true" className="h-2 w-20 overflow-hidden rounded-full bg-secondary sm:w-28">
                    <span className="block h-full rounded-full bg-accent-ink" style={{ width: `${pct}%` }} />
                  </span>
                </span>
              </span>
            );
            return (
              <li key={module.id || module.slug}>
                <Link
                  to={`/module/${module.slug}`}
                  className="block rounded-xl border border-border bg-card px-4 py-3 transition hover:bg-secondary"
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-faint">
          Explore the modules at your own pace. You can move between activities, revisit earlier discoveries, and return
          whenever you’re ready. There’s no required order or deadline.{" "}
          <Link to="/aspects" className="font-medium text-accent-ink underline underline-offset-2">
            How the workbook works
          </Link>
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
  if (!isAuthenticated) return <PublicHome />;
  return (
    <WorkbookGate>
      <MemberHome />
    </WorkbookGate>
  );
}
