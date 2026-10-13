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

const FAMILIAR = ["Too many directions", "Can’t tell what fits", "Not ready to bet on it", "Done with personality tests"];

const STEPS = [
  { label: "Notice", line: "What keeps pulling at you." },
  { label: "Try", line: "One small step you can undo." },
  { label: "Reflect", line: "What actually happened, and what it cost." },
  { label: "Decide", line: "Keep going, change it, or drop it." },
];

const FACTS = [
  { title: "Private", dot: "#E9A23B", line: "Your writing stays on your device. You share only what you choose." },
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
.eh .btn{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:var(--ink);font-weight:700;font-size:.95rem;padding:.8rem 1.1rem;border-radius:11px;box-shadow:3px 3px 0 var(--ink);transition:transform .15s}
.eh .btn:hover{transform:translate(-1px,-1px)}
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
.eh .pills li:nth-child(2){transform:rotate(-1.2deg);background:var(--plumsoft)}
.eh .pills li:nth-child(3){transform:rotate(1deg);background:var(--goldsoft)}
.eh .after{margin-top:18px;color:var(--muted);max-width:52ch;font-size:.97rem}
.eh .after b{color:var(--ink)}
.eh .dark{background:var(--night);color:#F2ECE4;padding:44px 0 48px;position:relative;overflow:hidden}
.eh .dark .k{color:var(--gold)}
.eh .dark h2{color:#fff}
.eh .flow{display:grid;margin-top:22px}
.eh .flow > div{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:14px 0;border-top:1px solid #2E2633}
.eh .flow b{font-size:1.05rem;color:#fff}
.eh .flow .ln{display:block;color:#B3A9BB;font-size:.93rem}
.eh .flow .num{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:var(--gold);color:var(--ink);font-weight:800;transform:rotate(-4deg)}
.eh .flow > div:nth-child(even) .num{background:#B48CD0;transform:rotate(3deg)}
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
        d="M0 22 L0 10 L18 14 L34 6 L52 12 L70 4 L92 13 L110 7 L131 15 L150 5 L172 12 L190 6 L212 14 L232 4 L252 11 L274 6 L292 15 L314 7 L333 12 L352 4 L374 13 L400 8 L400 22 Z"
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
            <p className="k">Pilot 1 · from Build Otherwise</p>
            <h1>
              Want something different but <em>can’t name it yet?</em>
            </h1>
            <p>Start with one small thing you can try. No plan, passion or business idea needed.</p>
            <div className="acts">
              <a className="btn" href={INTEREST_FORM} target="_blank" rel="noopener noreferrer">
                Join the Pilot 1 list
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
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
          <p>Joining the list isn’t enrolling. You’ll hear from us when it opens.</p>
          <a className="btn" href={INTEREST_FORM} target="_blank" rel="noopener noreferrer">
            Join the Pilot 1 list
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <small>Researcher, educator or community partner? Use the same form and pick the partner option.</small>
        </div>
      </section>
    </div>
  );
}

