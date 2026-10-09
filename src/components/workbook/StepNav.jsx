import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function StepNav({ prev, next }) {
  return (
    <nav className="no-print flex flex-col gap-3 border-t border-natural pt-6 sm:flex-row sm:items-center sm:justify-between">
      {prev ? (
        <Link
          to={`/lesson/${prev.code}`}
          className="inline-flex items-center gap-2 text-[13px] text-teal-deep transition hover:text-copper"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>
            Back · <span className="text-ink-soft">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="text-[13px] text-ink-faint">This is the first step.</span>
      )}
      {next ? (
        <Link
          to={`/lesson/${next.code}`}
          className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2 text-[13px] text-ivory transition hover:bg-teal-deep/90 sm:ml-auto"
        >
          <span>
            Next · <span className="text-ivory/80">{next.title}</span>
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="text-[13px] text-ink-faint sm:ml-auto">This is the last step in Pilot 1.</span>
      )}
    </nav>
  );
}