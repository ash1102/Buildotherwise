import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * The shared renderer for curriculum text.
 *
 * Lesson, library and thread text is stored with light Markdown: paragraphs,
 * **bold**, *italic*, headings, bullet lists and numbered lists. It is rendered
 * here so those markers appear as formatting rather than as characters, and so
 * one change covers every page that shows curriculum text.
 *
 * The stored wording is never edited. The only adjustment made to the text is a
 * blank line before a list that was written directly under a sentence, which is
 * what keeps that list rendering as a list.
 *
 * Raw HTML is not enabled, and a link is only rendered when it is a safe one.
 */

const ITEM = /^[ \t]*(?:[-*+]|\d+[.)])\s+/;

/** A list written on the line after a sentence still needs its own line to be a list. */
function withListBreaks(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const previous = out[out.length - 1];
    if (ITEM.test(line) && previous !== undefined && previous.trim() !== "" && !ITEM.test(previous)) {
      out.push("");
    }
    out.push(line);
  }
  return out.join("\n");
}

/** http(s), mailto and in-app links only. Anything else keeps its plain text. */
const SAFE_LINK = /^(?:https?:\/\/|mailto:|\/|#)/i;

function SafeLink({ node, href = "", children, ...props }) {
  if (!SAFE_LINK.test(href)) return <span {...props}>{children}</span>;
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className="text-teal-deep underline underline-offset-2 transition hover:text-copper"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}

const COMPONENTS = {
  p: ({ node, ...props }) => <p className="mt-4 first:mt-0" {...props} />,
  h1: ({ node, ...props }) => <h2 className="mt-7 font-heading text-[24px] leading-snug first:mt-0" {...props} />,
  h2: ({ node, ...props }) => <h3 className="mt-6 font-heading text-[21px] leading-snug first:mt-0" {...props} />,
  h3: ({ node, ...props }) => <h3 className="mt-6 font-heading text-[19px] leading-snug first:mt-0" {...props} />,
  h4: ({ node, ...props }) => <h4 className="mt-5 font-heading text-[17px] leading-snug first:mt-0" {...props} />,
  h5: ({ node, ...props }) => <h4 className="mt-5 font-heading text-[16px] leading-snug first:mt-0" {...props} />,
  h6: ({ node, ...props }) => (
    <h4 className="mt-5 font-heading text-[15px] leading-snug text-ink-soft first:mt-0" {...props} />
  ),
  ul: ({ node, ...props }) => <ul className="mt-4 list-disc space-y-2 pl-5 first:mt-0" {...props} />,
  ol: ({ node, ...props }) => <ol className="mt-4 list-decimal space-y-2 pl-5 first:mt-0" {...props} />,
  li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-ink" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="mt-4 border-l-2 border-copper/40 pl-4 text-ink-soft first:mt-0" {...props} />
  ),
  hr: ({ node, ...props }) => <hr className="my-6 border-natural" {...props} />,
  a: SafeLink,
  img: () => null,
};

export default function Prose({ text, className = "" }) {
  const content = withListBreaks(text);
  if (!content.trim()) return null;

  return (
    <div className={`workbook-prose ${className}`}>
      <ReactMarkdown components={COMPONENTS}>{content}</ReactMarkdown>
    </div>
  );
}