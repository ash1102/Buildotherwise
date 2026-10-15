import React from "react";
import { Lock } from "lucide-react";

/**
 * Where the carry-forward records are kept. Different from the rest of the
 * workbook, which stays on the device, so it is said in full, not as one line.
 * Wording matches the implementation: the LearnerRecord entity, readable through
 * the app only by the account that wrote it.
 */
export default function RecordsPrivacyNotice() {
  return (
    <section
      aria-labelledby="records-privacy"
      className="rounded-xl border border-border bg-secondary p-4 sm:p-5"
    >
      <p id="records-privacy" className="inline-flex items-center gap-2 text-[15px] font-semibold text-foreground">
        <Lock className="h-4 w-4 text-accent-ink" aria-hidden="true" />
        Where these records are stored
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted-foreground">
        <li>
          These records are saved to <strong className="text-foreground">your Entrepalooza account</strong>, in the
          app&rsquo;s database, which is hosted by Base44. That is why they follow you when you sign in on another device.
        </li>
        <li>In the app, only your account can open, change or delete them. Other learners can&rsquo;t see them.</li>
        <li>Build Otherwise runs the app, so it has technical access to that database.</li>
        <li>
          Your step answers and journal are different: they stay <strong className="text-foreground">on this device
          only</strong>. A draft copied from a step is not saved to your account until you press Save.
        </li>
        <li>
          Delete removes a record from the database. To ask about your records, email{" "}
          <a href="mailto:Start@buildotherwise.org" className="font-medium text-accent-ink underline underline-offset-2">
            Start@buildotherwise.org
          </a>
          .
        </li>
      </ul>
    </section>
  );
}
