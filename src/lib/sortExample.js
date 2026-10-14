/**
 * Tap-to-sort: learn "what happened / what it might mean / what is still unknown"
 * by sorting the step's own worked example, then doing it with your own words.
 *
 * The example sentences are not written here. They are read out of the step's
 * `show` text, from any bullet that starts with a bold label (for example
 * "- **Report:** ..."), so the curriculum stays the single source of the wording.
 * Nothing in this exercise is scored or ranked.
 */

export const SORT_BUCKETS = [
  { id: "happened", label: "What happened" },
  { id: "means", label: "What it might mean" },
  { id: "unknown", label: "Still unknown" },
];

/** How the example's own labels group into the three buckets. Unlisted labels are left out. */
const BUCKET_FOR_LABEL = [
  [/^(report|observation|observed|conditions?|cost|barrier|what happened|what held attention)/i, "happened"],
  [/^(interpretation|possible interpretation|what it might mean)/i, "means"],
  [/^(unknown|what remains unknown|still unknown)/i, "unknown"],
];

const QUOTES = /^[\s\u201c\u201d"']+|[\s\u201c\u201d"']+$/g;

/** Pulls the labelled statements out of a step's example text. */
export function parseSortCards(show) {
  const cards = [];
  String(show || "")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^\s*[-*]\s+\*\*(.+?)\*\*\s*(.+?)\s*$/);
      if (!match) return;
      const label = match[1].replace(/:\s*$/, "").trim();
      const text = match[2].replace(/^:\s*/, "").replace(QUOTES, "").trim();
      const found = BUCKET_FOR_LABEL.find(([pattern]) => pattern.test(label));
      if (!found || !text) return;
      cards.push({ id: `card-${cards.length}`, label, text, bucket: found[1] });
    });
  return cards;
}

/** A fixed, mixed-up order, so the example's own order does not give the answer away. */
export function mixCards(cards) {
  return [...cards.filter((_, index) => index % 2 === 1), ...cards.filter((_, index) => index % 2 === 0)];
}

export const SORT_KEY = "sortedOwn";
export const EMPTY_SORT = { happened: "", means: "", unknown: "" };

export function composeSort(entry) {
  const lines = [];
  if ((entry.happened || "").trim()) lines.push(`What happened: ${entry.happened.trim()}`);
  if ((entry.means || "").trim()) lines.push(`What it might mean: ${entry.means.trim()}`);
  if ((entry.unknown || "").trim()) lines.push(`Still unknown: ${entry.unknown.trim()}`);
  return lines.join("\n");
}
