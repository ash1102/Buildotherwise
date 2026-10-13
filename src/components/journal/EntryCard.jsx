import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { BookOpen } from "lucide-react";
import EntryActions from "./EntryActions";
import FollowUpList from "./FollowUpList";

export default function EntryCard({
  entry,
  followUps = [],
  onShare,
  onDelete,
  onAddToRecord,
  onFollowUp,
  onEdit,
  onExport,
  compact = false,
}) {
  const from = entry.lesson_title || entry.lesson_code;
  const label =
    entry.kind === "free" ? entry.prompt_label || "Personal entry" : entry.prompt_label || "Lesson response";

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="workbook-label">{label}</p>
        <time className="text-[14px] text-muted-faint" dateTime={entry.created_date}>
          {moment(entry.created_date).format("D MMM YYYY, HH:mm")}
        </time>
      </header>

      {from ? (
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[14px] text-muted-faint">
          <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {entry.lesson_code ? (
            <Link
              className="font-medium text-accent-ink underline underline-offset-2"
              to={`/lesson/${entry.lesson_code}`}
            >
              {from}
            </Link>
          ) : (
            from
          )}
        </p>
      ) : null}

      <p
        className={`mt-2 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-foreground ${
          compact ? "line-clamp-4" : ""
        }`}
      >
        {entry.body || <span className="italic text-muted-faint">Empty entry</span>}
      </p>

      {entry.route ? <p className="mt-2 text-[14px] text-muted-faint">Route taken: {entry.route}</p> : null}

      {entry.revision_of ? (
        <p className="mt-2 text-[14px] text-accent-ink">Revised from an earlier entry. Both are kept.</p>
      ) : null}

      <EntryActions
        entry={entry}
        onFollowUp={onFollowUp}
        onEdit={onEdit}
        onExport={onExport}
        onShare={onShare}
        onDelete={onDelete}
        onAddToRecord={onAddToRecord}
      />

      <FollowUpList
        followUps={followUps}
        onFollowUp={onFollowUp}
        onEdit={onEdit}
        onExport={onExport}
        onShare={onShare}
        onDelete={onDelete}
      />
    </article>
  );
}