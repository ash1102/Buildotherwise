import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Info } from "lucide-react";
import {
  OWN_EXPERIMENT,
  OWN_FOLLOW_UP,
  QUESTIONS,
  STARTING_POINTS,
  anotherQuestionFor,
  firstQuestionFor,
  framingFor,
  groupQuestionsForPath,
  thoughtFor,
} from "@/lib/dashboardDiscovery";
import { TITLE_MAX, threadFromDiscovery } from "@/lib/discoveryThreadData";
import { createDiscoveryConfirmed, updateDiscoveryConfirmed } from "@/lib/discoveries";

/**
 * Discovery on the dashboard: Notice -> Explore -> Choose.
 * Everything is component state until the participant presses Save on the Choose step. Save is the only
 * thing that writes: it creates one DiscoveryThread row on their account (see src/lib/discoveryThreads.js),
 * and Save again updates that same row. Nothing is copied into the Journal, the Life Map, My Records or the workbook.
 * Start over, Explore something else and Skip write nothing.
 * One invitation shows at a time, and the way to the workbook is on screen at every step.
 */

const primaryButton =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary-soft px-5 py-3 text-[15px] font-semibold text-[hsl(277_34%_16%)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";
const quietButton =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-primary-foreground/10 px-5 py-3 text-[15px] font-medium text-primary-foreground transition hover:bg-primary-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";
const textButton =
  "inline-flex min-h-[44px] items-center rounded-md px-1 text-[15px] font-medium text-primary-foreground underline underline-offset-2 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";
const choiceButton =
  "flex min-h-[52px] w-full items-center rounded-xl border border-border bg-primary-foreground/10 px-4 py-3 text-left text-[16px] leading-snug text-primary-foreground transition hover:bg-primary-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

const pickButton =
  "flex min-h-[44px] w-full items-center rounded-lg border border-border bg-primary-foreground/5 px-4 py-2.5 text-left text-[15px] leading-snug text-primary-foreground transition hover:bg-primary-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

/**
 * All six questions, grouped by the path the participant started on, behind a collapsed control.
 * Nothing is listed until the participant opens it. Picking a question opens that one and closes the list;
 * it doesn't change the starting path.
 */
function BrowseQuestions({ pointId, currentId, onPick }) {
  const [open, setOpen] = useState(false);
  const { closest, rest } = groupQuestionsForPath(pointId);
  const panelId = "discovery-all-questions";
  const item = (q) => {
    const current = q.id === currentId;
    return (
      <li key={q.id}>
        <button
          type="button"
          aria-current={current ? "true" : undefined}
          onClick={() => onPick(q)}
          className={`${pickButton} ${current ? "border-primary-foreground bg-primary-foreground/15 font-semibold" : ""}`}
        >
          {q.text}
        </button>
      </li>
    );
  };
  return (
    <div className="mt-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={textButton}
      >
        Browse all questions
        <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open ? (
        <div id={panelId} className="mt-3 space-y-4">
          <div>
            <p className="text-[13px] font-semibold text-primary-foreground/85">Closest to where you started</p>
            <ul className="mt-2 grid gap-2">{closest.map(item)}</ul>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-primary-foreground/85">Other questions</p>
            <ul className="mt-2 grid gap-2">{rest.map(item)}</ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const INITIAL = {
  stage: "welcome",
  pointId: null,
  questionId: null,
  seen: [],
  own: false,
  text: "",
  optionId: null,
  notes: "",
  related: false,
  saveOpen: false,
  title: "",
  savedId: null,
};

/**
 * Maps the saved-discovery row into the DiscoveryRecord shape.
 * The discovery's own details live under `source`, so the title, body and context stay the participant's words.
 */
function toRecordFields(row) {
  return {
    title: row.title,
    body: row.response,
    source: {
      kind: row.source,
      question_id: row.question_id,
      question_text: row.question_text,
      path_id: row.path_id,
      follow_up_text: row.follow_up_text,
      option_id: row.option_id,
      option_label: row.option_label,
      notes: row.notes,
      description: row.description,
    },
  };
}

const textareaClass = "mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-[16px] leading-relaxed text-foreground";

export default function DiscoveryStart({ onSkip, headingLevel = "h2" }) {
  const [state, setState] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
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
  }, [state.stage, state.questionId, state.own]);

  const question = state.questionId && !state.own ? QUESTIONS[state.questionId] : null;
  const written = state.text.trim();
  const followUp = question ? framingFor(state.pointId, question.id).followUp : OWN_FOLLOW_UP;
  const experiment = question ? framingFor(state.pointId, question.id).experiment : OWN_EXPERIMENT;

  const showQuestion = (next, extra = {}) =>
    setState((current) => ({
      ...current,
      ...extra,
      stage: "question",
      questionId: next.id,
      seen: current.seen.includes(next.id) ? current.seen : [...current.seen, next.id],
      own: false,
      text: "",
      optionId: null,
      notes: "",
      related: false,
      saveOpen: false,
      title: "",
      savedId: null,
    }));

  const choosePoint = (pointId) => showQuestion(firstQuestionFor(pointId), { pointId, seen: [] });
  const another = () => {
    const next = anotherQuestionFor(state.pointId, state.questionId, state.seen);
    if (next) showQuestion(next);
  };
  const setOwn = (own) =>
    setState((c) => ({ ...c, own, text: "", optionId: null, notes: "", related: false, saveOpen: false, title: "", savedId: null }));

  // The only function in this file that writes anything. It runs from the Save form's submit and nowhere else.
  // Success is shown only after the account confirms the write. On failure the entered words stay on screen.
  const saveDiscovery = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const data = threadFromDiscovery({ title: state.title, state });
      const entry = state.savedId
        ? await updateDiscoveryConfirmed(state.savedId, toRecordFields(data))
        : await createDiscoveryConfirmed(toRecordFields(data));
      const savedId = entry?.id || state.savedId;
      setState((c) => ({ ...c, savedId, saveOpen: false }));
      setSaveMessage("Saved to Discovery Record.");
    } catch (error) {
      console.error("Discovery save failed", error);
      setSaveMessage("That didn’t save to your account. Your words are still here. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const OriginalResponse = ({ label }) =>
    written ? (
      <p className="max-w-[62ch] rounded-xl bg-primary-foreground/10 px-4 py-3 text-[15px] leading-relaxed text-primary-foreground/90">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="mt-1 block whitespace-pre-wrap break-words">{written}</span>
      </p>
    ) : null;

  const actionButton = `${quietButton} w-full justify-start text-left`;

  return (
    <section
      aria-labelledby="discovery-heading"
      className="discovery-surface relative overflow-hidden rounded-2xl border border-border bg-primary px-5 py-7 text-primary-foreground sm:px-8 sm:py-9"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary-soft" />
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

      {state.stage === "question" && (question || state.own) ? (
        <>
          <p className="text-[13px] font-semibold text-accent-ink">Notice</p>
          <Heading
            id="discovery-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 max-w-[34ch] text-[clamp(1.4rem,1.1rem+1.4vw,1.9rem)] leading-snug text-primary-foreground outline-none"
          >
            {state.own ? "Write your own question, or something you’ve noticed." : question.text}
          </Heading>
          <div className="mt-4">
            <label htmlFor="discovery-own-words" className="block text-[15px] text-primary-foreground/90">
              {state.own ? "Your question or observation" : "Your response, if you want to write one. Optional."}
            </label>
            <textarea
              id="discovery-own-words"
              rows={3}
              maxLength={600}
              value={state.text}
              onChange={(event) => setState((c) => ({ ...c, text: event.target.value }))}
              className={textareaClass}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={state.own && !written}
              onClick={() => setState((c) => ({ ...c, stage: "explore" }))}
            >
              {state.own ? "Explore this" : "Explore this one"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            {state.own ? (
              <button type="button" className={quietButton} onClick={() => setOwn(false)}>
                Use one of the questions instead
              </button>
            ) : (
              <>
                <button type="button" className={quietButton} onClick={another}>
                  Show me another question
                </button>
                <button type="button" className={quietButton} onClick={() => setOwn(true)}>
                  Write my own instead
                </button>
              </>
            )}
          </div>
          {state.own ? null : <BrowseQuestions key={question.id} pointId={state.pointId} currentId={question.id} onPick={showQuestion} />}
        </>
      ) : null}

      {state.stage === "explore" && (question || state.own) ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setState((c) => ({ ...c, stage: "choose" }));
          }}
        >
          <p className="text-[13px] font-semibold text-accent-ink">Explore</p>
          <p className="mt-2 text-[15px] font-semibold text-primary-foreground/90">{question ? question.text : "Your own question or observation"}</p>
          <div className="mt-3">
            <OriginalResponse label={question ? "What you wrote" : "Your question or observation"} />
          </div>
          <Heading
            id="discovery-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 text-[clamp(1.4rem,1.1rem+1.4vw,1.9rem)] leading-snug text-primary-foreground outline-none"
          >
            {followUp}
          </Heading>
          {question ? (
            <fieldset className="mt-4">
              <legend className="sr-only">{followUp} Choose one, or skip.</legend>
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
                    <span className="flex min-h-[52px] items-center gap-3 rounded-xl border border-border bg-primary-foreground/10 px-4 py-3 text-[16px] leading-snug text-primary-foreground transition hover:bg-primary-foreground/20 peer-checked:border-primary-foreground peer-checked:bg-primary-foreground/25 peer-checked:font-semibold peer-checked:shadow-[inset_0_0_0_1px_hsl(var(--primary-foreground))] peer-checked:[&_.dot_span]:opacity-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-foreground">
                      <span aria-hidden="true" className="dot grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-primary-foreground/70">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground opacity-0 transition-opacity" />
                      </span>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className="mt-4">
            <label htmlFor="discovery-notes" className="block text-[15px] text-primary-foreground/90">
              Anything you notice, about the subject or about yourself. Optional.
            </label>
            <textarea
              id="discovery-notes"
              rows={3}
              maxLength={600}
              value={state.notes}
              onChange={(event) => setState((c) => ({ ...c, notes: event.target.value }))}
              className={textareaClass}
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className={primaryButton}>
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className={quietButton} onClick={() => setState((c) => ({ ...c, stage: "question" }))}>
              Back
            </button>
          </div>
        </form>
      ) : null}

      {state.stage === "choose" && (question || state.own) ? (
        <div className="space-y-5">
          <p className="text-[13px] font-semibold text-accent-ink">Choose</p>
          <Heading
            id="discovery-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-[clamp(1.3rem,1.05rem+1.2vw,1.7rem)] leading-snug text-primary-foreground outline-none"
          >
            What would you like to do next?
          </Heading>
          <OriginalResponse label={question ? "What you wrote" : "Your question or observation"} />
          {state.notes.trim() ? (
            <p className="max-w-[62ch] rounded-xl bg-primary-foreground/10 px-4 py-3 text-[15px] leading-relaxed text-primary-foreground/90">
              <span className="block text-[13px] font-semibold">Your notes</span>
              <span className="mt-1 block whitespace-pre-wrap break-words">{state.notes.trim()}</span>
            </p>
          ) : null}
          {question && state.optionId ? (
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-primary-foreground/95">{thoughtFor(question.id, state.optionId)}</p>
          ) : null}

          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <button type="button" className={actionButton} onClick={() => setState((c) => ({ ...c, stage: "explore" }))}>
                Keep exploring
              </button>
            </li>
            <li>
              <button
                type="button"
                aria-expanded={state.saveOpen}
                aria-controls={state.saveOpen ? "discovery-save-form" : undefined}
                className={actionButton}
                onClick={() => {
                  setSaveMessage("");
                  setState((c) => ({ ...c, saveOpen: !c.saveOpen }));
                }}
              >
                {state.savedId ? "Update My Discoveries" : "Save to My Discoveries"}
              </button>
            </li>
            <li>
              <button
                type="button"
                aria-expanded={state.related}
                aria-controls={state.related ? "discovery-experiment" : undefined}
                className={actionButton}
                onClick={() => setState((c) => ({ ...c, related: !c.related }))}
              >
                Try something related
              </button>
            </li>
            <li>
              <button type="button" className={actionButton} onClick={another}>
                Explore something else
              </button>
            </li>
          </ul>
          {state.saveOpen ? (
            <form
              id="discovery-save-form"
              className="rounded-xl border border-border px-4 py-4"
              onSubmit={(event) => {
                event.preventDefault();
                saveDiscovery();
              }}
            >
              <label htmlFor="discovery-title" className="block text-[15px] text-primary-foreground/90">
                Give it a title, if you want one. Optional.
              </label>
              <input
                id="discovery-title"
                type="text"
                maxLength={TITLE_MAX}
                value={state.title}
                onChange={(event) => setState((c) => ({ ...c, title: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-[16px] text-foreground"
              />
              <p className="mt-2 text-[14px] leading-relaxed text-primary-foreground/85">
                This keeps the question, what you wrote, your answer to the follow-up, and your notes. It goes to your
                Entrepalooza account. It isn’t copied to your Journal, Life Map or Records.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className={`${primaryButton} disabled:opacity-60`}>
                  {saving ? "Saving…" : state.savedId ? "Update" : "Save"}
                </button>
                <button type="button" className={quietButton} onClick={() => setState((c) => ({ ...c, saveOpen: false }))}>
                  Not now
                </button>
              </div>
            </form>
          ) : null}
          {saveMessage ? (
            <p role="status" className="text-[15px] font-medium text-primary-foreground">
              {saveMessage}{" "}
              {state.savedId && saveMessage !== "" && !saveMessage.startsWith("That didn") ? (
                <Link to="/my-discoveries" className="underline underline-offset-2">
                  Open My Discoveries
                </Link>
              ) : null}
            </p>
          ) : null}

          {state.related ? (
            <div id="discovery-experiment" className="rounded-xl border border-border px-4 py-4">
              <p className="text-[13px] font-semibold text-accent-ink">A small experiment · optional</p>
              <p className="mt-1 max-w-[60ch] text-[16px] leading-relaxed text-primary-foreground/95">{experiment}</p>
              <p className="mt-2 text-[14px] text-primary-foreground/80">Skip it if it doesn’t fit.</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <button type="button" className={textButton} onClick={onSkip}>
            Skip this and go to the workbook
          </button>
          <Link to="/my-discoveries" className={textButton}>
            My Discoveries
          </Link>
          {state.stage !== "welcome" ? (
            <button type="button" className={textButton} onClick={() => {
                setSaveMessage("");
                setState(INITIAL);
              }}>
              Start over
            </button>
          ) : null}
        </div>
        <p className="flex items-start gap-2 text-[14px] leading-relaxed text-primary-foreground/85">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Nothing you choose or type here is saved unless you press Save to My Discoveries. If you don’t, it’s gone
            when you leave this page. If you do, it goes to your Entrepalooza account, and it isn’t copied to your
            Journal, Life Map or Records.
          </span>
        </p>
      </div>
    </section>
  );
}
