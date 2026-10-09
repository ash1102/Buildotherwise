import React from "react";
import Prose from "@/components/workbook/Prose";
import ReplyForm from "./ReplyForm";
import ReplyList from "./ReplyList";

export default function ThreadCard({ thread, moduleLabel, replies, user, onChanged }) {
  const open = thread.status !== "coming_later";

  return (
    <article className="workbook-card p-5">
      <span className="workbook-label">{moduleLabel}</span>
      <h3 className="mt-2 font-heading text-[19px] leading-snug">{thread.title}</h3>
      {thread.practice ? <Prose text={thread.practice} className="mt-2 text-[14px]" /> : null}

      <div className="mt-4 rounded-lg border border-dashed border-teal-deep/40 bg-teal-deep-wash/40 p-4">
        <p className="workbook-label">The prompt</p>
        <p className="mt-1.5 font-heading text-[17px] leading-snug text-ink">{thread.prompt}</p>
      </div>

      {thread.guidance ? <p className="mt-3 text-[13px] leading-relaxed text-ink-faint">{thread.guidance}</p> : null}

      {open ? (
        <>
          <ReplyForm thread={thread} user={user} onPosted={onChanged} />
          <ReplyList replies={replies} user={user} onDeleted={onChanged} />
        </>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-natural-deep bg-ivory-deep/50 p-4 text-[13px] leading-relaxed text-ink-faint">
          Not open yet. This part of the program is still being written, so replies are closed here for now.
        </p>
      )}
    </article>
  );
}