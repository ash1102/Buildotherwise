import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  OWN_QUESTION_LABEL,
  TEXT_MAX,
  TITLE_MAX,
  deleteThread,
  fallbackTitle,
  pathLabel,
  updateThread,
  useDiscoveryThreads,
} from "@/lib/discoveryThreads";
import { OWN_EXPERIMENT, QUESTIONS, framingFor, thoughtFor } from "@/lib/dashboardDiscovery";

const primary =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const secondary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[15px] font-medium text-foreground transition hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const danger =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2.5 text-[15px] font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const field = "mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-[16px] leading-relaxed text-foreground";

function whenLabel(row) {
  const stamp = row.updated_date || row.created_date;
  return stamp ? new Date(stamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
}

function PrivacyNotice() {
  return (
    <section aria-labelledby="discoveries-privacy" className="rounded-xl border border-border bg-secondary p-4 sm:p-5">
      <p id="discoveries-privacy" className="inline-flex items-center gap-2 text-[15px] font-semibold text-foreground">
        <Lock className="h-4 w-4 text-accent-ink" aria-hidden="true" />
        Where these are stored
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted-foreground">
        <li>
          A discovery is saved to <strong className="text-foreground">your Entrepalooza account</strong> only when you
          press Save in Discovery, in the app&rsquo;s database, which is hosted by Base44.
        </li>
        <li>Other learners can&rsquo;t see them.</li>
        <li>Build Otherwise runs the app, so it has technical access to that database.</li>
        <li>Nothing here is copied to your Journal, Life Map or My Records, and you choose if it ever goes there.</li>
        <li>
          Delete removes a discovery from the database. You can also download or delete them all in{" "}
          <Link to="/settings" className="font-medium text-accent-ink underline underline-offset-2">
            Settings
          </Link>
          . To ask about them, email{" "}
          <a href="mailto:Start@buildotherwise.org" className="font-medium text-accent-ink underline underline-offset-2">
            Start@buildotherwise.org
          </a>
          .
        </li>
      </ul>
    </section>
  );
}

/** One saved discovery, opened. Everything in it can be changed, and nothing changes until Save changes is pressed. */
function DiscoveryDetail({ row, onBack, onChanged, onDeleted }) {
  const question = row.source === "question" && QUESTIONS[row.question_id] ? QUESTIONS[row.question_id] : null;
  const [title, setTitle] = useState(row.title || "");
  const [response, setResponse] = useState(row.response || "");
  const [notes, setNotes] = useState(row.notes || "");
  const [optionId, setOptionId] = useState(row.option_id || "");
  const [related, setRelated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const option = question && optionId ? question.options.find((o) => o.id === optionId) : null;
  const dirty =
    title !== (row.title || "") ||
    response !== (row.response || "") ||
    notes !== (row.notes || "") ||
    optionId !== (row.option_id || "");
  const needsText = row.source === "own" && !response.trim();

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const next = {
        title: title.trim() || fallbackTitle({ response, question_text: row.question_text }),
        response: response.trim(),
        notes: notes.trim(),
        option_id: option ? option.id : "",
        option_label: option ? option.label : optionId ? row.option_label || "" : "",
      };
      const saved = await updateThread(row.id, next);
      onChanged({ ...row, ...next, ...(saved || {}) });
      setTitle(next.title);
      setMessage("Saved to your account.");
    } catch {
      setMessage("That didn’t save. Your words are still here. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setMessage("");
    try {
      await deleteThread(row.id);
      onDeleted(row.id);
    } catch {
      setMessage("That didn’t delete. Nothing was removed. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className={secondary}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All my discoveries
      </button>

      <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div>
          <p className="workbook-label">{row.source === "own" ? OWN_QUESTION_LABEL : "A question you started from"}</p>
          <h2 className="mt-1 text-[20px] leading-snug">{row.question_text || OWN_QUESTION_LABEL}</h2>
          {row.path_id && pathLabel(row.path_id) ? (
            <p className="mt-1 text-[14px] text-muted-foreground">You started from: {pathLabel(row.path_id)}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="disc-title" className="text-[15px] font-medium">
            Title
          </label>
          <input id="disc-title" type="text" maxLength={TITLE_MAX} value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </div>

        <div>
          <label htmlFor="disc-response" className="text-[15px] font-medium">
            {row.source === "own" ? "Your question or observation" : "What you wrote"}
          </label>
          <Textarea id="disc-response" rows={3} maxLength={TEXT_MAX} value={response} onChange={(e) => setResponse(e.target.value)} className={field} />
        </div>

        {row.follow_up_text ? (
          <fieldset>
            <legend className="text-[15px] font-medium">{row.follow_up_text}</legend>
            {question ? (
              <div className="mt-2 grid gap-2">
                {question.options.map((o) => (
                  <label key={o.id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-[16px] has-[:checked]:border-primary has-[:checked]:bg-secondary">
                    <input type="radio" name="disc-option" value={o.id} checked={optionId === o.id} onChange={() => setOptionId(o.id)} />
                    {o.label}
                  </label>
                ))}
                {optionId ? (
                  <button type="button" className="min-h-[44px] self-start px-1 text-[15px] text-muted-foreground underline underline-offset-2" onClick={() => setOptionId("")}>
                    Clear my choice
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-1 text-[15px] text-muted-foreground">{row.option_label ? `You chose: ${row.option_label}` : "You didn’t choose an answer."}</p>
            )}
          </fieldset>
        ) : null}

        {question && optionId ? (
          <p className="max-w-[62ch] rounded-xl bg-secondary px-4 py-3 text-[16px] leading-relaxed">{thoughtFor(question.id, optionId)}</p>
        ) : null}

        <div>
          <label htmlFor="disc-notes" className="text-[15px] font-medium">
            Anything you notice. Add to it whenever you come back.
          </label>
          <Textarea id="disc-notes" rows={4} maxLength={TEXT_MAX} value={notes} onChange={(e) => setNotes(e.target.value)} className={field} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={primary} disabled={busy || !dirty || needsText}>
            {busy ? "Saving…" : "Save changes"}
          </button>
          {needsText ? <span className="text-[14px] text-muted-foreground">Add your question or observation to save.</span> : null}
          {message ? (
            <span role="status" className="text-[15px] text-muted-foreground">
              {message}
            </span>
          ) : null}
        </div>
      </form>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <button type="button" className={secondary} aria-expanded={related} aria-controls={related ? "disc-experiment" : undefined} onClick={() => setRelated((v) => !v)}>
          Try something related
        </button>
        {related ? (
          <div id="disc-experiment" className="mt-4">
            <p className="workbook-label">A small experiment · optional</p>
            <p className="mt-1 max-w-[60ch] text-[16px] leading-relaxed">{question ? framingFor(row.path_id || null, question.id).experiment : OWN_EXPERIMENT}</p>
            <p className="mt-2 text-[14px] text-muted-foreground">Skip it if it doesn’t fit. Add what you notice to your notes above.</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        {confirmDelete ? (
          <div>
            <p className="text-[16px]">Delete this discovery from your account? This can’t be undone.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" className={danger} disabled={busy} onClick={remove}>
                {busy ? "Deleting…" : "Yes, delete it"}
              </button>
              <button type="button" className={secondary} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={danger} onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete this discovery
          </button>
        )}
      </section>
    </div>
  );
}

/** My Discoveries: what a participant chose to keep from Discovery. Open one to change it, add to it, or delete it. */
export default function MyDiscoveriesPage() {
  const { threads, setThreads, loading, error } = useDiscoveryThreads();
  const [openId, setOpenId] = useState(null);
  const open = threads.find((t) => t.id === openId) || null;

  if (loading) return <p className="py-10 text-[16px] text-muted-faint">Opening your discoveries…</p>;

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">What you chose to keep</p>
        <h1 className="mt-2">My Discoveries</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Questions and observations you saved from Discovery. Open one to change it, add notes, or try something
          related. You can delete any of them. Keeping them is always your call.
        </p>
      </header>

      {error ? (
        <p className="text-[16px] text-muted-foreground">Your saved discoveries didn’t load. Refresh the page. Nothing has been deleted.</p>
      ) : open ? (
        <DiscoveryDetail
          key={open.id}
          row={open}
          onBack={() => setOpenId(null)}
          onChanged={(next) => setThreads((list) => list.map((t) => (t.id === next.id ? next : t)))}
          onDeleted={(id) => {
            setThreads((list) => list.filter((t) => t.id !== id));
            setOpenId(null);
          }}
        />
      ) : threads.length ? (
        <ul className="grid gap-3">
          {threads.map((row) => (
            <li key={row.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <p className="text-[13px] text-muted-foreground">{whenLabel(row)}</p>
              <h2 className="mt-1 text-[18px] leading-snug">{row.title || fallbackTitle(row)}</h2>
              <p className="mt-1 text-[15px] text-muted-foreground">{row.question_text || OWN_QUESTION_LABEL}</p>
              {row.response ? <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-[16px]">{row.response}</p> : null}
              <button type="button" className={`mt-3 ${secondary}`} onClick={() => setOpenId(row.id)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Open
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[16px] leading-relaxed">
            Nothing saved yet. When something in Discovery is worth keeping, choose Save to My Discoveries.
          </p>
        </div>
      )}

      <p>
        <Link to="/" className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Back to Discovery
        </Link>
      </p>

      <PrivacyNotice />
    </div>
  );
}
