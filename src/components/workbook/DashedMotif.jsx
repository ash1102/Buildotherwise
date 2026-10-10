import React from "react";

/**
 * The workbook's small dashed mark, kept as a quiet signature rather than a large
 * decorative circle.
 */
export default function DashedMotif({ size = "sm", dots = 3 }) {
  const box = size === "lg" ? "h-9 w-9" : size === "md" ? "h-7 w-7" : "h-6 w-6";
  const dot = "h-1 w-1";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${box} shrink-0 items-center justify-center gap-1 rounded-full border border-dashed border-border`}
    >
      {Array.from({ length: dots }).map((_, index) => (
        <span key={index} className={`${dot} rounded-full ${index === 1 ? "bg-primary" : "bg-input"}`} />
      ))}
    </span>
  );
}