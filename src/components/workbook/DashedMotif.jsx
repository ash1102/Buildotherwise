import React from "react";

const DOT_COLORS = ["bg-primary", "bg-accent-soft", "bg-border"];

/** The workbook's dashed circular motif, used as a quiet signature throughout. */
export default function DashedMotif({ size = "md", dots = 3 }) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-7 w-7" : "h-10 w-10";
  const dot = size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${box} shrink-0 items-center justify-center gap-1 rounded-full border border-dashed border-primary/40`}
    >
      {Array.from({ length: dots }).map((_, index) => (
        <span key={index} className={`${dot} ${DOT_COLORS[index % DOT_COLORS.length]} rounded-full`} />
      ))}
    </span>
  );
}