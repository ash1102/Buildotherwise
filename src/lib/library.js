import { base44 } from "@/api/base44Client";

export const KIND_LABELS = {
  reading: "Reading",
  research_brief: "Research brief",
  note: "Supplemental note",
};

/** Getting Started is not Module 0, so its label never reads as a number. */
export function moduleTitle(modules, order) {
  const module = modules.find((item) => item.order === order);
  if (module) return module.kind === "orientation" ? "Getting Started" : `Module ${module.order} — ${module.title}`;
  return order === 0 ? "Getting Started" : `Module ${order}`;
}

/** Readings and notes stay in the order the curriculum teaches them. */
export async function loadLibraryResources() {
  const page = await base44.entities.LibraryResource.filter(
    { status: "published" },
    { sort: "order", limit: 200 }
  );
  return page.items;
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