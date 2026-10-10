import React from "react";
import { Link } from "react-router-dom";

/**
 * What the map is drawn from, and how much has gathered in each part of the
 * Discovery Record. The steps fill these; nothing is entered a second time.
 */
export default function RecordGathering({ sections, figures }) {
  return (
    <div className="space-y-6">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {figures.map((figure) => (
          <li key={figure.label} className="rounded-lg border border-natural bg-white px-4 py-3">
            <p className="font-heading text-2xl leading-none text-ink">{figure.value}</p>
            <p className="mt-2 text-[12.5px] leading-snug text-ink-faint">{figure.label}</p>
          </li>
        ))}
      </ul>

      <div>
        <p className="workbook-label">Where your record has gathered</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <li key={section.key}>
              <Link
                to="/record"
                className="flex h-full items-baseline justify-between gap-3 rounded-lg border border-natural bg-white px-3.5 py-3 transition hover:border-teal-deep/40"
              >
                <span className="text-[13px] leading-snug text-ink-soft">{section.label}</span>
                <span
                  className={`shrink-0 text-[12.5px] ${
                    section.items.length ? "text-teal-deep" : "text-ink-faint"
                  }`}
                >
                  {section.items.length ? `${section.items.length} saved` : "still open"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
          Every one of these comes from answers you already saved, and stays open until there is something to put in
          it.{" "}
          <Link to="/record" className="text-teal-deep underline decoration-natural underline-offset-2">
            Open the Discovery Record
          </Link>
        </p>
      </div>
    </div>
  );
}