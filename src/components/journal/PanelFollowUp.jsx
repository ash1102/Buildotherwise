import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DictateButton from "@/components/workbook/DictateButton";

/** Three ways back into an entry, so a thought can keep going. */
const STARTERS = ["Here’s what happened next…", "I see this differently now…", "This question is still open…"];

export default function PanelFollowUp({ onSave, onCancel }) {
  const [text, setText] = useState("");

  const startWith = (starter) => {
    setText((previous) => (previous.trim() ? previous : `${starter} `));
  };

  return (
    <div className="mt-2 rounded-lg border border-teal-deep/25 bg-ivory/70 p-3">
      <p className="workbook-label">Add a follow-up</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STARTERS.map((starter) => (
          <button
            key={starter}
            type="button"
            onClick={() => startWith(starter)}
            className="rounded-full border border-natural bg-white px-2.5 py-1 text-[11.5px] text-ink-soft transition hover:border-teal-deep/50"
          >
            {starter}
          </button>
        ))}
      </div>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        autoFocus
        aria-label="Follow-up to this entry"
        className="mt-2 min-h-[4rem] border-natural bg-white text-[13px] leading-relaxed"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DictateButton value={text} onText={setText} />
        <Button
          type="button"
          size="sm"
          disabled={!text.trim()}
          onClick={() => onSave(text.trim())}
          className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
        >
          Add follow-up
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="rounded-full text-ink-soft">
          Cancel
        </Button>
      </div>
    </div>
  );
}