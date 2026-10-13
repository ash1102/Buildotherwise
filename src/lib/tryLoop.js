/**
 * The try loop: plan one small try, then check in on what happened.
 *
 * Wording below is taken from the Module 2 lessons wherever possible. The example
 * tries come from the "Choose an interest or try something new" step, the "belongs
 * in the record" list from "Reflection, evidence, conditions, and cost", and the
 * situation facts from the first step's boundary. Nothing here is a score, a
 * ranking, or a readiness check, and none of the example tries is promised as
 * available (the exposure menu is a placeholder until cohort, location and
 * partners are confirmed).
 */

/** Where the saved plans and check-ins live, keyed by lesson code. */
export const PLAN_KEY = "plannedTry";
export const CHECKIN_KEY = "tryCheckIns";

/** Example small tries. "own" and "reject" keep the lesson's other two routes open. */
export const TRY_CARDS = [
  { id: "demo", label: "Watch a short beginner demonstration" },
  { id: "outline", label: "Look over a course outline" },
  { id: "ask", label: "Ask one person how a task works" },
  { id: "sort", label: "Sort a set of materials" },
  { id: "own", label: "Something I name myself" },
  { id: "reject", label: "None of these fit. I'll name what would make a better test" },
];

export const STOP_RULES = [
  { id: "5", label: "after about 5 minutes" },
  { id: "10", label: "after about 10 minutes" },
  { id: "15", label: "after about 15 minutes" },
  { id: "20", label: "after about 20 minutes" },
  { id: "signal", label: "when I choose, and I'll note the signal" },
];

/** From "Notice without forcing an answer". */
export const NOTICE_CHIPS = [
  "What holds my attention",
  "What feels hard or frustrating",
  "What is worth another look",
  "What I would rather skip",
];

/** From the first Module 2 step: facts about the situation, not mindset problems. */
export const CONDITION_CHIPS = [
  "Money",
  "Transport",
  "Schedule",
  "Childcare",
  "Technology",
  "Housing",
  "Accessibility",
  "Energy",
  "Support",
];

export const OUTCOMES = [
  "I did it",
  "I did part of it",
  "I changed it",
  "I didn't get to it",
  "Something got in the way",
  "I don't know yet",
];

/** From "Reflection, evidence, conditions, and cost": these belong in the record. */
export const RECORD_CHIPS = ["Boredom", "Friction", "No access", "No opportunity", "Still uncertain"];

export const EMPTY_PLAN = { card: "", stop: "", notice: [], conditions: [], own: "" };
export const EMPTY_CHECKIN = { outcome: "", record: [], note: "" };

export function toggleItem(list, item) {
  return list.includes(item) ? list.filter((existing) => existing !== item) : [...list, item];
}

const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);
const joinList = (items) => items.map(lower).join(", ");

/** The plan as plain sentences, so it reads the same in the journal as it does here. */
export function composePlan(plan) {
  const card = TRY_CARDS.find((item) => item.id === plan.card);
  const own = (plan.own || "").trim();
  const lines = [];

  if (card && card.id === "own") {
    lines.push(own ? `Try: ${own}` : "Try: something I name myself.");
  } else if (card && card.id === "reject") {
    lines.push(own ? `No option fit. What would make a better test: ${own}` : "No option fit yet.");
  } else if (card) {
    lines.push(`Try: ${card.label}.`);
    if (own) lines.push(`In my words: ${own}`);
  }

  const stop = STOP_RULES.find((item) => item.id === plan.stop);
  if (stop) lines.push(`Stop: ${stop.label}.`);
  if (plan.notice && plan.notice.length) lines.push(`I will notice: ${joinList(plan.notice)}.`);
  if (plan.conditions && plan.conditions.length) lines.push(`Could get in the way: ${joinList(plan.conditions)}.`);

  return lines.join("\n");
}

export function composeCheckIn({ plan, outcome, record, note }) {
  const lines = [];
  const planned = plan && plan.text ? plan.text.split("\n")[0] : "";
  if (planned) lines.push(`Planned: ${planned}`);
  if (outcome) lines.push(`What happened: ${outcome}.`);
  if (record && record.length) lines.push(`In the record: ${joinList(record)}.`);
  if ((note || "").trim()) lines.push(`Note: ${note.trim()}`);
  return lines.join("\n");
}