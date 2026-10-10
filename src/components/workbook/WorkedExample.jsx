import React from "react";
import Prose from "./Prose";

/**
 * A worked example, shown as distinct labelled parts. The stored wording is never
 * changed — the labels are only recognised so the parts read separately instead of
 * arriving as one block.
 */
const PARTS = [
  { label: "What happened", re: /^\s*(?:\*\*)?what happened\b/i },
  { label: "What held attention", re: /^\s*(?:\*\*)?what held attention\b/i },
  { label: "Possible interpretation", re: /^\s*(?:\*\*)?possible interpretation\b/i },
  { label: "What remains unknown", re: /^\s*(?:\*\*)?what remains unknown\b/i },
];

/** Drops the label itself from the line, so the heading is not said twice. */
function stripLabel(line, re) {
  return line
    .replace(re, "")
    .replace(/^[\s:.\-—–*]+/, "")
    .replace(/^\*\*/, "")
    .trim();
}

function toParts(text) {
  const lines = String(text || "").split("\n");
  const intro = [];
  const parts = [];
  let current = null;

  lines.forEach((line) => {
    const found = PARTS.find((part) => part.re.test(line));
    if (found) {
      current = { label: found.label, lines: [] };
      const rest = stripLabel(line, found.re);
      if (rest) current.lines.push(rest);
      parts.push(current);
      return;
    }
    if (current) current.lines.push(line);
    else intro.push(line);
  });

  return { intro: intro.join("\n").trim(), parts };
}

export default function WorkedExample({ text }) {
  const { intro, parts } = toParts(text);

  if (!parts.length) return <Prose text={text} />;

  return (
    <div className="space-y-4">
      {intro ? <Prose text={intro} /> : null}
      <dl className="grid gap-4">
        {parts.map((part) => (
          <div key={part.label} className="rounded-lg border border-border bg-card p-4">
            <dt className="workbook-label">{part.label}</dt>
            <dd className="mt-1.5">
              <Prose text={part.lines.join("\n").trim()} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}