/**
 * Answers and step choices that decide Getting Started are stored per account.
 * Logged-out writing keeps the original browser key. A signed-in account does not
 * read that key, so a new participant is not already through O.1–O.5 because
 * someone else finished those steps in this browser.
 */

let progressUserId = null;

function sanitizeUserId(userId) {
  if (!userId) return "";
  return String(userId).replace(/[^A-Za-z0-9_-]/g, "");
}

export function setProgressUserId(userId) {
  progressUserId = sanitizeUserId(userId) || null;
}

export function getProgressUserId() {
  return progressUserId;
}

/** Browser key when logged out. Account key when a user id is set. */
export function progressStorageKey(baseKey, userId) {
  const id = sanitizeUserId(userId === undefined ? progressUserId : userId);
  if (!id) return baseKey;
  return `${baseKey}::user::${id}`;
}
