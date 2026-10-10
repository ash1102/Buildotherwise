import React from "react";

/** One assistant's setup, kept as a plain numbered list so it stays readable and printable. */
export default function ClientCard({ name, blurb, steps, warning }) {
  return (
    <section className="workbook-section">
      <h2 className="text-[19px]">{name}</h2>
      <p className="mt-1.5 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">{blurb}</p>
      {warning ? (
        <p className="mt-3 max-w-[68ch] rounded-md border border-border bg-primary-wash/60 px-3 py-2 text-[15px] leading-relaxed text-foreground">
          {warning}
        </p>
      ) : null}
      <ol className="mt-3 max-w-[68ch] list-decimal space-y-2 pl-5 text-[16px] leading-relaxed text-muted-foreground">
        {steps.map((step) => (
          <li key={step} className="pl-0.5">
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}