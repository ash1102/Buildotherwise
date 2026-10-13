/**
 * Spoken words are added to what is already written. Dictation swaps out only the
 * words it added itself, and only when they are still at the end of the text, so
 * anything typed by hand keeps its exact place. Text in, text out: nothing here
 * reads or writes storage, and nothing is decided about what was said.
 */

/** One space between two pieces of text, so spoken words never run together. */
export function joinWords(head, tail) {
  const before = String(head || "");
  const after = String(tail || "");
  if (!before) return after;
  if (!after) return before;
  return /[\s\n]$/.test(before) ? `${before}${after}` : `${before} ${after}`;
}

/**
 * The written text with the words just heard placed at the end.
 * `previousTail` is the wording dictation put there last time. It is replaced by
 * the new words, and only while the text still ends with it — so once someone
 * types underneath, the words just heard are added instead of overwriting.
 */
export function addSpokenWords(current, nextTail, previousTail) {
  const text = String(current || "");
  const previous = String(previousTail || "");
  const next = String(nextTail || "");
  const head = previous && text.endsWith(previous) ? text.slice(0, text.length - previous.length) : text;
  if (!next) return head;
  return joinWords(head, next);
}