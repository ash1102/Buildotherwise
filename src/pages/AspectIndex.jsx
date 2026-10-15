import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DashedMotif from "@/components/workbook/DashedMotif";
import { ASPECTS } from "@/lib/aspects";

export default function AspectIndex() {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-4">
          <DashedMotif size="lg" />
          <p className="workbook-label">How the workbook works</p>
        </div>
        <h1 className="mt-4 max-w-3xl font-heading text-3xl leading-[1.15] sm:text-4xl">
          Seven aspects, each with its own page.
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          This is the workbook described from the inside: what it is made of, and how each part behaves. Each page says
          plainly what works today and what is still being built.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {ASPECTS.map((aspect) => (
          <Link
            key={aspect.slug}
            to={`/aspect/${aspect.slug}`}
            className="group flex flex-col rounded-lg border border-natural bg-white p-5 transition hover:border-teal-deep/50 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            <span className="font-heading text-[13px] text-copper">{aspect.number}</span>
            <h2 className="mt-2 font-heading text-xl leading-snug">{aspect.label}</h2>
            <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{aspect.promise}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[12.5px] text-teal-deep">
              {aspect.tryLabel}
              <ArrowRight
                className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-dashed border-teal-deep/40 bg-white/60 p-6">
        <p className="workbook-label">What stays the same</p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Whatever you try on these pages, nothing leaves this browser on its own. Pausing and stopping are complete
          answers here too.
        </p>
      </section>
    </div>
  );
}