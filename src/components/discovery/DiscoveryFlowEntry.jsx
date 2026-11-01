import React, { useState } from "react";
import moment from "moment";
import { Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { OWN_QUESTION_LABEL, TEXT_MAX, TITLE_MAX, fallbackTitle, pathLabel } from "@/lib/discoveryThreadData";
import { OWN_EXPERIMENT, QUESTIONS, framingFor, thoughtFor } from "@/lib/dashboardDiscovery";

const primary =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const secondary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[15px] font-medium text-foreground transition hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const danger =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2.5 text-[15px] font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const field = "mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-[16px] leading-relaxed text-foreground";

/**
 * A Discovery Record entry saved from Discovery on the dashboard.
 * Closed, it reads like any other entry. Opened, everything in it can be changed, and nothing changes
 * until Save changes is pressed. `item` is the shared shape from discoveryMigration.js.
 *   onSave(next)  -> resolves once the account confirms; rejects on failure (the words stay on screen)
 *   onDelete()    -> resolves to { originalKept } once deleted; rejects on failure (nothing removed)
 */
export default function DiscoveryFlowEntry({ item, onSave, onDelete }) {
  const question = item.source === "question" && QUESTIONS[item.question_id] ? QUESTIONS[item.question_id] : null;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [response, setResponse] = useState(item.response);
  const [notes, setNotes] = useState(item.notes);
  const [optionId, setOptionId] = useState(item.option_id);
  const [related, setRelated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const option = question && optionId ? question.options.find((o) => o.id === optionId) : null;
  const dirty =
    title !== item.title || response !== item.response || notes !== item.notes || optionId !== item.option_id;
  const needsText = item.source === "own" && !response.trim();
  const fieldId = (name) => `disc-${name}-${item.id}`;
  const stamp = item.updated_date || item.created_date;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const next = {
        title: title.trim() || fallbackTitle({ response, question_text: item.question_text }),
        response: response.trim(),
        notes: notes.trim(),
        option_id: option ? option.id : "",
        // A choice whose wording is no longer offered stays exactly as it was saved.
        option_label: option ? option.label : optionId ? item.option_label : "",
      };
      await onSave(next);
      setTitle(next.title);
      setResponse(next.response);
      setNotes(next.notes);
      setMessage("Saved to your Discovery Record.");
    } catch (error) {
      console.error("Discovery Record edit failed", error);
      setMessage("That didn’t save. Your words are still here. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setMessage("");
    try {
      await onDelete();
    } catch (error) {
      console.error("Discovery Record delete failed", error);
      setMessage("That didn’t delete. Nothing was removed. Try again.");
      setBusy(false);
    }
  };

  return (
    <article className="rounded-lg border border-natural bg-card p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-heading text-[17px] leading-snug text-ink">{item.title || fallbackTitle(item)}</h3>
        {stamp ? (
          <time className="text-[11px] text-ink-faint" dateTime={stamp}>
            {moment(stamp).format("D MMM YYYY")}
          </time>
        ) : null}
      </header>
      <p className="mt-1 text-[13.5px] text-ink-faint">From Discovery: {item.question_text || OWN_QUESTION_LABEL}</p>
      {!open && item.response ? (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-[14.5px] leading-relaxed text-ink-soft">
          {item.response}
        </p>
      ) : null}
      {!open && item.option_label ? (
        <p className="mt-1 text-[13.5px] text-ink-soft">You chose: {item.option_label}</p>
      ) : null}

      {!open ? (
        <button type="button" className={`mt-3 ${secondary}`} aria-expanded={false} onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Open
        </button>
      ) : (
        <div className="mt-4 space-y-5">
          <form onSubmit={save} className="space-y-5">
            {item.path_id && pathLabel(item.path_id) ? (
              <p className="text-[14px] text-muted-foreground">You started from: {pathLabel(item.path_id)}</p>
            ) : null}

            <div>
              <label htmlFor={fieldId("title")} className="text-[15px] font-medium">
                Title
              </label>
              <input
                id={fieldId("title")}
                type="text"
                maxLength={TITLE_MAX}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label htmlFor={fieldId("response")} className="text-[15px] font-medium">
                {item.source === "own" ? "Your question or observation" : "What you wrote"}
              </label>
              <Textarea
                id={fieldId("response")}
                rows={3}
                maxLength={TEXT_MAX}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className={field}
              />
            </div>

            {item.follow_up_text ? (
              <fieldset>
                <legend className="text-[15px] font-medium">{item.follow_up_text}</legend>
                {question ? (
                  <div className="mt-2 grid gap-2">
                    {question.options.map((o) => (
                      <label
                        key={o.id}
                        className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-[16px] has-[:checked]:border-primary has-[:checked]:bg-secondary"
                      >
                        <input
                          type="radio"
                          name={fieldId("option")}
                          value={o.id}
                          checked={optionId === o.id}
                          onChange={() => setOptionId(o.id)}
                        />
                        {o.label}
                      </label>
                    ))}
                    {optionId ? (
                      <button
                        type="button"
                        className="min-h-[44px] self-start px-1 text-[15px] text-muted-foreground underline underline-offset-2"
                        onClick={() => setOptionId("")}
                      >
                        Clear my choice
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    {item.option_label ? `You chose: ${item.option_label}` : "You didn’t choose an answer."}
                  </p>
                )}
              </fieldset>
            ) : null}

            {question && optionId ? (
              <p className="max-w-[62ch] rounded-xl bg-secondary px-4 py-3 text-[16px] leading-relaxed">
                {thoughtFor(question.id, optionId)}
              </p>
            ) : null}

            <div>
              <label htmlFor={fieldId("notes")} className="text-[15px] font-medium">
                Anything you notice. Add to it whenever you come back.
              </label>
              <Textarea
                id={fieldId("notes")}
                rows={4}
                maxLength={TEXT_MAX}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={field}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className={primary} disabled={busy || !dirty || needsText}>
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className={secondary} onClick={() => setOpen(false)}>
                Close
              </button>
              {needsText ? (
                <span className="text-[14px] text-muted-foreground">Add your question or observation to save.</span>
              ) : null}
            </div>
          </form>

          <section>
            <button
              type="button"
              className={secondary}
              aria-expanded={related}
              aria-controls={related ? fieldId("experiment") : undefined}
              onClick={() => setRelated((v) => !v)}
            >
              Try something related
            </button>
            {related ? (
              <div id={fieldId("experiment")} className="mt-4">
                <p className="workbook-label">A small experiment · optional</p>
                <p className="mt-1 max-w-[60ch] text-[16px] leading-relaxed">
                  {question ? framingFor(item.path_id || null, question.id).experiment : OWN_EXPERIMENT}
                </p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  Skip it if it doesn’t fit. Add what you notice to your notes above.
                </p>
              </div>
            ) : null}
          </section>

          <section>
            {confirmDelete ? (
              <div>
                <p className="text-[16px]">Delete this from your Discovery Record? This can’t be undone.</p>
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
                Delete this entry
              </button>
            )}
          </section>
        </div>
      )}

      {message ? (
        <p role="status" className="mt-3 text-[15px] text-muted-foreground">
          {message}
        </p>
      ) : null}
    </article>
  );
}
