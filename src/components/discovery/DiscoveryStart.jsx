import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import {
  QUESTIONS,
  STARTING_POINTS,
  anotherQuestionFor,
  firstQuestionFor,
  nextQuestionFor,
  questionsForPath,
  thoughtFor,
} from "@/lib/dashboardDiscovery";

/**
 * Discovery on the dashboard (Phase 2A prototype).
 * Everything here is component state. Nothing is written to the account, the device, the
 * workbook, the journal or the Life Map, so there is nothing to sync, export or delete.
 * One invitation shows at a time, and the way to the workbook is on screen at every step.
 */

const primaryButton =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary-soft px-5 py-3 text-[15px] font-semibold text-[hsl(277_34%_16%)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";
const quietButton =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg border border-primary-foreground/40 px-5 py-3 text-[15px] font-medium text-primary-foreground transition hover:bg-primary-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";
const textButton =
  "inline-flex min-h-[44px] items-center rounded-md px-1 text-[15px] font-medium text-primary-foreground underline underline-offset-2 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";
const choiceButton =
  "flex min-h-[52px] w-full items-center rounded-xl border border-primary-foreground/40 bg-primary-foreground/10 px-4 py-3 text-left text-[16px] leading-snug text-primary-foreground transition hover:bg-primary-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

const pickButton =
  "flex min-h-[44px] w-full items-center rounded-lg border border-primary-foreground/30 px-4 py-2.5 text-left text-[15px] leading-snug text-primary-foreground transition hover:bg-primary-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

/**
 * Every question, grouped by the path the participant started on. Their own path's questions come first,
 * but any question can be opened from here at any time. Picking one doesn't change the starting path.
 */
function OtherQuestions({ pointId, currentId, onPick }) {
  const all = questionsForPath(pointId);
  const closest = all.slice(0, 3);
  const rest = all.slice(3);
  const item = (q) => {
    const current = q.id === currentId;
    return (
      <li key={q.id}>
        <button
          type="button"
          aria-current={current ? "true" : undefined}
          onClick={() => onPick(q)}
          className={`${pickButton} ${current ? "bg-primary-foreground/15 font-semibold" : ""}`}
        >
          {q.text}
        </button>
      </li>
    );
  };
  return (
    <div className="mt-6 space-y-3">
      <p className="text-[14px] font-semibold text-primary-foreground/85">Explore a different question</p>
      <div>
        <p className="text-[13px] text-primary-foreground/80">Closest to where you started</p>
        <ul className="mt-2 grid gap-2">{closest.map(item)}</ul>
      </div>
      <div>
        <p className="text-[13px] text-primary-foreground/80">Other questions</p>
        <ul className="mt-2 grid gap-2">{rest.map(item)}</ul>
      </div>
    </div>
  );
}

const INITIAL = { stage: "welcome", pointId: null, questionId: null, seen: [], optionId: null, text: "" };

export default function DiscoveryStart({ onSkip, headingLevel = "h2" }) {
  const [state, setState] = useState(INITIAL);
  const headingRef = useRef(null);
  const firstRender = useRef(true);
  const Heading = headingLevel;

  // Move focus to the new heading when the step changes, so a keyboard or screen-reader user lands on it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (headingRef.current) headingRef.current.focus();
  }, [state.stage, state.questionId]);

  const question = state.questionId ? QUESTIONS[state.questionId] : null;

  const showQuestion = (next, extra = {}) =>
    setState((current) => ({
      ...current,
      ...extra,
      stage: "question",
      questionId: next.id,
      seen: current.seen.includes(next.id) ? current.seen : [...current.seen, next.id],
      optionId: null,
      text: "",
    }));

  const choosePoint = (pointId) => showQuestion(firstQuestionFor(pointId), { pointId, seen: [] });
  const another = () => {
    const next = anotherQuestionFor(state.pointId, state.questionId, state.seen);
    if (next) showQuestion(next);
  };

  return (
    <section
      aria-labelledby="discovery-heading"
      className="discovery-surface rounded-2xl bg-primary px-5 py-7 text-primary-foreground sm:px-8 sm:py-9"
    >
      {state.stage === "welcome" ? (
        <>
          <Heading
            id="discovery-heading"
            ref={headingRef}
            tabIndex={-1}
            className="max-w-[22ch] text-[clamp(1.7rem,1.2rem+2vw,2.4rem)] leading-[1.1] text-primary-foreground outline-none"
          >
            You don’t have to know what you’re looking for.
          </Heading>
          <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-primary-foreground/90">
            Maybe something has been on your mind. Maybe you’re ready for a change. Maybe you’re just curious what this
            is all about. There’s no right answer. Pick wherever you want to start.
          </p>
          <ul className="mt-5 grid gap-3">
            {STARTING_POINTS.map((point) => (
              <li key={point.id}>
                <button type="button" className={choiceButton} onClick={() => choosePoint(point.id)}>
                  {point.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {state.stage === "question" && question ? (
        <>
          <p className="text-[13px] font-semibold text-primary-foreground/85">A question to look at</p>
          <Heading
            id="discovery-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 max-w-[34ch] text-[clamp(1.4rem,1.1rem+1.4vw,1.9rem)] leading-snug text-primary-foreground outline-none"
          >
            {question.text}
          </Heading>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={primaryButton} onClick={() => setState((c) => ({ ...c, stage: "followup" }))}>
              Explore this one
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className={quietButton} onClick={another}>
              Show me another question
            </button>
          </div>
          <OtherQuestions pointId={state.pointId} currentId={question.id} onPick={showQuestion} />
        </>
      ) : null}

      {state.stage === "followup" && question ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setState((c) => ({ ...c, stage: "result" }));
          }}
        >
          <p className="text-[13px] font-semibold text-primary-foreground/85">{question.text}</p>
          <Heading
            id="discovery-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-[clamp(1.4rem,1.1rem+1.4vw,1.9rem)] leading-snug text-primary-foreground outline-none"
          >
            {question.followUp}
          </Heading>
          <fieldset className="mt-4">
            <legend className="sr-only">{question.followUp} Choose one, or skip.</legend>
            <div className="grid gap-3">
              {question.options.map((option) => (
                <label key={option.id} className="block cursor-pointer">
                  <input
                    type="radio"
                    name={`follow-${question.id}`}
                    value={option.id}
                    checked={state.optionId === option.id}
                    onChange={() => setState((c) => ({ ...c, optionId: option.id }))}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-[52px] items-center rounded-xl border border-primary-foreground/40 bg-primary-foreground/10 px-4 py-3 text-[16px] leading-snug text-primary-foreground transition hover:bg-primary-foreground/20 peer-checked:border-primary-soft peer-checked:bg-primary-soft peer-checked:font-semibold peer-checked:text-[hsl(277_34%_16%)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-foreground">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4">
            <label htmlFor="discovery-own-words" className="block text-[15px] text-primary-foreground/90">
              In your own words, if you want. Optional, and not saved.
            </label>
            <textarea
              id="discovery-own-words"
              rows={3}
              maxLength={300}
              value={state.text}
              onChange={(event) => setState((c) => ({ ...c, text: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-[16px] leading-relaxed text-foreground"
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className={primaryButton}>
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className={quietButton} onClick={another}>
              Skip this question
            </button>
          </div>
        </form>
      ) : null}

      {state.stage === "result" && question
        ? (() => {
            const upNext = nextQuestionFor(state.pointId, state.seen, state.questionId);
            return (
              <div className="space-y-5">
                <Heading
                  id="discovery-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-[clamp(1.3rem,1.05rem+1.2vw,1.7rem)] leading-snug text-primary-foreground outline-none"
                >
                  Something to think about
                </Heading>
                <p className="max-w-[62ch] text-[17px] leading-relaxed text-primary-foreground/95">
                  {thoughtFor(question.id, state.optionId)}
                </p>
                {state.text.trim() ? (
                  <p className="max-w-[62ch] rounded-xl bg-primary-foreground/10 px-4 py-3 text-[15px] leading-relaxed text-primary-foreground/90">
                    <span className="block text-[13px] font-semibold">You wrote (not saved)</span>
                    <span className="mt-1 block whitespace-pre-wrap break-words">{state.text.trim()}</span>
                  </p>
                ) : null}

                <div className="rounded-xl border border-primary-foreground/30 px-4 py-4">
                  <p className="text-[13px] font-semibold text-primary-foreground/85">A small experiment · optional</p>
                  <p className="mt-1 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/95">
                    {question.experiment}
                  </p>
                  <p className="mt-2 text-[14px] text-primary-foreground/80">Skip it if it doesn’t fit.</p>
                </div>

                {upNext ? (
                  <div>
                    <p className="text-[13px] font-semibold text-primary-foreground/85">Another question you might like</p>
                    <p className="mt-1 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/95">{upNext.text}</p>
                    <button type="button" className={`mt-3 ${primaryButton}`} onClick={() => showQuestion(upNext)}>
                      Look at this one
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <p className="max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/95">
                    That’s all four questions for now. The workbook has more to try whenever you’re ready.
                  </p>
                )}

                <OtherQuestions pointId={state.pointId} currentId={question.id} onPick={showQuestion} />
                <p className="text-[15px] text-primary-foreground/90">
                  Want to keep a thought? Your{" "}
                  <Link to="/journal" className="font-medium underline underline-offset-2">
                    Journal
                  </Link>{" "}
                  is the place. Nothing here goes there on its own.
                </p>
              </div>
            );
          })()
        : null}

      <div className="mt-6 space-y-3 border-t border-primary-foreground/25 pt-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <button type="button" className={textButton} onClick={onSkip}>
            Skip this and go to the workbook
          </button>
          {state.stage !== "welcome" ? (
            <button type="button" className={textButton} onClick={() => setState(INITIAL)}>
              Start over
            </button>
          ) : null}
        </div>
        <p className="flex items-start gap-2 text-[14px] leading-relaxed text-primary-foreground/85">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>This is a prototype. Nothing you choose or type here is saved. It’s gone when you leave this page.</span>
        </p>
      </div>
    </section>
  );
}
