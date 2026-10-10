import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import DashedMotif from "@/components/workbook/DashedMotif";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await base44.entities.Feedback.create({
        kind: "usability",
        message: email.trim() ? `${message.trim()}\n\nReply to: ${email.trim()}` : message.trim(),
      });
      setSent(true);
      setMessage("");
      setEmail("");
      toast({ title: "Thank you — your message has gone to the program team." });
    } catch (error) {
      toast({ title: "That didn't send. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="space-y-8">
      <header>
        <div className="flex items-center gap-4">
          <DashedMotif size="lg" />
          <p className="workbook-label">CONTACT</p>
        </div>
        <h1 className="mt-4 max-w-3xl font-heading text-3xl leading-[1.15] sm:text-4xl">Contact the program team</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          Send a question, a concern, or something the workbook should do better. Messages go to the Entrepalooza
          program team at Build Otherwise.
        </p>
      </header>

      <form onSubmit={submit} className="max-w-2xl rounded-lg border border-natural bg-white p-5 sm:p-6">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Nothing from your workbook or journal is sent with this message. You decide what to write here.
        </p>

        <label className="mt-5 block font-heading text-[15px] text-ink" htmlFor="contact-email">
          Your email address <span className="text-ink-faint">(optional, if you would like a reply)</span>
        </label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="mt-2 border-natural bg-ivory/60 text-[14px]"
        />

        <label className="mt-5 block font-heading text-[15px] text-ink" htmlFor="contact-message">
          Your message
        </label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="What would you like the program team to know?"
          className="mt-2 min-h-[7rem] border-natural bg-ivory/60 text-[14px] leading-relaxed"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={sending || !message.trim()}
            className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
          >
            <Send className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            {sending ? "Sending…" : "Send message"}
          </Button>
          {sent ? <span className="text-[12.5px] text-teal-deep">Received. Thank you.</span> : null}
        </div>
      </form>

      <div className="max-w-2xl rounded-lg border border-dashed border-teal-deep/40 bg-white/60 p-5">
        <p className="workbook-label">If you need support now</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
          Entrepalooza is an educational workbook, not therapy or treatment, and this form is not monitored around the
          clock. If you are in crisis or need clinical support, please contact your local emergency services or a
          qualified professional rather than this form.
        </p>
      </div>
    </article>
  );
}