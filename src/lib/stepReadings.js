/**
 * Which library readings belong on a participant step.
 *
 * The Program Library already stores the reading in the owner's words, with
 * lesson_code pointing at the step. The preview course map is a separate
 * admin review copy: it adds status tags, draft slots, and a few text
 * corrections. Participants never read from that map.
 */

/** A reading longer than this opens collapsed, still in the original words. */
export const READING_PREVIEW_CHARS = 480;

const PLACEHOLDER_BODIES = [
  "this reading is not written yet. it will be drawn from this module's own lesson text and needs your approval. nothing has been invented to fill the space.",
  "the full text is not in this preview yet. this reading is listed so you can paste it in.",
];

function plain(value) {
  return String(value || "")
    .replace(/\u2019/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isPlaceholder(item) {
  const title = plain(item.title);
  if (title.startsWith("draft reading") || title.startsWith("draft:")) return true;
  if (title.includes("to be written") || title.includes("not written yet") || title.includes("placeholder")) return true;
  const body = plain(item.body);
  return PLACEHOLDER_BODIES.includes(body);
}

/**
 * Published participant readings for one step. Drafts, staff notes, outside
 * sources, empty bodies, and placeholder slots are left out. The body is
 * returned unchanged.
 */
export function visibleStepReadings(resources, lessonCode) {
  const code = String(lessonCode || "").trim();
  if (!code) return [];

  return (resources || [])
    .filter((item) => {
      if (!item) return false;
      if (String(item.lesson_code || "").trim() !== code) return false;
      if (item.status && item.status !== "published") return false;
      if (item.audience === "program_team") return false;
      if (item.kind && item.kind !== "reading") return false;
      if (!String(item.body || "").trim()) return false;
      if (isPlaceholder(item)) return false;
      return true;
    })
    .map((item) => ({
      id: item.id || `${code}:${item.order ?? ""}:${item.title || ""}`,
      title: item.title || "",
      body: item.body,
      order: typeof item.order === "number" ? item.order : 0,
    }))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(({ id, title, body }) => ({ id, title, body }));
}

/** A prefix of the stored reading, cut on a paragraph or sentence when it is long. */
export function readingPreview(body) {
  const text = String(body ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (text.length <= READING_PREVIEW_CHARS) return { preview: text, long: false };

  const window = text.slice(0, READING_PREVIEW_CHARS);
  const paragraph = window.lastIndexOf("\n\n");
  let cut = -1;
  if (paragraph >= 80) cut = paragraph;
  else {
    const sentence = window.lastIndexOf(". ");
    if (sentence >= 80) cut = sentence + 1;
    else {
      const space = window.lastIndexOf(" ");
      if (space >= 80) cut = space;
    }
  }
  if (cut < 0) cut = READING_PREVIEW_CHARS;
  const preview = text.slice(0, cut).trim();
  if (!preview || preview === text) return { preview: text, long: false };
  return { preview, long: true };
}
