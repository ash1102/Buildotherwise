/** Asked about one remembered time, not as a lasting property of the activity. */
export const ENERGY_QUESTION =
  "Think of one recent time you did this or were here. How was your energy afterward compared with before?";

/** Choices saved before this wording. Their labels stay so an old mark is not rewritten. */
export const LEGACY_ENERGY_CHOICES = [
  { id: "gives", label: "Gives me energy", legacy: true },
  { id: "drains", label: "Drains me", legacy: true },
  { id: "both", label: "Both", legacy: true },
  { id: "unsure", label: "Not sure yet", legacy: true },
];

export const EPISODE_ENERGY_CHOICES = [
  { id: "more", label: "More energy" },
  { id: "less", label: "Less energy" },
  { id: "same", label: "About the same" },
  { id: "mixed", label: "Mixed or changed over time" },
  { id: "not-sure", label: "Not sure" },
];

export const ENERGY_CHOICES = [...EPISODE_ENERGY_CHOICES, ...LEGACY_ENERGY_CHOICES];

export function energyObservationLabel(choice) {
  const selected = ENERGY_CHOICES.find((item) => item.id === choice);
  if (!selected) return "";
  return selected.legacy ? selected.label : `One recent time: ${selected.label}`;
}

/** Places, activities, and people already on the map. Transport and other observations are not targets. */
export function energyTargets(graph) {
  return (graph.nodes || []).filter((node) => {
    if (!String(node.text || node.label || "").trim()) return false;
    const questionId = String(node.question_id || "");
    if (questionId === "p1-how" || questionId.startsWith("p3-") || questionId.startsWith("p5-")) return false;
    return ["places", "placeless", "groups"].includes(node.section);
  });
}

export function energyLine(source, choice, note = "") {
  const selected = ENERGY_CHOICES.find((item) => item.id === choice);
  if (!source?.id || !selected) return null;
  const name = source.label || source.text;
  const explanation = String(note || "").trim();
  const observation = energyObservationLabel(choice);
  return {
    question_id: "p3-energy",
    source_label: ENERGY_QUESTION,
    label: name + " — " + observation,
    text: name + " — " + observation + (explanation ? "\n" + explanation : ""),
    links: [source.id],
    energy_choice: choice,
    energy_note: explanation,
  };
}
