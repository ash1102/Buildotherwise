import React from "react";
import moment from "moment";
import EntryActions from "./EntryActions";

/** Follow-ups stay attached to the entry they answer, each keeping its own date. */
export default function FollowUpList({ followUps, onFollowUp, onEdit, onExport, onShare, onDelete }) {
  if (!followUps.length) return null;

  return (
    <div className="mt-3 space-y-4 border-l border-dashed border-natural-deep pl-4">
      {followUps.map((item) => (
        <div key={item.id}>
          <p className="workbook-label">Follow-up · {moment(item.created_date).format("D MMM YYYY, HH:mm")}</p>
          <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
            {item.body || <span className="italic text-ink-faint">Empty entry</span>}
          </p>
          <EntryActions
            entry={item}
            onFollowUp={onFollowUp}
            onEdit={onEdit}
            onExport={onExport}
            onShare={onShare}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}