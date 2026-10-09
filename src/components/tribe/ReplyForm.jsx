import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

/** Replies are separate from the journal: nothing private is ever posted from here. */
export default function ReplyForm({ thread, user, onPosted }) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="mt-5 rounded-lg border border-natural bg-ivory-deep/50 p-4">
        <p className="text-[13.5px] leading-relaxed text-ink-soft">
          A reply is posted with your name and is visible to everyone using this workbook. Sign in to add one, or keep
          your answer in your own private journal instead.
        </p>
        <Button
          type="button"
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="mt-3 rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
        >
          Sign in to reply
        </Button>
      </div>
    );
  }

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    try {
      await base44.entities.TribeReply.create({
        thread_id: thread.id,
        thread_title: thread.title,
        module_order: thread.module_order,
        display_name: user.full_name || user.email || "Participant",
        body: text,
      });
      setBody("");
      onPosted();
    } catch (createError) {
      setError("That didn't post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        aria-label={`Your reply to ${thread.title}`}
        placeholder="Add your answer. Nothing from your journal is copied here."
        className="min-h-[5rem] resize-y border-natural bg-white text-[14px] leading-relaxed"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={submit}
          disabled={saving || !body.trim()}
          className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
        >
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          {saving ? "Posting…" : "Post reply"}
        </Button>
        <span className="text-[12px] text-ink-faint">
          Posting as {user.full_name || user.email || "you"} · visible to everyone using this workbook
        </span>
      </div>
      {error ? <p className="mt-2 text-[12.5px] text-copper">{error}</p> : null}
    </div>
  );
}