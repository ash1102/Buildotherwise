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

export const EXPLORATION_MENU = [
  {
    "category": "Making",
    "items": [
      {
        "id": "explore-0-0",
        "label": "Make a snack using something already available",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-0-1",
        "label": "Sketch an object from three different angles",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-0-2",
        "label": "Repurpose a container for a practical use",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Solving",
    "items": [
      {
        "id": "explore-1-0",
        "label": "Investigate why an everyday object works",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-1-1",
        "label": "Compare two ways to solve a small problem",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-1-2",
        "label": "Troubleshoot a harmless issue using a guide",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Building",
    "items": [
      {
        "id": "explore-2-0",
        "label": "Build a small structure from recycled materials",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-2-1",
        "label": "Draft a plan to repair or improve something",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-2-2",
        "label": "Observe how a simple item is assembled",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Connecting",
    "items": [
      {
        "id": "explore-3-0",
        "label": "Ask someone what they enjoy about an activity",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-3-1",
        "label": "Find a free local or online gathering to explore",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-3-2",
        "label": "Listen to someone explain a skill unfamiliar to you",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Helping",
    "items": [
      {
        "id": "explore-4-0",
        "label": "Ask someone if they want help with a small task",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-4-1",
        "label": "Find a community need and research one way to contribute",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-4-2",
        "label": "Explain something useful to someone who asks",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Creating",
    "items": [
      {
        "id": "explore-5-0",
        "label": "Take five photos around a single theme",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-5-1",
        "label": "Make a thirty-second rhythm or sound experiment",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-5-2",
        "label": "Write or sketch a one-minute idea",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Organizing",
    "items": [
      {
        "id": "explore-6-0",
        "label": "Rearrange a small area for easier use",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-6-1",
        "label": "Make a simple checklist for a repeated task",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-6-2",
        "label": "Plan the steps for a tiny event or outing",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  },
  {
    "category": "Unexpected",
    "items": [
      {
        "id": "explore-7-0",
        "label": "Explore a job you have never considered",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-7-1",
        "label": "Watch a beginner demonstration outside your usual interests",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      },
      {
        "id": "explore-7-2",
        "label": "Investigate one unfamiliar question that surprises you",
        "minutes": "5–20 minutes",
        "cost": "Free or use what you have",
        "alternative": "Watching, researching, or asking a question counts."
      }
    ]
  }
];

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

export const EMPTY_PLAN = { card: "", stop: "", notice: [], conditions: [], own: "", route: "", category: "", experiment: "" };
export const EMPTY_CHECKIN = { outcome: "", record: [], note: "" };

export function toggleItem(list, item) {
  return list.includes(item) ? list.filter((existing) => existing !== item) : [...list, item];
}

const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);
const joinList = (items) => items.map(lower).join(", ");

/** The plan as plain sentences, so it reads the same in the journal as it does here. */
export function composePlan(plan) {
  const card = TRY_CARDS.find((item) => item.id === plan.card);
  const experiment = EXPLORATION_MENU.flatMap((group) => group.items).find((item) => item.id === plan.experiment);
  const own = (plan.own || "").trim();
  const lines = [];

  if (experiment) {
    lines.push(`Try: ${experiment.label}.`);
    if (own) lines.push(`In my words: ${own}`);
  } else if (card && card.id === "own") {
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