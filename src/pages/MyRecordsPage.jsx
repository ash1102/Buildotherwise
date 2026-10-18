import React, { useMemo, useState } from "react";
import useCurriculum from "@/hooks/useCurriculum";
import { useDecisions, useWorkbook } from "@/lib/workbook";
import {
  RECORD_TYPES,
  deleteRecord,
  draftFromSteps,
  previousType,
  readSkipped,
  recordDef,
  saveRecord,
  setSkipped,
  useLearnerRecords,
} from "@/lib/learnerRecords";
import RecordCard from "@/components/records/RecordCard";
import RecordsPrivacyNotice from "@/components/records/RecordsPrivacyNotice";

/**
 * My Records: the carry-forward chain from question to Tribe Continuity Card.
 * Each record can be seen, edited and deleted here, and shows the record before it.
 */
export default function MyRecordsPage() {
  const { modules, lessonsByCode, loading: curriculumLoading } = useCurriculum();
  const { answers } = useWorkbook();
  const decisions = useDecisions();
  const { byType, loading, error, setByType } = useLearnerRecords();
  const [skipped, setSkippedState] = useState(() => readSkipped());

  const liveOrders = useMemo(
    () => new Set(modules.filter((module) => module.status === "live").map((module) => module.order)),
    [modules]
  );

  const skip = (type, value) => {
    setSkipped(type, value);
    setSkippedState(readSkipped());
  };

  if (curriculumLoading || loading) {
    return <p className="py-10 text-[16px] text-muted-faint">Opening your records…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Carried forward</p>
        <h1 className="mt-2">My Records</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          Nine short records, each building on the one before: your question, what the evidence showed, the branch you
          explore, the try you name and review, what it costs, what success means now, your current direction, and how
          you want to stay connected. Every one is yours to edit or delete. Every one can stay blank.
        </p>
      </header>

      <RecordsPrivacyNotice />

      {error ? (
        <p className="text-[16px] text-muted-foreground">
          Your saved records didn’t load. Refresh the page. Nothing has been deleted.
        </p>
      ) : null}

      <ol className="space-y-4">
        {RECORD_TYPES.map((def, index) => {
          const saved = byType[def.type] || null;
          const available = !def.liveOnly && liveOrders.has(def.module);
          const stepDraft = draftFromSteps(def, answers, lessonsByCode, decisions);
          const draft = !saved && !skipped[def.type] ? stepDraft : null;
          const prevType = previousType(def.type);
          const prevSaved = prevType ? byType[prevType] : null;
          const previous =
            prevSaved && String(prevSaved.body || "").trim()
              ? { title: recordDef(prevType).title, body: prevSaved.body }
              : null;

          return (
            <RecordCard
              key={def.type}
              def={def}
              number={index + 1}
              saved={saved}
              draft={draft}
              previous={previous}
              available={available}
              moduleLabel={`Module ${def.module}`}
              revisitLabel={def.revisit ? `Module ${def.revisit}` : ""}
              liveOnly={Boolean(def.liveOnly)}
              canRefill={Boolean(stepDraft) && Boolean(skipped[def.type])}
              onRefill={() => skip(def.type, false)}
              onDiscardDraft={() => skip(def.type, true)}
              onSave={async (body, prefilledFrom) => {
                const row = await saveRecord({ id: saved && saved.id, type: def.type, body, prefilledFrom });
                setByType((current) => ({ ...current, [def.type]: row }));
              }}
              onDelete={async () => {
                if (!saved) return;
                await deleteRecord(saved.id);
                // The step answer is still on this device; don't put it straight back as a draft.
                skip(def.type, true);
                setByType((current) => {
                  const next = { ...current };
                  delete next[def.type];
                  return next;
                });
              }}
            />
          );
        })}
      </ol>
    </div>
  );
}
