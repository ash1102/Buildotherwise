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

const LOOP = ["Notice", "Try", "Reflect", "Decide"];

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

const PILOT_QUESTIONS = [
  "Could participants understand and engage with the activities?",
  "Were the experiments accessible, realistic and safe?",
  "Did participants learn something useful from what they tried?",
  "Were they able to make their own decisions about what to explore next?",
  "Which activities helped, which created confusion, and what needs to change?",
];

const marigoldButton =
  "inline-flex items-center gap-2 rounded-lg bg-primary-soft px-5 py-3 text-[15px] font-semibold text-foreground transition hover:brightness-95";

function InterestButton({ children = "Express interest in Pilot 1" }) {
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
        <p className="text-[13px] font-semibold text-primary-soft">Build Otherwise presents · Pilot 1</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,1.4rem+3.6vw,3.6rem)] leading-[1.05] tracking-tight text-primary-foreground">
          You don’t need your whole life figured out.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[18px] leading-relaxed text-primary-foreground/85">
          You need something worth testing. Start with a question, an ordinary task, or “I don’t know yet.” Try something
          small if you choose, and decide what comes next.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <InterestButton />
          <Link
            to="/login"
            className="inline-flex items-center rounded-lg border border-primary-foreground/50 px-5 py-3 text-[15px] font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
          >
            Log in
          </Link>
        </div>
        <ol className="mt-7 flex flex-wrap gap-2" aria-label="The learning loop">
          {LOOP.map((step, index) => (
            <li
              key={step}
              className={`rounded-full border px-3 py-1 text-[14px] ${
                index === LOOP.length - 1
                  ? "border-primary-soft bg-primary-soft text-foreground"
                  : "border-primary-foreground/40 text-primary-foreground"
              }`}
            >
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-[68ch]">
        <p className="workbook-label">Who this may fit</p>
        <h2 className="mt-1.5">You do not need a business idea to start.</h2>
        <ul className="mt-4 grid gap-2">
          {FIT.map((line) => (
            <li key={line} className="rounded-xl border border-border bg-card px-4 py-3 text-[17px] leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          Entrepreneurship is a real option, and the business-building skills are useful even if you never start one, but
          it is not a requirement.
        </p>
      </section>

      <section className="rounded-2xl bg-accent px-5 py-8 sm:px-8">
        <p className="workbook-label">One small example</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EXAMPLE.map((step) => (
            <div key={step.label} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-[18px] text-accent-ink">{step.label}</h3>
              <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground">{step.line}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          That does not mean “become a furniture restorer.” It means you know more than you did before.
        </p>
      </section>

      <section className="max-w-[68ch]">
        <p className="workbook-label">What Pilot 1 is testing</p>
        <h2 className="mt-1.5">Usable and useful, not proof of outcomes.</h2>
        <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">
          Pilot 1 is about whether the program is usable and useful, not proof that it produces recovery, jobs or
          businesses. We want to learn:
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
        <h2 className="text-primary-foreground">Help shape the first pilot.</h2>
        <div className="mt-5">
          <InterestButton>Express interest</InterestButton>
        </div>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-primary-foreground/80">
          Expressing interest is not enrollment. Researchers, educators, facilitators, workforce organizations and
          community partners can use the same form and pick the partner option.
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
