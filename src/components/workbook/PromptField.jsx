import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getAnswer, setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { addSpokenWords } from "@/lib/dictation";
import AnswerFeedback from "@/components/feedback/AnswerFeedback";

/**
 * One question, with the question itself as the label above the box. The answer is
 * saved as it is typed and joins the Conversation Journal as an entry linked to
 * this step, so it is never typed twice.
 */
export default function PromptField({
  lessonCode,
  lessonTitle,
  index,
  label,
  route,
  onSaved,
  variant = "card",
  compact = false,
  fieldKey,
  onBind,
  onActivate,
}) {
  const [value, setValue] = useState(() => getAnswer(lessonCode, index));
  const [state, setState] = useState("idle");
  const [invitation, setInvitation] = useState(false);
  const [declined, setDeclined] = useState(false);
  const timer = useRef(null);
  const valueRef = useRef(value);
  const handleRef = useRef(null);
  const areaRef = useRef(null);

  useEffect(() => {
    setValue(getAnswer(lessonCode, index));
    setState("idle");
    setInvitation(false);
    setDeclined(false);
  }, [lessonCode, index]);

  // Leaving the step before the pause ends still writes the note, so the journal has it.
  useEffect(() => {
    return () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
      timer.current = null;
      const pending = valueRef.current;
      setAnswer(lessonCode, index, pending);
      saveAnswer({
        lessonCode,
        lessonTitle,
        promptKey: `${lessonCode}#${index}`,
        promptLabel: label,
        body: pending,
        route,
      });
    };
  }, [lessonCode, lessonTitle, index, label, route]);

  valueRef.current = value;

  useEffect(() => {
    if (!onBind || !fieldKey) return undefined;
    onBind(fieldKey, {
      getValue: () => valueRef.current,
      // Dictation hands over only the words just heard. They are added to whatever
      // is in the box at that moment, so typing and speaking never cancel each other.
      insertText: (heard, previousTail) => {
        if (handleRef.current) handleRef.current(addSpokenWords(valueRef.current, heard, previousTail));
      },
      focus: () => {
        if (areaRef.current) areaRef.current.focus();
      },
    });
    return () => onBind(fieldKey, null);
  }, [fieldKey, onBind]);

  const handleChange = (next) => {
    setValue(next);
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setAnswer(lessonCode, index, next);
      saveAnswer({
        lessonCode,
        lessonTitle,
        promptKey: `${lessonCode}#${index}`,
        promptLabel: label,
        body: next,
        route,
      });
      // "Saved" is only shown once the words really read back from the browser's storage.
      setState(String(getAnswer(lessonCode, index)) === String(next) ? "saved" : "error");
      if (!declined && next.trim().length >= 10) setInvitation(true);
      if (onSaved) onSaved();
    }, 650);
  };

  handleRef.current = handleChange;

  return (
    <div className={variant === "inline" ? "" : "rounded-xl border border-border bg-card p-4 sm:p-5"}>
      <label htmlFor={`${lessonCode}-${index}`} className="block text-[16px] font-medium leading-snug text-foreground">
        {label}
      </label>
      <Textarea
        ref={areaRef}
        id={`${lessonCode}-${index}`}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          if (onActivate) onActivate(fieldKey);
        }}
        rows={compact ? 1 : 3}
        placeholder={compact ? "One line is enough." : "A few words are enough."}
        className={`mt-2 resize-y border-input bg-card text-[16px] leading-relaxed ${
          compact ? "min-h-[2.75rem]" : "min-h-[5rem]"
        }`}
      />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        {!compact && String(value || "").trim().length >= 10 && invitation && !declined ? (
          <div className="w-full rounded-lg border border-border bg-card p-3 text-sm" role="group" aria-label="Optional discovery invitation">
            <p className="font-medium">Want to explore that a little further?</p>
            <p className="mt-1 text-muted-foreground">We can look at your answer together, or you can keep going. Your choice.</p>
            <div className="mt-2 flex gap-3">
              <button type="button" className="underline underline-offset-2" onClick={() => setInvitation(false)}>Not now</button>
              <button type="button" className="underline underline-offset-2" onClick={() => { setDeclined(true); setInvitation(false); }}>Keep going</button>
            </div>
          </div>
        ) : null}
        {!compact && String(value || "").trim().length >= 10 ? (
          <AnswerFeedback
            className="min-w-0 flex-1"
            sourceType="workbook_answer"
            sourceKey={`${lessonCode}#${index}`}
            sourceLabel={label}
            lessonCode={lessonCode}
            promptId={index}
            getText={() => valueRef.current}
          />
        ) : (
          <span />
        )}
        <span aria-live="polite" className="text-[14px] text-accent-ink">
          {state === "saved" ? "Saved" : state === "saving" ? "Saving…" : state === "error" ? "Not saved. Try again." : ""}
        </span>
      </div>
    </div>
  );
}