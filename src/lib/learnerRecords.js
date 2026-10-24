import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { answerKey } from "./workbook";
import { readStore, writeStore } from "./store";
import { progressStorageKey } from "./progressScope";

/**
 * The carry-forward chain. Each record builds on the one before it:
 * question → evidence note → branch → named try → try review →
 * Financial Reality Note → success-now note → Current Direction Record →
 * Tribe Continuity Card.
 *
 * Records are saved to the learner's account (the LearnerRecord entity), and only
 * that account can read, change or delete them through the app.
 *
 * `module` is where a record first opens. A record whose module is not live yet
 * shows as "opens with Module X" and cannot be filled. `revisit` is a later module
 * that deepens it. Records with a source in Modules 1–5 open early as a first
 * draft rather than waiting for Modules 6–10.
 * `liveOnly` records are made in a live session, not in the app.
 *
 * `sources` are step answers that can pre-fill a first draft. Each one names a step
 * and either a fixed answer slot ("plan", "checkin") or a pattern matched against
 * that step's prompts, so a reordered prompt list does not point at the wrong box.
 * The first source holding a line wins. A draft is only saved when the learner
 * presses Save.
 */
export const RECORD_TYPES = [
  {
    type: "question",
    title: "Question",
    module: 2,
    prompt: "What are you trying to learn right now?",
    sources: [
      { code: "M2-L1", match: /^(\*\*)?Question:/ },
      { code: "M1-L1", match: /What caught your attention/ },
    ],
  },
  {
    type: "evidence_note",
    title: "Evidence note",
    module: 4,
    prompt: "What did you actually see or check? What does it support, complicate, or leave unknown?",
    sources: [
      { code: "M5-L3", match: /one piece of evidence you gathered/i },
      // Module 4 is interactive (Oct 24, 2026): the revised statement stays in slot 4.
      { code: "M4-L3", slot: 4 },
      { code: "M4-L1", match: /What more accurate statement fits/ },
      { code: "M2-L3", match: /what evidence supports or complicates/i },
    ],
  },
  {
    type: "branch",
    title: "Branch",
    module: 6,
    prompt: "Which branch are you exploring: a pathway, a problem or opportunity, or continued exploration?",
    sources: [],
  },
  {
    type: "named_try",
    title: "Named try",
    module: 2,
    revisit: 7,
    prompt: "Name the one manageable try: what you will create, practise or move forward.",
    sources: [
      { code: "M2-L1", slot: "plan" },
      { code: "M2-L1", match: /^(\*\*)?Smallest real action:/ },
      { code: "M3-L2", match: /What single part of the setup would you change/ },
    ],
  },
  {
    type: "try_review",
    title: "Try review",
    module: 2,
    revisit: 7,
    prompt: "What happened, what did it cost, and what did it teach?",
    sources: [
      { code: "M2-L2", slot: "checkin" },
      { code: "M2-L3", match: /^what changed from (expectation|what you expected)/i },
      { code: "M3-L3", match: /What changed, and what else was different/ },
    ],
  },
  {
    type: "financial_reality_note",
    title: "Financial Reality Note",
    module: 8,
    prompt: "What does this direction cost in money, time and labour, and what constraints are real?",
    sources: [],
  },
  {
    type: "success_now_note",
    title: "Success-now note",
    module: 9,
    prompt: "What would count as success for you right now, at the capacity you actually have?",
    sources: [],
  },
  {
    type: "current_direction_record",
    title: "Current Direction Record",
    module: 5,
    revisit: 9,
    prompt: "Your current direction, and when you will look at it again. It can change.",
    sources: [
      { code: "M5-L3", decision: true },
      { code: "M2-L3", decision: true },
    ],
  },
  {
    type: "tribe_continuity_card",
    title: "Tribe Continuity Card",
    module: 10,
    liveOnly: true,
    prompt: "If you want to stay connected: how, with whom, and how often. Leaving is a full ending too.",
    sources: [],
  },
];

export function recordDef(type) {
  return RECORD_TYPES.find((item) => item.type === type) || null;
}

/** The record just before this one in the chain, if any. */
export function previousType(type) {
  const index = RECORD_TYPES.findIndex((item) => item.type === type);
  return index > 0 ? RECORD_TYPES[index - 1].type : null;
}

function promptsOf(lesson) {
  return [...((lesson && lesson.try_prompts) || []), ...((lesson && lesson.reflect_prompts) || [])];
}

/** The first step answer that can seed this record, with where it came from. */
export function draftFromSteps(def, answers, lessonsByCode, decisions = {}) {
  for (const source of def.sources || []) {
    let key = "";
    if (source.decision) {
      const picked = String((decisions || {})[source.code] || "").trim();
      if (!picked) continue;
      const lesson = lessonsByCode[source.code];
      return {
        body: `Next Decision: ${picked}`,
        code: source.code,
        stepTitle: (lesson && lesson.title) || source.code,
      };
    }
    if (source.slot) {
      key = answerKey(source.code, source.slot);
    } else if (source.match) {
      const index = promptsOf(lessonsByCode[source.code]).findIndex((prompt) => source.match.test(String(prompt)));
      if (index < 0) continue;
      key = answerKey(source.code, index);
    }
    const value = String((answers || {})[key] || "").trim();
    if (value) {
      const lesson = lessonsByCode[source.code];
      return { body: value, code: source.code, stepTitle: (lesson && lesson.title) || source.code };
    }
  }
  return null;
}

/* ---------- account storage ---------- */

const entity = () => base44.entities.LearnerRecord;

export async function listMyRecords() {
  return entity().list("-updated_date", 50);
}

export async function saveRecord({ id, type, body, prefilledFrom }) {
  const def = recordDef(type);
  const data = {
    record_type: type,
    body,
    prefilled_from: prefilledFrom || "",
    description: def ? def.title : type,
  };
  if (id) return entity().update(id, data);
  return entity().create(data);
}

export async function deleteRecord(id) {
  return entity().delete(id);
}

/** Loads the signed-in learner's records, keyed by type (newest wins if there are two). */
export function useLearnerRecords() {
  const [byType, setByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const rows = await listMyRecords();
      const map = {};
      (rows || []).forEach((row) => {
        if (!map[row.record_type]) map[row.record_type] = row;
      });
      setByType(map);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { byType, loading, error, refresh, setByType };
}

/* ---------- "don't pre-fill this again" (this device) ---------- */

/**
 * After a learner deletes a record, the step answer it came from is still on this
 * device. Without this, the same draft would reappear and the delete would look
 * like it did nothing. Kept on the device, per account.
 */
const SKIP_KEY = "recordPrefillSkipped";

export function readSkipped() {
  return readStore(progressStorageKey(SKIP_KEY), {});
}

export function setSkipped(type, skipped) {
  const key = progressStorageKey(SKIP_KEY);
  const current = readStore(key, {});
  const next = { ...current };
  if (skipped) next[type] = true;
  else delete next[type];
  writeStore(key, next);
}
