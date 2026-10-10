import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Surfaces a beat can use. Written as literal strings so Tailwind keeps them. */
const TONES = {
  plain: "border-natural bg-white",
  show: "border-natural bg-teal-deep-wash/50",
  out: "border-dashed border-teal-deep/40 bg-white",
  boundary: "border-natural bg-ivory-deep/60",
};

/**
 * The step unfolds one beat at a time. A beat that is still closed stays visible
 * as an invitation rather than hidden content, and the whole step can be opened
 * at once by anyone who would rather read it straight through.
 */
export default function LessonBeats({ beats, startOpen = 1 }) {
  const [visible, setVisible] = useState(Math.min(Math.max(startOpen, 1), beats.length));
  const everything = visible >= beats.length;
  const next = beats[visible] || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {beats.map((beat, index) => (
            <span
              key={beat.key}
              className={`h-1.5 rounded-full transition-all ${
                index < visible ? "w-7 bg-teal-deep" : "w-3 bg-natural-deep"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span aria-live="polite" className="text-[12px] text-ink-faint">
            {visible} of {beats.length} beats open
          </span>
          <button
            type="button"
            onClick={() => setVisible(everything ? 1 : beats.length)}
            className="text-[12px] text-teal-deep underline decoration-natural underline-offset-4 transition hover:text-copper"
          >
            {everything ? "Move one beat at a time" : "Open the whole step"}
          </button>
        </div>
      </div>

      {beats.map((beat, index) => {
        const open = index < visible;

        if (open && beat.bare) {
          return <div key={beat.key}>{beat.content}</div>;
        }

        return (
          <section
            key={beat.key}
            className={`rounded-lg border p-5 transition sm:p-6 ${
              open ? TONES[beat.tone || "plain"] : "border-dashed border-natural bg-white/50"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="workbook-label">{beat.label}</p>
              <span className="text-[11px] text-ink-faint">
                {index + 1} of {beats.length}
              </span>
            </div>
            {open ? (
              <div className="mt-3">{beat.content}</div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] leading-relaxed text-ink-faint">{beat.teaser}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setVisible(index + 1)}
                  className="border-teal-deep/40 text-teal-deep hover:bg-teal-deep-wash"
                >
                  Open this beat
                </Button>
              </div>
            )}
          </section>
        );
      })}

      {next ? (
        <button
          type="button"
          onClick={() => setVisible(visible + 1)}
          className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2 text-[13px] text-ivory transition hover:bg-teal-deep/90"
        >
          Continue · {next.label}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}