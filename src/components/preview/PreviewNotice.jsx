import React from "react";
import { Eye } from "lucide-react";

/** Every preview page says out loud what it is, and what it is not. */
export function PreviewBanner() {
  return (
    <div className="no-print rounded-xl border border-dashed border-accent-soft bg-accent-wash p-4 sm:p-5">
      <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
        <Eye className="h-4 w-4" aria-hidden="true" />
        Preview for review. Not published.
      </p>
      <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-muted-foreground">
        This is a review copy of the updated course. It sits beside the live workbook: no approved lesson text was
        overwritten, no learner records were changed, and nobody has been enrolled from here. Where wording is not the
        program owner’s yet, the block says so.
      </p>
    </div>
  );
}

/** The disclaimer the build brief asks for, in its own words. */
export function PreviewDisclaimer() {
  return (
    <p className="no-print border-t border-border pt-4 text-[14px] leading-relaxed text-muted-faint">
      Pilot preview. All examples are invented. This is an educational program, not therapy, treatment, financial advice,
      or a promise of a job, income, or business success.
    </p>
  );
}