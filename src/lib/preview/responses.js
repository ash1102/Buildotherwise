import { base44 } from "@/api/base44Client";

/**
 * Preview work is saved only when the person chooses to save it, and only to
 * their own account. Skipping writes nothing at all: no record is the same as
 * "no response". Nothing is ever labelled a decision, and nothing carries
 * forward unless the person sets that themselves.
 */
export async function listMyResponses() {
  return base44.entities.PreviewResponse.list("-created_date", 400);
}

export async function listResponsesForStep(stepCode) {
  return base44.entities.PreviewResponse.filter({ step_code: stepCode }, "-created_date", 200);
}

export function parseValues(record) {
  try {
    return JSON.parse((record && record.response_data) || "{}") || {};
  } catch (error) {
    return {};
  }
}

export async function saveResponse({ section, moduleLabel, step, block, promptLabel, text, values }) {
  const existing = await base44.entities.PreviewResponse.filter(
    { step_code: step.code, block_id: block.id },
    "-created_date",
    1
  );
  const payload = {
    section_key: section.key,
    module_label: moduleLabel || "",
    step_code: step.code,
    step_title: step.title,
    block_id: block.id,
    block_version: block.version,
    block_type: block.type,
    prompt_label: promptLabel || block.title || "",
    response_text: text || "",
    response_data: JSON.stringify(values || {}),
    carry_forward: existing[0] ? Boolean(existing[0].carry_forward) : false,
  };
  if (existing[0]) return base44.entities.PreviewResponse.update(existing[0].id, payload);
  return base44.entities.PreviewResponse.create(payload);
}

export async function setCarryForward(record, next) {
  return base44.entities.PreviewResponse.update(record.id, { carry_forward: Boolean(next) });
}

export async function removeResponse(id) {
  return base44.entities.PreviewResponse.delete(id);
}

/** A short, readable line for the notes view and for the JSON take-away. */
export function joinSummary(pairs) {
  return pairs
    .filter((pair) => String(pair.value || "").trim())
    .map((pair) => `${pair.label}: ${pair.value}`)
    .join("\n");
}

/** The take-away file. Plain data, owned by the person who saved it. */
export function buildTakeaway(rows, sectionsById) {
  return {
    title: "Entrepalooza preview take-away",
    exported: new Date().toISOString(),
    note: "Notes you saved in the preview. Only the notes you chose to carry forward are marked.",
    notes: rows.map((row) => ({
      section: (sectionsById[row.section_key] || {}).title || row.section_key,
      step: row.step_title,
      step_code: row.step_code,
      block_id: row.block_id,
      prompt: row.prompt_label,
      response: row.response_text,
      carry_forward: Boolean(row.carry_forward),
      saved: row.created_date,
    })),
  };
}