import React from "react";
import { Link } from "react-router-dom";

/**
 * Modules 6-10 are written but not built into Pilot 1. This is a different state
 * from a module that is waiting on the journal, and it never counts as locked.
 */
export default function ComingLaterNotice({ module }) {
  return (
    <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
      <p className="workbook-label">Coming later</p>
      <h2 className="mt-2">
        {module ? `Module ${module.order} — ${module.title}` : "This module"} is not part of Pilot 1
      </h2>
      <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
        Pilot 1 covers Getting Started and Modules 1–5. This module is written but not built into the pilot yet, so no
        steps from it can be opened and nothing here is counted as complete.
      </p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
          Back to the workbook
        </Link>
        <Link to="/program-library" className="text-[15px] text-muted-foreground hover:text-foreground">
          Look in the Library
        </Link>
      </div>
    </section>
  );
}