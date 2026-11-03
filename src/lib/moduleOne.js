import { answerKey, setAnswer } from "./workbook";
import { saveAnswer } from "./journal";

/**
 * Module 1 interactive lessons (review branch "module-1-interactive", Oct 24, 2026).
 *
 * Wording comes from Ashley's "Module 1 Interactive Redesign" specification unless a
 * comment says DRAFT (Claude). Nothing here is approved participant curriculum yet.
 *
 * SAVED-ANSWER KEYS. All answers stay in the existing workbook answers store
 * (`answers`, synced to the account) and are copied to the journal by prompt key,
 * so a repeat tap updates one journal entry instead of adding another.
 *
 * New keys (plain text; multi-selects are joined with "; "):
 *   M1-L1#notice-route    which kind of noticing they picked (one of NOTICE_OPTIONS labels)
 *   M1-L1#notice-text     their own optional words for it
 *   M1-L1#map-context     a Life Map line they chose to bring in, copied as written
 *   M1-L1#encounter       possibility cards they SELECTED (multi, "; "-joined titles). Selecting only
 *                         means it caught their attention: not an interest, not a plan.
 *                         Oct 24, 2026: the gallery grew from 3 cards to 12 and became multi-select.
 *                         A value saved under an earlier card title (single title) still reads
 *                         as that card; it is only rewritten if the participant changes it.
 *   M1-L1#stood-out       optional: what, if anything, stood out
 *   M1-L1#carry-choice    what they want to carry into Module 2 (one of CARRY_OPTIONS)
 *   M1-L2#compare         their answer to the Jordan/Riley question
 *   M1-L2#lens            whether they used a personal activity or the fictional example
 *   M1-L2#reasons         reasons that might keep them involved (multi)
 *   M1-L2#surprise        optional: did anything about those reasons surprise you
 *   M1-L3#carry-mode      keep / change / leave open the Module 1 starting point
 *   M1-L3#willing         what they're willing to try
 *   M1-L3#approach        how they'll approach the experience
 *   M1-L3#support         what makes exploration workable (multi)
 *   M1-L3#support-other   their own words about support
 *   M1-L3#revisit         when to revisit the agreement
 *   <code>#finished       ISO date, set only when they tap "I'm done with this lesson".
 *                         Lets someone who writes nothing still move on.
 *
 * Existing keys reused WITH THEIR ORIGINAL MEANING:
 *   M1-L3#1  "What observation or question would you like to bring into Module 2?"
 *   M1-L3#4  "What's one thing you believe about yourself that you haven't had the
 *            opportunity to test?" (read again in Module 4 and the bridge into Module 4)
 *
 * Older keys (M1-L1 time-energy, own-caught, garden-*, possibility, M1-L1#0-1,
 * M1-L2#0, M1-L3#0-3) are never written here. They are shown read-only under
 * "Earlier answers" and still count toward progress.
 */

export const M1_CODES = ["M1-L1", "M1-L2", "M1-L3"];

export const FINISHED = "finished";

export const NOTICE_OPTIONS = [
  { id: "curious", label: "Something I'm curious about", prompt: "What's something you've wondered about or wanted to understand better?" },
  { id: "frustrates", label: "Something that frustrates me", prompt: "What's something you keep wishing someone would fix or do differently?" },
  { id: "know-how", label: "Something I know how to do", prompt: "What's something you've learned through experience that you might explore further?" },
  { id: "never-tried", label: "Something I've never tried", prompt: "Is there something you have encountered but not tried, if you want to name it?" },
  { id: "nothing-yet", label: "Nothing comes to mind yet", prompt: "" },
];

/**
 * Discovery gallery cards (Ashley's list, Oct 24, 2026). `legacyTitles` are the earlier
 * card titles, so a selection saved before the gallery grew still shows as selected.
 */
