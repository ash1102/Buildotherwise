import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import SaveRow from "./SaveRow";
import { joinSummary, parseValues } from "@/lib/preview/responses";

/**
 * Optional writing. Every box can be left empty, and an empty box is a complete
 * answer rather than a gap in the record.
 */
export default function FieldsBlock({ block, record, onSave, saving, canSave }) {
  const [values, setValues] = useState(() => parseValues(record));
  const [saved, setSaved] = useState(Boolean(record));

  const setField = (id, value) => {
    setValues((current) => ({ ...current, [id]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    const text = joinSummary((block.fields || []).map((field) => ({ label: field.label, value: values[field.id] })));
    await onSave({ values, text: text || "No response" });
    setSaved(true);
  };

  return (
    <div>
      {block.question ? (
        <p className="max-w-[68ch] text-[17px] leading-relaxed text-foreground">{block.question}</p>
      ) : null}

      <div className="mt-4 space-y-5">
        {(block.fields || []).map((field) => (
          <div key={field.id}>
            <label htmlFor={`${block.id}-${field.id}`} className="block text-[15px] font-medium text-foreground">
              {field.label}
            </label>
            <Textarea
              id={`${block.id}-${field.id}`}
              value={values[field.id] || ""}
              onChange={(event) => setField(field.id, event.target.value)}
              placeholder="Optional. One line is enough."
              className="mt-2"
            />
          </div>
        ))}
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