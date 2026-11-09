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
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
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

      <section aria-label="What shaped you" className="gs-story space-y-16 sm:space-y-24 py-8 sm:py-12">
        <style>{`
          .gs-story [data-gs-reveal] { opacity: 1; transform: none; }
          @media (prefers-reduced-motion: no-preference) {
            .gs-story [data-gs-reveal]:not(.gs-visible) { opacity: 0; transform: translateY(24px); }
            .gs-story [data-gs-reveal] { transition: opacity 850ms ease, transform 850ms ease; }
          }
        `}</style>
        <div data-gs-reveal className="max-w-[68ch]">
          <p className="workbook-label mb-4">A place to begin</p>
          <h2 className="text-3xl sm:text-5xl leading-tight font-semibold tracking-tight">What shaped you doesn't have to define you.</h2>
        </div>
        <div data-gs-reveal className="max-w-[62ch] space-y-5 text-xl sm:text-2xl leading-relaxed">
          <p>Some experiences change us.</p>
          <p>Sometimes we learn to stay quiet to avoid conflict.</p>
          <p>Sometimes we become fiercely independent because depending on someone wasn't an option.</p>
          <p>Sometimes we learn to read a room before we've even said a word.</p>
        </div>
        <div data-gs-reveal className="max-w-[62ch] space-y-5 text-lg sm:text-xl leading-relaxed">
          <p>We might become guarded, stubborn, sensitive, restless, or determined.</p>
          <p>And somewhere along the way, those ways of responding can become part of how we describe ourselves—or how other people describe us.</p>
          <p className="font-semibold text-foreground">But there's a difference between who you are and what you've learned to do.</p>
        </div>
        <div data-gs-reveal className="max-w-[62ch] space-y-5 text-lg sm:text-xl leading-relaxed">
          <p>Maybe something that once protected you now holds you back.</p>
          <p>Maybe something you've always considered a shortcoming has another side you haven't explored.</p>
          <p>Maybe an ability you developed during a difficult time could serve a completely different purpose today.</p>
          <p>And maybe there are things you simply want to leave behind.</p>
        </div>
        <div data-gs-reveal className="max-w-[62ch] space-y-5 text-lg sm:text-xl leading-relaxed">
          <p>You don't have to be grateful for what happened. You don't have to call it a blessing or find a lesson in it.</p>
          <p className="text-2xl sm:text-3xl font-semibold leading-snug">You also don't have to let it write the rest of your story.</p>
        </div>
        <div data-gs-reveal className="max-w-[62ch] space-y-5 text-lg sm:text-xl leading-relaxed">
          <p>You get to explore what stays, what changes, and what you want to do differently.</p>
          <p className="text-2xl sm:text-3xl font-semibold">That's where we begin.</p>
          <p className="text-base text-muted-foreground">You can take your time, skip a question, or change your mind along the way.</p>
        </div>
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
