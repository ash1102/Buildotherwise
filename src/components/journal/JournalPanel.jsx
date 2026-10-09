import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEntry, useJournalEntries } from "@/lib/journal";
import { readStore, writeStore } from "@/lib/store";
import EntryCard from "./EntryCard";

const DRAFT_KEY = "journalDraft";

/**
 * The slide-over panel. It is mounted once in the layout, so the journal is on
 * every page, and draft text survives being closed.
 */
export default function JournalPanel({ open, onClose, lesson }) {
  const entries = useJournalEntries();
  const [draft, setDraft] = useState(() => readStore(DRAFT_KEY, ""));
  const [saved, setSaved] = useState(false);
  const areaRef = useRef(null);

  useEffect(() => {
    if (open && areaRef.current) areaRef.current.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (value) => {
    setDraft(value);
    setSaved(false);
    writeStore(DRAFT_KEY, value);
  };

  const handleSave = () => {
    const body = draft.trim();
    if (!body) return;
    addEntry({
      kind: lesson ? "lesson" : "free",
      body,
      lesson_code: lesson ? lesson.code : "",
      lesson_title: lesson ? lesson.title : "",
      prompt: lesson ? `${lesson.code}#freeform` : "freeform",
      prompt_label: lesson ? "Written mid-step" : "Written freely",
    });
    setDraft("");
    writeStore(DRAFT_KEY, "");
    setSaved(true);
  };

  // Nothing is left in the page while the journal is closed.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close the journal"
        onClick={onClose}
        className="absolute inset-0 bg-ink/25"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Conversation Journal"
        className="animate-journal-slide absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col border-l border-natural bg-ivory shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-natural px-5 py-4">
          <div>
            <p className="workbook-label">Conversation Journal</p>
            <h2 className="mt-1 font-heading text-xl">
              {lesson ? "Write where you are" : "Write at any moment"}
            </h2>
            {lesson ? (
              <p className="mt-1 text-[12px] text-ink-faint">
                From {lesson.code} · {lesson.title}
              </p>
            ) : (
              <p className="mt-1 text-[12px] text-ink-faint">Free-form entry</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the journal"
            className="rounded-full border border-natural bg-white p-1.5 text-ink-soft transition hover:border-teal-deep hover:text-teal-deep"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Textarea
            ref={areaRef}
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            rows={5}
            placeholder="Anything worth keeping: a noticing, a question, a line you don't want to lose."
            className="min-h-[8rem] resize-y border-natural bg-white text-[14px] leading-relaxed"
          />
          <p className="mt-2 text-[12px] text-ink-faint">
            Nothing you type here is sent anywhere. It stays in this browser until you choose to share it. Closing this
            panel keeps your draft.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Button type="button" onClick={handleSave} className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90">
              <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
              Save to journal
            </Button>
            {saved ? <span className="text-[12px] text-teal-deep">Saved.</span> : null}
          </div>

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <p className="workbook-label">Recent</p>
              <Link to="/journal" onClick={onClose} className="text-[12px] text-teal-deep underline decoration-natural underline-offset-2">
                Open the full journal
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {entries.slice(0, 4).map((entry) => (
                <EntryCard key={entry.id} entry={entry} compact />
              ))}
              {entries.length === 0 ? (
                <p className="text-[13px] text-ink-faint">
                  No entries yet. The journal keeps every reflection answer you save, alongside anything you write here.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}