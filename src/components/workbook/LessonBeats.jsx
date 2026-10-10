import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

/** Surfaces a beat can use. Written as literal strings so Tailwind keeps them. */
const TONES = {
  plain: "border-natural bg-white",
  show: "border-natural bg-teal-deep-wash/50",
  out: "border-dashed border-teal-deep/40 bg-white",
  boundary: "border-natural bg-ivory-deep/60",
};

/**
 * The step opens one beat at a time, so a participant meets the teaching in order
 * rather than as one long block. Beats already read collapse to a quiet line that
 * can be reopened, beats still ahead stay out of sight, and anyone who would rather
 * read the step straight through can open the whole thing.
 */
export default function LessonBeats({ beats }) {
  const [current, setCurrent] = useState(0);
  const [openAll, setOpenAll] = useState(false);
  const next = beats[current + 1] || null;
  const last = current >= beats.length - 1;

  const openBeat = (index) => {
    setOpenAll(false);
    setCurrent(index);
  };

  const beatCard = (beat, index) => {
    if (beat.bare) {
      return <div key={beat.key}>{beat.content}</div>;
    }

    return (
      <section
        key={beat.key}
        className={`rounded-lg border p-5 transition sm:p-6 ${TONES[beat.tone || "plain"]}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="workbook-label">{beat.label}</p>
          <span className="text-[11px] text-ink-faint">
            {index + 1} of {beats.length}
          </span>
        </div>
        <div className="mt-3">{beat.content}</div>
      </section>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {beats.map((beat, index) => (
            <span
              key={beat.key}
              className={`h-1.5 rounded-full transition-all ${
                openAll || index <= current ? "w-7 bg-teal-deep" : "w-3 bg-natural-deep"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span aria-live="polite" className="text-[12px] text-ink-faint">
            {openAll ? `All ${beats.length} beats open` : `Beat ${current + 1} of ${beats.length}`}
          </span>
          <button
            type="button"
            onClick={() => setOpenAll((value) => !value)}
            className="text-[12px] text-teal-deep underline decoration-natural underline-offset-4 transition hover:text-copper"
          >
            {openAll ? "Back to one beat at a time" : "Read the whole step"}
          </button>
        </div>
      </div>

      {openAll
        ? beats.map((beat, index) => beatCard(beat, index))
        : beats.map((beat, index) => {
            if (index === current) return beatCard(beat, index);
            if (index > current) return null;

            return (
              <button
                key={beat.key}
                type="button"
                onClick={() => openBeat(index)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-natural bg-white/60 px-4 py-2.5 text-left transition hover:border-teal-deep/40"
              >
                <span className="flex items-center gap-2 text-[12.5px] text-ink-soft">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-natural-deep text-[10.5px] text-ink-faint">
                    {index + 1}
                  </span>
                  {beat.label}
                </span>
                <span className="text-[11.5px] text-ink-faint">Reopen</span>
              </button>
            );
          })}

      {!openAll && next ? (
        <button
          type="button"
          onClick={() => setCurrent(current + 1)}
          className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-4 py-2 text-[13px] text-ivory transition hover:bg-teal-deep/90"
        >
          Continue · {next.label}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      {!openAll && last ? (
        <p className="text-[12.5px] text-ink-faint">
          That is the last beat of this step. Anything above can be reopened to change your writing.
        </p>
      ) : null}
    </div>
  );
}