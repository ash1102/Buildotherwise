import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

const ROLES = [
  {
    value: "partner",
    label: "A partner organization",
    hint: "Community groups, reentry and recovery programs, workforce and education partners.",
    prompt: "What does your organization do, and what kind of partnership do you have in mind?",
    askOrg: true,
  },
  {
    value: "volunteer",
    label: "A volunteer",
    hint: "Give feedback on lessons, test the workbook, or lend a skill.",
    prompt: "Tell us a little about yourself and what you’d like to help with.",
    askOrg: false,
  },
  {
    value: "fiscal_sponsor",
    label: "A fiscal sponsor or funder",
    hint: "Build Otherwise is not yet a registered nonprofit and is working toward fiscal sponsorship.",
    prompt: "Tell us about your organization or fund and what you’d like to talk about.",
    askOrg: true,
  },
  {
    value: "participant",
    label: "Someone interested in the program",
    hint: "Questions about Entrepalooza or the pilot.",
    prompt: "What would you like to know?",
    askOrg: false,
  },
  {
    value: "other",
    label: "Something else",
    hint: "Researchers, reviewers, press, or anything that doesn’t fit above.",
    prompt: "What’s on your mind?",
    askOrg: true,
  },
];

const VOLUNTEER_INTERESTS = [
  "Reviewing lessons",
  "Testing the workbook",
  "Research or evaluation",
  "Design or tech",
  "Outreach and connections",
  "Something else",
];

const EMPTY = { name: "", email: "", organization: "", message: "", website: "" };

export default function GetInvolved() {
  const [role, setRole] = useState("");
  const [fields, setFields] = useState(EMPTY);
  const [interests, setInterests] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const current = ROLES.find((item) => item.value === role);
  const ready = role && fields.name.trim() && fields.email.trim() && fields.message.trim();

  const update = (key) => (event) => setFields((value) => ({ ...value, [key]: event.target.value }));
  const toggleInterest = (item) =>
    setInterests((list) => (list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]));

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setSending(true);
    const payload = {
      reaching_out_as: role,
      name: fields.name.trim(),
      email: fields.email.trim(),
      organization: current?.askOrg ? fields.organization.trim() : "",
      interests: role === "volunteer" ? interests : [],
      message: fields.message.trim(),
      website: fields.website,
    };
    try {
      try {
        const response = await base44.functions.invoke("submitInquiry", payload);
        if (response?.data?.error) throw new Error(response.data.error);
      } catch (functionError) {
        // If the notifier is unavailable, still save the message so nothing is lost.
        if (payload.website) throw functionError;
        const { website, ...record } = payload;
        await base44.entities.Inquiry.create({ ...record, status: "new", email_notified: false });
      }
      setSent(true);
      setFields(EMPTY);
      setInterests([]);
      toast({ title: "Thank you. Your message has gone to Ashley at Build Otherwise." });
    } catch (error) {
      toast({ title: "That didn’t send. Please check the form and try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Get involved</p>
        <h1 className="mt-2">Help shape the first pilot</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Build Otherwise is early, and the people who join now shape what it becomes. We’re looking for partner
          organizations, volunteers, reviewers and a fiscal sponsor. Tell us who you are and we’ll reply by email.
        </p>
      </header>

      {sent ? (
        <div className="workbook-section max-w-[42rem]" role="status">
          <h2 className="text-[18px]">Message received</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
            Thank you. Ashley reads every message and will reply to the email address you gave.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSent(false);
              setRole("");
            }}
            className="mt-4 rounded-md"
          >
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="workbook-section max-w-[42rem]" noValidate>
          <fieldset>
            <legend className="text-[16px] font-medium text-foreground">I’m reaching out as…</legend>
            <div className="mt-3 grid gap-2">
              {ROLES.map((item) => (
                <label
                  key={item.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                    role === item.value ? "border-primary bg-secondary" : "border-input bg-card hover:bg-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="reaching_out_as"
                    value={item.value}
                    checked={role === item.value}
                    onChange={() => setRole(item.value)}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span>
                    <span className="block text-[16px] text-foreground">{item.label}</span>
                    <span className="block text-[14px] leading-snug text-muted-foreground">{item.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {current ? (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-[16px] font-medium text-foreground" htmlFor="gi-name">
                  Your name
                </label>
                <Input id="gi-name" value={fields.name} onChange={update("name")} autoComplete="name" className="mt-2" />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-foreground" htmlFor="gi-email">
                  Email address
                </label>
                <Input
                  id="gi-email"
                  type="email"
                  value={fields.email}
                  onChange={update("email")}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2"
                />
              </div>

              {current.askOrg ? (
                <div>
                  <label className="block text-[16px] font-medium text-foreground" htmlFor="gi-org">
                    Organization <span className="font-normal text-muted-faint">(optional)</span>
                  </label>
                  <Input
                    id="gi-org"
                    value={fields.organization}
                    onChange={update("organization")}
                    autoComplete="organization"
                    className="mt-2"
                  />
                </div>
              ) : null}

              {role === "volunteer" ? (
                <fieldset>
                  <legend className="text-[16px] font-medium text-foreground">
                    What would you like to help with? <span className="font-normal text-muted-faint">(optional)</span>
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {VOLUNTEER_INTERESTS.map((item) => (
                      <label key={item} className="flex cursor-pointer items-center gap-2 text-[15px] text-foreground">
                        <input
                          type="checkbox"
                          checked={interests.includes(item)}
                          onChange={() => toggleInterest(item)}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <div>
                <label className="block text-[16px] font-medium text-foreground" htmlFor="gi-message">
                  {current.prompt}
                </label>
                <Textarea
                  id="gi-message"
                  value={fields.message}
                  onChange={update("message")}
                  rows={5}
                  placeholder="A few sentences are enough."
                  className="mt-2 min-h-[7rem]"
                />
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="gi-website">Leave this empty</label>
                <input id="gi-website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={update("website")} />
              </div>

              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Only Ashley sees what you send, and it’s used only to reply to you.
              </p>

              <Button
                type="submit"
                disabled={sending || !ready}
                className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                {sending ? "Sending…" : "Send message"}
              </Button>
            </div>
          ) : null}
        </form>
      )}

      <p className="max-w-[42rem] text-[15px] leading-relaxed text-muted-foreground">
        Using the workbook and have a question, a concern, or need to pause?{" "}
        <Link to="/contact" className="font-medium text-accent-ink underline underline-offset-2">
          Use the contact page
        </Link>
        .
      </p>
    </article>
  );
}
