/**
 * Module 2: four ways into any possibility, so money, transportation, contacts, or
 * a lack of immediate opportunity never decide whether someone can take part.
 *
 *   try    do a small beginner version yourself
 *   watch  observe someone else doing it
 *   ask    ask a question of someone who knows
 *   notYet can't get to it yet; record what's in the way and keep a question
 *
 * Every way listed here is free. `needs` names what a way depends on, so the page
 * can say "needs internet" instead of quietly assuming it. Draft wording, pending
 * Ashley's review. Stored answers: M2-L1#21 = chosen way, M2-L2#30–32 = access notes.
 */

export const WAY_KINDS = [
  { id: "try", label: "Try it", short: "Do a small beginner version yourself." },
  { id: "watch", label: "Watch someone", short: "See how someone else does it." },
  { id: "ask", label: "Ask someone", short: "Ask one question of someone who knows." },
  { id: "notYet", label: "Not able to yet", short: "Note what’s in the way and keep a question for later." },
];

/** What a way can depend on. Participants can mark what they don't have this week. */
export const NEEDS = [
  { id: "internet", label: "Internet or data" },
  { id: "travel", label: "Getting somewhere new" },
  { id: "contact", label: "Someone I know to ask" },
  { id: "phone", label: "A phone call or message" },
];

export const NEED_LABEL = Object.fromEntries(NEEDS.map((need) => [need.id, need.label]));

/** Ways into each sampler card. Keys match the card ids in DiscoverySampler. */
export const WAYS = {
  repair: {
    try: {
      text: "Pick something around you that isn’t working right: a squeaky door, a slow phone, a wobbly chair. Write the symptom, one thing you checked, and what you found.",
      needs: [],
      note: "Don’t open anything electrical, and don’t take apart anything you’d have to pay to fix.",
    },
    watch: {
      text: "Watch a free repair video. Write down the symptom, the test they used, and how they knew what was wrong.",
      needs: ["internet"],
    },
    ask: {
      text: "Ask someone who fixes things: “How do you figure out what’s wrong before you fix it?” A friend, a relative, or a maintenance worker all count.",
      needs: ["contact"],
    },
    notYet: {
      text: "Write down one thing that broke recently, and how it got figured out or why it didn’t. That’s a real diagnosis story to come back to.",
      needs: [],
    },
  },
  design: {
    try: {
      text: "Take a flyer, label, bill, or form you already have. Look at it for five seconds, then write what you noticed first. Sketch one change that would make the main message easier to find.",
      needs: [],
    },
    watch: {
      text: "Next time you’re somewhere you already go (a bus stop, a store, a waiting room), compare two or three signs. Which one did you understand fastest, and why?",
      needs: [],
    },
    ask: {
      text: "Ask someone who makes flyers or posts for a group, church, or business: “How do you decide what goes at the top?”",
      needs: ["contact"],
    },
    notYet: {
      text: "Keep or photograph one notice that confused you, and write what was hard to find.",
      needs: [],
    },
  },
  services: {
    try: {
      text: "Pick one service you or someone you know might use, like a library card, a food pantry, or a bus pass. Find its flyer or web page and check three things: who it’s for, how to get it, and who to contact.",
      needs: [],
      note: "A printed flyer works as well as a web page. Don’t enter personal information.",
    },
    watch: {
      text: "Next time you’re at a front desk you already use (a library, clinic, or office), notice how staff answer questions and what people are asked to bring.",
      needs: [],
    },
    ask: {
      text: "Ask at a library desk or a community center front desk: “If someone needed help finding this kind of service, where would you send them?” You don’t need to know anyone there.",
      needs: [],
    },
    notYet: {
      text: "Think of one time getting help was harder than it needed to be. Write down what information was missing. Skip this if it’s not something you want to revisit.",
      needs: [],
    },
  },
  making: {
    try: {
      text: "Sketch one everyday object from two or three angles. Paper and pencil are enough. Ten minutes is plenty to start.",
      needs: [],
    },
    watch: {
      text: "Watch someone draw or make something, either a person you know who doodles or builds things, or a free video.",
      needs: [],
    },
    ask: {
      text: "Ask someone who makes things: “What was the first thing you made, and what was hard about it?”",
      needs: ["contact"],
    },
    notYet: {
      text: "No paper or no time? Look at one object and write how you’d draw it, in three steps.",
      needs: [],
    },
  },
  music: {
    try: {
      text: "Pick a song you already know. Tap or hum its rhythm, then change one part of it.",
      needs: [],
    },
    watch: {
      text: "Watch someone play, at church, on the street, at home, or in a free video. Notice what their hands or breath are doing.",
      needs: [],
    },
    ask: {
      text: "Ask someone who plays or sings: “How did you learn your first song?”",
      needs: ["contact"],
    },
    notYet: {
      text: "Write down one song you’d like to study later, and what you’d want to find out about it.",
      needs: [],
    },
  },
  nature: {
    try: {
      text: "Look closely at one plant: indoors, outside, or through a window. Write three details and one question.",
      needs: [],
    },
    watch: {
      text: "Watch someone take care of plants or animals: a neighbor gardening, a park worker, or a free nature video.",
      needs: [],
    },
    ask: {
      text: "Ask someone who gardens or works outside: “How can you tell if a plant is healthy?”",
      needs: ["contact"],
    },
    notYet: {
      text: "Use a photo instead, and say that you did. Write the question you’d want to check in person later.",
      needs: [],
    },
  },
  organizing: {
    try: {
      text: "Rearrange one drawer, shelf, or folder on your phone. A day later, check what’s easier, harder, or the same.",
      needs: [],
    },
    watch: {
      text: "In a store or library you already go to, notice how things are arranged so people can find them.",
      needs: [],
    },
    ask: {
      text: "Ask someone whose space always seems to work: “How do you decide where things go?”",
      needs: ["contact"],
    },
    notYet: {
      text: "Sketch the arrangement you’d try, without moving anything yet.",
      needs: [],
    },
  },
  community: {
    try: {
      text: "Go to one free public session you can get to, like a library program or an open meeting. Only go if it feels safe and workable.",
      needs: ["travel"],
    },
    watch: {
      text: "Read a group’s public calendar or description, or watch a recorded public meeting. Many city meetings are posted online.",
      needs: ["internet"],
    },
    ask: {
      text: "Call or message an organizer: “What happens on a first visit, and does it cost anything?”",
      needs: ["phone"],
    },
    notYet: {
      text: "Write what’s keeping you from going, and what you’d need to know first.",
      needs: [],
    },
  },
  investigating: {
    try: {
      text: "Pick an everyday object or process you can safely look at. Write what you can see, and separately, what you’re guessing.",
      needs: [],
    },
    watch: {
      text: "Watch someone do an everyday process, like cooking, sorting mail, or fixing something, and write down the steps in order.",
      needs: [],
    },
    ask: {
      text: "Ask someone who does it every day: “How does this actually work?”",
      needs: ["contact"],
    },
    notYet: {
      text: "Write the question down and keep it. A good question is a real result.",
      needs: [],
    },
  },
  // The participant's own possibility, from Module 1 or from what they wrote above.
  own: {
    try: {
      text: "Find the smallest beginner version you can do with what you already have, in under 30 minutes.",
      needs: [],
    },
    watch: {
      text: "Watch someone do it, somewhere you already go or in a free video.",
      needs: [],
    },
    ask: {
      text: "Ask one person who does it, or someone at a public desk. Use one of the questions below.",
      needs: [],
    },
    notYet: {
      text: "Write what you’d need first, and one thing you could find out about it without doing it yet.",
      needs: [],
    },
  },
};

