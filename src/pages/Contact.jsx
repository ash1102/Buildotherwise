import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

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
        message: message.trim(),
        email: email.trim(),
      });
      setSent(true);
      setMessage("");
      setEmail("");
      toast({ title: "Thank you. Your message has gone to Ashley at Build Otherwise." });
    } catch (error) {
      toast({ title: "That didn't send. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Contact</p>
        <h1 className="mt-2">Contact Ashley</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Send a question, a concern, or something the workbook should do better. Messages go to Ashley Zeck, who runs
          Entrepalooza at Build Otherwise.
        </p>
      </header>

      <form onSubmit={submit} className="workbook-section max-w-[42rem]">
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Nothing from your workbook or journal is sent with this message. You decide what to write here.
        </p>

        <label className="mt-5 block text-[16px] font-medium text-foreground" htmlFor="contact-email">
          Your email address <span className="font-normal text-muted-faint">(optional, if you would like a reply)</span>
        </label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="mt-2"
        />

        <label className="mt-5 block text-[16px] font-medium text-foreground" htmlFor="contact-message">
          Your message
        </label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="A few words are enough."
          className="mt-2 min-h-[7rem]"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={sending || !message.trim()}
            className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            {sending ? "Sending…" : "Send message"}
          </Button>
          {sent ? <span className="text-[15px] text-accent-ink">Received. Thank you.</span> : null}
        </div>
      </form>

      <div className="max-w-[42rem] rounded-xl border border-dashed border-input bg-card p-5">
        <h2 className="text-[17px]">If you need support now</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
          Entrepalooza is an educational workbook, not therapy or treatment, and this form is not monitored around the
          clock. If you are in crisis or need clinical support, please contact your local emergency services or a
          qualified professional rather than this form. In the US, you can call or text 988 any time.
        </p>
      </div>
    </article>
  );
}