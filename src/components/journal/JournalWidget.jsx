import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import JournalPanel from "./JournalPanel";
import { useJournalContext } from "./JournalContext";

/** The quiet button, fixed on every page, that opens the journal slide-over. */
export default function JournalWidget() {
  const [open, setOpen] = useState(false);
  const { lesson } = useJournalContext();
  const { pathname } = useLocation();

  /** The header already carries the journal link, so on the homepage the floating button would only repeat it. */
  if (pathname === "/") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-teal-deep/25 bg-teal-deep px-4 py-3 text-[13px] font-medium text-ivory shadow-lg shadow-ink/10 transition hover:bg-teal-deep/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Journal
      </button>
      <JournalPanel open={open} onClose={() => setOpen(false)} lesson={lesson} />
    </>
  );
}