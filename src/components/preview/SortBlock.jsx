import React, { useState } from "react";
import SaveRow from "./SaveRow";
import { joinSummary, parseValues } from "@/lib/preview/responses";

/**
 * Sorting with explanations and no marks. A wrong pick is not possible here:
 * every statement brings its own explanation, whatever category it is put in.
 */
export default function SortBlock({ block, record, onSave, onClear, saving, canSave }) {
  const [values, setValues] = useState(() => parseValues(record));
  const [saved, setSaved] = useState(Boolean(record));
  const assignments = values.assignments || {};

  const assign = (itemId, categoryId) => {
    setSaved(false);
    setValues((current) => ({ ...current, assignments: { ...(current.assignments || {}), [itemId]: categoryId } }));
  };

  const handleSave = async () => {
    const text = joinSummary(
      (block.items || []).map((item) => {
        const category = (block.categories || []).find((entry) => entry.id === assignments[item.id]);
        return { label: item.text, value: category ? category.label : "" };
      })
    );
    await onSave({ values, text: text || "No response" });
    setSaved(true);
  };

  const handleClear = () => {
    setValues({ assignments: {} });
    setSaved(false);
    if (onClear) onClear();
  };

  return (
    <div>
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">{block.instruction}</p>

      <ul className="mt-4 space-y-4">
        {(block.items || []).map((item) => {
          const chosen = assignments[item.id];
          return (
            <li key={item.id} className="rounded-lg border border-border bg-background p-4">
              <p className="text-[17px] leading-relaxed text-foreground">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(block.categories || []).map((category) => {
                  const active = chosen === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => assign(item.id, category.id)}
                      className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                        active
                          ? "border-primary bg-primary-wash font-medium text-foreground"
                          : "border-input bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
              {chosen ? (
                <p aria-live="polite" className="mt-3 border-l-2 border-accent-soft pl-3 text-[16px] leading-relaxed text-muted-foreground">
                  {item.explanation}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {block.footnote ? <p className="mt-4 text-[15px] text-muted-faint">{block.footnote}</p> : null}

      <SaveRow
        onSave={handleSave}
        onClear={handleClear}
        saving={saving}
        canSave={canSave}
        savedLabel={saved ? "Saved to your account." : "Not saved yet."}
        signedOutNote="Log in to save your own answers in this preview."
      />
    </div>
  );
}