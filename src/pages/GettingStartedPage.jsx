import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useCurriculum from "@/hooks/useCurriculum";
import StepList from "@/components/workbook/StepList";
import { useAuth } from "@/lib/AuthContext";
import LoginRedirect from "@/components/LoginRedirect";
import {
  EARLIER_GS_CODES,
  GS_CODES,
  OPTIONAL_GS_CODES,
  firstOpenGettingStartedStep,
  gettingStartedFinished,
  gettingStartedStepDone,
  gettingStartedSteps,
} from "@/lib/gettingStarted";
import { useWorkbook } from "@/lib/workbook";

/**
 * Getting Started is now a brief welcome (O.1) before Module 1.
 * The Life Map is an optional companion in its own tab.
 * Earlier Getting Started steps stay readable for anyone who answered them.
 */
export default function GettingStartedPage() {
  const { lessons, loading, error } = useCurriculum();
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-gs-reveal]");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("gs-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("gs-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4, rootMargin: "0px 0px -12% 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [loading]);
  const { answers, states } = useWorkbook();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const admin = Boolean(isAuthenticated && user?.role === "admin");
  const steps = gettingStartedSteps(lessons);
  const stepsDone = gettingStartedFinished(lessons, answers, states);
  const open = firstOpenGettingStartedStep(lessons, answers, states);
  const anyDone = steps.some((lesson) => gettingStartedStepDone(lesson, answers, states));
  const missing = GS_CODES.filter((code) => !steps.some((lesson) => lesson.code === code));
  const optional = OPTIONAL_GS_CODES.map((code) => (lessons || []).find((lesson) => lesson.code === code)).filter(Boolean);
  /** Former Getting Started steps, listed only when this person saved something there. */
  const earlier = EARLIER_GS_CODES.map((code) => (lessons || []).find((lesson) => lesson.code === code))
    .filter(Boolean)
    .filter((lesson) => Object.keys(answers || {}).some((key) => key.startsWith(`${lesson.code}#`) && String(answers[key] || "").trim()));

  if (isLoadingAuth || loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening Getting Started…</p>;
  }

  // Finished people can still come back here (the Back link on every step points here).
  // They see a way forward instead of being bounced to the Life Map.
  if (!admin && stepsDone && !isAuthenticated) return <LoginRedirect />;

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Getting Started</p>
        <h1 className="mt-2">Start here. You can decide as you go.</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Entrepalooza helps you explore interests and possibilities through learning, conversation, and small
          real-world experiences. You can pass, pause, or change your mind.
        </p>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted-faint">
          One short welcome, about five minutes. Then your dashboard opens. Your Life Map is always there in its own tab if
          you want it.
        </p>
      </header>

      <section aria-label="What shaped you" className="gs-story relative -mx-4 sm:-mx-8 px-5 sm:px-10 overflow-hidden">
        <style>{`
          .gs-story { background: radial-gradient(ellipse at 90% 12%, rgba(184,143,215,.12), transparent 32%), radial-gradient(ellipse at 5% 75%, rgba(184,143,215,.07), transparent 35%); }
          .gs-story .gs-scene { min-height: 68svh; display: flex; align-items: center; padding: 5rem 0; border-bottom: 1px solid rgba(184,143,215,.12); }
          .gs-story .gs-scene:nth-of-type(3n) .gs-copy { margin-left: auto; }
          .gs-story .gs-copy { max-width: 780px; width: 100%; }
          .gs-story .gs-accent { width: 42px; height: 2px; background: #c8a6df; margin-bottom: 1.5rem; }
          .gs-story .gs-hero { font-size: clamp(2.3rem, 6vw, 5.3rem); line-height: 1.08; letter-spacing: -.045em; font-weight: 650; }
          .gs-story .gs-statement { font-size: clamp(1.9rem, 4vw, 3.5rem); line-height: 1.24; letter-spacing: -.025em; }
          .gs-story .gs-line { font-size: clamp(1.55rem, 3vw, 2.6rem); line-height: 1.35; letter-spacing: -.015em; }
          .gs-story .gs-scene:nth-of-type(4n) .gs-copy { padding-left: 1.2rem; border-left: 2px solid rgba(200,166,223,.55); }
          @media (prefers-reduced-motion: no-preference) {
            .gs-story [data-gs-reveal]:not(.gs-visible) { opacity: 0; transform: translateY(46px); filter: blur(5px); }
            .gs-story [data-gs-reveal] { transition: opacity 1700ms cubic-bezier(.22,1,.36,1) 180ms, transform 1700ms cubic-bezier(.22,1,.36,1) 180ms, filter 1700ms ease 180ms; }
          }
          @media (prefers-reduced-motion: reduce) { .gs-story [data-gs-reveal] { opacity: 1 !important; transform: none !important; filter: none !important; } }
        `}</style>
        <div className="pt-12 text-sm tracking-[.24em] uppercase text-accent-ink">A place to begin <span aria-hidden="true" className="ml-3">↓</span></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-hero">What shaped you doesn't have to define you.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-statement">Some experiences change us.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">Sometimes we learn to stay quiet to avoid conflict.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">Sometimes we become fiercely independent because depending on someone wasn't an option.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">Sometimes we learn to read a room before we've even said a word.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-statement">We might become guarded, stubborn, sensitive, restless, or determined.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">And somewhere along the way, those ways of responding can become part of how we describe ourselves—or how other people describe us.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-hero">But there's a difference between who you are and what you've learned to do.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">Maybe something that once protected you now holds you back.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">Maybe something you've always considered a shortcoming has another side you haven't explored.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">Maybe an ability you developed during a difficult time could serve a completely different purpose today.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-line">And maybe there are things you simply want to leave behind.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-statement">You don't have to be grateful for what happened. You don't have to call it a blessing or find a lesson in it.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-hero">You also don't have to let it write the rest of your story.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-statement">You get to explore what stays, what changes, and what you want to do differently.</p></div></div>
        <div className="gs-scene"><div className="gs-copy" data-gs-reveal><div className="gs-accent" aria-hidden="true" /><p className="gs-hero">That's where we begin.</p></div></div>
        <div className="py-16 text-base text-muted-foreground">You can take your time, skip a question, or change your mind along the way.</div>
      </section>

      {error && !steps.length ? (
        <p className="text-[16px] text-muted-foreground">Getting Started didn’t load. Refresh the page.</p>
      ) : null}

      {missing.length ? (
        <p className="text-[16px] text-muted-foreground">
          These steps are not in this build yet: {missing.join(", ")}.
        </p>
      ) : null}

      {stepsDone ? (
        <div className="space-y-3">
          <p className="text-[16px] text-muted-foreground">You’re through the welcome. You can reread it below.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[16px] font-medium text-primary-foreground"
          >
            Next: your dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      {open ? (
        <Link
          to={`/lesson/${open.code}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[16px] font-medium text-primary-foreground"
        >
          {anyDone ? `Continue: ${open.title}` : "Start"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}

      {admin ? (
        <p className="text-[15px] text-muted-foreground">
          Admins can open the workbook before these steps are done.{" "}
          <Link to="/" className="font-medium text-accent-ink underline underline-offset-2">
            Open the workbook
          </Link>
        </p>
      ) : null}

      <StepList lessons={steps} scopeLabel="in Getting Started" numberByIndex />

      {earlier.length ? (
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="workbook-label">Your earlier answers</p>
          <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
            These steps used to be part of Getting Started. They aren’t needed anymore, but what you saved is still
            here. My Way Forward is in Module 1, Lesson 3.
          </p>
          <ul className="mt-3 space-y-2">
            {earlier.map((lesson) => (
              <li key={lesson.code}>
                <Link to={`/lesson/${lesson.code}`} className="text-[16px] font-medium text-accent-ink underline underline-offset-2">
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {optional.length ? (
        <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
          <p className="workbook-label">Optional, later</p>
          <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
            Not needed to open the workbook. Worth a look before you reply to anyone in Tribe threads.
          </p>
          <ul className="mt-3 space-y-1">
            {optional.map((lesson) => (
              <li key={lesson.code} className="text-[16px] text-foreground">
                {lesson.title}
                {lesson.duration_min ? <span className="text-muted-faint"> · About {lesson.duration_min} min</span> : null}
                <span className="block text-[14px] text-muted-faint">Opens once the steps above are done.</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isAuthenticated ? (
        <Link to="/" className="inline-block text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the main site
        </Link>
      ) : null}
    </div>
  );
}