export const ENCOUNTER_CARDS = [
  { id: "repair", title: "Repair & Restore", description: "Figure out why things stop working and how to bring them back to life.", icon: "wrench", alt: "Illustration: a wrench", legacyTitles: ["Repairing what others throw away"] },
  { id: "design", title: "Design Experiences", description: "Create environments and experiences that change how people learn or interact.", icon: "sparkles", alt: "Illustration: sparkles", legacyTitles: ["Designing experiences"] },
  { id: "community", title: "Community Projects", description: "Explore how people work together to solve local problems.", icon: "users", alt: "Illustration: a group of people", legacyTitles: ["Solving a community problem"] },
  { id: "nature", title: "Nature & Discovery", description: "Investigate plants, animals, ecosystems, and the natural world.", icon: "leaf", alt: "Illustration: a leaf" },
  { id: "sound", title: "Sound & Music", description: "Explore how sounds are created, recorded, combined, and experienced.", icon: "music", alt: "Illustration: musical notes" },
  { id: "making", title: "Making Things", description: "Experiment with materials, tools, and hands-on creativity.", icon: "hammer", alt: "Illustration: a hammer" },
  { id: "behavior", title: "Human Behavior", description: "Explore why people think, feel, decide, and behave as they do.", icon: "brain", alt: "Illustration: a brain" },
  { id: "food", title: "Food & Experimentation", description: "Discover how ingredients, cultures, and techniques shape food.", icon: "chef", alt: "Illustration: a chef's hat" },
  { id: "tech", title: "Technology & Invention", description: "Explore how technology works and what new things it makes possible.", icon: "cpu", alt: "Illustration: a computer chip" },
  { id: "stories", title: "Stories & Media", description: "Discover how stories are created and communicated through different media.", icon: "book", alt: "Illustration: an open book" },
  { id: "systems", title: "Systems & Problem-Solving", description: "Investigate how complicated systems work and how they might be improved.", icon: "network", alt: "Illustration: connected nodes in a network" },
  { id: "movement", title: "Movement & Performance", description: "Explore movement, dance, physical expression, and performance.", icon: "person", alt: "Illustration: a standing figure" },
];

/** Selected card ids, from the saved text. Earlier single-title values still match their card. */
export function selectedEncounterIds(value) {
  const titles = splitMulti(value);
  return ENCOUNTER_CARDS.filter((card) => titles.some((title) => title === card.title || (card.legacyTitles || []).includes(title))).map((card) => card.id);
}

/** Saved text for a set of card ids, in gallery order, using the current titles. */
export function encounterValue(ids) {
  return joinMulti(ENCOUNTER_CARDS.filter((card) => ids.includes(card.id)).map((card) => card.title));
}

export const CARRY_OPTIONS = [
  "Something from my own experience",
  "An unfamiliar possibility I encountered",
  "A question I want answered",
  "Nothing specific yet",
];

export const COMPARE_OPTIONS = [
  {
    label: "They're equally passionate about motorcycles.",
    // DRAFT feedback (Claude), built from the four points in the spec.
    feedback:
      "That's one possibility, but the time they spend doesn't tell us that. Jordan mentions enjoying the problems and stopping when something else needs attention. Riley mentions bills and family responsibilities.",
  },
  {
    label: "Their reasons for engaging may be different.",
    feedback:
      "That's what the descriptions suggest. Jordan talks about enjoyment; Riley talks about money and responsibility. Even so, the reasons can overlap. Riley sometimes enjoys the work too.",
  },
  {
    label: "We need more information before deciding how either person feels.",
    feedback:
      "Fair. Two short descriptions can't tell us everything about either person. What they do show is that the same amount of time can come from different reasons.",
  },
];

/** Shown after any choice. DRAFT (Claude), from the spec's four points. */
export const COMPARE_TAKEAWAY =
  "Time spent, on its own, doesn't establish passion. Reasons and circumstances matter, and motivation usually has several influences at once.";

export const LENS_OPTIONS = ["I'm thinking of an activity from my life", "I'll use Jordan or Riley instead"];

export const REASON_OPTIONS = [
  "I enjoy it.",
  "I'm curious about it.",
  "It's important to me.",
  "Other people depend on me.",
  "It's necessary right now.",
  "I feel pressure to keep doing it.",
  "I'm not sure.",
];

export const CARRY_MODES = ["Keep it", "Change it", "Leave it open"];

export const WILLING_OPTIONS = [
  "Explore something unfamiliar.",
  "Follow something I've already noticed.",
  "Watch or learn how something works.",
  "Ask someone about their experience.",
  "Keep looking until something stands out.",
];

