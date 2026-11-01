/**
 * Dashboard discovery questions (Phase 2A prototype). Pure content and ordering only.
 * Nothing here reads or writes any store: what a participant picks lives in component state
 * and is gone when they leave the page.
 *
 * Writing rules: no verdicts. Nothing is called a strength, talent, passion or business
 * opportunity. Observations describe what a choice can mean, never what it does mean.
 */

/** The three ways in. Each starts with a different question. */
export const STARTING_POINTS = [
  {
    id: "attention",
    label: "Something keeps catching my attention.",
    order: ["noticing", "overlooked", "lost-track", "self-taught", "mild-curiosity", "change"],
  },
  {
    id: "different",
    label: "I want something different, but I don’t know what.",
    order: ["change", "lost-track", "self-taught", "overlooked", "mild-curiosity", "noticing"],
  },
  {
    id: "looking",
    label: "I’m just looking around.",
    order: ["mild-curiosity", "self-taught", "overlooked", "lost-track", "noticing", "change"],
  },
];

/**
 * Path-specific follow-ups and experiments. A question keeps its base wording and options everywhere.
 * Under a path it can be asked differently and suggest a different small experiment.
 * Each field is optional: a missing followUp or experiment falls back to the question's own.
 * Follow-ups are only overridden where every existing answer option still answers the question shown.
 */
export const PATH_FRAMING = {
  attention: {
    "lost-track": {
      experiment: "Next time something holds your attention, note the first thing that caught it. Don’t decide what it means yet.",
    },
    overlooked: {
      followUp: "What do you usually do when it catches your attention?",
      experiment: "The next time you notice it, ask one person nearby whether they’ve noticed it too. You’re only finding out how common it is.",
    },
    "self-taught": {
      experiment: "Find one small thing you’ve taught yourself and write down what first caught your interest in it.",
    },
    "mild-curiosity": {
      experiment: "Spend fifteen minutes on it, then notice whether it leads back to the thing that first caught your attention.",
    },
    change: {
      experiment: "For one day, write down the moments your attention drifts toward something. Don’t change anything yet.",
    },
  },
  different: {
    change: {
      followUp: "Which of these is closest to the change you’d want?",
      experiment: "For one day, notice the moments your week feels lighter and the moments it feels heavier. Write one line for each.",
    },
    "lost-track": {
      experiment: "Think about the last time you lost track of time. Write down what made that time different from an ordinary one.",
    },
    "self-taught": {
      experiment: "Pick one thing you taught yourself and ask whether you could make more room for it.",
    },
    overlooked: {
      experiment: "Notice one problem this week you usually skip. Write one line about what you’d want to do differently about it.",
    },
    "mild-curiosity": {
      experiment: "Spend fifteen minutes on it this week. Notice whether it feels like a break or like more of the same.",
    },
    noticing: {
      experiment: "Write the thing you keep noticing in one sentence, then write one thing about your week that would change if you paid more attention to it.",
    },
  },
  looking: {
    "mild-curiosity": {
      followUp: "What would you like to do with it, if anything?",
      experiment: "Spend fifteen minutes with it: read one thing, watch one video, or ask one person. Then notice whether you want more or you’re done.",
    },
    "self-taught": {
      experiment: "Ask one person how they would do the thing you taught yourself. Notice where their way differs from yours.",
    },
    overlooked: {
      experiment: "Next time you notice a problem in passing, write it down. Don’t decide whether it matters.",
    },
    "lost-track": {
      experiment: "Next time you lose track of time, write down what you were doing in one line. Don’t decide what it means.",
    },
    noticing: {
      experiment: "Write it down in one sentence, without deciding whether it matters. Come back to it in a week.",
    },
    change: {
      experiment: "For one day, notice the moments your week feels lighter and heavier. Write one line for each.",
    },
  },
};

/** The follow-up and experiment a question carries on a given path, falling back to its own. */
export function framingFor(pointId, questionId) {
  const question = QUESTIONS[questionId];
  const framed = PATH_FRAMING[pointId] && PATH_FRAMING[pointId][questionId];
  return {
    followUp: (framed && framed.followUp) || question.followUp,
    experiment: (framed && framed.experiment) || question.experiment,
  };
}

