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
    if (loading) return;
    const story = document.querySelector(".gs-story");
    if (!story) return;
    const scenes = Array.from(story.querySelectorAll(".gs-frame"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { story.classList.add("gs-reduced"); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = story.getBoundingClientRect();
      const distance = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / distance));
      const position = progress * (scenes.length - 1);
      scenes.forEach((node, index) => {
        const difference = Math.abs(position - index);
        // Keep adjacent passages from being readable simultaneously.
        const opacity = Math.max(0, Math.min(1, (0.52 - difference) / 0.22));
        node.style.opacity = String(opacity);
        node.style.transform = `translateY(${(index - position) * 12}px)`;
        node.style.visibility = opacity < 0.02 ? "hidden" : "visible";
        node.style.pointerEvents = opacity > .9 ? "auto" : "none";
        node.setAttribute("aria-hidden", opacity < .5 ? "true" : "false");
      });
      story.style.setProperty("--gs-progress", String(progress));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
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
      <section aria-label="What shaped you" className="gs-story relative -mx-4 sm:-mx-8" style={{ height: "1350svh" }}>
        <style>{`
          .gs-story { --gs-progress: 0; }
          .gs-story .gs-stage { position: sticky; top: 0; height: 100svh; min-height: 500px; overflow: hidden; display: grid; place-items: center; isolation: isolate; background: #19151f; }
          .gs-story .gs-stage:before { content: ""; position: absolute; inset: -20%; z-index: -1; background: radial-gradient(ellipse at 65% 35%, rgba(176,115,201,.24), transparent 45%), radial-gradient(ellipse at 12% 85%, rgba(123,84,155,.16), transparent 50%); transform: translateY(calc(var(--gs-progress) * -12%)); }
          .gs-story .gs-stage:after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(145deg, transparent 35%, rgba(224,187,232,.07)); opacity: var(--gs-progress); }
          .gs-story .gs-frame { position: absolute; inset: 0; padding: clamp(1.5rem, 6vw, 5rem); display: flex; flex-direction: column; justify-content: center; align-items: flex-start; opacity: 0; will-change: opacity, transform; color: #f5edf7; }

          .gs-story .gs-frame:nth-of-type(3n) { align-items: flex-end; text-align: right; }
          .gs-story .gs-frame:nth-of-type(4n) { align-items: center; text-align: center; }
          .gs-story .gs-frame p { max-width: min(24ch, 100%); text-wrap: balance; overflow-wrap: break-word; }
          .gs-story .gs-hero { font-size: clamp(2rem, 7vw, 5.1rem); font-weight: 650; line-height: 1.08; letter-spacing: -.055em; }
          .gs-story .gs-statement { font-size: clamp(1.7rem, 5vw, 3.6rem); line-height: 1.2; letter-spacing: -.035em; }
          .gs-story .gs-body { font-size: clamp(1.25rem, 3vw, 2.15rem); line-height: 1.5; max-width: min(36ch, 100%) !important; }
          .gs-story .gs-rule { height: 3px; width: 64px; background: #d3a9e8; margin-bottom: 2rem; border-radius: 3px; }
          .gs-story .gs-progress { position: absolute; bottom: 3.5rem; left: 8%; right: 8%; height: 2px; background: rgba(255,255,255,.18); }
          .gs-story .gs-progress span { display: block; height: 100%; width: calc(var(--gs-progress) * 100%); background: #d3a9e8; }
          @media (max-width: 640px) { .gs-story .gs-frame { padding: 1.5rem 1.75rem 5rem; } .gs-story .gs-frame p { max-width: 100%; } .gs-story .gs-body { line-height: 1.42; } }
          .gs-story .gs-cue { position: absolute; bottom: 4.7rem; left: 8%; color: #c6b5ce; font-size: .75rem; letter-spacing: .18em; text-transform: uppercase; }
          @media (prefers-reduced-motion: reduce) {
            .gs-story { height: auto !important; }
            .gs-story .gs-stage { height: auto; min-height: 0; display: block; padding: 3rem 0; }
            .gs-story .gs-frame { position: relative; opacity: 1 !important; transform: none !important; min-height: 40vh; }
            .gs-story .gs-progress, .gs-story .gs-cue { display: none; }
          }
        `}</style>
        <div className="gs-stage">
          <div className="gs-cue" aria-hidden="true">Scroll to explore ↓</div>
          <div className="gs-progress" aria-hidden="true"><span /></div>
          <div className="gs-frame" aria-hidden="false"><div className="gs-rule" aria-hidden="true" /><p className="gs-hero">What shaped you doesn't have to define you.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">Some experiences change us.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-body">Sometimes we learn to stay quiet to avoid conflict. Sometimes we become fiercely independent because depending on someone wasn't an option. Sometimes we learn to read a room before we've even said a word.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">We might become guarded, stubborn, sensitive, restless, or determined.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-body">And somewhere along the way, those ways of responding can become part of how we describe ourselves—or how other people describe us.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-hero">But there's a difference between who you are and what you've learned to do.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">Maybe something that once protected you now holds you back.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">Maybe something you've always considered a shortcoming has another side you haven't explored.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">Maybe an ability you developed during a difficult time could serve a completely different purpose today.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">And maybe there are things you simply want to leave behind.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-body">You don't have to be grateful for what happened. You don't have to call it a blessing or find a lesson in it.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-hero">You also don't have to let it write the rest of your story.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-statement">You get to explore what stays, what changes, and what you want to do differently.</p></div>
          <div className="gs-frame" aria-hidden="true"><div className="gs-rule" aria-hidden="true" /><p className="gs-hero">That's where we begin.</p></div>
        </div>
      </section>

      <section aria-label="Your next step" className="mx-auto max-w-[68ch] px-1 py-7 sm:py-10">
        <p className="workbook-label">Getting Started</p>
        <h2 className="mt-3 text-[clamp(1.65rem,5vw,2.5rem)] font-semibold leading-tight tracking-tight">
          {stepsDone ? "Where you go next is up to you." : "A few things worth knowing before you begin."}
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          {stepsDone
            ? "You've completed the welcome. You can return to it whenever you want, or explore what's next."
            : "Before you explore, take a few minutes to learn what this is, what it isn't, and what stays yours. You can pause, pass, or change your mind."}
        </p>
        {stepsDone ? (
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[16px] font-medium text-primary-foreground"
          >
            Explore your dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : open ? (
          <Link
            to={`/lesson/${open.code}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[16px] font-medium text-primary-foreground"
          >
            {anyDone ? "Continue the welcome" : "Read the welcome"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
        <p className="mt-4 text-[14px] leading-relaxed text-muted-faint">
          {stepsDone
            ? "Your Life Map is always available in its own tab."
            : "About five minutes. Afterward, your dashboard opens. Your Life Map is optional."}
        </p>
      </section>

      {error && !steps.length ? (
        <p className="text-[16px] text-muted-foreground">Getting Started didn’t load. Refresh the page.</p>
      ) : null}

      {missing.length ? (
        <p className="text-[16px] text-muted-foreground">
          These steps are not in this build yet: {missing.join(", ")}.
        </p>
      ) : null}

      <StepList lessons={steps} scopeLabel="in Getting Started" numberByIndex />

      {admin ? (
        <p className="text-[14px] text-muted-faint">
          Admin access: <Link to="/" className="underline underline-offset-2">Open the workbook</Link>
        </p>
      ) : null}

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
