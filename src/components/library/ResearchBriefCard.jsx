import React from "react";

/**
 * One of Build Otherwise's own research notes: title, plain summary and the
 * limit it states for itself. Full documents stay private while under review,
 * so nothing here fetches or links to them.
 */
export default function ResearchBriefCard({ brief }) {
  return (
    <li className="border-t border-natural pt-4">
      <h4 className="font-heading text-[17px]">{brief.title}</h4>
      {brief.summary ? <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{brief.summary}</p> : null}
      {brief.review_status ? (
        <p className="mt-2 break-words text-[12px] leading-relaxed text-ink-faint">Limit: {brief.review_status}</p>
      ) : null}
    </li>
  );
}
