import React from "react";
import ReviewSection from "./ReviewSection";
import ApprovalForm from "./ApprovalForm";

const STATUS_LABELS = {
  pending_evaluator_and_clinical_review: "Pending evaluator and clinical review",
  pending_program_review: "Pending program review",
  rehearsal_draft: "Rehearsal draft",
  approved: "Approved",
  not_required: "Review not required",
};

export default function ReviewPackageCard({ pkg, moduleTitle, onSave, saving }) {
  return (
    <article className="workbook-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-natural pb-4">
        <div>
          <p className="workbook-label">
            {moduleTitle} · Card {pkg.lesson_code}
          </p>
          <h3 className="mt-2 font-heading text-xl">{pkg.lesson_title}</h3>
        </div>
        <span className="rounded-full border border-natural bg-ivory-deep/60 px-3 py-1 text-[12px] text-ink-soft">
          {STATUS_LABELS[pkg.review_status] || pkg.review_status}
        </span>
      </header>

      <div className="mt-5 space-y-4">
        <ReviewSection label="Review scope">{pkg.review_scope}</ReviewSection>
        <ReviewSection label="Current card">{pkg.current_card_note}</ReviewSection>
        <ReviewSection label="Proposed draft text" hint={pkg.proposed_draft_label} tone="draft">
          {pkg.proposed_draft_text || "No lesson-level draft text exists for this card yet."}
        </ReviewSection>
        <ReviewSection label="Changes requested" tone="quiet">
          {pkg.changes_requested}
        </ReviewSection>
        <ReviewSection label="Instructional purpose">{pkg.instructional_purpose}</ReviewSection>
        <ReviewSection label="Research rationale and limitations" tone="quiet">
          {[pkg.research_rationale, pkg.research_limitations].filter(Boolean).join("\n\n")}
        </ReviewSection>
        <ReviewSection label="Facilitator boundaries">{pkg.facilitator_boundaries}</ReviewSection>
        <ReviewSection label="Participation alternatives" tone="quiet">
          {pkg.participation_alternatives}
        </ReviewSection>
        <ReviewSection label="Recommended for review, not approved instructions" tone="draft">
          {pkg.reviewer_notes}
        </ReviewSection>
        {pkg.source_label ? (
          <p className="break-words text-[12px] leading-relaxed text-ink-faint">
            {pkg.source_label}
            {pkg.source_url ? ` · ${pkg.source_url}` : ""}
          </p>
        ) : null}
        <ApprovalForm pkg={pkg} onSave={onSave} saving={saving} />
      </div>
    </article>
  );
}