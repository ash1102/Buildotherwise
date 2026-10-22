import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Prose from "@/components/workbook/Prose";
import { neighbourAspects } from "@/lib/aspects";

/** One aspect's page: what it is, something to try, and where it lives. */
export default function AspectShell({ aspect, children }) {
  const { previous, next } = neighbourAspects(aspect.slug);

  return (
    <article className="space-y-10">
      <div>
        <Link
          to="/aspects"
          className="inline-flex items-center gap-2 text-[13px] text-ink-faint transition hover:text-teal-deep"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All seven aspects
        </Link>

        <p className="workbook-label mt-6">Aspect {aspect.number}</p>
        <h1 className="mt-3">{aspect.label}</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          {aspect.promise}
        </p>
        <Prose text={aspect.body} className="mt-5" />
      </div>

      <section>
        <div className="flex items-center gap-3">
          <span className="workbook-label">{aspect.tryLabel}</span>
          <span className="h-px flex-1 bg-natural" />
        </div>
        <div className="mt-4 rounded-lg border border-natural bg-card p-5 sm:p-6">{children}</div>
        {aspect.note ? (
          <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-ink-faint">{aspect.note}</p>
        ) : null}
      </section>

      <section>
        <p className="workbook-label">Where this lives</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {aspect.places.map((place) => (
            <Link
              key={place.to}
              to={place.to}
              className="inline-flex items-center gap-2 rounded-full border border-natural bg-card px-4 py-2 text-[13px] text-teal-deep transition hover:border-teal-deep/50"
            >
              {place.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <nav className="flex flex-col gap-3 border-t border-natural pt-5 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link
            to={`/aspect/${previous.slug}`}
            className="inline-flex items-center gap-2 text-[13.5px] text-ink-soft transition hover:text-teal-deep"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {previous.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/aspect/${next.slug}`}
            className="inline-flex items-center gap-2 text-[13.5px] text-ink-soft transition hover:text-teal-deep sm:text-right"
          >
            {next.label}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}