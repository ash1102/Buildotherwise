import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function PrivacyToggles() {
  const [sharing, setSharing] = useState(false);

  return (
    <div>
      <div className="rounded-md border border-natural bg-ivory/50 p-4">
        <p className="workbook-label">One line you wrote</p>
        <p className="mt-2 font-heading text-[16px] leading-relaxed text-ink">
          “The thing I keep coming back to is not really about the job.”
        </p>
        <p className="mt-2 text-[12.5px] text-ink-faint">Kept in this browser · Tuesday</p>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 rounded-md border border-natural p-4">
        <div>
          <p className="text-[14.5px] text-ink">Share this entry with the program creator</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">
            Separate from saving. You choose per entry, and you can change your mind before sending.
          </p>
        </div>
        <Switch checked={sharing} onCheckedChange={setSharing} aria-label="Share this entry" />
      </div>

      {sharing ? (
        <div className="mt-3 rounded-md border border-copper/30 bg-copper-wash/70 p-4">
          <p className="workbook-label">If you sent it, this is all that would go</p>
          <ul className="mt-2 space-y-1 text-[13.5px] leading-relaxed text-ink-soft">
            <li>The entry above, in your own words</li>
            <li>Its date and the step it came from</li>
          </ul>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Not your journal, not your other answers, and not anything you have written elsewhere.
          </p>
        </div>
      ) : (
        <p className="mt-3 inline-flex items-start gap-2 text-[13px] leading-relaxed text-teal-deep/80">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
          Right now it stays in this browser.
        </p>
      )}
    </div>
  );
}