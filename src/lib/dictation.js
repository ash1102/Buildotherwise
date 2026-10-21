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
/** Insert a final phrase at the cursor and use the field's normal save handler. */
export function insertDictatedText(node, words, onChange, afterFrame = (callback) => requestAnimationFrame(callback)) {
  if (!node || node.disabled || node.readOnly || !words) return;
  const current = node.value || "";
  // Use the cursor only when the box is actually focused. Otherwise (for example on a phone,
  // where the box is not focused so the keyboard stays closed) add the words at the end.
  const focused = typeof document !== "undefined" && document.activeElement === node;
  const start = focused ? (node.selectionStart ?? current.length) : current.length;
  const end = focused ? (node.selectionEnd ?? start) : start;
  const before = current.slice(0, start);
  const after = current.slice(end);
  const phrase = (before && !/\s$/.test(before) ? " " : "") + words + (after && !/^\s|^[.,!?;:]/.test(after) ? " " : "");
  const next = before + phrase + after;
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node), "value")?.set;
  if (setter) setter.call(node, next); else node.value = next;
  if (onChange) onChange({ target: node, currentTarget: node, type: "change", preventDefault() {}, stopPropagation() {}, persist() {} });
  else node.dispatchEvent(new Event("input", { bubbles: true }));
  if (!focused) return;
  const cursor = before.length + phrase.length;
  node.setSelectionRange(cursor, cursor);
  afterFrame(() => { if (node.isConnected !== false) node.setSelectionRange(cursor, cursor); });
}
