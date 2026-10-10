import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { entrySummary } from "@/lib/reflection";

export default function EntryPicker({ entries, selectedIds, onToggle, onBring, busy }) {
  const count = selectedIds.length;

  return (
    <section className="workbook-card p-5">
      <p className="workbook-label">Your entries in this browser</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Choose what you want reflected on. Nothing leaves this browser until you bring it in, and what you bring in becomes
        part of this conversation.
      </p>

      {entries.length === 0 ? (
        <p className="mt-4 text-[13.5px] leading-relaxed text-ink-faint">
          You have no saved entries in this browser yet. Write one in the Journal, then come back and choose it here.
        </p>
      ) : (
        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => {
            const summary = entrySummary(entry);
            return (
              <li key={entry.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-natural/70 bg-ivory/60 px-3 py-2.5">
                  <Checkbox
                    checked={selectedIds.includes(entry.id)}
                    onCheckedChange={() => onToggle(entry.id)}
                    className="mt-0.5"
                    aria-label={`Choose the entry from ${summary.when}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-ink-faint">{summary.when}</span>
                    <span className="mt-0.5 block text-[13.5px] text-ink">{summary.where}</span>
                    <span className="mt-1 block break-words text-[13px] leading-relaxed text-ink-soft">{summary.excerpt}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={onBring}
          disabled={!count || busy}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {count ? `Bring ${count} ${count === 1 ? "entry" : "entries"} in` : "Bring entries in"}
        </Button>
        <span className="text-[12.5px] text-ink-faint">The agent can only see what you bring in.</span>
      </div>
    </section>
  );
}