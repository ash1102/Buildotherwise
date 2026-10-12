import React from "react";

/** Renders **emphasis** without ever injecting markup. */
function inline(text) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return parts.map((part, index) => (index % 2 === 1 ? <strong key={`em-${index}`}>{part}</strong> : part));
}

/** Reading text, teaching text and the take-away line, all readable on their own. */
export default function TextBlock({ block, variant = "body" }) {
  const paragraphs = String(block.body || "").split(/\n{2,}/).filter(Boolean);
  const prose = variant === "takeaway" ? "workbook-prose text-foreground" : "workbook-prose";

  return (
    <div className={prose}>
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (trimmed.startsWith("### ")) {
          return <h4 key={index}>{trimmed.slice(4)}</h4>;
        }
        if (trimmed.startsWith("•") || /^\d+\./.test(trimmed)) {
          const lines = trimmed.split("\n").filter(Boolean);
          return (
            <ul key={index} className="ml-0 list-none space-y-1.5 pl-0">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="text-[17px] leading-[1.65]">
                  {inline(line)}
                </li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{inline(trimmed)}</p>;
      })}
    </div>
  );
}