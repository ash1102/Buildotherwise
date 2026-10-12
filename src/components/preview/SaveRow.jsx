import React from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";

/**
 * Saving is a deliberate act, and it is separate from sharing. Nothing is sent
 * anywhere until this button is pressed.
 */
export default function SaveRow({ onSave, onClear, saving, savedLabel, canSave, signedOutNote }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave || saving}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-[14px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
        Save this answer
      </button>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-[14px] text-foreground transition hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Look again
        </button>
      ) : null}
      <span aria-live="polite" className="text-[14px] text-muted-faint">
        {canSave ? savedLabel : signedOutNote}
      </span>
    </div>
  );
}