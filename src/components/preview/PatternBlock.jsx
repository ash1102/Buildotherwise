import React, { useState } from "react";
import SaveRow from "./SaveRow";
import { joinSummary, parseValues } from "@/lib/preview/responses";

/**
 * Two invented people, four equal options each, an explanation after every pick.
 * No score, no scale, and no type is assigned to anyone.
 */
export default function PatternBlock({ block, record, onSave, saving, canSave }) {
  const [values, setValues] = useState(() => parseValues(record));
  const [saved, setSaved] = useState(Boolean(record));
  const picks = values.picks || {};

  const pick = (personId, option) => {
    setSaved(false);
    setValues((current) => ({
      ...current,
      picks: { ...(current.picks || {}), [personId]: current.picks && current.picks[personId] === option ? "" : option },
    }));
  };

  const handleSave = async () => {
    const text = joinSummary(
      (block.people || []).map((person) => ({ label: person.name, value: picks[person.id] }))
    );
    await onSave({ values, text: text || "No response" });
    setSaved(true);
  };

  return (
    <div>
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">{block.instruction}</p>

      <div className="mt-4 space-y-5">
        {(block.people || []).map((person) => {
          const chosen = picks[person.id];
          return (
            <div key={person.id} className="rounded-lg border border-border bg-background p-4">
              <h4>{person.name}</h4>
              <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-foreground">{person.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(block.options || []).map((option) => {
                  const active = chosen === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => pick(person.id, option)}
                      className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                        active
                          ? "border-primary bg-primary-wash font-medium text-foreground"
                          : "border-input bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {chosen ? (
                <p aria-live="polite" className="mt-3 border-l-2 border-accent-soft pl-3 text-[16px] leading-relaxed text-muted-foreground">
                  {person.explanations[chosen]}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {block.boundary ? (
        <p className="mt-4 rounded-md border border-dashed border-input bg-secondary p-3 text-[15px] leading-relaxed text-muted-foreground">
          {block.boundary}
        </p>
      ) : null}

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