import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Prose from "@/components/workbook/Prose";
import { base44 } from "@/api/base44Client";
import { answerKey, setAnswer as setWorkbookAnswer, useAnswers } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import {
  AGREEMENT_APPROACH,
  AGREEMENT_CODE,
  AGREEMENT_NOTE,
  AGREEMENT_WHY,
  GS_CODES,
  markSubmitted,
  readAgreement,
} from "@/lib/gettingStarted";
import LearningAgreement from "@/components/gettingStarted/LearningAgreement";

/**
 * What Submit sends: why they're here and how they want to approach it, nothing else.
 * (Stored in the existing join_choice / choice_note fields.)
 * The optional note and "What makes it work for you" (O.4) stay private, so they are never sent.
 */
function buildSending(lessonsByCode, answers) {
  const { why, approach } = readAgreement(answers);
  return { join_choice: why, choice_note: approach, change_help: "", support_plan: [] };
}

/**
 * Getting Started, one step at a time, in a pop-up. Answers save to the same
 * workbook boxes as the step pages, so nothing is typed twice. Every question can
 * be skipped. Submit sends only what the review screen shows.
 */
export default function GettingStartedPopup({ lessons, onClose }) {
  const navigate = useNavigate();
  const answers = useAnswers();
  const scrollRef = useRef(null);
  const steps = useMemo(
    () => GS_CODES.map((code) => (lessons || []).find((lesson) => lesson.code === code)).filter(Boolean),
    [lessons]
  );
  const lessonsByCode = useMemo(() => Object.fromEntries(steps.map((lesson) => [lesson.code, lesson])), [steps]);

  /** -1 is the welcome, 0..n-1 the steps, n the review, n+1 the sent screen. */
  const [index, setIndex] = useState(-1);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const reviewAt = steps.length;
  const doneAt = steps.length + 1;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const sendingPreview = useMemo(() => buildSending(lessonsByCode, answers), [lessonsByCode, answers]);

  const submit = async () => {
    setSending(true);
    setError("");
    try {
      const record = {
        ...sendingPreview,
        description: `Getting Started: ${sendingPreview.join_choice || "no choice given"}`,
      };
      await base44.entities.GettingStartedSubmission.create(record);
      markSubmitted({ sent: sendingPreview });
      setIndex(doneAt);
    } catch {
      setError("That didn't send. Check your connection and try again. Nothing was lost.");
    } finally {
      setSending(false);
    }
  };

  const step = index >= 0 && index < steps.length ? steps[index] : null;
  const prompts = step ? [...(step.try_prompts || []), ...(step.reflect_prompts || [])] : [];

  /** Getting Started answers are kept on the step and land in the journal, so the journal starts here. */
  const setAnswer = (code, promptIndex, text) => {
    setWorkbookAnswer(code, promptIndex, text);
    const lesson = lessonsByCode[code];
    const allPrompts = lesson ? [...(lesson.try_prompts || []), ...(lesson.reflect_prompts || [])] : [];
    saveAnswer({
      lessonCode: code,
      lessonTitle: lesson ? lesson.title : "Getting Started",
      promptKey: `${code}#${promptIndex}`,
      promptLabel: allPrompts[promptIndex] || "Getting Started",
      body: text,
    });
  };

  const renderPrompt = (label, promptIndex) => {
    const key = answerKey(step.code, promptIndex);
    const value = (answers || {})[key] || "";
    const id = `gs-${step.code}-${promptIndex}`;

    if (step.code === AGREEMENT_CODE && promptIndex === AGREEMENT_WHY) {
      return <LearningAgreement key={key} lessonTitle={step.title} />;
    }
    if (step.code === AGREEMENT_CODE && (promptIndex === AGREEMENT_APPROACH || promptIndex === AGREEMENT_NOTE)) {
      return null;
    }

    return (
      <div key={key}>
        <label htmlFor={id} className="block text-[15px] font-medium text-foreground">
          {label}
        </label>
        <Textarea
          id={id}
          rows={2}
          value={value}
          onChange={(event) => setAnswer(step.code, promptIndex, event.target.value)}
          className="mt-2 min-h-[56px]"
        />
      </div>
    );
  };

  const total = steps.length;

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-foreground/40 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gs-title"
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <p className="workbook-label">Getting Started</p>
            {index >= 0 && index < total ? (
              <p className="text-[12.5px] text-muted-faint">
                Step {index + 1} of {total}
              </p>
            ) : null}
          </div>
          {index < doneAt ? (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Not now
            </button>
          ) : null}
        </div>

        {index >= 0 && index < total ? (
          <div className="flex gap-1 px-5 pt-3" aria-hidden="true">
            {steps.map((item, position) => (
              <span key={item.code} className={`h-1.5 flex-1 rounded-full ${position <= index ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        ) : null}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
          {index === -1 ? (
            <div>
              <h2 id="gs-title" className="font-heading text-2xl">
                Before Module 1
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
                {total} short steps: {steps.map((lesson) => lesson.title).join(", ")}.
              </p>
              <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-foreground">
                <li>Nothing here is scored. You can skip any question.</li>
                <li>“Not now” closes this. You can open it again from the home page.</li>
                <li>
                  At the end you’ll see exactly what gets sent to Ashley before you submit: only why you’re here and how you
                  want to approach it.
                  Everything else stays private in your workbook.
                </li>
              </ul>
            </div>
          ) : null}

          {step ? (
            <div>
              <h2 id="gs-title" className="font-heading text-2xl">
                {step.title}
              </h2>
              {step.purpose ? <p className="mt-2 text-[15px] text-muted-foreground">{step.purpose}</p> : null}
              <div className="mt-4">
                <Prose text={step.teach} />
              </div>
              {step.show ? (
                <div className="mt-5 rounded-xl border border-border bg-card px-4 py-3">
                  <p className="workbook-label">Example</p>
                  <div className="mt-1">
                    <Prose text={step.show} />
                  </div>
                </div>
              ) : null}
              {prompts.length ? (
                <div className="mt-6 space-y-5 border-t border-border pt-5">
                  <p className="text-[13px] text-muted-faint">Answer what fits. Saved as you type.</p>
                  {prompts.map((label, promptIndex) => (String(label || "").trim() ? renderPrompt(label, promptIndex) : null))}
                </div>
              ) : null}
            </div>
          ) : null}

          {index === reviewAt ? (
            <div>
              <h2 id="gs-title" className="font-heading text-2xl">
                Check what gets sent
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Only this goes to Ashley. Everything else you wrote stays private in your workbook. Go back to change anything.
              </p>
              <dl className="mt-5 space-y-4 rounded-xl border border-border bg-card px-4 py-4 text-[15px]">
                <div>
                  <dt className="text-[13px] font-semibold text-accent-ink">Why I'm here</dt>
                  <dd className="mt-0.5 text-foreground">{sendingPreview.join_choice || "Not chosen (that's okay)"}</dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold text-accent-ink">My approach</dt>
                  <dd className="mt-0.5 text-foreground">{sendingPreview.choice_note || "Not chosen (that's okay)"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-faint">
                After you submit, Getting Started won’t pop up again. Your answers stay readable in Settings. To pause
                or leave, email Start@buildotherwise.org. No reason needed.
              </p>
              {error ? (
                <p role="alert" className="mt-3 text-[14px] text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          ) : null}

          {index === doneAt ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 id="gs-title" className="mt-4 font-heading text-2xl">
                Sent. Getting Started is done.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Next is your Life Map: the life you’re actually living, one line at a time.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
          {index > -1 && index < doneAt ? (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setIndex(index - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <span />
          )}
          {index < reviewAt ? (
            <Button
              type="button"
              size="lg"
              className="h-auto whitespace-normal rounded-full py-3"
              onClick={() => setIndex(index + 1)}
            >
              {index === -1
                ? "Start"
                : index === total - 1
                  ? "Next: check what gets sent"
                  : `Next: ${steps[index + 1].title}`}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          ) : index === reviewAt ? (
            <Button type="button" size="lg" className="rounded-full" disabled={sending} onClick={submit}>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {sending ? "Sending…" : "Submit"}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="rounded-full"
              onClick={() => {
                onClose();
                navigate("/map");
              }}
            >
              Next: map your life
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
