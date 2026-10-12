import React from "react";
import { Link } from "react-router-dom";
import CourseOutline from "@/components/preview/CourseOutline";
import { PreviewBanner, PreviewDisclaimer } from "@/components/preview/PreviewNotice";
import { sections } from "@/lib/preview/course";
import { useAuth } from "@/lib/AuthContext";

/** The front door of the review copy. Nothing here is published. */
export default function PreviewHome() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      <PreviewBanner />

      <header>
        <p className="workbook-label">Course review copy</p>
        <h1 className="mt-3">The updated course, for your review</h1>
        <p className="workbook-prose mt-3">
          Before you start, then Modules 1 to 10. Every step is open, in any order. Nothing is required, no step is
          scored, and skipping anything records nothing. Each block says whether its words are yours, a shortened
          version, a draft, or a new proposal.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/preview/notes"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          My notes in this preview
        </Link>
        <Link
          to="/preview/review"
          className="inline-flex items-center rounded-md border border-input bg-card px-4 py-2 text-[15px] font-medium text-foreground transition hover:bg-secondary"
        >
          Review sheet: changes, gaps, tests
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
        >
          The live workbook, unchanged
        </Link>
      </div>

      {!isAuthenticated ? (
        <p className="rounded-md border border-dashed border-input bg-secondary p-3 text-[15px] leading-relaxed text-muted-foreground">
          You can read everything here without an account. Saving your own answers needs an account, so they are kept
          against you and nobody else.
        </p>
      ) : null}

      <CourseOutline sections={sections} />

      <PreviewDisclaimer />
    </div>
  );
}