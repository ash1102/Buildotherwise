/**
 * "Come back after your try."
 *
 * The steps below plan a real-world try, and the step after each one asks what
 * happened. Self-paced, it is easy to click straight from the plan into the
 * reflection before the try has had any time to happen. So on these steps, Next is
 * replaced by a short pause screen with an optional calendar reminder.
 *
 * This is a nudge, not a lock: the next step can always be opened, and "I didn't
 * get to it" is a result the next step accepts.
 */
// Oct 24, 2026 (module-2-interactive): M2-L1 removed. The pause and reminder now live
// inside M2-L2 ("Try it in the real world"), so the plan step ends normally.
export const AFTER_TRY_STEPS = ["M3-L2"];

export function isAfterTryStep(code) {
  return AFTER_TRY_STEPS.includes(code);
}

/** When the reminder fires. Local time. */
export const REMINDER_OPTIONS = [
  { id: "tonight", label: "This evening" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "2days", label: "In 2 days" },
  { id: "3days", label: "In 3 days" },
];

export function reminderDate(id, from = new Date()) {
  const date = new Date(from);
  date.setSeconds(0, 0);
  if (id === "tonight") {
    date.setHours(18, 0);
    // Already past 6 pm: an hour from now instead.
    if (date.getTime() <= from.getTime()) return new Date(from.getTime() + 60 * 60 * 1000);
    return date;
  }
  const days = id === "tomorrow" ? 1 : id === "2days" ? 2 : 3;
  date.setDate(date.getDate() + days);
  date.setHours(18, 0);
  return date;
}

const pad = (value) => String(value).padStart(2, "0");

function icsStamp(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function icsEscape(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** A one-event calendar file. Nothing is sent anywhere; the participant's own calendar holds it. */
export function buildReminderIcs({ when, stepTitle, url }) {
  const end = new Date(when.getTime() + 15 * 60 * 1000);
  const summary = "Entrepalooza: come back after your try";
  const description = [
    `When you're ready, open the next step${stepTitle ? ` (${stepTitle})` : ""} and say what happened.`,
    "Didn't get to it? That counts too. You can say so.",
    url || "",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Entrepalooza//Workbook//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}@entrepalooza`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(when)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    url ? `URL:${url}` : "",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:PT0M",
    `DESCRIPTION:${icsEscape(summary)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(filename, text) {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
