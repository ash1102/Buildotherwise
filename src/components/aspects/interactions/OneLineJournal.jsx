import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEntry } from "@/lib/journal";
import DictateButton from "@/components/workbook/DictateButton";

export default function OneLineJournal() {
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(null);

  const save = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const entry = addEntry({
      kind: "free",
      body: trimmed,
      prompt_label: "A first line",
      route: "/aspect/guided-journal",
    });
    setSaved(entry);
    setBody("");
  };

  return (
    <div>
      <label className="workbook-label" htmlFor="aspect-line">
        One line about today
      </label>
      <Textarea
        id="aspect-line"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        className="mt-2 min-h-[92px] bg-ivory/50 text-[15px] leading-relaxed"
        placeholder="Whatever is on your mind. You can leave it half-finished."
      />

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <DictateButton value={body} onText={setBody} />
        <Button onClick={save} disabled={!body.trim()} className="rounded-full">
          Save to your journal
        </Button>
        {saved ? (
          <span className="inline-flex items-center gap-2 text-[13px] text-teal-deep">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Saved to this browser, at {new Date(saved.created_date).toLocaleDateString()}.
          </span>
        ) : null}
      </div>

      {saved ? (
        <Link
          to="/journal"
          className="mt-4 inline-flex items-center gap-2 text-[13px] text-teal-deep transition hover:text-copper"
        >
          Open your journal
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}