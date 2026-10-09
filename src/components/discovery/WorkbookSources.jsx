import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { GROUP_LABELS, entriesFromAnswers, tryLogValues } from "@/lib/discovery";
import {
  setDiscoveryNote,
  useDecisions,
  useDiscoveryNotes,
  useLifeMap,
  useWorkbook,
} from "@/lib/workbook";

/**
 * What the steps already saved, kept whole and folded away until asked for.
 * Nothing here is required, and nothing displays as missing work.
 */
export default function WorkbookSources() {
  const [open, setOpen] = useState(false);
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const map = useLifeMap();
  const notes = useDiscoveryNotes();

  const fromAnswers = entriesFromAnswers(answers);
  const pick = (section) => fromAnswers.filter((item) => item.section === section);
  const tryLog = tryLogValues(answers).filter((item) => item.value);
  const decided = Object.entries(decisions || {}).filter(([, value]) => value);
  const mapCount = Object.values(map || {}).reduce(
    (count, list) => count + (Array.isArray(list) ? list.length : 0),
    0
  );

  const groups = [
    { title: GROUP_LABELS.curiosity, items: pick("curiosity") },
    { title: GROUP_LABELS.try_plan, items: [...pick("try_plan"), ...tryLog] },
    { title: GROUP_LABELS.observed, items: [...pick("observed"), ...pick("unknown")] },
    { title: GROUP_LABELS.conditions, items: [...pick("conditions"), ...pick("cost")] },
    { title: GROUP_LABELS.revised, items: pick("revised") },
    { title: GROUP_LABELS.close, items: pick("close") },
  ].filter((group) => group.items.length);

  const nothingYet = !groups.length && !decided.length && !(notes.context || "").trim();

  return (
    <section className="rounded-lg border border-dashed border-teal-deep/35 bg-white/60 p-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        <span>
          <span className="block font-heading text-[16px] leading-snug text-ink">From your workbook steps</span>
          <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-faint">
            Answers and decisions you already saved, plus your life context. Opening this changes nothing.
          </span>
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-teal-deep transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="mt-5 space-y-6">
          <div>
            <p className="workbook-label">Current life context</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              A few lines about the life this work sits inside — what already takes your time, what you are protecting, and
              what is in reach right now. Your Life Map has {mapCount} {mapCount === 1 ? "line" : "lines"} in it so far.
            </p>
            <Textarea
              value={notes.context || ""}
              onChange={(event) => setDiscoveryNote("context", event.target.value)}
              rows={3}
              placeholder="What your weeks actually look like right now."
              className="mt-3 min-h-[5rem] resize-y border-natural bg-ivory/60 text-[14px] leading-relaxed"
            />
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <p className="workbook-label">{group.title}</p>
              <dl className="mt-3 space-y-3">
                {group.items.map((item) => (
                  <div key={`${item.key}-${item.label}`}>
                    <dt className="text-[12.5px] text-ink-faint">{item.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-soft">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          {decided.length ? (
            <div>
              <p className="workbook-label text-copper">Next decisions you have recorded</p>
              <ul className="mt-3 space-y-2">
                {decided.map(([code, value]) => (
                  <li key={code} className="flex flex-wrap items-baseline gap-2 text-[14px]">
                    <span className="text-teal-deep">{code}</span>
                    <span className="font-medium text-ink">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {nothingYet ? (
            <p className="text-[13px] leading-relaxed text-ink-faint">
              Nothing saved from the steps yet. This stays available whenever there is something to gather.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}