export const QUESTIONS = {
  "self-taught": {
    id: "self-taught",
    text: "What’s something you’ve figured out how to do that nobody actually taught you?",
    followUp: "What got you started?",
    options: [
      {
        id: "needed",
        label: "I needed it to work.",
        thought:
          "A lot of what people can do began as a workaround for something that had to get done. Starting out of need is a common way in.",
      },
      {
        id: "curious",
        label: "I got curious and kept going.",
        thought:
          "Curiosity can carry someone a long way without anyone noticing. It doesn’t have to turn into anything to be worth noticing.",
      },
      {
        id: "around",
        label: "Someone around me did it.",
        thought:
          "Picking something up by watching is real learning, even when it never felt like learning. The people around us shape more than we usually count.",
      },
      {
        id: "unsure",
        label: "I’m not sure. It just happened.",
        thought:
          "That’s a very normal answer. Plenty of what we know arrives that way, and it’s easy to miss until someone asks.",
      },
    ],
    experiment:
      "Ask one person how they would do it. Notice where their way differs from yours. That’s the whole experiment.",
  },
  overlooked: {
    id: "overlooked",
    text: "What’s a problem you notice that other people seem to overlook?",
    followUp: "What do you usually do when you notice it?",
    options: [
      {
        id: "nothing",
        label: "Nothing. I move on.",
        thought:
          "Moving on is a reasonable choice. Noticing something and leaving it alone doesn’t mean it doesn’t matter to you, or that it has to.",
      },
      {
        id: "fix",
        label: "I fix it myself.",
        thought:
          "Fixing things quietly is easy to take for granted, partly because it often goes unseen. It’s also worth asking whether you want to be the one who does it.",
      },
      {
        id: "mention",
        label: "I mention it to someone.",
        thought:
          "Saying it out loud is one way a noticed problem becomes a shared one. What happens next is often the more interesting part.",
      },
      {
        id: "think",
        label: "I think about it for a while.",
        thought:
          "Turning something over in your mind is a way of paying attention. It can be a good sign that something is worth a closer look, or it can just be how you think.",
      },
    ],
    experiment:
      "The next time you notice one, ask one person nearby whether they’ve noticed it too. You’re only finding out how common it is.",
  },
  "lost-track": {
    id: "lost-track",
    text: "Have you ever gotten so caught up figuring something out that you completely lost track of time?",
    followUp: "How did you feel afterward?",
    options: [
      {
        id: "energized",
        label: "Energized.",
        thought:
          "Feeling energized afterward is worth noticing. It’s one clue about what the activity does for you, and it’s only one.",
      },
      {
        id: "calm",
        label: "Calm.",
        thought:
          "Some activities settle us rather than wind us up. That can matter as much as how good we are at them.",
      },
      {
        id: "tired",
        label: "Tired, but in a good way.",
        thought:
          "Good tired often means the effort was yours and it was worth it. That’s useful to know, whatever you decide to do with it.",
      },
      {
        id: "drained",
        label: "Honestly, kind of drained.",
        thought:
          "Losing track of time doesn’t always mean something is good for you. Noticing the cost counts as much as noticing the pull.",
      },
    ],
    experiment:
      "The next time you lose track of time, write down what you were doing in one line. Don’t decide what it means.",
  },
  noticing: {
    id: "noticing",
    text: "What’s something you keep noticing that other people don’t seem to pay much attention to?",
    followUp: "What makes you want to understand it better?",
    options: [
      {
        id: "keeps",
        label: "I keep coming back to it.",
        thought:
          "Coming back to something again and again means it has hold of you. It doesn’t have to be more than that yet.",
      },
      {
        id: "why",
        label: "I wonder why others don’t see it.",
        thought:
          "Noticing what others miss is a real kind of attention. It can also just mean you see things from a different angle, which is worth knowing about yourself.",
      },
      {
        id: "common",
        label: "I want to know whether it’s common.",
        thought:
          "Checking how common something is makes a good first step. You can find out without deciding what it means.",
      },
      {
        id: "stands",
        label: "I’m not sure. It just stands out.",
        thought: "That’s enough. Plenty of interests begin with something that simply stood out.",
      },
    ],
    experiment:
      "Write it down in one sentence, without deciding whether it matters. Come back to that sentence in a week and notice whether it still catches you.",
  },
  change: {
    id: "change",
    text: "If something about your ordinary week could be different, what would you want more of—or less of?",
    followUp: "Which of those feels closest to true right now?",
    options: [
      {
        id: "more",
        label: "More of something small I already enjoy.",
        thought:
          "Small changes to an ordinary week are often the most reachable. Starting small doesn’t mean aiming low.",
      },
      {
        id: "less",
        label: "Less of something that wears me down.",
        thought:
          "Knowing what you want less of can be as useful as knowing what you want more of. It points at the friction, which is often where the real options are.",
      },
      {
        id: "time",
        label: "A different use of my time, not a different life.",
        thought:
          "A change doesn’t have to be large to matter. Rearranging an hour or two can be enough to notice a difference.",
      },
      {
        id: "unsure",
        label: "I’m not sure yet.",
        thought:
          "Not knowing yet is a normal place to be. You can leave the question open and still learn from it.",
      },
    ],
    experiment:
      "For one day, notice the moments your week feels lighter and the moments it feels heavier. Write one line for each. Don’t change anything yet.",
  },
  "mild-curiosity": {
    id: "mild-curiosity",
    text: "What’s something you’re mildly curious about—not passionate about, not talented at, just curious about?",
    followUp: "What would you like to do with that curiosity?",
    options: [
      {
        id: "lookup",
        label: "Look it up.",
        thought:
          "Looking something up is the smallest way to follow a curiosity. It costs almost nothing, and you can stop whenever you like.",
      },
      {
        id: "once",
        label: "Try it once.",
        thought:
          "One try tells you more than a lot of thinking. It also gives you something real to compare against what you imagined.",
      },
      {
        id: "ask",
        label: "Ask someone who knows.",
        thought:
          "People who do a thing usually have a different view of it than people who only read about it. Asking is often the quickest way to find that out.",
      },
      {
        id: "nothing",
        label: "Nothing. It’s fine as a passing interest.",
        thought:
          "Not every curiosity needs a next step. Leaving it alone is allowed, and it can still be a good thing to have noticed.",
      },
    ],
    experiment:
      "Spend fifteen minutes with it: read one thing, watch one video, or ask one person. Then notice whether you want more or you’re done. Either answer is fine.",
  },
};