export const APPROACH_OPTIONS = [
  "Pay attention to what happens and what I learn.",
  "Bring a question I want to investigate.",
  "Try something small, within my limits.",
  "Observe first before deciding whether to participate.",
];

export const SUPPORT_OPTIONS = [
  "Flexible timing",
  "Clear instructions",
  "Someone to talk things through with",
  "A quiet place",
  "Little or no cost",
  "Help accessing an opportunity",
  "Nothing additional right now",
];
export const SUPPORT_NONE = "Nothing additional right now";

export const REVISIT_OPTIONS = ["After I try something", "When something changes", "Whenever I decide it's useful", "No check-in planned"];

/** O.4 "What makes it work for you": its three live answer slots. */
export const WHAT_MAKES_IT_WORK = [
  { code: "O.4", index: 2, label: "How you'd like to take part" },
  { code: "O.4", index: 3, label: "Anything that makes it harder to show up" },
  { code: "O.4", index: 4, label: "Support you'd want" },
];

/** Older answers per lesson, shown read-only so nothing written before becomes unreachable. */
export const EARLIER_ANSWERS = {
  "M1-L1": [
    { key: "M1-L1#0", label: "What you might want to understand better" },
    { key: "M1-L1#1", label: "What you'd need to encounter, ask, or try" },
    { key: "M1-L1#time-energy", label: "What draws you in, and what you get through" },
    { key: "M1-L1#activity-parts", label: "Parts you pay more attention to" },
    { key: "M1-L1#missing-experience", label: "Something missing from your week" },
    { key: "M1-L1#own-caught", label: "What caught your attention" },
    { key: "M1-L1#own-dont-know", label: "What you don't know yet" },
    { key: "M1-L1#possibility", label: "What might help you learn a little more" },
  ],
  "M1-L2": [{ key: "M1-L2#0", label: "A question about choice, pressure, or flexibility" }],
  "M1-L3": [
    { key: "M1-L3#0", label: "What you were willing to try, in your words" },
    { key: "M1-L3#2", label: "Support or adjustment that would help" },
    { key: "M1-L3#3", label: "When to revisit the agreement" },
  ],
};

/** Keys whose saved text means "this lesson was used". */
const RESPONSE_KEYS = {
  "M1-L1": ["notice-route", "notice-text", "map-context", "encounter", "stood-out", "carry-choice", FINISHED,
    // older interactive keys still count
    "time-energy", "activity-parts", "missing-experience", "own-caught", "own-dont-know", "possibility", "garden-picks"],
  "M1-L2": ["compare", "lens", "reasons", "surprise", FINISHED],
  "M1-L3": ["carry-mode", "willing", "approach", "support", "support-other", "revisit", FINISHED, "1", "4"],
};

export function isModuleOneInteractive(code) {
  return M1_CODES.includes(code);
}

/** Older JSON-quoted values still read as their words. */
export function plainValue(raw) {
  const text = String(raw ?? "");
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? parsed : text;
  } catch {
    return text;
  }
}

export function readAnswer(answers, code, key) {
  return plainValue((answers || {})[answerKey(code, key)]).trim();
}

export function splitMulti(value) {
  return String(value || "")
    .split("; ")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinMulti(list) {
  return (list || []).filter(Boolean).join("; ");
}

/** Save one answer and keep one journal entry for it. Blank clears the entry's text. */
export function recordAnswer(lesson, key, value, label) {
  const text = String(value ?? "");
  setAnswer(lesson.code, key, text);
  saveAnswer({
    lessonCode: lesson.code,
    lessonTitle: lesson.title,
    promptKey: answerKey(lesson.code, key),
    promptLabel: label,
    body: text,
  });
}

/** Marks the lesson done without needing an answer. Not copied to the journal. */
export function markFinished(code, on) {
  setAnswer(code, FINISHED, on ? new Date().toISOString() : "");
}

/** A Module 1 lesson counts once anything is saved on it, or the participant said they were done. */
export function moduleOneStepComplete(code, answers) {
  const keys = RESPONSE_KEYS[code] || [];
  if (keys.some((key) => String((answers || {})[answerKey(code, key)] || "").trim())) return true;
  return (EARLIER_ANSWERS[code] || []).some((item) => String((answers || {})[item.key] || "").trim());
}
