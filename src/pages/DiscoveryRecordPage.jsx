import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Download, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  contextRows,
  createDiscovery,
  listAllDiscoveryRecords,
  listAllThreads,
  listDiscoveries,
  loadDiscoveries,
  migrateThreadsToRecords,
  readMovedThreadIds,
  removeDiscoveryConfirmed,
  updateDiscoveryConfirmed,
  useDiscoveries,
} from "@/lib/discoveries";
import {
  editableFromRecord,
  editableFromThread,
  isDiscoveryFlowRecord,
  migrationAllowed,
  recordPatchFromEdit,
  unmovedThreads,
} from "@/lib/discoveryMigration";
import { deleteThread, updateThread } from "@/lib/discoveryThreads";
import { useAuth } from "@/lib/AuthContext";
import { GROUP_LABELS, entriesFromAnswers, tryLogValues } from "@/lib/discovery";
import { useDecisions, useDiscoveryNotes, useWorkbook } from "@/lib/workbook";
import { downloadText } from "@/lib/download";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DiscoveryForm from "@/components/discovery/DiscoveryForm";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import WorkbookSources from "@/components/discovery/WorkbookSources";
import DiscoveryFlowEntry from "@/components/discovery/DiscoveryFlowEntry";

/**
 * Discoveries saved from Discovery before the Discovery Record took them over, read straight from the account.
 * Shows only threads no record points at, so a moved discovery appears once. When migration is switched on for
 * this account (see MIGRATION_SWITCH), it runs first; until then the earlier saves are shown and edited in place.
 */
function useEarlierDiscoveries(email) {
  const [threads, setThreads] = useState([]);
  const [state, setState] = useState("loading");

  const refresh = useCallback(async () => {
    try {
      if (migrationAllowed(email)) {
        try {
          const result = await migrateThreadsToRecords();
          if (result.moved) await loadDiscoveries();
        } catch (error) {
          // Nothing is lost: anything not moved is still shown below from its original copy.
          console.error("Discovery migration did not finish", error);
        }
      }
      const [records, all, movedIds] = await Promise.all([listAllDiscoveryRecords(), listAllThreads(), readMovedThreadIds()]);
      setThreads(unmovedThreads(all, records, movedIds));
      setState("ready");
    } catch (error) {
      console.error("Earlier discoveries could not load", error);
      setState("failed");
    }
  }, [email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { threads, setThreads, state };
}

function newestFirst(a, b) {
  return (a.created_date || "") < (b.created_date || "") ? 1 : -1;
}

export default function DiscoveryRecordPage() {
  const discoveries = useDiscoveries();
  const { user } = useAuth();
  const earlier = useEarlierDiscoveries(user?.email);
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
      toast({ title: "That did not save. Try again." });
    }
  };

  const download = () => {
    const blocks = [];

    if (discoveries.length || earlier.threads.length) {
      const fromThreads = earlier.threads.map((thread) => ({
        title: thread.title,
        body: thread.response,
        created_date: thread.created_date,
        source: { question_text: thread.question_text, option_label: thread.option_label, notes: thread.notes },
      }));
      const lines = [...discoveries, ...fromThreads].map((entry) => {
        const parts = [`### ${entry.title || moment(entry.created_date).format("D MMMM YYYY")}`];
        parts.push(entry.body || "(no words yet)");
        if (entry.decision) parts.push(`Next decision: ${entry.decision}`);
        (entry.decision_updates || []).forEach((update) =>
          parts.push(`Earlier decision: ${update.decision} (${moment(update.date).format("D MMMM YYYY")})`)
        );
        const from = entry.source && (entry.source.lesson_title || entry.source.label || entry.source.question_text);
        if (from) parts.push(`From: ${from}`);
        if (entry.source && entry.source.option_label) parts.push(`You chose: ${entry.source.option_label}`);
        if (entry.source && entry.source.notes) parts.push(`Your notes: ${entry.source.notes}`);
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

  const afterDelete = (result) => {
    const words = result?.originalKept
      ? "Deleted from your Discovery Record. An earlier saved copy couldn’t be removed; it is still in your download. Try deleting it again from Settings, or email Start@buildotherwise.org."
      : "Deleted from your Discovery Record.";
    setStatus(words);
    toast({ title: words });
  };

  const items = [
    ...discoveries.map((entry) =>
      isDiscoveryFlowRecord(entry)
        ? {
            kind: "flow",
            key: `record-${entry.id}`,
            created_date: entry.created_date,
            editable: editableFromRecord(entry),
            onSave: (next) => updateDiscoveryConfirmed(entry.id, recordPatchFromEdit(entry, next)),
            onDelete: async () => afterDelete(await removeDiscoveryConfirmed(entry.id)),
          }
        : { kind: "card", key: `record-${entry.id}`, created_date: entry.created_date, entry }
    ),
    ...earlier.threads.map((thread) => ({
      kind: "flow",
      key: `thread-${thread.id}`,
      created_date: thread.created_date,
      editable: editableFromThread(thread),
      onSave: async (next) => {
        const saved = await updateThread(thread.id, next);
        earlier.setThreads((list) => list.map((t) => (t.id === thread.id ? { ...t, ...next, ...(saved || {}) } : t)));
      },
      onDelete: async () => {
        await deleteThread(thread.id);
        earlier.setThreads((list) => list.filter((t) => t.id !== thread.id));
        afterDelete({ originalKept: false });
      },
    })),
  ].sort(newestFirst);

  return (
    <div className="space-y-7">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Discovery Record</p>
        <h1 className="mt-2">Discovery Record</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Two different things live on this page. <strong className="font-semibold text-foreground">Saved answers</strong> are
          what the steps already hold, kept where you wrote them.{" "}
          <strong className="font-semibold text-foreground">Discoveries you keep</strong> are the few things you choose to
          carry forward yourself, added here or saved from Discovery on your dashboard. Open one to change it, change
          what you chose, or try something related. Nothing is added here on your behalf.
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
            Saved to your account. Your carry-forward records (question to Tribe Continuity Card) live on{" "}
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

        {earlier.state === "failed" ? (
          <p className="text-[15px] text-muted-foreground">
            Some discoveries you saved earlier didn’t load. Refresh the page. Nothing has been deleted.
          </p>
        ) : null}

        {items.length ? (
          <div className="space-y-3">
            {items.map((item) =>
              item.kind === "card" ? (
                <DiscoveryCard key={item.key} entry={item.entry} />
              ) : (
                <DiscoveryFlowEntry key={item.key} item={item.editable} onSave={item.onSave} onDelete={item.onDelete} />
              )
            )}
          </div>
        ) : adding || earlier.state === "loading" ? null : (
          <div className="rounded-xl border border-dashed border-input bg-card p-5">
            <p className="text-[17px] font-semibold text-foreground">Nothing kept yet.</p>
            <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
              Keep something when it is worth carrying forward, here or with Save to Discovery Record on your dashboard.
              Answers you saved in the steps below are already yours and do not need adding here.
            </p>
          </div>
        )}
      </section>

      <WorkbookSources />
    </div>
  );
}