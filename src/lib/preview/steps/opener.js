import { TAG } from "../tags";

/**
 * The Life Map stands after "Before you start" and before Module 1.
 * It is not an orientation step and it is not a lesson inside Module 1.
 * The activity block moved here from the front of the Module 1 preview.
 */
export const opener = {
  key: "life-map",
  slug: "life-map",
  title: "Life Map",
  label: "Before Module 1",
  pilot: null,
  kind: "lifemap",
  purpose: "A picture of the life you are already living. It comes after Before you start and before Module 1, and it does not interpret that life.",
  readings: [{ id: "BY-R6", title: "Map the Life You're Actually Living", tag: TAG.REUSED }],
  steps: [
    {
      code: "BY-L6",
      title: "Map the Life You’re Actually Living",
      sourceLesson: "O.6",
      readings: ["BY-R6"],
      blocks: [
        {
          id: "M1-PREVIEW-L1-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "The six moves",
          tag: TAG.PROPOSED,
          body:
            "The map keeps six moves, in recall order:\n\n" +
            "1. Recall places and activities from a recent stretch you remember.\n" +
            "2. Add people or groups. A role or group label is enough.\n" +
            "3. Add optional observations about particular entries.\n" +
            "4. Add former activities, something you have wanted to do, and what affected access.\n" +
            "5. Look across the visible entries for a repeated detail, if you want to.\n" +
            "6. Choose whether to explore anything further, or leave that choice for later.\n\n" +
            "A repeated detail does not yet say why it repeats, whether you like it, or whether you want more of it. Nothing on the map is read as a personality, and nothing is scored.",
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
            { id: "place", label: "A place I spent time", hint: "Including home." },
            { id: "placeless", label: "An activity from that time", hint: "At home, online, while travelling, or in different places." },
            { id: "missing", label: "Missing or not yet reached", hint: "Absence is not the same as wanting it back. Shown with a dashed border." },
          ],
          marks: [
            { id: "plus", label: "More energy after one time", meaning: "One observation, not a permanent description." },
            { id: "minus", label: "Less energy after one time", meaning: "One observation, not a permanent description." },
            { id: "same", label: "About the same energy", meaning: "One observation, not a permanent description." },
            { id: "star", label: "Something about this matters to me", meaning: "Optional. Nothing has to matter." },
            { id: "question", label: "I would like to understand something here", meaning: "Optional. Nothing coming to mind is an answer." },
            { id: "dollar", label: "Money or resources play a role", meaning: "If any. Not assumed to be the main reason." },
            { id: "bang", label: "A part of this holds my attention", meaning: "No requirement to be unusually focused." },
            { id: "blocked", label: "Something makes this difficult", meaning: "If anything. A difficulty is not a plan." },
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
            { id: "noticed-because", label: "The entry or experience that brought this to my attention was" },
            { id: "do-not-know", label: "I do NOT know yet" },
            { id: "small-way", label: "One small way I could learn more about it" },
          ],
          nothingYet: {
            label: "I'm not choosing something to explore right now.",
            message: "That counts as a complete answer. Your answer can change. Text already written in the fields stays saved.",
          },
          plain:
            "This step recalls a recent stretch. You can add cards for a place, an activity, or something missing or not yet reached, then tag an observation about one entry: energy after one time, something that matters, something to understand, a role for money or resources, a part that holds your attention, or a difficulty. You can connect a card to more than one other card. A list view shows the same content without dragging. You can load an invented example map. Optional lines let you name one thing worth understanding better, the entry that brought it to mind, what you do not know yet, and one small way to learn more. Choosing not to explore right now counts as a complete answer.",
        },
      ],
    },
  ],
};