/** The journal-reflection agent. It has no journal access: it only sees what is brought into the conversation. */
export const REFLECTION_AGENT = "conversation_journal_reflection";

export const STARTER_PROMPTS = [
  "Help me reflect on this entry without suggesting actions yet.",
  "Separate what happened from what I think it means.",
  "Compare these three entries. Show possible patterns and exceptions.",
  "Help me distinguish curiosity, familiarity, outside pressure, and practical constraints.",
  "Draft one carry-forward note from what I choose to keep.",
];

/** The exact text of the entries the owner picked. Nothing else ever leaves the browser. */
export function entryBlock(entries) {
  return entries
    .map((entry) => {
      const when = (entry.created_date || "").slice(0, 10) || "undated";
      const where = [entry.lesson_title || entry.lesson_code, entry.prompt_label].filter(Boolean).join(" · ");
      return [
        `Entry ${entry.id} · ${when}${where ? ` · ${where}` : ""}`,
        (entry.body || "").trim() || "(no text saved)",
        "",
      ].join("\n");
    })
    .join("\n");
}

export function entrySummary(entry) {
  const when = entry.created_date
    ? new Date(entry.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Undated";
  const where = [entry.lesson_title || entry.lesson_code, entry.prompt_label].filter(Boolean).join(" · ") || "Free writing";
  const body = (entry.body || "").replace(/\s+/g, " ").trim();
  return { when, where, excerpt: body.length > 130 ? `${body.slice(0, 130)}…` : body || "No text saved yet." };
}

export function conversationLabel(conversation) {
  if (conversation.metadata?.name) return conversation.metadata.name;
  const when = conversation.created_date ? new Date(conversation.created_date) : new Date();
  return `Reflection · ${when.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

export function newConversationName() {
  return `Reflection · ${new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}