import React, { useMemo, useState } from "react";
import moment from "moment";
import { Download, PenLine, Printer, Send, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { addFollowUp, removeEntry, reviseEntry, updateEntry, useJournalEntries } from "@/lib/journal";
import { createDiscovery, listDiscoveries } from "@/lib/discoveries";
import { downloadText } from "@/lib/download";
import EntryCard from "@/components/journal/EntryCard";
import JournalComposer from "@/components/journal/JournalComposer";
import EditEntryPanel from "@/components/journal/EditEntryPanel";
import FollowUpPanel from "@/components/journal/FollowUpPanel";
import AddFromJournalDialog from "@/components/discovery/AddFromJournalDialog";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DashedMotif from "@/components/workbook/DashedMotif";

const TABS = [
  { key: "all", label: "All entries" },
  { key: "free", label: "Personal entries" },
  { key: "lesson", label: "Lesson responses" },
];

export default function JournalPage() {
  const entries = useJournalEntries();
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
      parts.push("", `## Follow-up — ${moment(item.created_date).format("D MMMM YYYY, HH:mm")}`, "", item.body || "(empty)");
    });
    downloadText(`entrepalooza-journal-${moment(entry.created_date).format("YYYY-MM-DD")}.md`, parts.join("\n"));
    toast({ title: "Entry exported." });
  };

  const downloadAll = () => {
    const lines = entries
      .slice()
      .reverse()
      .map((entry) => {
        const where = entry.lesson_title ? ` — ${entry.lesson_code} ${entry.lesson_title}` : "";
        return `## ${entry.kind === "free" ? entry.prompt_label || "Personal entry" : entry.prompt_label || "Lesson response"}${where}\n_${moment(
          entry.created_date
        ).format("D MMMM YYYY, HH:mm")}_\n\n${entry.body || "(empty)"}\n`;
      });
    downloadText("entrepalooza-journal.md", `# Conversation Journal\n\n${lines.join("\n")}`);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Conversation Journal</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Your Conversation Journal</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              Keep your lesson responses, observations, and questions together. Return to an earlier entry when you want
              to add something or see what has changed.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={downloadAll} className="rounded-full border-natural bg-white">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="rounded-full border-natural bg-white"
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          <PrivacyNote>Your journal lives in this browser until you share an entry.</PrivacyNote>
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
              className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
                tab === item.key
                  ? "border-teal-deep bg-teal-deep text-ivory"
                  : "border-natural bg-white text-ink-soft hover:border-teal-deep/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {selected.length ? (
          <Button
            type="button"
            className="rounded-full bg-copper text-ivory hover:bg-copper/90"
            onClick={() => {
              const chosen = entries.filter((entry) => selected.includes(entry.id));
              setPending({
                label: `${chosen.length} selected ${chosen.length === 1 ? "entry" : "entries"} — ${chosen
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
        <section className="rounded-lg border border-copper/40 bg-copper-wash/60 p-5">
          <p className="workbook-label text-copper">Confirm exactly what you are sharing</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            Scope: <strong className="font-medium text-ink">{pending.label}</strong>. Nothing else goes with it, and no
            other part of your journal is visible. You can withdraw this later by telling the program creator.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              onClick={send}
              disabled={sending}
              className="rounded-full bg-copper text-ivory hover:bg-copper/90"
            >
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {sending ? "Sending…" : "Send this"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPending(null)}
              className="rounded-full border-natural bg-white"
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
        <section className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6">
          <p className="font-heading text-xl text-ink">Start wherever you are.</p>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft">
            Write a thought, question, or observation. Responses you save from lessons will appear here too.
          </p>
          <Button
            type="button"
            onClick={focusComposer}
            className="mt-4 rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
          >
            <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
            Write an entry
          </Button>
        </section>
      ) : (
        <div className="space-y-8">
          {topLevel.length === 0 ? (
            <p className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6 text-[14px] leading-relaxed text-ink-soft">
              Nothing in this view yet. Your other entries are still here under a different filter.
            </p>
          ) : null}

          {grouped.map((group) => (
            <section key={group.key}>
              <p className="workbook-label">{group.title}</p>
              <div className="mt-3 space-y-3">
                {group.items.map((entry) => {
                  const earlier = entry.revision_of
                    ? entries.find((candidate) => candidate.id === entry.revision_of)
                    : null;
                  return (
                    <div key={entry.id} className="space-y-3">
                      {earlier ? (
                        <div className="rounded-lg border border-dashed border-natural-deep bg-ivory-deep/60 p-4">
                          <p className="workbook-label">Earlier wording, kept</p>
                          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-faint">
                            {earlier.body}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex items-start gap-3">
                        {tab === "all" ? (
                          <Checkbox
                            className="mt-4 border-teal-deep/40 data-[state=checked]:bg-teal-deep"
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
                                label: `One entry — ${item.prompt_label || "personal entry"}${
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
          ))}
        </div>
      )}

      <section className="no-print rounded-lg border border-natural bg-white/60 p-5">
        <p className="workbook-label">
          <Trash2 className="mb-2 h-4 w-4" aria-hidden="true" />
          Changing your mind
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          Deleting an entry here removes it from this browser. Sharing only ever sends what you confirm above — one entry
          or the entries you ticked — and never your whole journal.
        </p>
      </section>
    </div>
  );
}