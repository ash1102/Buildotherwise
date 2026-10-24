import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { setAnswer } from "@/lib/workbook";
import { entryForPrompt, journalStepHref, saveAnswer, useJournalEntries } from "@/lib/journal";
import PrivacyNote from "./PrivacyNote";

/**
 * Conversation Journal: Go Deeper. One open writing area per lesson, saved into the
 * existing journal as a single entry (prompt key `<code>#go-deeper`), so it is never
 * duplicated. The journal entry is the source of truth: if someone edits it on the
 * Journal page (replacing it, or keeping the earlier wording as a revision), the
 * newest version shows here, and further writing here updates that version.
 */
export default function GoDeeperJournal({ lesson, prompt, followUps = [], intro }) {
  const promptKey = `${lesson.code}#go-deeper`;
  const entries = useJournalEntries();
  const saved = entryForPrompt(lesson.code, promptKey);
  const savedBody = saved ? saved.body || "" : "";
  const [value, setValue] = useState(savedBody);
  const [state, setState] = useState("idle");
  const editing = useRef(false);
  const timer = useRef(null);
  const latest = useRef(value);
  latest.current = value;

  // Pick up edits made on the Journal page, unless someone is typing here.
  useEffect(() => {
    if (!editing.current && !timer.current) setValue(savedBody);
  }, [savedBody, entries]);

  const write = (text) => {
    setAnswer(lesson.code, "go-deeper", text);
    saveAnswer({
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      promptKey,
      promptLabel: `Go deeper: ${prompt}`,
      body: text,
    });
  };

  // Leaving before the pause ends still saves.
  useEffect(
    () => () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
      timer.current = null;
      write(latest.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const change = (text) => {
    setValue(text);
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      write(text);
      setState("saved");
    }, 700);
  };

  const id = `${lesson.code}-go-deeper`;
  return (
    <section aria-labelledby={`${id}-label`} className="space-y-4 rounded-2xl border border-primary/40 bg-card p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-accent-ink" aria-hidden="true" />
        <p className="workbook-label">Conversation Journal · Go deeper</p>
      </div>
      <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
      <label id={`${id}-label`} htmlFor={id} className="block font-heading text-[19px] font-semibold leading-snug text-foreground">
        {prompt}
      </label>
      {followUps.length ? (
        <div>
          <p className="text-[14px] font-medium text-muted-foreground">If you want somewhere to start (optional)</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-foreground">
            {followUps.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Textarea
        id={id}
        value={value}
        onFocus={() => {
          editing.current = true;
        }}
        onBlur={() => {
          editing.current = false;
        }}
        onChange={(event) => change(event.target.value)}
        rows={7}
        placeholder="Write as much or as little as you like."
        className="min-h-[10rem] resize-y border-input bg-card text-[16px] leading-relaxed"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span aria-live="polite" className="text-[14px] text-accent-ink">
          {state === "saved" ? "Saved to your journal" : state === "saving" ? "Saving…" : saved ? "In your journal" : ""}
        </span>
        <Link to={journalStepHref(lesson.code)} className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Open in your journal
        </Link>
      </div>
      <PrivacyNote>Saved to your private journal as you write. You can come back and change it here or in the journal.</PrivacyNote>
    </section>
  );
}
