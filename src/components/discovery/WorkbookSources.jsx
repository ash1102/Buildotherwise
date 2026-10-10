import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useCurriculum from "@/hooks/useCurriculum";
import { GROUP_LABELS, savedLineCount, sourcesFromAnswers, tryLogValues } from "@/lib/discovery";
import { createDiscovery, listDiscoveries } from "@/lib/discoveries";
import {
  setDiscoveryNote,
  useDecisions,
  useDiscoveryNotes,
  useLifeMap,
  useWorkbook,
} from "@/lib/workbook";

/**
 * What the steps already saved, kept whole and folded away until asked for.
 * Every saved answer is readable here, names the step and question it came from,
 * and can be kept in the Discovery Record without retyping a word. Nothing is
 * required, and nothing displays as missing work.
 */
export default function WorkbookSources() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const map = useLifeMap();
  const notes = useDiscoveryNotes();
  const { lessonsByCode } = useCurriculum();

  const fromAnswers = sourcesFromAnswers(answers, lessonsByCode);
  const pick = (section) => fromAnswers.filter((item) => item.section === section);
  const tryLog = tryLogValues(answers).filter((item) => item.value);
  const decided = Object.entries(decisions || {}).filter(([, value]) => value);
  const mapCount = Object.values(map || {}).reduce(
    (count, list) => count + (Array.isArray(list) ? list.length : 0),
    0
  );
  const allLines = savedLineCount(answers);

  const groups = [
    { title: GROUP_LABELS.curiosity, items: pick("curiosity") },
    { title: GROUP_LABELS.try_plan, items: [...pick("try_plan"), ...tryLog] },
    { title: GROUP_LABELS.observed, items: [...pick("observed"), ...pick("unknown")] },
    { title: GROUP_LABELS.conditions, items: [...pick("conditions"), ...pick("cost")] },
    { title: GROUP_LABELS.revised, items: pick("revised") },
    { title: GROUP_LABELS.close, items: pick("close") },
  ].filter((group) => group.items.length);

  const nothingEligible = !groups.length;

  const keep = (item) => {
    const created = createDiscovery({
      title: "",
      body: item.value,
      source: {
        kind: "lesson",
        label: item.label,
        lesson_code: item.lesson_code,
        lesson_title: item.lesson_title,
        date: new Date().toISOString(),
      },
    });
    setStatus(
      listDiscoveries().some((entry) => entry.id === created.id)
        ? "Kept in your Discovery Record. The step answer is untouched."
        : "This browser did not keep that entry, so nothing was added."
    );
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[17px] font-semibold text-foreground">From your workbook steps</span>
          <span className="mt-1 block text-[15px] leading-relaxed text-muted-foreground">
            Saved answers you can read here and keep in your record without typing them again. Opening this changes
            nothing.
          </span>
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-faint transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="mt-5 space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="workbook-label">{group.title}</h4>
              <ul className="mt-2 space-y-3">
                {group.items.map((item) => (
                  <li key={`${item.key}-${item.label}`} className="rounded-lg border border-border bg-background p-3.5">
                    <p className="text-[15px] font-medium text-foreground">{item.question}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-muted-foreground">
                      {item.value}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted-faint">
                      {item.lesson_code ? (
                        <Link
                          to={`/lesson/${item.lesson_code}`}
                          className="font-medium text-accent-ink underline underline-offset-2"
                        >
                          From {item.lesson_code} — {item.lesson_title}
                        </Link>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => keep(item)}
                        className="h-8 rounded-md border-input bg-card text-[14px]"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Keep in my record
                      </Button>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {nothingEligible ? (
            <p className="text-[16px] leading-relaxed text-muted-foreground">
              {allLines
                ? `${allLines} ${allLines === 1 ? "line is" : "lines are"} saved in steps. None of them feeds the Discovery Record yet — the record's own questions sit in Modules 1–5, and your answers appear here as you reach them.`
                : "Nothing saved from the steps yet. This stays available whenever there is something to gather."}{" "}
              <Link to="/" className="font-medium text-accent-ink underline underline-offset-2">
                Open the workbook
              </Link>
            </p>
          ) : null}

          <div>
            <h4 className="workbook-label">Current life context</h4>
            <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
              A few lines about the life this work sits inside. Your Life Map has {mapCount} {mapCount === 1 ? "line" : "lines"} in
              it so far.
            </p>
            <Textarea
              value={notes.context || ""}
              onChange={(event) => setDiscoveryNote("context", event.target.value)}
              rows={3}
              placeholder="A few words are enough."
              className="mt-2 min-h-[5rem] resize-y border-input bg-card text-[16px] leading-relaxed"
            />
          </div>

          {decided.length ? (
            <div>
              <h4 className="workbook-label">Next decisions you have recorded</h4>
              <ul className="mt-2 space-y-2">
                {decided.map(([code, value]) => (
                  <li key={code} className="flex flex-wrap items-baseline gap-2 text-[16px]">
                    <Link to={`/lesson/${code}`} className="font-medium text-accent-ink underline underline-offset-2">
                      {code}
                    </Link>
                    <span className="text-foreground">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p aria-live="polite" className="text-[15px] text-accent-ink">
            {status}
          </p>
        </div>
      ) : null}
    </section>
  );
}