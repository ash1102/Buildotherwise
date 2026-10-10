import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * This workbook's own assistant address, read from the site the reader is on right
 * now, so it is never a stale copy of a domain typed by hand.
 */
export default function ServerUrlField() {
  const [copied, setCopied] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const url = new URL("/api/mcp", window.location.origin).toString();

  const copy = async () => {
    setBlocked(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setBlocked(true);
    }
  };

  return (
    <section className="workbook-section">
      <p className="workbook-label">Assistant address</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={url}
          aria-label="Assistant address"
          onFocus={(event) => event.target.select()}
          className="w-full min-w-0 rounded-md border border-input bg-secondary/60 px-3 py-2 font-mono text-[14px] text-foreground"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-muted-faint">
        This is the address of the site you are reading now. Everyone uses the same one.
      </p>
      {blocked ? (
        <p role="status" className="mt-1 max-w-[68ch] text-[14px] leading-relaxed text-muted-foreground">
          Your browser would not copy it for you. Select the address above and copy it with your own keyboard.
        </p>
      ) : null}
    </section>
  );
}