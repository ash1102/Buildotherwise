import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cleanSourceText, loadBriefText } from "@/lib/library";
import Prose from "@/components/workbook/Prose";

/**
 * One research brief: the summary and its source, with the full text as an
 * optional view. The full text is read only when it is opened.
 */
export default function ResearchBriefCard({ brief }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (text !== null || !brief.full_text_uri) return;
    setLoading(true);
    setFailed(false);
    try {
      setText(cleanSourceText(await loadBriefText(brief.full_text_uri)));
    } catch (error) {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="border-t border-natural pt-4">
      <h3 className="font-heading text-[17px]">{brief.title}</h3>
      {brief.summary ? <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{brief.summary}</p> : null}
      {brief.source_label ? <p className="mt-2 break-words text-[12px] leading-relaxed text-ink-faint">Source: {brief.source_label}</p> : null}
      {brief.review_status ? (
        <p className="mt-1 break-words text-[12px] leading-relaxed text-ink-faint">Review status: {brief.review_status}</p>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="mt-2.5 inline-flex items-center gap-2 text-[13px] text-teal-deep transition hover:text-copper"
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
        {open ? "Close the full brief" : "Read the full brief"}
        {open ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>

      {open ? (
        <div className="mt-3 rounded-lg border border-natural bg-white p-4">
          {loading ? (
            <p className="text-[13px] text-ink-faint">Opening the brief…</p>
          ) : failed ? (
            <p className="text-[13px] leading-relaxed text-ink-soft">The full brief could not be opened just now. Try again in a moment.</p>
          ) : text ? (
            <div className="max-h-[30rem] overflow-y-auto pr-2">
              <Prose text={text} />
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed text-ink-soft">The full text is held with the program creator.</p>
          )}
        </div>
      ) : null}
    </li>
  );
}