import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getAnswer, setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import PrivacyNote from "./PrivacyNote";
import DictateButton from "./DictateButton";

/**
 * One question. The answer autosaves and joins the Conversation Journal as an
 * entry linked to this step, so it is never typed twice.
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
}) {
  const [value, setValue] = useState(() => getAnswer(lessonCode, index));
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => {
    setValue(getAnswer(lessonCode, index));
    setState("idle");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lessonCode, index]);

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
      setState("saved");
      if (onSaved) onSaved();
    }, 650);
  };

  return (
    <div className={variant === "inline" ? "" : "rounded-lg border border-natural bg-white p-4 sm:p-5"}>
      <label className="block font-heading text-[16px] leading-snug text-ink" htmlFor={`${lessonCode}-${index}`}>
        {label}
      </label>
      <Textarea
        id={`${lessonCode}-${index}`}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        rows={compact ? 1 : 3}
        placeholder={
          compact
            ? "One line is enough."
            : "Write as much or as little as you want. “I don't know yet” is a complete answer."
        }
        className={`mt-3 resize-y border-natural bg-ivory/60 text-[14px] leading-relaxed ${
          compact ? "min-h-[2.75rem]" : "min-h-[5rem]"
        }`}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <DictateButton value={value} onText={handleChange} />
          <PrivacyNote />
        </div>
        <span aria-live="polite" className="text-[12px] text-teal-deep">
          {state === "saved" ? "Saved to your journal" : state === "saving" ? "Saving…" : ""}
        </span>
      </div>
    </div>
  );
}