import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Prose from "./Prose";

/**
 * Where the step's teaching comes from, and what it will not do. Kept in one
 * compact disclosure rather than repeated as a participant-facing footer.
 */
export default function SourceDetails({
  open,
  onToggle,
  approvalState,
  approvalNote,
  approvedSource,
  approvedVersion,
  boundary,
}) {
  const pending = approvalState === "pending_approval";
  if (!boundary && !approvedSource && !pending) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
      >
        <span className="text-[15px] font-medium text-foreground">Source details</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-faint" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-faint" aria-hidden="true" />
        )}
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-4 py-3">
          {pending ? (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {approvalNote || "The teaching on this step is still being reviewed by the program team."}
            </p>
          ) : null}
          {approvedSource ? (
            <p className="break-words text-[15px] leading-relaxed text-muted-foreground">
              Approved source: {approvedSource}
              {approvedVersion ? ` · ${approvedVersion}` : ""}
            </p>
          ) : null}
          {boundary ? <Prose text={boundary} /> : null}
        </div>
      ) : null}
    </div>
  );
}