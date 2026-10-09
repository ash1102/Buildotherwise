import React from "react";
import DashedMotif from "@/components/workbook/DashedMotif";

export default function ReviewHeader({ packageCount, undecidedCount }) {
  return (
    <header className="border-b border-natural pb-7">
      <div className="flex items-start gap-4">
        <DashedMotif size="lg" />
        <div>
          <p className="workbook-label">Program team · Content review</p>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Review packages for the later lesson cards</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            The workbook structure for Modules 6 to 10 is kept as it is, and their cards are marked as not ready for
            participant delivery. Each package below holds the current card, the working draft held for review, the changes
            requested, the research rationale and its limits, facilitator boundaries, and participation alternatives.
          </p>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            A complete workbook structure is not the same as approved lesson content. The drafts here are review candidates:
            recording a decision does not insert one into a participant card, and it sits outside anything participants see.
          </p>
          <p className="mt-3 text-[12.5px] text-ink-faint">
            {packageCount} packages · {undecidedCount} without a recorded decision
          </p>
        </div>
      </div>
    </header>
  );
}