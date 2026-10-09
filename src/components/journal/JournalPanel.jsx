import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEntry, addFollowUp, getEntry, useJournalEntries } from "@/lib/journal";
import { readStore, writeStore } from "@/lib/store";
import { downloadText } from "@/lib/download";
import EntryCard from "./EntryCard";
import PanelFollowUp from "./PanelFollowUp";
import PrivacyNote from "@/components/workbook/PrivacyNote";

const DRAFT_KEY = "journalDraft";

/** One status at a time, so storage and privacy are never claimed in the same breath. */
const STATUS_TEXT = {
  draft: "Draft saved in this browser",
  saving: "Saving…",
  saved: "Entry saved",
  error: "Couldn’t save. Keep this panel open and copy your text.",
};

const STATUS_TONE = {
  draft: "text-ink-faint",
  saving: "text-ink-faint",
  saved: "text-teal-deep",
  error: "text-copper",
};

/**
 * The slide-over panel. It is mounted once in the layout, so the journal is on
 * every page, and an unfinished draft survives being closed.
 */
export default function JournalPanel({ open, onClose, lesson }) {
  const entries = useJournalEntries();
  const [draft, setDraft] = useState(() => readStore(DRAFT_KEY, ""));
  const [status, setStatus] = useState("draft");
  const [replyTo, setReplyTo] = useState(null);
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
    setStatus("draft");
    writeStore(DRAFT_KEY, value);
  };

  const handleSave = () => {
    const body = draft.trim();
    if (!body) return;
    setStatus("saving");
    const saved = addEntry({
      kind: lesson ? "lesson" : "free",
      body,
      lesson_code: lesson ? lesson.code : "",
      lesson_title: lesson ? lesson.title : "",
      prompt: lesson ? `${lesson.code}#freeform` : "freeform",
      prompt_label: lesson ? "Written mid-step" : "Written freely",
    });
    // "Entry saved" only appears once the entry is really in this browser's storage.
    if (!getEntry(saved.id)) {
      setStatus("error");
      return;
    }
    setDraft("");
    writeStore(DRAFT_KEY, "");
    setStatus("saved");
  };

  const downloadCopy = () => {
    const lines = entries
      .slice()
      .reverse()
      .map(
        (entry) =>
          `## ${entry.prompt_label || "Entry"}\n_${moment(entry.created_date).format("D MMM YYYY, HH:mm")}_\n\n${
            entry.body || "(empty)"
          }\n`
      );
    downloadText("entrepalooza-journal.md", `# Conversation Journal\n\n${lines.join("\n")}`);
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
            <h2 className="mt-1 font-heading text-xl">What’s on your mind?</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Write a thought, question, observation, or something you want to return to.
            </p>
            {lesson ? (
              <p className="mt-1 text-[12px] text-ink-faint">
                From {lesson.code} · {lesson.title}
              </p>
            ) : null}
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
            aria-label="What’s on your mind?"
            placeholder="Start anywhere. A few words are enough."
            className="min-h-[8rem] resize-y border-natural bg-white text-[14px] leading-relaxed"
          />

          <p aria-live="polite" className={`mt-2 text-[12px] ${STATUS_TONE[status]}`}>
            {STATUS_TEXT[status]}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim() || status === "saving"}
              className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
            >
              <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
              Save to journal
            </Button>
          </div>

          <div className="mt-3">
            <PrivacyNote>
              Saved in this browser, not automatically synced between devices. Sharing an entry is a separate action.
            </PrivacyNote>
            <button
              type="button"
              onClick={downloadCopy}
              className="mt-1.5 ml-5 text-[12px] text-teal-deep underline decoration-natural underline-offset-2 hover:decoration-copper"
            >
              Download a copy to keep a backup
            </button>
          </div>

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <p className="workbook-label">Recent entries</p>
              <Link
                to="/journal"
                onClick={onClose}
                className="text-[12px] text-teal-deep underline decoration-natural underline-offset-2"
              >
                Open the full journal
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              {entries.slice(0, 4).map((entry) => (
                <div key={entry.id}>
                  <EntryCard entry={entry} compact onFollowUp={() => setReplyTo(entry)} />
                  {replyTo?.id === entry.id ? (
                    <PanelFollowUp
                      onSave={(body) => {
                        addFollowUp(entry, body);
                        setReplyTo(null);
                      }}
                      onCancel={() => setReplyTo(null)}
                    />
                  ) : null}
                </div>
              ))}
              {entries.length === 0 ? (
                <p className="text-[13px] text-ink-faint">
                  Nothing here yet. The journal keeps every reflection answer you save, alongside anything you write here.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}