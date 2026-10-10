import React, { useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DictateButton from "@/components/workbook/DictateButton";

/** Writing what happened next, without changing the entry being answered. */
export default function FollowUpPanel({ entry, onSave, onCancel }) {
  const [text, setText] = useState("");
  const empty = !text.trim();

  return (
    <section className="rounded-lg border border-teal-deep/30 bg-white p-5">
      <p className="workbook-label">Follow-up to {moment(entry.created_date).format("D MMM YYYY")}</p>
      <p className="mt-2 border-l border-dashed border-natural-deep pl-3 text-[13px] leading-relaxed text-ink-faint">
        {entry.body}
      </p>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        autoFocus
        aria-label="Follow-up"
        placeholder="What happened next, or what you see now."
        className="mt-3 border-natural bg-ivory/40 text-[14px] leading-relaxed"
      />
      <div className="mt-3">
        <DictateButton value={text} onText={setText} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={empty}
          onClick={() => onSave(text.trim())}
          className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
        >
          Add this follow-up
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-full text-ink-soft">
          Cancel
        </Button>
      </div>
    </section>
  );
}