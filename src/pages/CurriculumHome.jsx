import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, Map } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import { useWorkbook } from "@/lib/workbook";
import { useAuth } from "@/lib/AuthContext";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import { isWorkbookLesson } from "@/lib/curriculum";
import WorkbookGate from "@/components/WorkbookGate";
import { stepComplete } from "@/lib/progress";
import { formatOpenDate, usePacedProgress } from "@/lib/pacing";

const INTEREST_FORM = "https://link.jotform.com/EhQXbmRwbk";

const FAMILIAR = ["Too many directions", "Can’t tell what fits", "Not ready to bet on it", "Done with personality tests"];

const STEPS = [
  { label: "Notice", line: "What keeps pulling at you." },
  { label: "Try", line: "One small step you can undo." },
  { label: "Reflect", line: "What actually happened, and what it cost." },
  { label: "Decide", line: "Keep going, change it, or drop it." },
];

const FACTS = [
  {
    title: "Private",
    dot: "#E9A23B",
    line: "What you write stays in your browser. An account only holds what you choose to save or send.",
  },
  { title: "No pressure", dot: "#B48CD0", line: "No grades, scores or streaks. Stopping or pausing counts as an answer." },
  {
    title: "Honest",
    dot: "#1C1720",
    line: "The pilot tests the program, not you. No promises of jobs, income or business results.",
  },
];

const marigoldButton =
  "inline-flex items-center gap-2 rounded-lg bg-primary-soft px-5 py-3 text-[15px] font-semibold text-foreground transition hover:brightness-95";

/**
 * The logged-out front door ("v5"): cream paper with grain, cut-paper shapes and a stitched
 * path, one dark band for how it works, and a gold sign-up block. Colors are fixed here on
 * purpose so the front door keeps its look in dark mode too. Sizes use rem so they hold up
 * when a phone's text size is set large.
 */
const FRONT_CSS = `
.eh{--cream:#F6F1E8;--paper:#FFFCF6;--ink:#1C1720;--muted:#5C5563;--gold:#E9A23B;--goldsoft:#FBEBD0;--plum:#4A2D5C;--plumsoft:#E7DCEF;--night:#18131C;
  position:relative;background:var(--cream);color:var(--ink);font-size:1rem;line-height:1.55;overflow:hidden}
.eh:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.eh > *{position:relative;z-index:1}
.eh .w{max-width:980px;margin:0 auto;padding:0 18px}
.eh .k{font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--plum)}
.eh h1,.eh h2{color:var(--ink);font-weight:700}
.eh h2{font-size:clamp(1.3rem,4.6vw,1.85rem);line-height:1.15;letter-spacing:-.02em;margin-top:6px}
.eh .btn{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:var(--ink);font-weight:700;font-size:.95rem;padding:.8rem 1.1rem;border-radius:11px;box-shadow:3px 3px 0 var(--ink)}
.eh .btn:hover{filter:brightness(.96)}
.eh .txt{font-size:.9rem;font-weight:600;color:var(--ink);text-decoration:underline;text-underline-offset:4px}
.eh .hero{padding:20px 0 40px}
.eh .shapes{position:relative;height:190px;margin-bottom:6px}
.eh .shapes svg{position:absolute;inset:0;width:100%;height:100%}
.eh .hero h1{font-size:clamp(1.8rem,6.6vw,3rem);line-height:1.07;letter-spacing:-.03em;max-width:17ch;margin-top:10px}
.eh .hero h1 em{font-style:normal;background:linear-gradient(transparent 58%,var(--gold) 58%,var(--gold) 92%,transparent 92%)}
.eh .hero p{color:var(--muted);font-size:1.03rem;margin-top:12px;max-width:36ch}
.eh .acts{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-top:22px}
.eh .torn{display:block;width:100%;height:22px}
.eh .rec{padding:38px 0 42px}
.eh .pills{list-style:none;padding:0;margin-top:18px;display:flex;flex-wrap:wrap;gap:10px}
.eh .pills li{background:var(--paper);border:1.5px solid var(--ink);border-radius:999px;padding:.55rem .95rem;font-size:.95rem;font-weight:600}
.eh .pills li:nth-child(2){background:var(--plumsoft)}
.eh .pills li:nth-child(3){background:var(--goldsoft)}
.eh .after{margin-top:18px;color:var(--muted);max-width:52ch;font-size:.97rem}
.eh .after b{color:var(--ink)}
.eh .dark{background:var(--night);color:#F2ECE4;padding:44px 0 48px;position:relative;overflow:hidden}
.eh .dark .k{color:var(--gold)}
.eh .dark h2{color:#fff}
.eh .flow{display:grid;margin-top:22px}
.eh .flow > div{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:14px 0;border-top:1px solid #2E2633}
.eh .flow b{font-size:1.05rem;color:#fff}
.eh .flow .ln{display:block;color:#B3A9BB;font-size:.93rem}
.eh .flow .num{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:var(--gold);color:var(--ink);font-weight:800}
.eh .flow > div:nth-child(even) .num{background:#B48CD0}
.eh .dark .ex{margin-top:18px;font-size:.93rem;color:#B3A9BB}
.eh .dark .ex b{color:#fff}
.eh .blob{position:absolute;right:-60px;top:-50px;width:200px}
.eh .facts{display:grid;gap:14px;padding:40px 18px;max-width:980px;margin:0 auto}
.eh .fact{background:var(--paper);border-radius:16px;padding:16px 18px;border:1.5px solid var(--ink);box-shadow:4px 4px 0 var(--ink)}
.eh .fact b{display:flex;align-items:center;gap:8px;font-size:1rem}
.eh .fact .dot{width:10px;height:10px;border-radius:50%}
.eh .fact span.l{color:var(--muted);font-size:.92rem}
.eh .cta{background:var(--gold);padding:40px 0 44px;position:relative;overflow:hidden}
.eh .cta h2{font-size:clamp(1.45rem,5.4vw,2.1rem)}
.eh .cta p{margin-top:6px;font-size:.98rem;max-width:44ch;color:var(--ink)}
.eh .cta .btn{background:var(--ink);color:#fff;box-shadow:3px 3px 0 var(--plum);margin-top:18px}
.eh .cta small{display:block;margin-top:14px;font-size:.85rem;max-width:46ch;color:var(--ink)}
.eh .cta .deco{position:absolute;right:-30px;bottom:-30px;width:170px;opacity:.5}
@media(min-width:760px){
  .eh .hero .w{display:grid;grid-template-columns:1.15fr .85fr;align-items:center;gap:30px}
  .eh .shapes{order:2;height:320px}
  .eh .hero{padding:40px 0 70px}
  .eh .flow{grid-template-columns:repeat(4,1fr);gap:22px}
  .eh .flow > div{grid-template-columns:1fr}
  .eh .facts{grid-template-columns:repeat(3,1fr);gap:22px}
}
`;

