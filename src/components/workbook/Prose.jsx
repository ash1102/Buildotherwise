import React from "react";

/** Small renderer for the curriculum's plain text: paragraphs and dash lists. */
export default function Prose({ text, className = "" }) {
  const blocks = String(text || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) return null;

  return (
    <div className={`workbook-prose ${className}`}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim());
        const isList = lines.length > 1 && lines.every((line) => /^[-•]\s+/.test(line));
        if (isList) {
          return (
            <ul key={index} className={index ? "mt-4 list-disc space-y-2 pl-5" : "list-disc space-y-2 pl-5"}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{line.replace(/^[-•]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className={index ? "mt-4" : ""}>
            {block}
          </p>
        );
      })}
    </div>
  );
}