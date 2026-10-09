import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { writeToClipboard } from "@/lib/clipboard";
import { serverUrl } from "@/lib/mcpUrl";

/** The app's own server address, shown read-only with a copy control. */
export default function ServerAddress() {
  const url = serverUrl();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const done = await writeToClipboard(url);
    setCopied(done);
    if (done) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="workbook-card p-5 sm:p-6">
      <p className="workbook-label">Server address</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <p
          className="min-w-0 flex-1 break-all rounded-md border border-natural bg-ivory-deep/60 px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-soft"
          aria-label="Entrepalooza server address"
        >
          {url}
        </p>
        <Button variant="outline" size="sm" onClick={copy} aria-label="Copy the server address">
          {copied ? <Check /> : <Copy />}
          <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
        This address is this app's own, so it always matches wherever Entrepalooza is served from.
      </p>
    </section>
  );
}