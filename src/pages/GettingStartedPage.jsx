import React from "react";
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
            here. Your learning agreement now lives in Module 1, Lesson 3.
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
