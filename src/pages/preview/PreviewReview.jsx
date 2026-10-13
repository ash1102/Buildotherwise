import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ContentTag from "@/components/preview/ContentTag";
import { PreviewBanner, PreviewDisclaimer } from "@/components/preview/PreviewNotice";
import { blockInventory } from "@/lib/preview/course";
import { TAG_LABELS } from "@/lib/preview/tags";
import { CONTENT_GAPS, FACILITATOR_NOTES, NOT_DONE, SCHEMA_CHANGES, TESTS } from "@/lib/preview/reviewNotes";

function List({ title, intro, rows }) {
  return (
    <section className="workbook-section">
      <h2>{title}</h2>
      {intro ? (
        <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.item || row} className="border-l-2 border-border pl-4">
            <p className="text-[16px] font-medium text-foreground">{row.item || row}</p>
            {row.detail ? (
              <p className="mt-1 max-w-[70ch] text-[15px] leading-relaxed text-muted-foreground">{row.detail}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** For the program team: what changed, what is missing, and what has not been tested. */
export default function PreviewReview() {
  const [user, setUser] = useState(undefined);
  const inventory = blockInventory();

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return <p className="py-10 text-[16px] text-muted-faint">Opening the review sheet…</p>;

  if (!user || user.role !== "admin") {
    return (
      <div className="space-y-4">
        <PreviewBanner />
        <h1>This sheet is for the program team.</h1>
        <p className="workbook-prose">
          Participants never see facilitator notes or the internal review list. Nothing about your own work is hidden
          from you: your notes are in your account, under my notes.
        </p>
        <Link to="/preview/notes" className="text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Go to my notes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PreviewBanner />

      <header className="border-b border-border pb-5">
        <p className="workbook-label">Program team only</p>
        <h1 className="mt-3">Review sheet</h1>
        <p className="workbook-prose mt-2">
          Every schema change, access-rule change, content gap and test result for this review copy. Nothing here is a
          claim that the experience is accessible, engaging or ready: it built, and that is all.
        </p>
      </header>

      <List
        title="Schema and access-rule changes"
        intro="Only one thing was added. Everything else the feature needs already existed."
        rows={SCHEMA_CHANGES}
      />

      <section className="workbook-section">
        <h2>How the tags read</h2>
        <ul className="mt-4 space-y-3">
          {Object.entries(TAG_LABELS).map(([key, meta]) => (
            <li key={key} className="flex flex-wrap items-start gap-3">
              <ContentTag tag={key} />
              <span className="max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{meta.long}</span>
            </li>
          ))}
        </ul>
      </section>

      <List
        title="Content gaps and wording that needs your sign-off"
        intro="Nothing was invented to fill a space. Where text does not exist yet, the gap is listed here."
        rows={CONTENT_GAPS}
      />

      <List title="Facilitator notes (participants never see this list)" rows={FACILITATOR_NOTES} />

      <section className="workbook-section">
        <h2>Block inventory</h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">
          Every block carries a stable ID and a version, so approving a lesson later means moving these definitions
          rather than rebuilding the interaction. Blocks marked “lesson-record” come straight from the existing lesson
          records.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-3 font-medium text-foreground">Section</th>
                <th className="py-2 pr-3 font-medium text-foreground">Step</th>
                <th className="py-2 pr-3 font-medium text-foreground">Block</th>
                <th className="py-2 pr-3 font-medium text-foreground">Version</th>
                <th className="py-2 pr-3 font-medium text-foreground">Type</th>
                <th className="py-2 font-medium text-foreground">Tag</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row.id} className="border-b border-border align-top">
                  <td className="py-2 pr-3 text-muted-foreground">{row.section}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.step}</td>
                  <td className="py-2 pr-3 font-mono text-[13px] text-foreground">{row.id}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.version}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.type}</td>
                  <td className="py-2 text-muted-foreground">{row.tag ? TAG_LABELS[row.tag].short : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <List title="What was tested" intro="Checked against the running preview, with your own account as the test account." rows={TESTS} />

      <List title="What was not done" rows={NOT_DONE} />

      <Link to="/preview" className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Back to the review copy
      </Link>

      <PreviewDisclaimer />
    </div>
  );
}