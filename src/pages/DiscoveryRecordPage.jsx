import React, { useState } from "react";
import moment from "moment";
import { Download, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { contextRows, createDiscovery, listDiscoveries, useDiscoveries } from "@/lib/discoveries";
import { GROUP_LABELS, entriesFromAnswers, tryLogValues } from "@/lib/discovery";
import { useDecisions, useDiscoveryNotes, useWorkbook } from "@/lib/workbook";
import { downloadText } from "@/lib/download";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DiscoveryForm from "@/components/discovery/DiscoveryForm";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import WorkbookSources from "@/components/discovery/WorkbookSources";

export default function DiscoveryRecordPage() {
  const discoveries = useDiscoveries();
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const notes = useDiscoveryNotes();
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState("");
  const { toast } = useToast();

  /** The form stays open when the browser refuses the write, so nothing typed is lost. */
  const add = (values) => {
    const created = createDiscovery(values);
    const kept = listDiscoveries().some((item) => item.id === created.id);
    if (kept) {
      setAdding(false);
      setStatus("Added to your Discovery Record.");
      toast({ title: "Added to your Discovery Record." });
    } else {
      setStatus("This browser did not keep the entry, so it is still open below.");
      toast({ title: "That did not save in this browser." });
    }
  };

  const download = () => {
    const blocks = [];

    if (discoveries.length) {
      const lines = discoveries.map((entry) => {
        const parts = [`### ${entry.title || moment(entry.created_date).format("D MMMM YYYY")}`];
        parts.push(entry.body || "(no words yet)");
        if (entry.decision) parts.push(`Next decision: ${entry.decision}`);
        (entry.decision_updates || []).forEach((update) =>
          parts.push(`Earlier decision: ${update.decision} (${moment(update.date).format("D MMMM YYYY")})`)
        );
        if (entry.source && entry.source.label) {
          parts.push(`From: ${entry.source.lesson_title || entry.source.label}`);
        }
        contextRows(entry.context).forEach((row) => parts.push(`- ${row.label} ${row.value}`));
        return parts.join("\n");
      });
      blocks.push(`## Discoveries you chose to keep\n${lines.join("\n\n")}`);
    }

    blocks.push(`## Current life context\n${notes.context || "(nothing written yet)"}`);
    const fromAnswers = entriesFromAnswers(answers);
    Object.entries(GROUP_LABELS).forEach(([section, label]) => {
      const items = fromAnswers.filter((item) => item.section === section);
      blocks.push(
        `## ${label}\n${
          items.length ? items.map((item) => `- ${item.label}: ${item.value}`).join("\n") : "- (nothing yet)"
        }`
      );
    });
    const tryLog = tryLogValues(answers).filter((item) => item.value);
    if (tryLog.length) {
      blocks.push(`## Try log\n${tryLog.map((item) => `- ${item.label}: ${item.value}`).join("\n")}`);
    }
    const decided = Object.entries(decisions || {}).filter(([, value]) => value);
    if (decided.length) {
      blocks.push(`## Next decisions\n${decided.map(([code, value]) => `- ${code}: ${value}`).join("\n")}`);
    }

    downloadText("entrepalooza-discovery-record.md", `# Discovery Record\n\n${blocks.join("\n\n")}`);
  };

  return (
    <div className="space-y-7">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Discovery Record</p>
        <h1 className="mt-2">Discovery Record</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Two different things live on this page. <strong className="font-semibold text-foreground">Saved answers</strong> are
          what the steps already hold, kept where you wrote them.{" "}
          <strong className="font-semibold text-foreground">Discoveries you keep</strong> are the few things you choose to
          carry forward yourself. Nothing is added here on your behalf.
        </p>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-faint">
          This is not a score or a finished account of who you are. A few words, uncertainty, or nothing to add yet are all
          okay.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            aria-expanded={adding}
            onClick={() => setAdding(!adding)}
            className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add a discovery
          </Button>
          <Button type="button" variant="outline" onClick={download} className="rounded-md border-input bg-card">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="rounded-md border-input bg-card"
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
        </div>
        <div className="mt-3">
          <PrivacyNote>
            Saved on this device only. Your carry-forward records (question to Tribe Continuity Card) live on{" "}
            <a href="/my-records" className="underline underline-offset-2">
              My Records
            </a>
            , saved to your account.
          </PrivacyNote>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="workbook-label">Discoveries you chose to keep</h2>

        {adding ? <DiscoveryForm onSubmit={add} onCancel={() => setAdding(false)} /> : null}

        <p aria-live="polite" className="text-[15px] text-accent-ink">
          {status}
        </p>

        {discoveries.length ? (
          <div className="space-y-3">
            {discoveries.map((entry) => (
              <DiscoveryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : adding ? null : (
          <div className="rounded-xl border border-dashed border-input bg-card p-5">
            <p className="text-[17px] font-semibold text-foreground">Nothing kept yet.</p>
            <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
              Keep something when it is worth carrying forward. Answers you saved in the steps below are already yours and
              do not need adding here.
            </p>
          </div>
        )}
      </section>

      <WorkbookSources />
    </div>
  );
}