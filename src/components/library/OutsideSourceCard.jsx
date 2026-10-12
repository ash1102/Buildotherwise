import React from "react";
import { ExternalLink } from "lucide-react";
import { KIND_LABELS } from "@/lib/library";

/** One outside article, study or talk. It links out; nothing here is program teaching. */
export default function OutsideSourceCard({ resource, moduleLabel }) {
  const byline = [resource.creator, resource.publisher, resource.year].filter(Boolean).join(" · ");
  const length = resource.kind === "talk" && resource.duration_min ? `about ${resource.duration_min} min` : null;

  return (
    <article className="workbook-card p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="workbook-label">{KIND_LABELS[resource.kind] || "Outside source"}</span>
        {length ? <span className="text-[12px] text-ink-faint">{length}</span> : null}
        {moduleLabel ? <span className="text-[12px] text-ink-faint">Goes with {moduleLabel}</span> : null}
      </div>

      <h3 className="mt-2 font-heading text-[19px] leading-snug">{resource.title}</h3>
      {byline ? <p className="mt-1 text-[12.5px] text-ink-faint">{byline}</p> : null}
      {resource.summary ? (
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{resource.summary}</p>
      ) : null}
      {resource.why_here ? (
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          <span className="font-medium text-foreground">Why it's here: </span>
          {resource.why_here}
        </p>
      ) : null}
      {resource.topics?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {resource.topics.map((topic) => (
            <span key={topic} className="rounded-full border border-natural px-2.5 py-0.5 text-[11.5px] text-ink-soft">
              {topic}
            </span>
          ))}
        </div>
      ) : null}

      {resource.url ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-[13px] text-teal-deep transition hover:text-copper"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {resource.kind === "talk" ? "Watch it" : "Open it"} (opens a new tab)
        </a>
      ) : null}
    </article>
  );
}
