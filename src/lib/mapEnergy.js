export const ENERGY_CHOICES = [
  { id: "gives", label: "Gives me energy" },
  { id: "drains", label: "Drains me" },
  { id: "both", label: "Both" },
  { id: "unsure", label: "Not sure yet" }
];

/** Existing activities and places are selected explicitly; no match is inferred from wording. */
export function energyTargets(graph) {
  return (graph.nodes || []).filter((node) =>
    ["places", "placeless"].includes(node.section) && node.question_id !== "p1-how" && String(node.text || node.label || "").trim()
  );
}

export function energyLine(source, choice, note = "") {
  const selected = ENERGY_CHOICES.find((item) => item.id === choice);
  if (!source?.id || !selected) return null;
  const name = source.label || source.text;
  const explanation = String(note || "").trim();
  return {
    question_id: "p3-energy",
    source_label: "How does this entry affect your energy?",
    label: name + " — " + selected.label,
    text: name + " — " + selected.label + (explanation ? "\n" + explanation : ""),
    links: [source.id],
    energy_choice: choice,
    energy_note: explanation
  };
}
