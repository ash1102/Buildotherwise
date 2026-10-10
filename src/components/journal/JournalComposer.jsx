import React, { useRef, useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEntry } from "@/lib/journal";
import { readStore, writeStore } from "@/lib/store";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DictateButton from "@/components/workbook/DictateButton";

const DRAFT_KEY = "journalPageDraft";

/** Offered to help someone begin. None of them is required. */
const OPENERS = [
  "Something I noticed",
  "A question I’m carrying",
  "Something I tried",
  "Something I see differently now",
  "Just write",
];

/** The always-visible writing box — the main action on the journal. */
export default function JournalComposer() {
  const [draft, setDraft] = useState(() => readStore(DRAFT_KEY, ""));
  const [opener, setOpener] = useState("");
  const [saved, setSaved] = useState(false);
  const areaRef = useRef(null);

  const write = (value) => {
    setDraft(value);
    setSaved(false);
    writeStore(DRAFT_KEY, value);
  };

  const chooseOpener = (label) => {
    setOpener(label);
    // A starting point only gives the first line; anything already typed is left alone.
    if (label !== "Just write" && !draft.trim()) write(`${label}\n`);
    areaRef.current?.focus();
  };

  const save = () => {
    const body = draft.trim();
    if (!body) return;
    addEntry({
      kind: "free",
      body,
      prompt: opener || "freeform",
      prompt_label: opener && opener !== "Just write" ? opener : "Written freely",
    });
    write("");
    setOpener("");
    setSaved(true);
  };

  return (
    <section className="rounded-lg border border-teal-deep/25 bg-white p-5 sm:p-6">
      <label htmlFor="journal-entry-box" className="workbook-label block">
        What’s on your mind?
      </label>
      <Textarea
        id="journal-entry-box"
        ref={areaRef}
        value={draft}
        onChange={(event) => write(event.target.value)}
        rows={4}
        placeholder="A noticing, a question, something you tried — whatever is worth keeping."
        className="mt-3 min-h-[7rem] resize-y border-natural bg-ivory/40 text-[14.5px] leading-relaxed"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {OPENERS.map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={opener === label}
            onClick={() => chooseOpener(label)}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
              opener === label
                ? "border-teal-deep bg-teal-deep text-ivory"
                : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <DictateButton value={draft} onText={write} />
        <Button
          type="button"
          onClick={save}
          disabled={!draft.trim()}
          className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
        >
          <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
          Save this entry
        </Button>
        {saved ? <span className="text-[12.5px] text-teal-deep">Saved.</span> : null}
        <PrivacyNote>Kept in this browser until you share an entry.</PrivacyNote>
      </div>
    </section>
  );
}