/** Small shared helpers for the /api functions. */

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

export function cleanList(value, maxItems, maxChars = 600) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => clean(item, maxChars)).filter(Boolean).slice(0, maxItems);
}

/** One line, no control characters: for anything placed in an email subject or header-like line. */
export function oneLine(value) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export const HOUR_MS = 60 * 60 * 1000;

/** How many of these records were created within the last hour. */
export function recentCount(records, now = Date.now()) {
  const cutoff = now - HOUR_MS;
  return (records || []).filter((r) => r?.created_date && new Date(r.created_date).getTime() > cutoff).length;
}
