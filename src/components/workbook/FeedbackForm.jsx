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
      toast({ title: "Thank you — that has been sent to the program creator." });
    } catch (error) {
      toast({ title: "That didn't send. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="no-print rounded-lg border border-natural bg-white/70 p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-[13px] font-medium text-teal-deep">
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
          Something confusing, or feedback about this step?
        </span>
        <span className="text-[12px] text-ink-faint">{open ? "Close" : "Open"}</span>
      </button>

      {open ? (
        <div className="mt-4">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            This form is separate from your journal. Whatever you send here is shared with the program creator; nothing
            from your journal comes with it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { value: "confusing_step", label: "This step was confusing" },
              { value: "usability", label: "Usability feedback" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
                  kind === option.value
                    ? "border-teal-deep bg-teal-deep text-ivory"
                    : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
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
            placeholder="What got in the way? What would have helped?"
            className="mt-3 min-h-[5rem] border-natural bg-ivory/60 text-[14px]"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button
              type="button"
              onClick={submit}
              disabled={sending || !message.trim()}
              className="rounded-full bg-copper text-ivory hover:bg-copper/90"
            >
              <Send className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              {sending ? "Sending…" : "Send feedback"}
            </Button>
            {sent ? <span className="text-[12px] text-teal-deep">Received. Thank you.</span> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}