/** Questions that work for almost anything, and for almost anyone. */
export const ASK_QUESTIONS = [
  "What does a normal day of this actually look like?",
  "What do you wish you’d known when you started?",
  "Is there a free or cheap way to try a small part of it?",
  "Where would you send someone who’s curious about this?",
];

/** Where to find someone to ask, without already knowing anyone. */
export const NO_CONTACTS = [
  "Library staff: answering questions is part of the job.",
  "Someone working where it happens, when they’re not busy.",
  "An online forum or group about it. Read first, then ask.",
  "A free class, open meeting, or drop-in session.",
  "Comments under a how-to video.",
];

/** What can get in the way. Picking any of these is information, not a failure. */
export const BARRIERS = [
  "Money",
  "Transportation",
  "Time",
  "Childcare or caregiving",
  "No one to ask",
  "Internet or phone",
  "Paperwork or ID",
  "Health or energy",
  "Didn’t feel safe or welcome",
  "No opportunity came up",
  "Something else",
];

export function waysFor(cardId) {
  return WAYS[cardId] || WAYS.own;
}

/** Which of a way's needs the participant said they don't have this week. */
export function missingNeeds(way, unavailable) {
  const off = new Set(unavailable || []);
  return (way?.needs || []).filter((need) => off.has(need));
}

/** A route name from the lesson, mapped to the way it points at. */
export function wayForRoute(route) {
  const text = String(route || "").toLowerCase();
  if (/couldn.?t access|not able/.test(text)) return "notYet";
  if (/observe|spoke|ask/.test(text)) return "watch";
  if (/tried/.test(text)) return "try";
  return "";
}