/** A soft curve where the dark band starts and ends. */
function TornEdge({ flip = false }) {
  return (
    <svg
      className="torn"
      viewBox="0 0 400 22"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        d="M0 22 L0 14 C100 2 300 2 400 14 L400 22 Z"
        fill="#18131C"
      />
    </svg>
  );
}

/** Before login: a front door that explains the program and collects interest. No module list. */
function PublicHome() {
  return (
    <div className="eh -mx-4 -mb-16 -mt-6 sm:-mx-6 sm:-mb-20 sm:-mt-8 lg:-mx-8">
      <style>{FRONT_CSS}</style>

      <section className="hero">
        <div className="w">
          <div className="shapes" aria-hidden="true">
            <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
              <path d="M40 40 L150 22 L162 34 L210 26 L222 60 L214 98 L226 140 L170 158 L120 150 L70 168 L48 120 L58 84 Z" fill="#4A2D5C" />
              <circle cx="250" cy="72" r="54" fill="#E9A23B" />
              <path d="M200 120 L310 108 L318 170 L208 182 Z" fill="#E7DCEF" stroke="#1C1720" strokeWidth="2" />
              <path
                d="M18 180 C80 150 110 100 170 92 S280 60 340 20"
                fill="none"
                stroke="#1C1720"
                strokeWidth="3"
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
              <circle cx="170" cy="92" r="7" fill="#FFFCF6" stroke="#1C1720" strokeWidth="2.5" />
              <circle cx="340" cy="20" r="9" fill="#1C1720" />
              <path d="M300 150 l14 -14 M300 136 l14 14" stroke="#1C1720" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="k">Pilot 1 · online · from Build Otherwise</p>
            <h1>
              Want something different but <em>can’t name it yet?</em>
            </h1>
            <p>Start with one small thing you can try. No plan, passion or business idea needed.</p>
            <div className="acts">
              <Link className="btn" to="/getting-started">
                Start now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a className="txt" href="#how">
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rec">
        <div className="w">
          <p className="k">Sound familiar?</p>
          <h2>Start where you actually are.</h2>
          <ul className="pills">
            {FAMILIAR.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="after">
            <b>No business idea required.</b> Building one is on the table. A job, training, a project or a pause count
            too.
          </p>
        </div>
      </section>

      <TornEdge />
      <section className="dark" id="how">
        <svg className="blob" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="48" fill="#4A2D5C" />
        </svg>
        <div className="w">
          <p className="k">How it works</p>
          <h2>Four moves. Each one is small.</h2>
          <div className="flow">
            {STEPS.map((step, index) => (
              <div key={step.label}>
                <span className="num">{index + 1}</span>
                <p>
                  <b>{step.label}</b>
                  <span className="ln">{step.line}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="ex">
            <b>Like this:</b> keeps watching furniture videos → refinishes one small table → loves it, hates the fumes →
            tries again with ventilation.
          </p>
        </div>
      </section>
      <TornEdge flip />

      <div className="facts">
        {FACTS.map((fact) => (
          <div key={fact.title} className="fact">
            <b>
              <span className="dot" style={{ background: fact.dot }} />
              {fact.title}
            </b>
            <span className="l">{fact.line}</span>
          </div>
        ))}
      </div>

      <section className="cta" id="join">
        <svg className="deco" viewBox="0 0 100 100" aria-hidden="true">
          <path
            d="M10 90 L30 40 L52 62 L70 18 L92 50"
            fill="none"
            stroke="#1C1720"
            strokeWidth="5"
            strokeDasharray="8 7"
            strokeLinecap="round"
          />
        </svg>
        <div className="w">
          <h2>Want in on Pilot 1?</h2>
          <p>
            Pilot 1 is online and open now. Begin whenever you like, and join the list if you want updates.
          </p>
          <div className="acts">
            <Link className="btn" to="/getting-started">
              Start now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a className="txt" href={INTEREST_FORM} target="_blank" rel="noopener noreferrer">
              Join the list for updates
            </a>
          </div>
          <small>
            Researcher, educator or community partner? Use the same list form and pick the partner or advisor option.
          </small>
        </div>
      </section>
    </div>
  );
}

/** After login, and after Getting Started: pick up where you left off, then the tools, then progress. */
function MemberHome() {
  const { modules, lessonsByOrder, orderedLessons, loading } = useCurriculum();
  const { answers, states } = useWorkbook();

  const progress = usePacedProgress({ modules, lessonsByOrder, answers, states });

  /** The workbook starts at Module 1. Getting Started is already finished by the time this shows. */
  const next = useMemo(() => {
    return orderedLessons.find((lesson) => isWorkbookLesson(lesson) && !stepComplete(lesson, answers, states)) || null;
  }, [orderedLessons, answers, states]);

  const started = orderedLessons.some((lesson) => isWorkbookLesson(lesson) && stepComplete(lesson, answers, states));
  const liveModules = modules.filter((module) => module.status === "live" && module.kind !== "orientation");
  const nextModule = next ? modules.find((module) => module.order === next.module_order) : null;
  const nextLabel = nextModule ? `Module ${nextModule.order}` : "";
  /** The next step sits in a module that opens later this week. */
  const nextRow = nextModule ? progress.byOrder[nextModule.order] : null;
  const waitingWeek = Boolean(nextRow && nextRow.lockReason === "week");
  const waitingDate = waitingWeek ? formatOpenDate(nextRow.opensAt) : "";

  return (
    <div className="space-y-10">
      <section>
        <p className="workbook-label">{started ? "Welcome back" : "Welcome"}</p>
        {loading ? (
          <div aria-busy="true" className="mt-3 h-[140px] animate-pulse rounded-2xl bg-border/60" />
        ) : next && waitingWeek ? (
          <div className="mt-3 rounded-2xl bg-primary px-5 py-7 text-primary-foreground sm:px-8">
            <p className="text-[13px] font-semibold text-primary-soft">
              {waitingDate ? `${nextLabel} opens ${waitingDate}` : `${nextLabel} opens next week`}
            </p>
            <h1 className="mt-1.5 text-[clamp(1.5rem,1.1rem+1.6vw,2.1rem)] text-primary-foreground">
              You’re caught up for this week.
            </h1>
            <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/85">
              One new module opens each week, so there is room for what you noticed or planned to happen out in your
              life. Nothing is overdue.
              Everything already open stays open: your journal, your Life Map, and every step you have done.
            </p>
            <Link to="/journal" className={`mt-5 ${marigoldButton}`}>
              Open your journal
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : next ? (
          <div className="mt-3 rounded-2xl bg-primary px-5 py-7 text-primary-foreground sm:px-8">
            <p className="text-[13px] font-semibold text-primary-soft">
              {started ? "Pick up where you left off" : "Next step"}
            </p>
            <h1 className="mt-1.5 text-[clamp(1.5rem,1.1rem+1.6vw,2.1rem)] text-primary-foreground">
              {nextLabel ? `${nextLabel} · ${next.title}` : next.title}
            </h1>
            {next.purpose ? (
              <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/85">{next.purpose}</p>
            ) : null}
            <Link to={`/lesson/${next.code}`} className={`mt-5 ${marigoldButton}`}>
              {started ? "Continue" : "Start"}
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
            <span className="block text-[15px] text-muted-foreground">Places, activities, energy, barriers, threads, people and groups.</span>
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
                ) : row.lockReason === "week" ? (
                  <span className="shrink-0 text-[13px] text-muted-faint">
                    {row.opensAt ? `Opens ${formatOpenDate(row.opensAt)}` : "Opens next week"}
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
                    to={`/module/${module.slug}`}
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
          One new module opens each week, once every step before it holds a saved line. The aim is to keep the
          workbook to about 2–3 hours a week. Modules 6–10 are still being built.
        </p>
        {progress.pacingSkipped ? (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-faint">
            Admin view: weekly pacing is skipped for you so every module stays open for review. Participants see it.
          </p>
        ) : null}
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
