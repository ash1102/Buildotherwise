import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEntry, addFollowUp, getEntry, useJournalEntries } from "@/lib/journal";
import { readStore, writeStore } from "@/lib/store";
import { downloadText } from "@/lib/download";
import useBackClose from "@/lib/useBackClose";
import EntryCard from "./EntryCard";
import PanelFollowUp from "./PanelFollowUp";
import PrivacyNote from "@/components/workbook/PrivacyNote";

const DRAFT_KEY = "journalDraft";

/** One status at a time, so storage and privacy are never claimed in the same breath. */
const STATUS_TEXT = {
  draft: "Draft saved on this device",
  saving: "Saving…",
  saved: "Entry saved",
  error: "Couldn’t save. Keep this panel open and copy your text.",
};

const STATUS_TONE = {
  draft: "text-muted-faint",
  saving: "text-muted-faint",
  saved: "text-accent-ink",
  error: "text-destructive",
};

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * The slide-over panel. Bounded to the viewport, its own scrolling, a visible close
 * button, Escape to dismiss, and focus moved in on open and returned on close.
 */
export default function JournalPanel({ open, onClose, lesson }) {
  const entries = useJournalEntries();
  const [draft, setDraft] = useState(() => readStore(DRAFT_KEY, ""));
  const [status, setStatus] = useState("draft");
  const [replyTo, setReplyTo] = useState(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  // Stays mounted for a moment after closing, so the panel can slide out.
  const [shown, setShown] = useState(open);
  const [leaving, setLeaving] = useState(false);
  useBackClose(open, onClose, "journal");

  useEffect(() => {
    if (open) {
      setShown(true);
      setLeaving(false);
      return undefined;
    }
    if (!shown) return undefined;
    setLeaving(true);
    const timer = window.setTimeout(() => {
      setShown(false);
      setLeaving(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      // Deferred, because the panel's own nodes are still being removed at this point.
      window.requestAnimationFrame(() => {
        const trigger = document.getElementById("journal-trigger");
        if (trigger) trigger.focus();
        else if (opener && document.contains(opener)) opener.focus();
      });
    };
  }, [open]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((node) => node.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

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
  if (!open && !shown) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-label="Close the journal"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-panel-title"
        className={`${leaving ? "animate-journal-slide-out" : "animate-journal-slide"} relative ml-auto flex h-full w-full max-w-full flex-col border-l border-border bg-card pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-xl sm:max-w-[26rem]`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-4">
          <div className="min-w-0">
            <h2 id="journal-panel-title" className="text-[20px]">
              Add a note
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
              Write a thought, question, observation, or something to return to.
            </p>
            {lesson ? (
              <p className="mt-1 break-words text-[13px] text-muted-faint">
                From {lesson.code} · {lesson.title}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close the journal"
            className="shrink-0 rounded-md border border-input bg-card p-2 text-foreground transition hover:bg-secondary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overscroll-contain overflow-y-auto px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <label htmlFor="journal-note" className="block text-[15px] font-medium text-foreground">
            What’s on your mind?
          </label>
          <Textarea
            id="journal-note"
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            rows={5}
            placeholder="A few words are enough."
            className="mt-2 min-h-[7rem] resize-y border-input bg-card text-[16px] leading-relaxed"
          />

          <p aria-live="polite" className={`mt-2 text-[13px] ${STATUS_TONE[status]}`}>
            {STATUS_TEXT[status]}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim() || status === "saving"}
              className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
              Save to journal
            </Button>
            <button
              type="button"
              onClick={downloadCopy}
              className="text-[14px] font-medium text-accent-ink underline underline-offset-2"
            >
              Download a copy
            </button>
          </div>

          <div className="mt-3">
            <PrivacyNote />
          </div>

          <section className="mt-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[16px]">Recent entries</h3>
              <Link
                to="/journal"
                onClick={onClose}
                className="text-[14px] font-medium text-accent-ink underline underline-offset-2"
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
                <p className="text-[15px] text-muted-faint">
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