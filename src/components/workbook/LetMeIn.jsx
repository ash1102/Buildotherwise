import React from "react";
import { Check, DoorOpen } from "lucide-react";

/**
 * Getting Started O.1 ends with one tap, not a writing box.
 * Nothing is typed and nothing is sent. Tapping it marks the step done.
 */
export default function LetMeIn({ ready, onChange }) {
  if (ready) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[16px] font-medium text-primary-foreground">
          <Check className="h-5 w-5" aria-hidden="true" />
          You’re in
        </span>
        <button
          type="button"
          onClick={() => onChange(false)}
          className="text-[14px] text-muted-foreground underline underline-offset-2"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-card px-6 py-3 text-[17px] font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
      >
        <DoorOpen className="h-5 w-5" aria-hidden="true" />
        Let me in
      </button>
      <p className="text-[14px] text-muted-faint">No typing. One tap and you’re through.</p>
    </div>
  );
}
