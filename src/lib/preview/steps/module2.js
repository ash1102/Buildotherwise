import { TAG } from "../tags";

/**
 * Module 2, built in detail for review. The step's own lesson record still
 * carries the teaching and the writing prompts, and nothing of it is rewritten
 * here. What this file adds is the part the workbook never showed: the module's
 * boundary in its own card, the exposure menu where it will go once the cohort,
 * location and partners are known, and the interactions proposed for this
 * module. The lines inside those interactions come from the lesson's own text;
 * the interactions themselves are new, and are tagged as proposed.
 *
 * A Next Decision appears only on the review step, which is where the
 * curriculum puts one for this module.
 */
export const module2 = {
  key: "module-2",
  slug: "learn-through-one-small-try",
  order: 2,
  title: "Learn Through One Small Try",
  pilot: "pilot_one",
  kind: "module",
  purpose: "Try one small, bounded thing and see what it teaches.",
  readings: [{ id: "M2-R1", title: "A Try Is Not a Commitment", tag: TAG.NEEDS_FULL_TEXT }],
  steps: [
    {
      code: "M2-L1",
      title: "Choose an interest or try something new",
      sourceLesson: "M2-L1",
      readings: ["M2-R1"],
      blocks: [
        {
          id: "M2-L1-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Boundary",
          tag: TAG.VERBATIM,
          body:
            "No purchase, public performance, or business idea is required. Transport, money, schedule, childcare, access and energy are facts about the situation, not mindset problems. The exposure menu stays a labelled placeholder until cohort, location and partners are known, and nothing on it is promised as available.",
        },
        {
          id: "M2-L1-b2",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "The exposure menu is not written yet",
          tag: TAG.PLACEHOLDER,
          body:
            "Categories may include employment and workplace exploration; education, certification or specialised study; trades, technical skills, crafts and hands-on work; art, music, writing, design and making; volunteering, mentoring or community contribution; entrepreneurship, freelancing or testing an idea; health, relationships, finances, routines, hobbies and community life; or another possibility you name. No one must select entrepreneurship.\n\n" +
            "A listed category is not a promise that a place or service is available near you, and choosing none of them is a complete answer.",
        },
        {
          id: "M2-L1-b3",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "Which way in",
          tag: TAG.PROPOSED,
          instruction:
            "Four equal ways to take part. All count the same, none is recommended, and leaving this alone records nothing.",
          groups: [
            {
              id: "route",
              question: "Which way did you take?",
              options: [
                { id: "thread", label: "Bring a thread" },
                { id: "bounded", label: "Choose one bounded exposure" },
                { id: "reject", label: "Reject the options and name what would make a better test" },
                { id: "neutral", label: "Use the supplied neutral task" },
              ],
            },
          ],
          plain:
            "Four ways to take part, all counting the same: bring a thread you already have, choose one bounded exposure, reject the options and name what would make a better test, or use the supplied neutral task. Rejecting the options is a full answer, and naming what would make a better test is useful information.",
        },
      ],
    },
    {
      code: "M2-L2",
      title: "Reflection, evidence, conditions, and cost",
      sourceLesson: "M2-L2",
      readings: [],
      blocks: [
        {
          id: "M2-L2-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Boundary",
          tag: TAG.VERBATIM,
          body:
            "Boredom, friction, no access, no opportunity and uncertainty are data, not evidence of a character flaw. A blocked or declined try is not proof of motivation, ability, or readiness.",
        },
        {
          id: "M2-L2-b2",
          version: "1.0",
          type: "sort",
          part: "activity",
          title: "What happened, and what it was taken to mean",
          tag: TAG.PROPOSED,
          instruction: "Choose one of the two for each line. Every line shows an explanation, and nothing is scored.",
          categories: [
            { id: "observation", label: "Something that happened" },
            { id: "interpretation", label: "An explanation added to it" },
          ],
          items: [
            {
              id: "s1",
              text: "I stopped after ten minutes because the instructions would not load.",
              answer: "observation",
              explanation: "Something you can check. It describes what happened, and why the session ended.",
            },
            {
              id: "s2",
              text: "I am not interested enough.",
              answer: "interpretation",
              explanation: "An explanation. Ten minutes of a page that would not load does not establish it.",
            },
            {
              id: "s3",
              text: "The checklist was completed in order.",
              answer: "observation",
              explanation: "Something you saw happen. It says nothing yet about what it means.",
            },
            {
              id: "s4",
              text: "The person likes structured work.",
              answer: "interpretation",
              explanation: "An explanation added to the checklist, not something the checklist shows.",
            },
            {
              id: "s5",
              text: "I did not get a chance to find out.",
              answer: "observation",
              explanation: "Accurate about access, and honest about what the try could not show.",
            },
            {
              id: "s6",
              text: "It did not suit me.",
              answer: "interpretation",
              explanation: "A verdict. The record might hold a condition, a cost or an unknown instead.",
            },
          ],
          footnote: "No score, and no count of right answers. One try informs the next question; it does not settle ability, readiness or fit.",
          plain:
            "Six lines, sorted into two groups. “I stopped after ten minutes because the instructions would not load” is something that happened. “I am not interested enough” is an explanation added to it. “The checklist was completed in order” is something that happened. “The person likes structured work” is an explanation. “I did not get a chance to find out” is something that happened. “It did not suit me” is an explanation.",
        },
      ],
    },
    {
      code: "M2-L3",
      title: "Review, next decision, and handoff",
      sourceLesson: "M2-L3",
      readings: [],
      blocks: [
        {
          id: "M2-L3-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Boundary",
          tag: TAG.VERBATIM,
          body:
            "Ratings are noticing tools only, never cutoffs, rankings, or readiness gates. No Next Decision is better than another. A useful try is not proof that anyone became harmonious, and interest stays a possibility rather than a destiny.",
        },
        {
          id: "M2-L3-b2",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "What the try left you with",
          tag: TAG.PROPOSED,
          instruction:
            "More than one is allowed. Every one of these counts, including no useful signal yet, and leaving this alone records nothing.",
          groups: [
            {
              id: "outcome",
              question: "Did the experience produce any of these?",
              multi: true,
              options: [
                { id: "evidence", label: "Evidence" },
                { id: "question", label: "A better question" },
                { id: "boundary", label: "A boundary" },
                { id: "none-yet", label: "No useful signal yet" },
              ],
            },
          ],
          plain:
            "Four answers, all counting the same: evidence, a better question, a boundary, or no useful signal yet. Naming no useful signal yet is a complete answer, and it does not decide the Next Decision for you.",
        },
      ],
      decision: true,
    },
  ],
};