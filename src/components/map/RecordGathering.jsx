import React from "react";
import { Link } from "react-router-dom";

/**
 * Where the record has gathered. Only the parts that hold something are listed,
 * so the page never fills with empty summary tiles.
 */
export default function RecordGathering({ sections }) {
  const filled = sections.filter((section) => section.items.length);

  if (!filled.length) {
    return (
      <p className="text-[16px] leading-relaxed text-muted-foreground">
        Nothing has gathered in the record's own sections yet. Each one fills from answers you save in the steps.{" "}
        <Link to="/" className="font-medium text-accent-ink underline underline-offset-2">
          Open the workbook
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {filled.map((section) => (
        <li key={section.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[16px]">
          <span className="text-foreground">{section.label}</span>
          <span className="text-[14px] text-muted-faint">
            {section.items.length} {section.items.length === 1 ? "answer" : "answers"} ·{" "}
            <Link to="/record" className="font-medium text-accent-ink underline underline-offset-2">
              see them
            </Link>
          </span>
        </li>
      ))}
    </ul>
  );
}