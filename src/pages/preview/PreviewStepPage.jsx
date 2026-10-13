import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BlockRenderer from "@/components/preview/BlockRenderer";
import { PreviewBanner, PreviewDisclaimer } from "@/components/preview/PreviewNotice";
import { getStep, pilotLabel, readingsForStep, stepNeighbours } from "@/lib/preview/course";
import { loadReadingBodies } from "@/lib/preview/readings";
import { listResponsesForStep, removeResponse, saveResponse } from "@/lib/preview/responses";
import { useAuth } from "@/lib/AuthContext";

const EMPTY_READING = {
  draft:
    "This reading is not written yet. It will be drawn from this module’s own lesson text and needs your approval. Nothing has been invented to fill the space.",
  short: "The full text is not in this preview yet. This reading is listed so you can paste it in.",
};

/** One step of the review copy, as a sequence of reading, lesson and activity parts. */
export default function PreviewStepPage() {
  const { code } = useParams();
  const { isAuthenticated } = useAuth();
  const found = getStep(code);

  const [records, setRecords] = useState({});
  const [lesson, setLesson] = useState(null);
  const [bodies, setBodies] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    let active = true;
    /* Nothing from the step before lingers while this one loads, so two lessons are never on screen at once. */
    setLesson(null);
    setBodies({});
    setRecords({});
    setLoading(true);
    (async () => {
      if (!found) {
        setLoading(false);
        return;
      }
      const readings = readingsForStep(found.section, found.step);
      const [readingBodies, liveLesson, rows] = await Promise.all([
        loadReadingBodies(readings),
        found.step.sourceLesson
          ? base44.entities.Lesson.filter({ code: found.step.sourceLesson }, "-created_date", 1)
          : Promise.resolve([]),
        isAuthenticated ? listResponsesForStep(found.step.code) : Promise.resolve([]),
      ]);
      if (!active) return;
      setBodies(readingBodies);
      setLesson(liveLesson[0] || null);
      const map = {};
      rows.forEach((row) => {
        map[row.block_id] = row;
      });
      setRecords(map);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [found, isAuthenticated]);

  const blocks = useMemo(() => {
    if (!found) return [];
    const { section, step } = found;
    // A step that carries its own wording does not also print the reading holding the same words.
    const readings = (step.hideReading ? [] : readingsForStep(section, step)).map((reading) => ({
      id: reading.id,
      version: "library-record",
      type: "reading",
      part: "reading",
      title: reading.title,
      tag: reading.tag,
      body: bodies[reading.id] || (reading.draft ? EMPTY_READING.draft : EMPTY_READING.short),
    }));

    const authored = step.blocks || [];
    const afterReading = authored.filter((block) => block.afterReading);
    const rest = authored.filter((block) => !block.afterReading);

    const liveText = [];
    if (lesson && !step.ownWording) {
      if (lesson.teach) {
        liveText.push({
          id: `${step.code}-teach`,
          version: "lesson-record",
          type: "teaching",
          part: "lesson",
          title: "Teaching",
          tag: "reused",
          body: lesson.teach,
        });
      }
      if (lesson.show && !step.hideLiveExample) {
        liveText.push({
          id: `${step.code}-show`,
          version: "lesson-record",
          type: "example",
          part: "lesson",
          title: "Worked example",
          tag: "reused",
          body: lesson.show,
        });
      }
    }

    /* Its own wording means its own activities too, so the earlier writing prompts are not printed as well. */
    const liveWriting = [];
    if (lesson && !step.ownWording && ((lesson.try_prompts || []).length || (lesson.reflect_prompts || []).length)) {
      const fields = [
        ...(lesson.try_prompts || []).map((prompt, index) => ({ id: `try-${index}`, label: prompt })),
        ...(lesson.reflect_prompts || []).map((prompt, index) => ({ id: `reflect-${index}`, label: prompt })),
      ];
      liveWriting.push({
        id: `${step.code}-writing`,
        version: "lesson-record",
        type: "optional_reflection",
        part: "activity",
        title: "Write, if you want to",
        tag: "reused",
        question: "Every box is optional. One line is enough, and leaving them all empty is a complete answer.",
        fields,
      });
    }

    const closing = [];
    if (lesson && lesson.what_comes_out) {
      closing.push({
        id: `${step.code}-out`,
        version: "lesson-record",
        type: "teaching",
        part: "lesson",
        title: "What this step comes out with",
        tag: "reused",
        body: lesson.what_comes_out,
      });
    }

    const decision = step.decision
      ? [{ id: `${step.code}-decision`, version: "1.0", type: "next_decision", part: "activity", title: "Next Decision" }]
      : [];

    return [...readings, ...afterReading, ...liveText, ...rest, ...liveWriting, ...closing, ...decision];
  }, [found, lesson, bodies]);

  const handleSave = async (block, payload) => {
    setSaving(block.id);
    try {
      const saved = await saveResponse({
        section: found.section,
        moduleLabel: pilotLabel(found.section) || found.section.title,
        step: found.step,
        block,
        promptLabel: payload.promptLabel,
        text: payload.text,
        values: payload.values,
      });
      setRecords((current) => ({ ...current, [block.id]: saved }));
    } finally {
      setSaving("");
    }
  };

  const handleClear = async (block) => {
    const record = records[block.id];
    if (!record) return;
    await removeResponse(record.id);
    setRecords((current) => {
      const next = { ...current };
      delete next[block.id];
      return next;
    });
  };

  if (loading) return <p className="py-10 text-[16px] text-muted-faint">Opening the step…</p>;

  if (!found) {
    return (
      <div className="space-y-4">
        <PreviewBanner />
        <h1>That step is not in this preview.</h1>
        <Link to="/preview" className="text-[16px] font-medium text-accent-ink underline underline-offset-2">
          Back to the review copy
        </Link>
      </div>
    );
  }

  const { section, step } = found;
  const { prev, next, index } = stepNeighbours(section, step.code);
  const pilot = pilotLabel(section);

  return (
    <div className="space-y-6">
      <PreviewBanner />

      <header className="border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="workbook-label">{section.title}</span>
          {pilot ? (
            <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
              {pilot}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3">{step.title}</h1>
        <p className="mt-2 text-[15px] text-muted-faint">
          Step {index + 1} of {section.steps.length}
        </p>

        <div className="no-print mt-4 flex flex-wrap items-center gap-4">
          {next ? (
            <Link to={`/preview/step/${next.code}`} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
              Skip to the next step
            </Link>
          ) : (
            <Link to={`/preview/module/${section.slug}`} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
              Skip to the end of this section
            </Link>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print this step
          </button>
          <span className="text-[14px] text-muted-faint">Nothing is recorded when you skip.</span>
        </div>
      </header>

      <div className="space-y-5">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            record={records[block.id]}
            recordsByBlockId={records}
            onSave={(payload) => handleSave(block, payload)}
            onClear={() => handleClear(block)}
            saving={saving === block.id}
            canSave={isAuthenticated}
          />
        ))}
      </div>

      {step.ownWording ? (
        <p className="rounded-md border border-dashed border-input bg-secondary p-4 text-[16px] leading-relaxed text-muted-foreground">
          The workbook’s earlier wording for this step is not repeated here: this step proposes replacing it. You can
          compare the two in the live workbook.
        </p>
      ) : null}

      {step.closesPilot ? (
        <p className="rounded-md border border-dashed border-input bg-secondary p-4 text-[16px] leading-relaxed text-muted-foreground">
          This is the end of Pilot 1. Modules 6 to 10 are optional and are not assigned to you: nothing carries on by
          itself, and nothing here decides that for you.
        </p>
      ) : null}

      <nav aria-label="Steps" className="no-print flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        {prev ? (
          <Link to={`/preview/step/${prev.code}`} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
            Back to {prev.title}
          </Link>
        ) : (
          <Link to={`/preview/module/${section.slug}`} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
            Back to {section.title}
          </Link>
        )}
        {next ? (
          <Link to={`/preview/step/${next.code}`} className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
            {next.title}
          </Link>
        ) : (
          <Link to="/preview" className="text-[15px] font-medium text-accent-ink underline underline-offset-2">
            Back to the review copy
          </Link>
        )}
      </nav>

      <PreviewDisclaimer />
    </div>
  );
}