import React from "react";
import moment from "moment";

/**
 * The actions offered on one entry. None of them sends anything on its own —
 * sharing still asks for confirmation on the page.
 */
export default function EntryActions({ entry, onFollowUp, onEdit, onExport, onShare, onDelete, onAddToRecord }) {
  const when = moment(entry.created_date).format("D MMM YYYY");
  const items = [
    onFollowUp && { label: "Add a follow-up", tone: "text-teal-deep", run: onFollowUp },
    onEdit && { label: "Edit", tone: "text-teal-deep", run: onEdit },
    onExport && { label: "Export", tone: "text-teal-deep", run: onExport },
    onShare && { label: "Share", tone: "text-copper", run: onShare },
    onDelete && { label: "Delete", tone: "text-ink-faint", run: onDelete },
    onAddToRecord && { label: "Add to Discovery Record", tone: "text-copper", run: onAddToRecord },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={`${item.label} — entry from ${when}`}
          className={`${item.tone} underline decoration-natural underline-offset-2 transition hover:decoration-copper`}
          onClick={() => item.run(entry)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}