import { QUESTIONS, framingFor, startingPoint } from "./dashboardDiscovery.js";

/**
 * The plain, no-network half of My Discoveries: what gets saved from Discovery, titles, and the download text.
 * Kept free of the account client so it can be tested on its own.
 */

export const OWN_QUESTION_LABEL = "Your own question or observation";
export const TITLE_MAX = 120;
export const TEXT_MAX = 600;

/** The fallback title when a participant leaves the title blank. Built from their own words or the question. */
export function fallbackTitle({ response, question_text }) {
  const base = String(response || "").trim() || String(question_text || "").trim() || "A discovery";
  return base.length > 60 ? `${base.slice(0, 57).trimEnd()}…` : base;
}

/**
 * Turns what's on screen in Discovery into the row that gets saved.
 * Wording is stored as it was shown, so the discovery reads the same later even if the questions change.
 */
export function threadFromDiscovery({ title, state }) {
  const question = state.questionId && !state.own ? QUESTIONS[state.questionId] : null;
  const framing = question ? framingFor(state.pointId, question.id) : null;
  const option = question && state.optionId ? question.options.find((o) => o.id === state.optionId) : null;
  const response = String(state.text || "").trim();
  const row = {
    source: question ? "question" : "own",
    question_id: question ? question.id : "",
    question_text: question ? question.text : OWN_QUESTION_LABEL,
    path_id: question && state.pointId ? state.pointId : "",
    response,
    follow_up_text: framing ? framing.followUp : "",
    option_id: option ? option.id : "",
    option_label: option ? option.label : "",
    notes: String(state.notes || "").trim(),
  };
  row.title = String(title || "").trim() || fallbackTitle(row);
  row.description = "Saved discovery";
  return row;
}

export function pathLabel(pathId) {
  const point = pathId ? startingPoint(pathId) : null;
  return point ? point.label : "";
}

/** Lines for the account download. Each field is the participant's own words or the wording they saw. */
export function discoveryExportLines(threads) {
  const lines = [`## My Discoveries (${threads.length} ${threads.length === 1 ? "discovery" : "discoveries"})`, ""];
  [...threads]
    .sort((a, b) => ((a.created_date || "") > (b.created_date || "") ? 1 : -1))
    .forEach((t) => {
      const when = t.created_date ? new Date(t.created_date).toLocaleString() : "";
      lines.push(`### ${t.title || "A discovery"}${when ? ` · ${when}` : ""}`);
      lines.push(`Question: ${t.question_text || OWN_QUESTION_LABEL}`);
      if (t.response) lines.push(`${t.source === "own" ? "Your question or observation" : "Your response"}: ${t.response}`);
      if (t.follow_up_text) lines.push(`Follow-up: ${t.follow_up_text}`);
      if (t.option_label) lines.push(`You chose: ${t.option_label}`);
      if (t.notes) lines.push(`Your notes: ${t.notes}`);
      lines.push("");
    });
  return lines;
}
