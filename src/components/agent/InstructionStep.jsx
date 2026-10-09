import React from "react";

/** One numbered step of the connection instructions. */
export default function InstructionStep({ number, title, children }) {
  return (
    <li className="workbook-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-teal-deep/40 font-heading text-[13px] text-teal-deep"
        >
          {number}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <h3 className="font-heading text-lg">{title}</h3>
          {children}
        </div>
      </div>
    </li>
  );
}