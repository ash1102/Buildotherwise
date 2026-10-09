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
    <article className="rounded-lg border border-natural/80 bg-white p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="workbook-label">{label}</p>
        <time className="text-[11px] text-ink-faint" dateTime={entry.created_date}>
          {moment(entry.created_date).format("D MMM YYYY, HH:mm")}
        </time>
      </header>

      {from ? (
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-teal-deep">
          <BookOpen className="h-3 w-3" aria-hidden="true" />
          {entry.lesson_code ? (
            <Link
              className="underline decoration-natural underline-offset-2 hover:text-copper"
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
        className={`mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft ${
          compact ? "line-clamp-4" : ""
        }`}
      >
        {entry.body || <span className="italic text-ink-faint">Empty entry</span>}
      </p>

      {entry.route ? <p className="mt-2 text-[12px] text-ink-faint">Route taken: {entry.route}</p> : null}

      {entry.revision_of ? (
        <p className="mt-2 text-[12px] text-copper">Revised from an earlier entry — both are kept.</p>
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