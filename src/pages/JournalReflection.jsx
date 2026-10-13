import React from "react";
import { Link } from "react-router-dom";
import { useJournalEntries } from "@/lib/journal";
import PrivacyNote from "@/components/workbook/PrivacyNote";

/**
 * Reflection is deferred for this repair. The screen no longer starts a
 * conversation or sends any entry anywhere: it states plainly that the feature is
 * not available yet, keeps your journal untouched, and points at what still works.
 * Saved conversations are not read, changed or deleted here.
 */
export default function JournalReflection() {
  const entries = useJournalEntries();

  return (
    <div className="space-y-7">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Reflection</p>
        <h1 className="mt-2">Reflecting on your entries</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          A reflection partner that works only with entries you choose to bring in would be useful here. It is not
          switched on yet, and nothing you have written is sent anywhere while it is off.
        </p>
        <div className="mt-3 max-w-[68ch]">
          <PrivacyNote>
            Your journal stays in this browser. Nothing from it is sent, copied or posted by this page.
          </PrivacyNote>
        </div>
      </header>

      <section className="rounded-xl border border-dashed border-input bg-card p-5 sm:p-6">
        <h2 className="text-[19px]">Not available yet</h2>
        <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Reflection is still being built, so there is no conversation to start here at the moment. Your journal entries
          stay exactly as they are, and any earlier reflection conversations remain stored in the app. Nothing has been
          deleted.
        </p>
        <ul className="mt-4 space-y-2 text-[16px]">
          <li>
            <Link to="/journal" className="font-medium text-accent-ink underline underline-offset-2">
              Read your journal
            </Link>{" "}
            <span className="text-muted-faint">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} saved on this device.
            </span>
          </li>
          <li>
            <Link to="/" className="font-medium text-accent-ink underline underline-offset-2">
              Return to the workbook
            </Link>{" "}
            <span className="text-muted-faint">and keep going with the steps.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}