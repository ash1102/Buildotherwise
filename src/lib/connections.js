/**
 * Connections: what the journal notices across entries, worked out in this
 * browser from the person's own words. Nothing here is sent anywhere, scored,
 * or treated as a conclusion. Everything is offered as a question.
 */
import { normalizeDecision } from "./workbook";

/** Follow-up questions that change with the decision someone picked. Skipping is always fine. */
export const DECISION_FOLLOW_UPS = {
  Keep: "What made this worth keeping?",
  Change: "What is the one thing you would change?",
  "Test again": "What, if anything, would you do differently on the next try?",
  Pause: "Anything you want to note about the pause, or what would make this worth coming back to? Leaving it blank is fine.",
  Stop: "Is there anything worth keeping from this before you set it down? “Nothing” is a complete answer.",
  "Another direction": "What direction is pulling at you, even roughly?",
  "Keep looking": "What are you still looking for here?",
  "I don't know yet": "What would help you know a little more? “Nothing yet” counts.",
};

/** Decisions that leave a thread open to come back to. */
const OPEN_DECISIONS = new Set(["Test again", "Pause", "Another direction", "Keep looking", "I don't know yet", "Change"]);

export function decisionFollowUp(decision) {
  return DECISION_FOLLOW_UPS[normalizeDecision(decision)] || "";
}

export function decisionFollowUpKey(lessonCode) {
  return `${lessonCode}#decision-followup`;
}

const STOPWORDS = new Set(
  (
    "about above after again against also always among another anything around because been before being below between " +
    "both but cannot could didn does doing done down during each even ever every from further have having here hers " +
    "herself himself into itself just know like made make many maybe more most much must myself never next nothing now " +
    "once only other ought ours ourselves over own really same should since some something still such than that thats " +
    "the their theirs them themselves then there these they thing things think this those though through thus till " +
    "today together too under until upon very want wants was were what whatever when where whether which while who " +
    "whom whose why will with within without would yeah yes yet your yours yourself yourselves going gonna kind sort " +
    "feel felt time times little lot lots well good okay right away back thought dont didnt cant wont isnt im ive " +
    "youre theyre theres wasnt sure step answer question try tried trying note"
  ).split(/\s+/)
);

function words(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word))
    .map((word) => (word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word));
}

function excerptAround(text, word) {
  const body = String(text || "").replace(/\s+/g, " ").trim();
  const at = body.toLowerCase().indexOf(word);
  if (at < 0) return body.length > 120 ? `${body.slice(0, 120)}…` : body;
  const start = Math.max(0, at - 50);
  const end = Math.min(body.length, at + word.length + 60);
  return `${start > 0 ? "…" : ""}${body.slice(start, end)}${end < body.length ? "…" : ""}`;
}

function isWriting(entry) {
  const prompt = String(entry.prompt || "");
  if (prompt.endsWith("#decision")) return false;
  if (prompt.startsWith("connection:")) return false;
  return Boolean(String(entry.body || "").trim());
}

function placeOf(entry) {
  return entry.lesson_code || `free:${entry.id}`;
}

function placeLabel(entry) {
  if (entry.lesson_title) return entry.lesson_title;
  return entry.prompt_label && entry.prompt_label !== "Written freely" ? entry.prompt_label : "A personal entry";
}

/**
 * Words that show up in more than one place. A repeated word is not proof of
 * anything; it is only offered as something worth a look.
 */
export function recurringWords(entries, limit = 6) {
  const latest = latestOnly(entries).filter(isWriting);
  const map = new Map();
  latest.forEach((entry) => {
    const place = placeOf(entry);
    new Set(words(entry.body)).forEach((word) => {
      if (!map.has(word)) map.set(word, new Map());
      const places = map.get(word);
      if (!places.has(place)) places.set(place, entry);
    });
  });
  return [...map.entries()]
    .filter(([, places]) => places.size >= 2)
    .map(([word, places]) => ({
      word,
      places: [...places.values()].map((entry) => ({
        id: entry.id,
        lessonCode: entry.lesson_code || "",
        label: placeLabel(entry),
        excerpt: excerptAround(entry.body, word),
      })),
    }))
    .sort((a, b) => b.places.length - a.places.length || a.word.localeCompare(b.word))
    .slice(0, limit);
}

/** Revisions keep the earlier wording; only the newest wording of each answer is read here. */
function latestOnly(entries) {
  const replaced = new Set(entries.map((entry) => entry.revision_of).filter(Boolean));
  return entries.filter((entry) => !replaced.has(entry.id));
}

/** Steps where the decision leaves something open, newest first, with whether the follow-up was answered. */
export function openThreads(entries) {
  const decisions = new Map();
  entries
    .filter((entry) => String(entry.prompt || "").endsWith("#decision"))
    .forEach((entry) => {
      if (!decisions.has(entry.lesson_code)) decisions.set(entry.lesson_code, entry);
    });
  const answered = new Set(
    entries
      .filter((entry) => String(entry.prompt || "").endsWith("#decision-followup") && String(entry.body || "").trim())
      .map((entry) => entry.lesson_code)
  );
  return [...decisions.values()]
    .map((entry) => ({ ...entry, decision: normalizeDecision(entry.body) }))
    .filter((entry) => OPEN_DECISIONS.has(entry.decision))
    .map((entry) => ({
      lessonCode: entry.lesson_code,
      lessonTitle: entry.lesson_title || entry.lesson_code,
      decision: entry.decision,
      question: decisionFollowUp(entry.decision),
      answered: answered.has(entry.lesson_code),
      date: entry.updated_date || entry.created_date,
    }));
}

/** Questions someone wrote down as questions they are carrying. */
export function carriedQuestions(entries) {
  return latestOnly(entries).filter(
    (entry) => /question/i.test(String(entry.prompt || "")) && entry.kind === "free" && !entry.follow_up_of
  );
}

export function connectionPromptKey(word) {
  return `connection:${word}`;
}

export function connectionAnswered(entries, word) {
  return entries.some((entry) => entry.prompt === connectionPromptKey(word) && String(entry.body || "").trim());
}
