import React from "react";
import { RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";

/** Lines a participant can mark, so the page itself is something you handle. */
const LINES = [
  "This week I noticed I keep returning to the same question about work.",
  "It shows up when I am washing dishes, and again when someone asks what I do.",
  "I am not sure yet whether it is worth doing anything about.",
];

export default function MarkUpPage() {
  const [marks, setMarks] = useStore("aspect.markup", []);

  const toggle = (index) =>
    setMarks((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );

  return (
    <div>
      <p className="text-[14px] leading-relaxed text-ink-soft">
        Tap a phrase to keep it. On a real step, keeping a phrase is what joins it to your journal.
      </p>

      <ul className="mt-4 space-y-2">
        {LINES.map((line, index) => {
          const marked = marks.includes(index);
          return (
            <li key={line}>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={marked}
                className={`w-full rounded-md border px-4 py-3 text-left text-[14.5px] leading-relaxed transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                  marked
                    ? "border-copper/40 bg-copper-wash text-ink"
                    : "border-natural bg-ivory/60 text-ink-soft hover:border-teal-deep/40"
                }`}
              >
                {line}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground">
          {marks.length === 0
            ? "Nothing marked yet."
            : `${marks.length} ${marks.length === 1 ? "line" : "lines"} marked and kept with this page.`}
        </p>
        {marks.length > 0 ? (
          <button
            type="button"
            onClick={() => setMarks([])}
            className="inline-flex items-center gap-2 text-[13px] text-ink-faint transition hover:text-copper"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Clear the marks
          </button>
        ) : null}
      </div>
    </div>
  );
}