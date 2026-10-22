import React from "react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-lg border border-teal-deep/20 bg-teal-deep-wash px-4 py-3 text-[14px] leading-relaxed text-ink">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] break-words rounded-lg border border-natural bg-card px-4 py-3 text-[14.5px] leading-relaxed text-ink-soft [&_h1]:mt-4 [&_h2]:mt-4 [&_h3]:mt-3 [&_h3]:font-heading [&_h3]:text-[15px] [&_h3]:text-ink [&_li]:mt-1 [&_p]:mt-3 [&_p:first-child]:mt-0 [&_strong]:text-ink [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        <ReactMarkdown>{message.content || ""}</ReactMarkdown>
      </div>
    </div>
  );
}