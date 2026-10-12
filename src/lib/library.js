import { base44 } from "@/api/base44Client";

export const KIND_LABELS = {
  reading: "Reading",
  research_brief: "Research brief",
  note: "Supplemental note",
  article: "Article",
  study: "Study",
  talk: "Talk",
};

/** Outside sources link out and sit on their own shelf, never mixed into the curriculum readings. */
export const OUTSIDE_KINDS = ["article", "study", "talk"];

export async function loadOutsideResources() {
  const page = await base44.entities.LibraryResource.filter(
    { status: "published", audience: { $ne: "program_team" }, kind: { $in: OUTSIDE_KINDS } },
    { sort: "order", limit: 200 }
  );
  return page.items;
}

/** Getting Started is not Module 0, so its label never reads as a number. */
export function moduleTitle(modules, order) {
  const module = modules.find((item) => item.order === order);
  if (module) return module.kind === "orientation" ? "Getting Started" : `Module ${module.order} — ${module.title}`;
  return order === 0 ? "Getting Started" : `Module ${order}`;
}

/**
 * Search, module and step are all resolved by the server, so the page never
 * narrows a list it has already loaded.
 */
export async function loadLibraryResources({ search = "", moduleOrder = null, lessonCode = null } = {}) {
  const query = { status: "published", audience: { $ne: "program_team" }, kind: { $nin: OUTSIDE_KINDS } };
  if (moduleOrder !== null && moduleOrder !== undefined) query.module_order = moduleOrder;
  if (lessonCode) query.lesson_code = lessonCode;
  const term = search.trim();
  if (term) {
    query.$or = [
      { title: { $regex: term, $options: "i" } },
      { summary: { $regex: term, $options: "i" } },
      { body: { $regex: term, $options: "i" } },
    ];
  }
  const page = await base44.entities.LibraryResource.filter(query, { sort: "order", limit: 200 });
  return page.items;
}

/** Only the steps a module actually holds a reading for, so the step filter is never empty. */
export async function loadReadingSteps(moduleOrder) {
  const page = await base44.entities.LibraryResource.filter(
    {
      status: "published",
      audience: { $ne: "program_team" },
      kind: { $nin: OUTSIDE_KINDS },
      module_order: moduleOrder,
      lesson_code: { $exists: true },
    },
    { distinct: "lesson_code" }
  );
  return page.items
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

/** The research shelf loads summaries only; a brief's full text is read when it is opened. */
export async function loadResearchBriefs() {
  const page = await base44.entities.LibraryResource.filter(
    { status: "published", audience: "program_team" },
    { sort: "order", limit: 20, fields: ["title", "summary", "source_label", "review_status", "full_text_uri", "order"] }
  );
  return page.items;
}

/** A full brief lives in private storage and is opened through a short-lived signed link. */
export async function loadBriefText(fileUri) {
  const { signed_url: signedUrl } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
  const response = await fetch(signedUrl);
  return response.text();
}

/** Source documents carry Notion's own markup. That is formatting, not content. */
export function cleanSourceText(text) {
  return (text || "")
    .replace(/<\/?(?:mention-page|mention-user|callout|table_of_contents|synced_block|column_list|column|divider|page)\b[^>]*\/?>/gi, "")
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/(^|\s)\*(?!\s)([^*\n]+?)\*(?=\s|$)/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function loadTribeThreads() {
  const page = await base44.entities.TribeThread.filter({}, { sort: "order", limit: 60 });
  return page.items;
}

export async function loadTribeReplies() {
  const page = await base44.entities.TribeReply.filter({}, { sort: "created_date", limit: 200 });
  return page.items;
}

export function subscribeTribeReplies(handler) {
  return base44.entities.TribeReply.subscribe(() => handler());
}

export function groupBy(list, key) {
  const groups = new Map();
  list.forEach((item) => {
    const value = item[key];
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(item);
  });
  return groups;
}