import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getAnswer, setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { addSpokenWords } from "@/lib/dictation";

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
  const timer = useRef(null);
  const valueRef = useRef(value);
  const handleRef = useRef(null);

  useEffect(() => {
    setValue(getAnswer(lessonCode, index));
    setState("idle");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lessonCode, index]);

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
    });
    return () => onBind(fieldKey, null);
  }, [fieldKey, onBind]);

  const handleChange = (next) => {
    setValue(next);
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
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
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        <span aria-live="polite" className="text-[14px] text-accent-ink">
          {state === "saved" ? "Saved" : state === "saving" ? "Saving…" : state === "error" ? "Not saved. Try again." : ""}
        </span>
      </div>
    </div>
  );
}