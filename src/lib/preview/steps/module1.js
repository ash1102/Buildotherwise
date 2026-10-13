import { TAG } from "../tags";

/**
 * Module 1, built in detail for review. The Notice lesson carries the garden
 * flow in the owner's wording; the Life Map lesson carries the six moves and the
 * card interactions; the patterns lesson reuses the approved lesson record and
 * adds the fictional comparison. No Next Decision anywhere in this module.
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
      code: "M1-PREVIEW-L1",
      title: "Map the Life You’re Actually Living",
      sourceLesson: null,
      readings: [],
      blocks: [
        {
          id: "M1-PREVIEW-L1-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "The six moves",
          tag: TAG.PROPOSED,
          body:
            "The map keeps all six moves the lesson already had:\n\n" +
            "1. Draw the week you are actually living.\n" +
            "2. Add what you do that has no place.\n" +
            "3. Mark energy, meaning, curiosity and barriers.\n" +
            "4. Note what is missing or out of reach.\n" +
            "5. Find the threads your attention keeps returning to.\n" +
            "6. Choose something worth exploring, or an honest unknown.\n\n" +
            "Nothing on the map is read as a personality, and nothing is scored.",
        },
        {
          id: "M1-PREVIEW-L1-b2",
          version: "1.0",
          type: "life_map",
          part: "activity",
          title: "Your map",
          tag: TAG.PROPOSED,
          instruction:
            "Add, edit, move and connect cards. The list view works over the same map, so dragging is never needed.",
          kinds: [
            { id: "place", label: "A place I go", hint: "Something that happens somewhere." },
            { id: "placeless", label: "Something without a place", hint: "Reading, walking, talking, making, fixing, helping." },
            { id: "missing", label: "Missing or out of reach", hint: "Shown with a dashed border." },
          ],
          marks: [
            { id: "plus", label: "+", meaning: "gives me energy" },
            { id: "minus", label: "–", meaning: "drains me" },
            { id: "star", label: "*", meaning: "I care about this" },
            { id: "question", label: "?", meaning: "I’m curious about this" },
            { id: "dollar", label: "$", meaning: "mostly for money/resources" },
            { id: "bang", label: "!", meaning: "I get unusually focused here" },
            { id: "blocked", label: "X", meaning: "something gets in the way" },
          ],
          example: {
            label: "Load the invented example map",
            note: "Invented for this preview. Not a participant story.",
            cards: [
              { id: "ex-1", kind: "place", text: "Tuesday evening class at the community centre", marks: ["plus", "star"], x: 0.2, y: 0.25 },
              { id: "ex-2", kind: "placeless", text: "Reading on the bus", marks: ["plus"], x: 0.5, y: 0.12 },
              { id: "ex-3", kind: "place", text: "The repair café on the first Saturday", marks: ["plus", "dollar"], x: 0.79, y: 0.28 },
              { id: "ex-4", kind: "placeless", text: "Drawing while waiting", marks: ["question"], x: 0.62, y: 0.62 },
              { id: "ex-5", kind: "missing", text: "Someone to go with", marks: ["blocked"], x: 0.28, y: 0.68 },
              { id: "ex-6", kind: "missing", text: "Evening childcare", marks: ["blocked"], x: 0.5, y: 0.85 },
            ],
            connections: [
              ["ex-1", "ex-5"],
              ["ex-3", "ex-6"],
              ["ex-2", "ex-4"],
            ],
          },
          fields: [
            { id: "one-thing", label: "One thing I might want to understand better is" },
            { id: "noticed-because", label: "I noticed it because" },
            { id: "do-not-know", label: "I do NOT know yet" },
            { id: "small-way", label: "One small way I could learn more about it" },
          ],
          nothingYet: {
            label: "Nothing on the map is worth exploring yet.",
            message: "That counts as a complete answer. Your answer can change.",
          },
          plain:
            "This step is a map of your week. You can add cards of three kinds (a place you go, something without a place, something missing or out of reach), mark them with + – * ? $ ! X, and connect two cards. A list view shows the same content without dragging. You can load an invented example map. Four optional lines let you name one thing worth understanding better, why you noticed it, what you do not know yet, and one small way to learn more. If nothing on the map is worth exploring yet, that counts as a complete answer.",
        },
      ],
    },
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
          title: "Step 2 — the garden example",
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
          title: "Step 2 — sort four statements",
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
          title: "Step 3 — your own thread",
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
          title: "Step 3 — the example",
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
          title: "Step 4 — a possibility",
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