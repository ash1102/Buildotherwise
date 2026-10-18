import React from "react";
import ReplyItem from "./ReplyItem";

export default function ReplyList({ replies, thread, user, onDeleted }) {
  if (!replies.length) {
    return <p className="mt-4 text-[14px] text-muted-foreground">No conversation yet. You can begin one.</p>;
  }
  const ids = new Set(replies.map((reply) => reply.id));
  const childrenByParent = new Map();
  for (const reply of replies) {
    const parent = reply.parent_reply_id && ids.has(reply.parent_reply_id) ? reply.parent_reply_id : null;
    if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
    childrenByParent.get(parent).push(reply);
  }
  const render = (reply, visited = new Set()) => {
    if (visited.has(reply.id)) return null;
    const nextVisited = new Set([...visited, reply.id]);
    return (
      <ReplyItem key={reply.id} reply={reply} thread={thread} user={user}
        canDelete={Boolean(user) && (reply.created_by_id === user.id || user.role === "admin")}
        onDeleted={onDeleted} onPosted={onDeleted}>
        {(childrenByParent.get(reply.id) || []).map((child) => render(child, nextVisited))}
      </ReplyItem>
    );
  };
  return <ul className="mt-5 space-y-4">{(childrenByParent.get(null) || []).map((reply) => render(reply))}</ul>;
}
