import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Printer, Trash2 } from "lucide-react";
import { PreviewBanner, PreviewDisclaimer } from "@/components/preview/PreviewNotice";
import { sections } from "@/lib/preview/course";
import { buildTakeaway, listMyResponses, removeResponse, setCarryForward } from "@/lib/preview/responses";
import { useAuth } from "@/lib/AuthContext";

const sectionsById = {};
sections.forEach((section) => {
  sectionsById[section.key] = section;
});

/** Everything you saved in the preview, in one place, with nothing carried forward by itself. */
export default function PreviewNotes() {
  const { isAuthenticated } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    listMyResponses()
      .then(setRows)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggleCarry = async (row) => {
    const next = !row.carry_forward;
    await setCarryForward(row, next);
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, carry_forward: next } : item)));
  };

  const remove = async (row) => {
    await removeResponse(row.id);
    setRows((current) => current.filter((item) => item.id !== row.id));
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(buildTakeaway(rows, sectionsById), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "entrepalooza-preview-takeaway.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const carried = rows.filter((row) => row.carry_forward).length;

  return (
    <div className="space-y-6">
      <PreviewBanner />

      <header className="border-b border-border pb-5">
        <p className="workbook-label">What you keep</p>
        <h1 className="mt-3">My notes in this preview</h1>
        <p className="workbook-prose mt-2">
          Everything you chose to save, across every section. Nothing carries forward on its own: mark the notes you
          want to keep, correct them, delete them, or take a copy away.
        </p>
        <p className="mt-3 text-[15px] text-muted-faint">
          {rows.length} saved · {carried} marked to carry forward · other participants can’t see these notes
        </p>
      </header>

      {!isAuthenticated ? (
        <p className="rounded-md border border-dashed border-input bg-secondary p-4 text-[16px] leading-relaxed text-muted-foreground">
          Notes are kept against your own account, so saving needs you to be logged in.{" "}
          <Link to="/login" className="font-medium text-accent-ink underline underline-offset-2">
            Log in
          </Link>
        </p>
      ) : loading ? (
        <p className="text-[16px] text-muted-faint">Opening your notes…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-input bg-secondary p-4 text-[16px] leading-relaxed text-muted-foreground">
          Nothing saved yet, and that is a complete answer. If you save something later, it appears here.
        </p>
      ) : (
        <>
          <div className="no-print flex flex-wrap gap-3">
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download my take-away
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-[15px] text-foreground transition hover:bg-secondary"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
          </div>

          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="workbook-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="workbook-label">
                      {(sectionsById[row.section_key] || {}).title || row.section_key}
                      {row.module_label ? ` · ${row.module_label}` : ""}
                    </p>
                    <h2 className="mt-1 text-[18px]">{row.step_title}</h2>
                  </div>
                  <span className="text-[13px] text-muted-faint">
                    {new Date(row.updated_date || row.created_date).toLocaleDateString()}
                  </span>
                </div>

                {row.prompt_label ? (
                  <p className="mt-2 text-[14px] text-muted-faint">{row.prompt_label}</p>
                ) : null}
                <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-foreground">
                  {row.response_text || "No response"}
                </p>

                <div className="no-print mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={Boolean(row.carry_forward)}
                    onClick={() => toggleCarry(row)}
                    className={`rounded-md border px-3 py-1.5 text-[14px] transition ${
                      row.carry_forward
                        ? "border-primary bg-primary-wash font-medium text-foreground"
                        : "border-input bg-card text-foreground"
                    }`}
                  >
                    {row.carry_forward ? "Carrying forward" : "Carry forward"}
                  </button>
                  <Link
                    to={`/preview/step/${row.step_code}`}
                    className="text-[14px] font-medium text-accent-ink underline underline-offset-2"
                  >
                    Open the step and correct it
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-accent-ink underline underline-offset-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <section className="workbook-section">
        <h2 className="text-[18px]">Shared devices</h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">
          These notes belong to your account, not to the browser you are using. On a shared device, log out when you
          have finished: the next person who logs in sees their own notes, not yours. Anything already saved stays in
          your account until you delete it, and it is not kept in the browser's own storage.
        </p>
      </section>

      <Link to="/preview" className="inline-block text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Back to the review copy
      </Link>

      <PreviewDisclaimer />
    </div>
  );
}