import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import SaveRow from "./SaveRow";
import { parseValues } from "@/lib/preview/responses";
import { CONTINUE_LOOKING, NEXT_DECISION_LABELS } from "@/lib/preview/tags";

/**
 * The seven decisions, exactly as the curriculum names them. Every one is a
 * complete answer, none is highlighted, and no decision is ever recorded for
 * someone who skipped or left the step blank.
 */
export default function DecisionBlock({ block, record, onSave, saving, canSave }) {
  const [values, setValues] = useState(() => parseValues(record));
  const [saved, setSaved] = useState(Boolean(record));

  const set = (changes) => {
    setSaved(false);
    setValues((current) => ({ ...current, ...changes }));
  };

  const handleSave = async () => {
    if (!values.decision) {
      await onSave({ values: { decision: "", unknown: "" }, text: "No response" });
      setSaved(true);
      return;
    }
    const line = `Next Decision: ${values.decision}`;
    const extra =
      values.decision === CONTINUE_LOOKING && String(values.unknown || "").trim()
        ? `\nWhat’s still unknown, and when I’ll look again: ${values.unknown}`
        : "";
    await onSave({ values, text: `${line}${extra}` });
    setSaved(true);
  };

  return (
    <div>
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        {block.note || "Pick one. “I don’t know yet” is fine."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(block.options && block.options.length ? block.options : NEXT_DECISION_LABELS).map((label) => {
          const active = values.decision === label;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => set({ decision: active ? "" : label })}
              className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                active
                  ? "border-primary bg-primary-wash font-medium text-foreground"
                  : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {values.decision === CONTINUE_LOOKING ? (
        <div className="mt-4">
          <label htmlFor={`${block.id}-unknown`} className="block text-[15px] font-medium text-foreground">
            What’s still unknown, and when will I look again?
          </label>
          <Textarea
            id={`${block.id}-unknown`}
            value={values.unknown || ""}
            onChange={(event) => set({ unknown: event.target.value.slice(0, 1000) })}
            placeholder="Optional."
            className="mt-2"
          />
        </div>
      ) : null}

      <SaveRow
        onSave={handleSave}
        saving={saving}
        canSave={canSave}
        savedLabel={saved ? "Saved to your account." : "Not saved yet."}
        signedOutNote="Log in to save your own decision in this preview."
      />
    </div>
  );
}