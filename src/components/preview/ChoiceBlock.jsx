import React, { useState } from "react";
import SaveRow from "./SaveRow";
import { joinSummary, parseValues } from "@/lib/preview/responses";

/**
 * Choices with no scores and no recommended answer. Nothing is selected until
 * the person selects it, and a group can be left alone entirely.
 */
export default function ChoiceBlock({ block, record, onSave, saving, canSave }) {
  const [values, setValues] = useState(() => parseValues(record));
  const [saved, setSaved] = useState(Boolean(record));

  const toggle = (group, optionId) => {
    setSaved(false);
    setValues((current) => {
      const chosen = current[group.id];
      if (group.multi) {
        const list = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
        if (group.clearsOthers && group.clearsOthers.includes(optionId)) {
          return { ...current, [group.id]: list.includes(optionId) ? [] : [optionId] };
        }
        const without = group.clearsOthers ? list.filter((id) => !group.clearsOthers.includes(id)) : list;
        const next = without.includes(optionId) ? without.filter((id) => id !== optionId) : [...without, optionId];
        return { ...current, [group.id]: next };
      }
      return { ...current, [group.id]: chosen === optionId ? "" : optionId };
    });
  };

  const labelFor = (group, id) => {
    const option = (group.options || []).find((item) => item.id === id);
    return option ? option.label : id;
  };

  const handleSave = async () => {
    const text = joinSummary(
      (block.groups || []).map((group) => {
        const chosen = values[group.id];
        const list = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
        return { label: group.question, value: list.map((id) => labelFor(group, id)).join(", ") };
      })
    );
    await onSave({ values, text: text || "No response" });
    setSaved(true);
  };

  return (
    <div>
      {block.instruction ? (
        <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">{block.instruction}</p>
      ) : null}

      <div className="mt-4 space-y-6">
        {(block.groups || []).map((group) => {
          const chosen = values[group.id];
          const list = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
          return (
            <fieldset key={group.id}>
              <legend className="text-[15px] font-medium text-foreground">{group.question}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(group.options || []).map((option) => {
                  const active = list.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(group, option.id)}
                      className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                        active
                          ? "border-primary bg-primary-wash font-medium text-foreground"
                          : "border-input bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {group.multi ? (
                <p className="mt-2 text-[14px] text-muted-faint">More than one is allowed. Nothing here is ranked.</p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <SaveRow
        onSave={handleSave}
        saving={saving}
        canSave={canSave}
        savedLabel={saved ? "Saved to your account." : "Not saved yet."}
        signedOutNote="Log in to save your own answers in this preview."
      />
    </div>
  );
}