import React, { useState } from "react";
import { Download, Plus, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { makeId } from "@/lib/store";
import { setLifeMap, useLifeMap } from "@/lib/workbook";
import { useJournalEntries } from "@/lib/journal";
import { downloadText } from "@/lib/download";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import DashedMotif from "@/components/workbook/DashedMotif";

const SECTIONS = [
  {
    key: "places",
    label: "Places",
    prompt: "Where this kind of activity happens — and whether you can get there, feel welcome, and afford it.",
  },
  {
    key: "placeless",
    label: "Activities without a fixed place",
    prompt: "Things you do anywhere: reading, walking, talking, making, fixing, helping.",
  },
  {
    key: "energy",
    label: "Energy markers",
    prompt: "What left you steadier, and what took more than it gave.",
  },
  {
    key: "barriers",
    label: "Barriers",
    prompt: "Cost, transport, childcare, accessibility, schedule, credentials. Facts about the situation — not failings.",
  },
  {
    key: "threads",
    label: "Threads",
    prompt: "What your attention keeps coming back to.",
  },
];

export default function LifeMapPage() {
  const map = useLifeMap();
  const entries = useJournalEntries();
  const [drafts, setDrafts] = useState({});
  const [linking, setLinking] = useState(null);

  const items = (key) => map[key] || [];

  const update = (key, next) => setLifeMap({ ...map, [key]: next });

  const addItem = (key) => {
    const text = (drafts[key] || "").trim();
    if (!text) return;
    update(key, [...items(key), { id: makeId("map"), text, entry_id: "" }]);
    setDrafts({ ...drafts, [key]: "" });
  };

  const removeItem = (key, id) => update(key, items(key).filter((item) => item.id !== id));

  const linkEntry = (key, id, entryId) =>
    update(
      key,
      items(key).map((item) => (item.id === id ? { ...item, entry_id: entryId } : item))
    );

  const download = () => {
    const body = SECTIONS.map((section) => {
      const lines = items(section.key).map((item) => `- ${item.text}`);
      return `## ${section.label}\n${lines.length ? lines.join("\n") : "- (nothing yet)"}\n`;
    }).join("\n");
    downloadText("entrepalooza-life-map.md", `# Map the Life You're Actually Living\n\n${body}`);
  };

  const total = SECTIONS.reduce((count, section) => count + items(section.key).length, 0);

  return (
    <div className="space-y-8">
      <header className="border-b border-natural pb-6">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Getting Started · the interactive map</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Map the life you’re actually living</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              This map grows as you go. Add anything, come back and change it, or leave sections empty — empty is honest too.
              It stays private, and you can download it whenever you want.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={download} className="rounded-full border-natural bg-white">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()} className="rounded-full border-natural bg-white">
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
          <PrivacyNote>{total ? `${total} ${total === 1 ? "entry" : "entries"} on this map, held in this browser only.` : null}</PrivacyNote>
        </div>
      </header>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.key} className="rounded-lg border border-natural bg-white p-5 sm:p-6">
            <p className="workbook-label">{section.label}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{section.prompt}</p>

            <ul className="mt-4 space-y-3">
              {items(section.key).map((item) => {
                const linked = item.entry_id ? entries.find((entry) => entry.id === item.entry_id) : null;
                return (
                  <li key={item.id} className="rounded-lg border border-natural/80 bg-ivory/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] leading-relaxed text-ink">{item.text}</p>
                      <div className="flex shrink-0 items-center gap-3 text-[12px]">
                        <button
                          type="button"
                          className="text-teal-deep underline decoration-natural underline-offset-2"
                          onClick={() => setLinking(linking === item.id ? null : item.id)}
                        >
                          {linked ? "Change link" : "Link journal"}
                        </button>
                        <button
                          type="button"
                          aria-label="Remove this map item"
                          className="text-ink-faint hover:text-copper"
                          onClick={() => removeItem(section.key, item.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {linked ? (
                      <p className="mt-2 border-l-2 border-teal-deep/30 pl-3 text-[13px] leading-relaxed text-ink-faint">
                        From your journal: {linked.body}
                      </p>
                    ) : null}

                    {linking === item.id ? (
                      <div className="mt-3">
                        {entries.length ? (
                          <select
                            className="w-full rounded-md border border-natural bg-white px-3 py-2 text-[13px]"
                            value={item.entry_id || ""}
                            onChange={(event) => {
                              linkEntry(section.key, item.id, event.target.value);
                              setLinking(null);
                            }}
                          >
                            <option value="">No link</option>
                            {entries.slice(0, 30).map((entry) => (
                              <option key={entry.id} value={entry.id}>
                                {(entry.lesson_title || "Written freely") + " — " + entry.body.slice(0, 60)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-[13px] text-ink-faint">
                            Your journal is empty so far. Write an entry and it can be linked here.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex gap-2">
              <Input
                value={drafts[section.key] || ""}
                onChange={(event) => setDrafts({ ...drafts, [section.key]: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addItem(section.key);
                }}
                placeholder="Add a line…"
                className="border-natural bg-ivory/60 text-[14px]"
              />
              <Button
                type="button"
                onClick={() => addItem(section.key)}
                disabled={!(drafts[section.key] || "").trim()}
                aria-label={`Add this line to ${section.label}`}
                className="rounded-full bg-teal-deep text-ivory hover:bg-teal-deep/90"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}