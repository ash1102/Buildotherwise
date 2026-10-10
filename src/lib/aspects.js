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
    promise: "A workbook you move through on screen, where every step keeps what you wrote.",
    body: "This is not a book you print and fill in later. Each step is a page you work on directly: the teaching, the thing to try, the reflection, and the next decision sit together, and your answers stay attached to the step that asked for them.\n\nThere is no file to save and no numbering to keep track of. Open the workbook, pick up where you stopped, and leave the rest for another day if that is what today allows.",
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
    promise: "The reading and the doing sit together, so nothing is set aside for later.",
    body: "Most of the reading here is short, and it is placed immediately before the activity that uses it. You are never asked to hold a chapter in your head while you do something else.\n\nIf a reading raises something worth keeping, it can become part of the same step: a saved answer, a journal line, or a choice carried into the next module.",
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
    promise: "One place that holds every answer you chose to keep, in your own words.",
    body: "What you save in the workbook gathers into one journal, in the order you wrote it, with the step and the date it came from. You can return to a line, add a follow-up months later, or revise it without losing the earlier wording.\n\nThe journal also offers a way back in when you sit down with nothing in mind, using the threads you left open.",
    interaction: "journal",
    tryLabel: "Try it: write one line",
    note: "This one is not a demonstration. A line written here is saved to your journal on this device.",
    places: [
      { to: "/journal", label: "Your Journal" },
      { to: "/journal-reflection", label: "Reflection" },
    ],
  },
  {
    slug: "private-reflection",
    number: "04",
    label: "Private reflection and self-discovery",
    promise: "Your writing is kept in this browser, and sharing is a separate, deliberate act.",
    body: "What you write stays in this browser, on this device. Nothing reaches Entrepalooza unless you deliberately share an entry, send feedback, or post to a Tribe Thread.\n\nSharing is per entry and separate from saving, so you can keep writing freely and decide later, once, whether any of it leaves — and the scope is shown to you before it goes.",
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
    body: "Getting Started is a short sequence of small questions. It asks what brought you here, how much you want to take on at once, and anything you would rather not do — all of which change what you are offered afterwards.\n\nBy the end you have a first journal entry and one thread to follow, which is enough to begin Module 1.",
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
    body: "You do not have to arrive with a plan. Exploration here means following one question long enough to see where it leads, and letting the answer to one prompt open the next.\n\nThe Life Map keeps the results of that wandering in one place, whether or not anything has come of it yet.",
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
    promise: "Pick a direction and the next prompt changes to match it. Stopping counts too.",
    body: "Wherever a step asks for a decision, the choices stand as equals: keep it, change it, test it again, pause, stop, take another direction, or keep looking.\n\nChoosing one changes the prompt you get next. Pausing and stopping are recorded as answers, not as unfinished work.",
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