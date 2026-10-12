import React from "react";

/** An example block. Every one says out loud whether it is invented. */
export default function ExampleNote({ block }) {
  return (
    <div className="rounded-lg border border-dashed border-input bg-secondary p-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-faint">
        {block.invented ? "Invented example" : "Illustration, not a participant story"}
      </p>
      <div className="mt-2 space-y-3">
        {String(block.body || "")
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index} className="max-w-[68ch] text-[17px] leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
      </div>
      {block.note ? (
        <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-muted-faint">{block.note}</p>
      ) : null}
    </div>
  );
}