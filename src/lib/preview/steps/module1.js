import { TAG } from "../tags";

/**
 * Module 1, built in detail for review. The Life Map is the section before this
 * one. The Notice lesson carries the garden flow in the owner's wording; the
 * patterns lesson reuses the approved lesson record and adds the fictional
 * comparison. No Next Decision anywhere in this module.
 */
export const module1 = {
  key: "module-1",
  slug: "find-something-worth-exploring",
  order: 1,
  title: "Find Something Worth Exploring",
  pilot: "pilot_one",
  kind: "module",
  purpose: "Start with something small that already has your attention.",
  readings: [
    { id: "M1-R1", title: "You Don’t Have to Know Yet", tag: TAG.NEEDS_FULL_TEXT },
    { id: "M1-R2", title: "When Something Matters, How It Holds You Matters", tag: TAG.NEEDS_FULL_TEXT },
  ],
  steps: [
    {
      code: "M1-PREVIEW-L2",
      title: "Notice without forcing an answer",
      sourceLesson: null,
      readings: ["M1-R1"],
      blocks: [
        {
          id: "M1-PREVIEW-L2-b2",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "Step 1",
          tag: TAG.VERBATIM,
          instruction: "Choose how to enter. You can skip this and still read everything below.",
          groups: [
            {
              id: "entry",
              question: "What would you like to work with today?",
              options: [
                { id: "own-attention", label: "Something that caught my attention", next: "step-3" },
                { id: "lifemap-thread", label: "A thread from my Life Map", next: "step-3" },
                { id: "garden", label: "The garden example", next: "step-2" },
                { id: "unsure", label: "I’m not sure yet", next: "step-2" },
              ],
            },
          ],
          plain:
            "Four ways in: something that caught your attention, a thread from your Life Map, the garden example, or not sure yet. Your own material goes straight to the reflection step, with the garden example offered as an optional look.",
        },
        {
          id: "M1-PREVIEW-L2-b3",
          version: "1.0",
          type: "example",
          part: "lesson",
          title: "Step 2: the garden example",
          invented: true,
          tag: TAG.VERBATIM,
          body:
            "Someone keeps noticing community gardens. They don’t yet know whether it’s the gardening, food, people, or being outside that interests them.",
        },
        {
          id: "M1-PREVIEW-L2-b4",
          version: "1.0",
          type: "sort",
          part: "activity",
          title: "Step 2: sort four statements",
          tag: TAG.VERBATIM,
          instruction:
            "Tap a category for each statement: “The example tells us this” or “Someone added this conclusion.”",
          categories: [
            { id: "tells", label: "The example tells us this" },
            { id: "added", label: "Someone added this conclusion" },
          ],
          items: [
            {
              id: "s1",
              text: "They keep noticing community gardens.",
              answer: "tells",
              explanation: "That’s in the example. It’s a starting point, not a commitment.",
            },
            {
              id: "s2",
              text: "Gardening is their passion.",
              answer: "added",
              explanation: "That adds a conclusion. We don’t know which part interests them yet.",
            },
            {
              id: "s3",
              text: "They aren’t sure what draws them in.",
              answer: "tells",
              explanation: "The example tells us they’re unsure. An unknown is useful information too.",
            },
            {
              id: "s4",
              text: "They should start a gardening business.",
              answer: "added",
              explanation: "That jumps from noticing to a destination they haven’t chosen.",
            },
          ],
          footnote: "No score or right/wrong marks. Just an explanation and a chance to look again.",
          plain:
            "Four statements are sorted into two groups. “They keep noticing community gardens” is in the example. “Gardening is their passion” adds a conclusion. “They aren’t sure what draws them in” is in the example, and an unknown is useful information too. “They should start a gardening business” jumps to a destination they haven’t chosen.",
        },
        {
          id: "M1-PREVIEW-L2-b5",
          version: "1.0",
          type: "optional_reflection",
          part: "activity",
          title: "Step 3: your own thread",
          tag: TAG.VERBATIM,
          showWhen: { blockId: "M1-PREVIEW-L2-b2", group: "entry", in: ["own-attention", "lifemap-thread"] },
          question: "What caught your attention, and what don’t you know yet?",
          fields: [
            { id: "caught", label: "What caught your attention" },
            { id: "dont-know", label: "What I don’t know yet" },
          ],
        },
        {
          id: "M1-PREVIEW-L2-b6",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "Step 3: the example",
          tag: TAG.VERBATIM,
          showWhen: { blockId: "M1-PREVIEW-L2-b2", group: "entry", in: ["garden", "unsure"] },
          instruction: "Either pick, or both, can be skipped.",
          groups: [
            {
              id: "drawing-in",
              question: "What might be drawing them in?",
              multi: true,
              clearsOthers: ["still-unclear"],
              options: [
                { id: "gardening", label: "the gardening" },
                { id: "food", label: "the food" },
                { id: "people", label: "the people" },
                { id: "outside", label: "being outside" },
                { id: "still-unclear", label: "still unclear" },
              ],
            },
            {
              id: "find-out",
              question: "What might they want to find out?",
              options: [
                { id: "part-matters", label: "which part matters most" },
                { id: "what-like", label: "what it would be like to try" },
                { id: "fits-week", label: "how it might fit into their week" },
              ],
            },
          ],
          titleOverride: "What might be drawing them in, and what might they want to find out?",
          plain:
            "For the example you can pick what might be drawing them in (the gardening, the food, the people, being outside, or still unclear) and what they might want to find out (which part matters most, what it would be like to try, or how it might fit into their week).",
        },
        {
          id: "M1-PREVIEW-L2-b7",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "Step 4: a possibility",
          tag: TAG.VERBATIM,
          instruction: "Any of these is a complete way to leave the step, including leaving without choosing.",
          groups: [
            {
              id: "possibility",
              question: "What might help you learn a little more?",
              options: [
                { id: "look-again", label: "Look again" },
                { id: "one-part", label: "Find out about one part" },
                { id: "ask", label: "Ask a question" },
                { id: "nothing", label: "Nothing for now" },
              ],
            },
          ],
          plain:
            "Four ways to leave: look again, find out about one part, ask a question, or nothing for now.",
        },
        {
          id: "M1-PREVIEW-L2-b8",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Closing line",
          tag: TAG.VERBATIM,
          body: "You can look again, learn a little more, ask a question, or leave it for now.",
        },
        {
          id: "M1-PREVIEW-L2-b9",
          version: "1.0",
          type: "takeaway",
          part: "takeaway",
          title: "Takeaway",
          tag: TAG.VERBATIM,
          body:
            "Noticing gives you somewhere to begin. It doesn’t tell you who you are or what you have to do next.",
        },
      ],
    },
    {
      code: "M1-PREVIEW-L3",
      title: "Obsessive and harmonious patterns (not labels)",
      sourceLesson: "M1-L2",
      /** This step carries its own invented pair, so the lesson record's earlier example is not printed too. */
      hideLiveExample: true,
      readings: ["M1-R2"],
      blocks: [
        {
          id: "M1-PREVIEW-L3-b1",
          version: "1.0",
          type: "pattern_compare",
          part: "activity",
          title: "Two invented people who both make music most evenings",
          tag: TAG.PROPOSED,
          invented: true,
          instruction:
            "For each person, pick one of these. Each pick shows an explanation. Mixed or unclear is a complete answer, and so is not enough information.",
          options: ["Mostly chosen and flexible", "Mostly pressured and rigid", "Mixed or unclear", "Not enough information"],
          people: [
            {
              id: "person-a",
              name: "Person A",
              description:
                "Can pause when needed, adjusts expectations, and stays connected to sleep, relationships and responsibilities.",
              explanations: {
                "Mostly chosen and flexible":
                  "The description shows room to pause and to adjust, with the rest of life still connected. That is the shape of a harmonious pattern.",
                "Mostly pressured and rigid":
                  "Nothing here describes pressure or rigidity. If you picked this, it may be worth checking which line led you there.",
                "Mixed or unclear": "That is a complete answer. One short description rarely settles a pattern either way.",
                "Not enough information": "Reasonable: three lines cannot show what happens over months, or under pressure.",
              },
            },
            {
              id: "person-b",
              name: "Person B",
              description:
                "Feels unable to stop, treats every interruption as a threat, skips essential needs, and believes a bad session means personal failure.",
              explanations: {
                "Mostly chosen and flexible":
                  "Nothing here describes room to pause or to choose. If you picked this, it may be worth checking which line led you there.",
                "Mostly pressured and rigid":
                  "The description shows a pattern where the activity presses back and the rest of life gives way. That is the shape of an obsessive pattern.",
                "Mixed or unclear": "That is a complete answer. One short description rarely settles a pattern either way.",
                "Not enough information": "Reasonable: three lines cannot show what happens over months, or under pressure.",
              },
            },
          ],
          boundary:
            "These words describe patterns, not types of people. Nobody is labeled obsessive, and no score or scale is used.",
          plain:
            "Two invented people who both make music most evenings are compared. For each, you can pick mostly chosen and flexible, mostly pressured and rigid, mixed or unclear, or not enough information, and each pick shows an explanation. The two research terms name patterns, not types of people.",
        },
        {
          id: "M1-PREVIEW-L3-b2",
          version: "1.0",
          type: "optional_reflection",
          part: "activity",
          title: "Optional reflection",
          tag: TAG.VERBATIM,
          question: "When I care intensely about something, what helps me stay able to choose instead of feeling controlled by it?",
          fields: [{ id: "reflection", label: "Your reflection (optional)" }],
        },
      ],
    },
  ],
};