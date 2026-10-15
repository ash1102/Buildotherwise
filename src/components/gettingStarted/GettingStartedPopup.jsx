import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Prose from "@/components/workbook/Prose";
import { base44 } from "@/api/base44Client";
import { answerKey, setAnswer as setWorkbookAnswer, useAnswers } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { GS_CODES, JOIN_CHOICES, joinChoiceText, markSubmitted, splitChoice } from "@/lib/gettingStarted";

const CHOICE_CODE = "O.5";
const CHOICE_INDEX = 1;
const CHANGE_INDEX = 2;
const PLAN_CODE = "O.4";

/** What Submit sends: the join choice and the support plan, only boxes that hold something. */
function buildSending(lessonsByCode, answers) {
  const { choice, note } = splitChoice((answers || {})[answerKey(CHOICE_CODE, CHOICE_INDEX)]);
  const changeHelp = String((answers || {})[answerKey(CHOICE_CODE, CHANGE_INDEX)] || "").trim();
  const plan = lessonsByCode[PLAN_CODE];
  const planPrompts = plan ? [...(plan.try_prompts || []), ...(plan.reflect_prompts || [])] : [];
  const supportPlan = planPrompts
    .map((question, index) => ({ question, answer: String((answers || {})[answerKey(PLAN_CODE, index)] || "").trim() }))
    .filter((row) => row.answer);
  return { join_choice: choice, choice_note: note, change_help: changeHelp, support_plan: supportPlan };
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

    if (step.code === CHOICE_CODE && promptIndex === CHOICE_INDEX) {
      const { choice, note } = splitChoice(value);
      return (
        <fieldset key={key}>
          <legend className="text-[15px] font-medium text-foreground">Your choice</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {JOIN_CHOICES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={choice === option}
                onClick={() => setAnswer(step.code, promptIndex, joinChoiceText(choice === option ? "" : option, note))}
                className={`rounded-full border px-4 py-2 text-[15px] transition ${
                  choice === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <label htmlFor={id} className="mt-3 block text-[13.5px] text-muted-foreground">
            Add a note if you want
          </label>
          <Textarea
            id={id}
            rows={2}
            value={note}
            onChange={(event) => setAnswer(step.code, promptIndex, joinChoiceText(choice, event.target.value))}
            className="mt-1 min-h-[56px]"
          />
        </fieldset>
      );
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
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-background shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-2xl"
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
                  At the end you’ll see exactly what gets sent to Ashley before you submit: your choice to join and your
                  “What makes it work for you” answers. Everything else stays on this device.
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
                  <p className="text-[13px] text-muted-faint">Answer what fits. Saved on this device as you type.</p>
                  {prompts.map((label, promptIndex) => renderPrompt(label, promptIndex))}
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
                Only this goes to Ashley. Everything else you wrote stays on this device. Go back to change anything.
              </p>
              <dl className="mt-5 space-y-4 rounded-xl border border-border bg-card px-4 py-4 text-[15px]">
                <div>
                  <dt className="text-[13px] font-semibold text-accent-ink">Your choice to join</dt>
                  <dd className="mt-0.5 text-foreground">{sendingPreview.join_choice || "Not chosen (that's okay)"}</dd>
                  {sendingPreview.choice_note ? (
                    <dd className="mt-0.5 text-muted-foreground">{sendingPreview.choice_note}</dd>
                  ) : null}
                </div>
                {sendingPreview.change_help ? (
                  <div>
                    <dt className="text-[13px] font-semibold text-accent-ink">If you want to change your choice later</dt>
                    <dd className="mt-0.5 text-foreground">{sendingPreview.change_help}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[13px] font-semibold text-accent-ink">What makes it work for you</dt>
                  {sendingPreview.support_plan.length ? (
                    sendingPreview.support_plan.map((row) => (
                      <dd key={row.question} className="mt-1.5">
                        <span className="block text-[13px] text-muted-faint">{row.question}</span>
                        <span className="text-foreground">{row.answer}</span>
                      </dd>
                    ))
                  ) : (
                    <dd className="mt-0.5 text-muted-foreground">Nothing added (that's okay)</dd>
                  )}
                </div>
              </dl>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-faint">
                After you submit, Getting Started won’t pop up again. Your answers stay readable in Settings. To change
                your choice later, email Start@buildotherwise.org.
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

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
