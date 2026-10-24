import React, { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import PrivacyNote from "./PrivacyNote";
import { getAnswer, setAnswer, useAnswers, answerKey } from "@/lib/workbook";
import { entryForPrompt, journalStepHref, saveAnswer } from "@/lib/journal";
import { GO_DEEPER_KEY, JOURNAL_INTRO, goDeeperFor } from "@/lib/journalPrompts";
import { plainValue } from "@/lib/moduleOne";

/** The lesson title, provided by LessonView, so journal entries are filed under the lesson. */
export const JournalLessonTitle = createContext("");

const PROMPT_KEY = (code) => answerKey(code, GO_DEEPER_KEY);

/** The latest journal wording wins, so edits made on the Journal page show here too. */
function savedText(code) {
  const entry = entryForPrompt(code, PROMPT_KEY(code));
  if (entry && typeof entry.body === "string") return entry.body;
  return String(getAnswer(code, GO_DEEPER_KEY) || "");
}

/**
 * Conversation Journal: Go Deeper. One open writing area per lesson, saved as it is typed
 * into the participant's existing, private Conversation Journal (one entry per lesson).
 * Nothing is written until the participant types, so an earlier entry is never blanked.
 */
export default function GoDeeperJournal({ lessonCode, lessonTitle: titleProp = "" }) {
  const contextTitle = useContext(JournalLessonTitle);
  const lessonTitle = titleProp || contextTitle;
  const answers = useAnswers();
  const set = goDeeperFor(lessonCode, answers);
  const id = useId();
  const [value, setValue] = useState(() => savedText(lessonCode));
  const [state, setState] = useState("idle");
  const timer = useRef(null);
  const pending = useRef(null);
  const label = set ? set.primary : "";

  useEffect(() => {
    setValue(savedText(lessonCode));
    setState("idle");
  }, [lessonCode]);

  const write = (text) => {
    setAnswer(lessonCode, GO_DEEPER_KEY, text);
    saveAnswer({
      lessonCode,
      lessonTitle,
      promptKey: PROMPT_KEY(lessonCode),
      promptLabel: `Go deeper: ${label}`,
      body: text,
    });
  };

  const writeRef = useRef(write);
  writeRef.current = write;

  // Leaving the lesson, or closing the tab, mid-pause still saves what was typed.
  useEffect(() => {
    const flush = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      if (pending.current !== null) {
        const text = pending.current;
        pending.current = null;
        writeRef.current(text);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonCode]);

  if (!set) return null;

  const onChange = (event) => {
    const next = event.target.value;
    setValue(next);
    setState("saving");
    pending.current = next;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      pending.current = null;
      write(next);
      setState(savedText(lessonCode) === next ? "saved" : "error");
    }, 700);
  };

  const earlier = set.earlier ? plainValue((answers || {})[set.earlier.key]).trim() : "";
  const headingId = `go-deeper-${id}`;

  return (
    <section aria-labelledby={headingId} className="rounded-2xl border-2 border-primary/30 bg-card p-5 sm:p-7">
      <p className="flex items-center gap-2 workbook-label">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Conversation Journal
      </p>
      <h2 id={headingId} className="mt-1 text-[clamp(1.35rem,1.1rem+1vw,1.75rem)] leading-tight">
        Conversation Journal — Go Deeper
      </h2>
      <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">{JOURNAL_INTRO}</p>

      <label htmlFor={`${headingId}-text`} className="mt-5 block max-w-[68ch] font-heading text-[20px] leading-snug text-foreground">
        {set.primary}
      </label>

      <div className="mt-4">
        <p className="text-[14px] font-semibold uppercase tracking-wide text-muted-faint">If you want somewhere to go next</p>
        <ul className="mt-2 space-y-1.5 pl-5 text-[16px] leading-relaxed text-foreground list-disc">
          {set.followUps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {set.note ? <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{set.note}</p> : null}

      {earlier ? (
        <div className="mt-4 border-l-2 border-primary/50 pl-3">
          <p className="text-[13px] text-muted-foreground">{set.earlier.label}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{earlier}</p>
        </div>
      ) : null}

      <div className="mt-5">
        <Textarea
          id={`${headingId}-text`}
          value={value}
          onChange={onChange}
          rows={9}
          placeholder="Write as much or as little as you like."
          className="min-h-[14rem] resize-y text-[17px]"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span aria-live="polite" className="text-[14px] text-accent-ink">
            {state === "saved" ? "Saved to your journal" : state === "saving" ? "Saving…" : state === "error" ? "Not saved. Try again." : value.trim() ? "Saved earlier. You can keep editing." : ""}
          </span>
          <Link
            to={journalStepHref(lessonCode)}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Open my journal entries for this lesson
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <PrivacyNote>
          Saved to your private Conversation Journal. It isn’t shared with anyone unless you choose to share it from your
          journal.
        </PrivacyNote>
        <p className="text-[14px] text-muted-faint">This isn’t graded, and there’s no length to reach. Writing here is optional.</p>
      </div>
    </section>
  );
}
