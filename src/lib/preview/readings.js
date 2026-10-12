import { base44 } from "@/api/base44Client";
import { correctModule4Text } from "./steps/module4";

/**
 * Readings already live in the library, so the preview reads them from there
 * instead of holding a second copy. A reading that has no body yet stays a
 * labelled empty slot: nothing is invented to fill it.
 */
function normalise(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export async function loadReadingBodies(readings) {
  if (!readings.length) return {};
  const rows = await base44.entities.LibraryResource.filter({ kind: "reading" }, "order", 300);
  const byTitle = {};
  rows.forEach((row) => {
    const key = normalise(row.title);
    if (key && !byTitle[key]) byTitle[key] = row;
  });

  const found = {};
  readings.forEach((reading) => {
    if (reading.draft) return;
    const row = byTitle[normalise(reading.title)];
    if (!row || !row.body) return;
    found[reading.id] = reading.correct ? correctModule4Text(row.body) : row.body;
  });
  return found;
}