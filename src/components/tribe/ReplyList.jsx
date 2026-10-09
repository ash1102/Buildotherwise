import React from "react";
import ReplyItem from "./ReplyItem";

export default function ReplyList({ replies, user, onDeleted }) {
  if (!replies.length) {
    return (
      <p className="mt-4 text-[13px] leading-relaxed text-ink-faint">
        No replies yet. Yours would be the first.
      </p>
    );
  }

  return (
    <ul className="mt-5 space-y-3">
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          canDelete={Boolean(user) && (reply.created_by_id === user.id || user.role === "admin")}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
}