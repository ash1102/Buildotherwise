import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { writeToClipboard } from "@/lib/clipboard";

/** A copy-ready block of connection text. */
export default function CodeSnippet({ label, code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const done = await writeToClipboard(code);
    setCopied(done);
    if (done) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-natural bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-natural px-3 py-1.5">
        <span className="workbook-label">{label}</span>
        <Button variant="ghost" size="sm" onClick={copy} aria-label={`Copy ${label}`}>
          {copied ? <Check /> : <Copy />}
          <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 text-[12px] leading-relaxed text-ink-soft">
        <code>{code}</code>
      </pre>
    </div>
  );
}