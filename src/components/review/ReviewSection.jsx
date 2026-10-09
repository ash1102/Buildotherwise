import React from "react";

const TONES = {
  plain: "border-natural bg-white",
  draft: "border-dashed border-copper/50 bg-copper-wash/30",
  quiet: "border-natural bg-ivory-deep/50",
};

export default function ReviewSection({ label, hint, children, tone = "plain" }) {
  if (!children) return null;
  return (
    <section className={`rounded-lg border p-4 sm:p-5 ${TONES[tone]}`}>
      <p className="workbook-label">{label}</p>
      {hint ? <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">{hint}</p> : null}
      <div className="mt-3 whitespace-pre-line break-words text-[13.5px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}