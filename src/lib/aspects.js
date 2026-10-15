/**
 * The seven aspects of the workbook. Each one has its own page, its own small
 * interactive piece, and a short honest description of what it does today.
 * Order here is the order on the index and the previous/next trail.
 */
export const ASPECTS = [
  {
    slug: "digital-workbook",
    number: "01",
    label: "An interactive digital workbook",
    promise: "A workbook you move through on screen. Every answer stays on its step and lands in your journal.",
    body: "This is not a book you print and fill in later. Each step is a page you work on directly: the teaching, the thing to try, the reflection, and the next decision sit together, and your answers stay attached to the step that asked for them.\n\nThere is no file to save and no numbering to keep track of. Open the workbook, pick up where you stopped, and leave the rest for another day if that is what today allows.\n\nWhat it is today: most steps are a short teaching, one or two questions, and a decision. A few steps, like planning a small try, have tap-to-answer pieces. More of those are still being built.",
    interaction: "markup",
    tryLabel: "Try it: mark up a page",
    note: "This demonstration is kept in this browser only. Nothing here is sent anywhere.",
    places: [
      { to: "/", label: "The workbook" },
      { to: "/getting-started", label: "Getting Started" },
    ],
  },
  {
    slug: "readings-in-activities",
    number: "02",
    label: "Readings woven into activities",
    promise: "Where a step has a reading, it sits right before the activity that uses it.",
    body: "Most of the reading here is short, and it is placed immediately before the activity that uses it. You are never asked to hold a chapter in your head while you do something else.\n\nIf a reading raises something worth keeping, it can become part of the same step: a saved answer, a journal line, or a choice carried into the next module.\n\nWhat it is today: many steps do not have their reading written yet. Those steps go straight to the activity.",
    interaction: "weave",
    tryLabel: "Try it: weave a reading into an activity",
    note: "In the workbook the reading and the activity arrive already paired. This shows how they fit.",
    places: [
      { to: "/", label: "The workbook" },
      { to: "/program-library", label: "Library" },
    ],
  },
  {
    slug: "guided-journal",
    number: "03",
    label: "A guided journal",
    promise: "Every answer you give in the workbook gathers here, and the journal points out what connects.",
    body: "What you save in the workbook gathers into one journal, in the order you wrote it, with the step and the date it came from. You can return to a line, add a follow-up months later, or revise it without losing the earlier wording.\n\nThe journal also notices things across your answers: threads you left open (a Test again, a Pause, a Keep looking), words that keep coming back in different steps, and questions you said you were carrying. Each one comes with a question you can answer or skip. None of it is a conclusion about you.\n\nWhen you want to think something through, you can bring chosen entries to an AI reflection partner. It sees only what you bring in.",
    interaction: "journal",
    tryLabel: "Try it: write one line",
    note: "This one is not a demonstration. A line written here is saved to your journal on this device.",
    places: [{ to: "/journal", label: "Your Journal" }],
  },
  {
    slug: "private-reflection",
    number: "04",
    label: "Private reflection and self-discovery",
    promise: "Your writing is kept in this browser, and sharing is a separate, deliberate act.",
    body: "What you write stays on this device. It leaves this device only if you share an entry, send feedback, post to a Tribe Thread, or bring entries into the reflection partner. Each of those is a separate choice you make.",
    interaction: "privacy",
    tryLabel: "Try it: choose what happens to a line",
    note: "Nothing is sent by this page. It shows the choice you are given in the workbook.",
    places: [
      { to: "/journal", label: "Your Journal" },
      { to: "/record", label: "Discovery Record" },
    ],
  },
  {
    slug: "onboarding-flow",
    number: "05",
    label: "An interactive onboarding flow",
    promise: "Getting Started walks you in with small questions rather than a wall of instructions.",
    body: "Getting Started is a short sequence of small questions. It asks what brought you here, how much you want to take on at once, and anything you would rather not do.\n\nYour answers land in your journal as you go, so the journal starts with Getting Started. That is enough to begin Module 1.",
    interaction: "onboarding",
    tryLabel: "Try it: three questions",
    note: "Your answers to this demonstration stay in this browser. The real sequence lives in Getting Started.",
    places: [
      { to: "/getting-started", label: "Getting Started" },
      { to: "/", label: "The workbook" },
    ],
  },
  {
    slug: "exploration",
    number: "06",
    label: "Interactive exploration",
    promise: "Follow what holds your attention, one question at a time.",
    body: "You do not have to arrive with a plan. Exploration here means following one question long enough to see where it leads, and letting the answer to one prompt open the next.\n\nThe Life Map keeps the results of that wandering in one place, whether or not anything has come of it yet, and the journal points out threads you left open.\n\nWhat it is today: the thread on this page is a demonstration. Workbook steps do not branch into different questions yet.",
    interaction: "thread",
    tryLabel: "Try it: pull a thread",
    note: "A demonstration thread. The Life Map is where threads like this are kept.",
    places: [
      { to: "/map", label: "Life Map" },
      { to: "/program-library", label: "Library" },
    ],
  },
  {
    slug: "choices-and-prompts",
    number: "07",
    label: "Choices and responsive prompts",
    promise: "Pick a direction and the follow-up question changes to match it. Stopping counts too.",
    body: "Wherever a step asks for a decision, the choices stand as equals: keep, change, test again, pause, stop, another direction, or keep looking.\n\nChoosing one changes the follow-up question you get right after it, and the answer goes into your journal beside the decision. Pausing and stopping are recorded as answers, not as unfinished work.\n\nWhat it is today: your choice changes the follow-up question, not which step comes next.",
    interaction: "choices",
    tryLabel: "Try it: pick a direction",
    note: "The choice below saves nothing. In the workbook it is kept with the step, and it can be changed later.",
    places: [
      { to: "/record", label: "Discovery Record" },
      { to: "/", label: "The workbook" },
    ],
  },
];

export function aspectBySlug(slug) {
  return ASPECTS.find((aspect) => aspect.slug === slug) || null;
}

export function neighbourAspects(slug) {
  const index = ASPECTS.findIndex((aspect) => aspect.slug === slug);
  return {
    previous: index > 0 ? ASPECTS[index - 1] : null,
    next: index >= 0 && index < ASPECTS.length - 1 ? ASPECTS[index + 1] : null,
  };
}