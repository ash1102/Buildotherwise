import React, { useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DictateButton from "@/components/workbook/DictateButton";

/** Editing asks, each time, whether the earlier wording stays. */
export default function EditEntryPanel({ entry, onSave, onCancel }) {
  const [text, setText] = useState(entry.body || "");
  const empty = !text.trim();

  return (
    <section className="rounded-lg border border-teal-deep/30 bg-white p-5">
      <p className="workbook-label">Editing the entry from {moment(entry.created_date).format("D MMM YYYY, HH:mm")}</p>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        aria-label="Edited entry wording"
        className="mt-3 border-natural bg-ivory/40 text-[14px] leading-relaxed"
      />
      <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
        Keep the earlier wording beside this one, or replace it in place. Either way it stays in your journal.
      </p>
      <div className="mt-3">
        <DictateButton value={text} onText={setText} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={empty}
          onClick={() => onSave("keep", text.trim())}
          className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
        >
          Keep the earlier wording
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={empty}
          onClick={() => onSave("replace", text.trim())}
          className="rounded-full border-natural bg-white"
        >
          Replace the wording
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-full text-ink-soft">
          Cancel
        </Button>
      </div>
    </section>
  );
}