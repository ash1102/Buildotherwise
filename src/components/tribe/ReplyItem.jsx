import React, { useState } from "react";
import moment from "moment";
import { Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReplyItem({ reply, thread, user, canDelete, onDeleted, onPosted, children }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    try { await base44.entities.TribeReply.delete(reply.id); onDeleted(); }
    catch { setError("Couldn't remove your reply. Please try again."); }
  };
  const send = async () => {
    if (!text.trim() || !user || saving) return;
    setSaving(true); setError("");
    try {
      await base44.entities.TribeReply.create({
        thread_id: thread.id,
        thread_title: thread.title,
        module_order: thread.module_order,
        parent_reply_id: reply.id,
        display_name: user.full_name || user.email || "Participant",
        body: text.trim(),
      });
      setText(""); setReplying(false); onPosted();
    } catch { setError("Couldn't post your response. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <li className="border-t border-border pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[14px] text-foreground">
          <span className="font-medium">{reply.display_name || "Participant"}</span>
          <span className="ml-2 text-[12px] text-muted-faint">{moment(reply.created_date).format("D MMM YYYY, HH:mm")}</span>
        </p>
        {canDelete ? (
          <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove my reply
          </button>
        ) : null}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{reply.body}</p>
      {user && thread.status !== "coming_later" ? (
        <button type="button" className="mt-2 text-[14px] font-medium text-accent-ink underline underline-offset-2" onClick={() => setReplying(!replying)}>
          {replying ? "Cancel" : "Respond to this person"}
        </button>
      ) : null}
      {replying ? (
        <div className="mt-3 space-y-2">
          <label className="block text-[14px] text-muted-foreground" htmlFor={`reply-to-${reply.id}`}>Responding to {reply.display_name || "participant"}. Your reply is visible to other workbook users.</label>
          <textarea id={`reply-to-${reply.id}`} value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full rounded-lg border border-input bg-card p-3 text-[16px] text-foreground" />
          <button type="button" disabled={!text.trim() || saving} onClick={send} className="rounded-md bg-primary px-4 py-2 text-[15px] text-primary-foreground disabled:opacity-50">{saving ? "Posting…" : "Post response"}</button>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-2 text-[14px] text-foreground">{error}</p> : null}
      {children ? <ul className="ml-4 mt-4 space-y-3 border-l-2 border-border pl-4">{children}</ul> : null}
    </li>
  );
}
