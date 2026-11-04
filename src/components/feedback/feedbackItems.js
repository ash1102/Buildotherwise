/** Drop blank items so an empty list does not draw a heading or an empty box. */
export function feedbackItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => String(item ?? "").trim()).filter(Boolean);
}
