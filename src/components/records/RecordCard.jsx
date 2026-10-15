import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CornerDownRight, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

/**
 * One record in the chain. States:
 *   later   its module is not built yet; shown, not fillable
 *   saved   on the account; can be edited or deleted
 *   draft   copied from a step answer on this device; not saved until Save
 *   empty   nothing yet
 */
export default function RecordCard({
  def,
  number,
  saved,
  draft,
  previous,
  available,
  moduleLabel,
  revisitLabel = "",
  liveOnly = false,
  onSave,
  onDelete,
  onDiscardDraft,
  onRefill,
  canRefill,
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");

  const mode = !available ? "later" : saved && !editing ? "saved" : editing ? "edit" : draft ? "draft" : "empty";

  useEffect(() => {
    if (mode === "draft") setText(draft.body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft && draft.body]);

  const run = async (action, done) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
      if (done) done();
    } catch {
      setMessage("That didn’t save. Your words are still here. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(
      () => onSave(text.trim(), mode === "draft" ? draft.code : saved ? saved.prefilled_from : ""),
      () => {
        setEditing(false);
        setMessage("Saved to your account.");
      }
    );

  const remove = () =>
    run(onDelete, () => {
      setConfirmDelete(false);
      setEditing(false);
      setText("");
      setMessage("Deleted from your account.");
    });

  const startEdit = () => {
    setText(saved ? saved.body || "" : "");
    setEditing(true);
    setMessage("");
  };

  return (
    <li className={`rounded-xl border bg-card p-5 sm:p-6 ${available ? "border-border" : "border-dashed border-input"}`}>
      <p className="workbook-label">
        {number}. {liveOnly ? `${moduleLabel} · live session` : moduleLabel}
        {revisitLabel ? ` · revisited in ${revisitLabel}` : ""}
      </p>
      <h2 className={`mt-1 text-[20px] ${available ? "" : "text-muted-faint"}`}>{def.title}</h2>
      <p className={`mt-1 max-w-[68ch] text-[15px] leading-relaxed ${available ? "text-muted-foreground" : "text-muted-faint"}`}>
        {def.prompt}
      </p>

      {available && previous ? (
        <div className="mt-4 rounded-lg border border-border bg-secondary p-3">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-ink">
            <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            Carried forward from your {previous.title}
          </p>
          <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
            {previous.body}
          </p>
        </div>
      ) : null}

      {mode === "later" ? (
        <p className="mt-4 text-[15px] text-muted-faint">
          {liveOnly
            ? `Made together in the ${moduleLabel} live session, not in the app. Until then, your other records carry forward on their own.`
            : `Opens with ${moduleLabel}, which is still being built.`}
          {liveOnly ? (
            <>
              {" "}
              <Link to="/module/build-the-tribe" className="font-medium text-accent-ink underline underline-offset-2">
                See what to carry forward
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {mode === "saved" ? (
        <div className="mt-4">
          <p className="whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">
            {saved.body || <span className="text-muted-faint">Saved with nothing written. That counts.</span>}
          </p>
          <p className="mt-2 text-[13px] text-muted-faint">
            Saved to your account
            {saved.updated_date ? ` · ${new Date(saved.updated_date).toLocaleDateString()}` : ""}
            {saved.prefilled_from ? ` · first drafted from step ${saved.prefilled_from}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
            {confirmDelete ? (
              <span className="inline-flex flex-wrap items-center gap-3 text-[15px]">
                <span className="text-foreground">Delete this record from your account?</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={remove}
                  className="rounded-md bg-destructive px-3 py-1.5 font-medium text-destructive-foreground disabled:opacity-50"
                >
                  Yes, delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-muted-foreground underline">
                  Keep it
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            )}
          </div>
        </div>
      ) : null}

      {mode === "draft" || mode === "edit" || mode === "empty" ? (
        <div className="mt-4 space-y-3">
          {mode === "draft" ? (
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Copied from what you wrote in{" "}
              <Link to={`/lesson/${draft.code}`} className="font-medium text-accent-ink underline underline-offset-2">
                {draft.stepTitle}
              </Link>
              . Not saved to your account yet. Change it, save it, or set it aside.
            </p>
          ) : null}
          <label className="sr-only" htmlFor={`record-${def.type}`}>
            {def.title}
          </label>
          <Textarea
            id={`record-${def.type}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            placeholder={mode === "empty" ? "In your own words. “I don’t know yet” counts." : undefined}
            className="text-[16px]"
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save to my account"}
            </button>
            {mode === "edit" ? (
              <button type="button" onClick={() => setEditing(false)} className="text-[15px] text-muted-foreground underline">
                Cancel
              </button>
            ) : null}
            {mode === "draft" ? (
              <button type="button" onClick={onDiscardDraft} className="text-[15px] text-muted-foreground underline">
                Set the draft aside
              </button>
            ) : null}
            {mode === "empty" && canRefill ? (
              <button type="button" onClick={onRefill} className="text-[15px] text-muted-foreground underline">
                Copy from my step answer again
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {message ? (
        <p role="status" className="mt-3 text-[14px] text-foreground">
          {message}
        </p>
      ) : null}
    </li>
  );
}
