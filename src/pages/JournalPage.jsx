import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import { Download, PenLine, Printer, Send, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { addFollowUp, journalStepDomId, removeEntry, reviseEntry, updateEntry, useJournalEntries } from "@/lib/journal";
import { createDiscovery, listDiscoveries } from "@/lib/discoveries";
import { downloadText } from "@/lib/download";
import EntryCard from "@/components/journal/EntryCard";
import JournalComposer from "@/components/journal/JournalComposer";
import EditEntryPanel from "@/components/journal/EditEntryPanel";
import FollowUpPanel from "@/components/journal/FollowUpPanel";
import AddFromJournalDialog from "@/components/discovery/AddFromJournalDialog";
import PrivacyNote from "@/components/workbook/PrivacyNote";

const TABS = [
  { key: "all", label: "All entries" },
  { key: "free", label: "Personal entries" },
  { key: "lesson", label: "Lesson responses" },
];

export default function JournalPage() {
  const entries = useJournalEntries();
  const [params] = useSearchParams();
  const stepCode = params.get("step") || "";
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState([]);
  const [pending, setPending] = useState(null);
  const [copying, setCopying] = useState(null);
  const [editing, setEditing] = useState(null);
  const [answering, setAnswering] = useState(null);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  /** Follow-ups belong to the entry they answer, however long the chain gets. */
  const { byId, followUpsFor } = useMemo(() => {
    const map = new Map(entries.map((entry) => [entry.id, entry]));
    const rootOf = (entry) => {
      let current = entry;
      const seen = new Set([entry.id]);
      while (current.follow_up_of && map.has(current.follow_up_of) && !seen.has(current.follow_up_of)) {
        seen.add(current.follow_up_of);
        current = map.get(current.follow_up_of);
      }
      return current.id;
    };
    const buckets = new Map();
    entries.forEach((entry) => {
      if (!entry.follow_up_of || !map.has(entry.follow_up_of)) return;
      const root = rootOf(entry);
      if (!buckets.has(root)) buckets.set(root, []);
      buckets.get(root).push(entry);
    });
    buckets.forEach((items) => items.sort((a, b) => (a.created_date > b.created_date ? 1 : -1)));
    return { byId: map, followUpsFor: (id) => buckets.get(id) || [] };
  }, [entries]);

  const visible = useMemo(() => {
    if (tab === "free") return entries.filter((entry) => entry.kind === "free");
    if (tab === "lesson") return entries.filter((entry) => entry.kind !== "free");
    return entries;
  }, [entries, tab]);

  /** Follow-ups are shown under the entry they answer, never as their own row. */
  const topLevel = useMemo(
    () => visible.filter((entry) => !(entry.follow_up_of && byId.has(entry.follow_up_of))),
    [visible, byId]
  );

  const grouped = useMemo(() => {
    const groups = [];
    topLevel.forEach((entry) => {
      const key = entry.lesson_code || "free";
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(entry);
      else groups.push({ key, title: entry.lesson_title || "Personal entries", items: [entry] });
    });
    return groups;
  }, [topLevel]);

  const stepNotes = useMemo(
    () => (stepCode ? entries.filter((entry) => entry.lesson_code === stepCode) : []),
    [entries, stepCode]
  );

  useEffect(() => {
    if (!stepCode || stepNotes.length === 0) return;
    const node = document.getElementById(journalStepDomId(stepCode));
    if (node) node.scrollIntoView({ block: "start" });
  }, [stepCode, stepNotes.length]);

  const focusComposer = () => {
    const box = document.getElementById("journal-entry-box");
    box?.scrollIntoView({ behavior: "smooth", block: "center" });
    box?.focus();
  };

  const send = async () => {
    if (!pending) return;
    setSending(true);
    try {
      await base44.entities.Feedback.create({
        kind: "shared_entry",
        message: pending.body,
        entry_label: pending.label,
      });
      toast({ title: "Shared. You can change your mind later by telling the program creator." });
      setPending(null);
      setSelected([]);
    } catch (error) {
      toast({ title: "That didn't send. Please try again." });
    } finally {
      setSending(false);
    }
  };

  /** Copies only the wording confirmed in the dialog; the journal entry is untouched. */
  const addToRecord = (body) => {
    if (!copying) return;
    const created = createDiscovery({
      body,
      source: {
        kind: copying.kind === "free" ? "journal" : "lesson",
        label: copying.prompt_label || (copying.kind === "free" ? "Written freely" : "Lesson reflection"),
        lesson_code: copying.lesson_code || "",
        lesson_title: copying.lesson_title || "",
        journal_entry_id: copying.id,
        date: copying.created_date,
      },
    });
    if (listDiscoveries().some((item) => item.id === created.id)) {
      setCopying(null);
      toast({ title: "Added to your Discovery Record." });
    } else {
      toast({ title: "That did not save in this browser, so nothing was copied." });
    }
  };

  const saveEdit = (mode, body) => {
    if (!editing) return;
    if (mode === "replace") updateEntry(editing.id, { body });
    else reviseEntry(editing.id, body);
    setEditing(null);
    toast({
      title:
        mode === "replace" ? "Entry updated." : "Saved with the earlier wording kept beside it.",
    });
  };

  const saveFollowUp = (body) => {
    if (!answering) return;
    addFollowUp(answering, body);
    setAnswering(null);
    toast({ title: "Follow-up added." });
  };

  const exportEntry = (entry) => {
    const where = entry.lesson_title ? ` · ${entry.lesson_code} ${entry.lesson_title}`.trim() : "";
    const parts = [
      `# ${entry.kind === "free" ? entry.prompt_label || "Personal entry" : entry.prompt_label || "Lesson response"}`,
      `_${moment(entry.created_date).format("D MMMM YYYY, HH:mm")}${where}_`,
      "",
      entry.body || "(empty)",
    ];
    followUpsFor(entry.id).forEach((item) => {
      parts.push("", `## Follow-up, ${moment(item.created_date).format("D MMMM YYYY, HH:mm")}`, "", item.body || "(empty)");
    });
    downloadText(`entrepalooza-journal-${moment(entry.created_date).format("YYYY-MM-DD")}.md`, parts.join("\n"));
    toast({ title: "Entry exported." });
  };

  const downloadAll = () => {
    const lines = entries
      .slice()
      .reverse()
      .map((entry) => {
        const where = entry.lesson_title ? `, ${entry.lesson_code} ${entry.lesson_title}` : "";
        return `## ${entry.kind === "free" ? entry.prompt_label || "Personal entry" : entry.prompt_label || "Lesson response"}${where}\n_${moment(
          entry.created_date
        ).format("D MMMM YYYY, HH:mm")}_\n\n${entry.body || "(empty)"}\n`;
      });
    downloadText("entrepalooza-journal.md", `# Conversation Journal\n\n${lines.join("\n")}`);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Conversation Journal</p>
        <h1 className="mt-2">Your Conversation Journal</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Keep your lesson responses, observations, and questions together. Return to an earlier entry when you want to
          add something or see what has changed.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={downloadAll} className="rounded-md border-input bg-card">
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
          <PrivacyNote>Saved on this device only.</PrivacyNote>
        </div>
      </header>

      <JournalComposer />

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={tab === item.key}
              onClick={() => setTab(item.key)}
              className={`rounded-md border px-3.5 py-2 text-[15px] transition ${
                tab === item.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {selected.length ? (
          <Button
            type="button"
            className="rounded-md bg-accent-ink text-white hover:bg-accent-ink/90"
            onClick={() => {
              const chosen = entries.filter((entry) => selected.includes(entry.id));
              setPending({
                label: `${chosen.length} selected ${chosen.length === 1 ? "entry" : "entries"}: ${chosen
                  .map((entry) => entry.lesson_title || "personal entries")
                  .join("; ")}`,
                body: chosen
                  .map((entry) => `${entry.prompt_label || "Personal entry"}: ${entry.body}`)
                  .join("\n\n"),
              });
            }}
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Share {selected.length} selected
          </Button>
        ) : null}
      </div>

      {pending ? (
        <section className="rounded-xl border border-border bg-secondary p-5">
          <p className="workbook-label">Confirm exactly what you are sharing</p>
          <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
            Scope: <strong className="font-semibold text-foreground">{pending.label}</strong>. Nothing else goes with it,
            and no other part of your journal is visible. You can withdraw this later by telling the program creator.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={send}
              disabled={sending}
              className="rounded-md bg-accent-ink text-white hover:bg-accent-ink/90"
            >
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {sending ? "Sending…" : "Send this"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPending(null)}
              className="rounded-md border-input bg-card"
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

      {answering ? (
        <FollowUpPanel entry={answering} onSave={saveFollowUp} onCancel={() => setAnswering(null)} />
      ) : null}

      {editing ? (
        <EditEntryPanel entry={editing} onSave={saveEdit} onCancel={() => setEditing(null)} />
      ) : null}

      {copying ? (
        <AddFromJournalDialog key={copying.id} entry={copying} onClose={() => setCopying(null)} onConfirm={addToRecord} />
      ) : null}

      {entries.length === 0 ? (
        <section className="rounded-xl border border-dashed border-input bg-card p-5">
          <h2 className="text-[19px]">Start wherever you are.</h2>
          <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
            {stepCode
              ? "Nothing from this step is here yet. A note you save on the step shows up here."
              : "Write a thought, question, or observation. Responses you save from lessons will appear here too."}
          </p>
          <Button
            type="button"
            onClick={focusComposer}
            className="mt-4 rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
          >
            <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
            Write an entry
          </Button>
        </section>
      ) : (
        <div className="space-y-8">
          {topLevel.length === 0 ? (
            <p className="rounded-xl border border-dashed border-input bg-card p-5 text-[17px] leading-relaxed text-muted-foreground">
              Nothing in this view yet. Your other entries are still here under a different filter.
            </p>
          ) : null}

          {stepCode && stepNotes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-input bg-card p-5 text-[17px] leading-relaxed text-muted-foreground">
              Nothing from this step is here yet. A note you save on the step shows up here.
            </p>
          ) : null}

          {grouped.map((group, index) => {
            const fromThisStep =
              Boolean(stepCode) &&
              group.key === stepCode &&
              grouped.findIndex((item) => item.key === stepCode) === index;
            return (
              <section
                key={`${group.key}-${index}`}
                id={fromThisStep ? journalStepDomId(stepCode) : undefined}
                className={fromThisStep ? "rounded-xl bg-secondary p-4" : undefined}
              >
                <p className="workbook-label">{group.title}</p>
              <div className="mt-3 space-y-3">
                {group.items.map((entry) => {
                  const earlier = entry.revision_of
                    ? entries.find((candidate) => candidate.id === entry.revision_of)
                    : null;
                  return (
                    <div key={entry.id} className="space-y-3">
                      {earlier ? (
                        <div className="rounded-xl border border-dashed border-input bg-secondary p-4">
                          <p className="workbook-label">Earlier wording, kept</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-muted-foreground">
                            {earlier.body}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex items-start gap-3">
                        {tab === "all" ? (
                          <Checkbox
                            className="mt-4 border-input data-[state=checked]:bg-primary"
                            aria-label="Select this entry to share"
                            checked={selected.includes(entry.id)}
                            onCheckedChange={(checked) =>
                              setSelected(
                                checked ? [...selected, entry.id] : selected.filter((id) => id !== entry.id)
                              )
                            }
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <EntryCard
                            entry={entry}
                            followUps={followUpsFor(entry.id)}
                            onAddToRecord={setCopying}
                            onFollowUp={setAnswering}
                            onEdit={setEditing}
                            onExport={exportEntry}
                            onShare={(item) =>
                              setPending({
                                label: `One entry, ${item.prompt_label || "personal entry"}${
                                  item.lesson_title ? `, from ${item.lesson_title}` : ""
                                }, written ${moment(item.created_date).format("D MMMM YYYY")}`,
                                body: item.body,
                              })
                            }
                            onDelete={(item) => {
                              removeEntry(item.id);
                              toast({ title: "Entry deleted." });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            );
          })}
        </div>
      )}

      <section className="no-print rounded-xl border border-border bg-card p-5">
        <h2 className="workbook-label">
          <Trash2 className="mb-2 h-4 w-4" aria-hidden="true" />
          Changing your mind
        </h2>
        <p className="mt-2 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Deleting an entry here removes it from this device. Sharing only sends what you confirm above, one entry
          or the entries you ticked, and never your whole journal.
        </p>
      </section>
    </div>
  );
}