/** What a visitor sees after skipping the follow-up, or when no option fits. */
export const NO_CHOICE_THOUGHT =
  "There’s no right answer here, and leaving it open is a fine answer too.";

/**
 * Every question on a path, in that path's order: its own questions first, then the rest.
 * Nothing is hidden. A participant can open any of them from any path.
 */
export function questionsForPath(pointId) {
  const point = startingPoint(pointId);
  return point ? point.order.map((id) => QUESTIONS[id]) : [];
}

export function startingPoint(id) {
  return STARTING_POINTS.find((point) => point.id === id) || null;
}

/** The first question in this starting point's order. */
export function firstQuestionFor(pointId) {
  const point = startingPoint(pointId);
  return point ? QUESTIONS[point.order[0]] : null;
}

/**
 * The next question in this starting point's order that has not been shown yet, or null once
 * all four have been seen. `fromId` is the one on screen now, so "another question" never repeats it.
 */
export function nextQuestionFor(pointId, seenIds = [], fromId = null) {
  const point = startingPoint(pointId);
  if (!point) return null;
  const seen = new Set([...(seenIds || []), fromId].filter(Boolean));
  const id = point.order.find((candidate) => !seen.has(candidate));
  return id ? QUESTIONS[id] : null;
}

/** What to say back for a chosen option. Never personal, never a verdict. */
export function thoughtFor(questionId, optionId) {
  const question = QUESTIONS[questionId];
  const option = question && question.options.find((item) => item.id === optionId);
  return option ? option.thought : NO_CHOICE_THOUGHT;
}

/** "Show me another": the next unseen question, else the next one in order, wrapping. Never the one on screen. */
export function anotherQuestionFor(pointId, currentId, seenIds = []) {
  const point = startingPoint(pointId);
  if (!point) return null;
  const unseen = nextQuestionFor(pointId, seenIds, currentId);
  if (unseen) return unseen;
  const at = point.order.indexOf(currentId);
  const nextId = point.order[(at + 1) % point.order.length];
  return nextId === currentId ? null : QUESTIONS[nextId];
}
