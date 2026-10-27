import React, { useState } from "react";
import { Flag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

/**
 * Separate from the journal on purpose: this one is shared with the program
 * creator, and says so before anything is sent.
 */
export default function FeedbackForm({ moduleOrder, lessonCode }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("confusing_step");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await base44.entities.Feedback.create({
        kind,
        module_order: moduleOrder,
        lesson_code: lessonCode,
        message: message.trim(),
      });
      setSent(true);
      setMessage("");
      toast({ title: "Thank you. That has been sent to the program creator." });
    } catch (error) {
      toast({ title: "That didn't send. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="no-print rounded-xl border border-border bg-card p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-[15px] font-medium text-foreground">
          <Flag className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
          Tell us what was confusing
        </span>
      </button>

      {open ? (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "confusing_step", label: "This step was confusing" },
              { value: "usability", label: "Usability feedback" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
                className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                  kind === option.value
                    ? "border-accent-ink bg-accent-ink text-primary-foreground"
                    : "border-input bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            aria-label="Your feedback"
            placeholder="A few words are enough."
            className="mt-3 min-h-[5rem] border-input bg-card text-[16px]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={submit}
              disabled={sending || !message.trim()}
              className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {sending ? "Sending…" : "Send feedback"}
            </Button>
            {sent ? <span className="text-[14px] text-accent-ink">Received. Thank you.</span> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}