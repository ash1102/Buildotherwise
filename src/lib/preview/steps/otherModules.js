import { TAG } from "../tags";

/**
 * Modules 3, 5, 6, 7, 8, 9 and 10. Module 2 is built in its own file. The lesson text comes from the existing
 * lesson records; the readings for Modules 2, 3 and 5 are the owner's shortened
 * versions, and the readings for Modules 6 to 10 are not written yet, so they
 * are shown as empty draft slots rather than invented text.
 *
 * Next Decisions appear only where the curriculum puts them: after a try or a
 * review, in Modules 2 to 9.
 */
const draftReading = (id, title) => ({ id, title, tag: TAG.DRAFT, draft: true });

const shortReading = (id, title) => ({ id, title, tag: TAG.NEEDS_FULL_TEXT });

export const otherModules = [
  {
    key: "module-3",
    slug: "test-how-i-operate",
    order: 3,
    title: "Test How I Operate",
    pilot: "pilot_one",
    kind: "module",
    purpose: "Change one part of the setup and see what is actually you.",
    readings: [
      shortReading("M3-R1", "Maybe It’s Not Just You. Look at the Setup."),
      shortReading("M3-R2", "Change One Thing and See What You Learn"),
      shortReading("M3-R3", "One Result Is a Clue, Not a Personality"),
    ],
    steps: [
      { code: "M3-L1", title: "Understand the setup around a task", sourceLesson: "M3-L1", readings: ["M3-R1"], blocks: [] },
      { code: "M3-L2", title: "Try changing one part of the setup", sourceLesson: "M3-L2", readings: ["M3-R2"], blocks: [] },
      { code: "M3-L3", title: "Review what helped and what it cost", sourceLesson: "M3-L3", readings: ["M3-R3"], blocks: [], decision: true },
    ],
  },
  {
    key: "module-5",
    slug: "protect-what-works",
    order: 5,
    title: "Protect What Works and Navigate Intensity",
    pilot: "pilot_one",
    kind: "module",
    purpose: "Keep what holds you steady, and handle intensity without a verdict.",
    readings: [
      shortReading("M5-R1", "Intensity Is Not Automatically the Problem"),
      shortReading("M5-R2", "Protect What Works or Change What Needs Changing"),
      shortReading("M5-R3", "A Hunch Can Start a Question. It Cannot Finish One."),
    ],
    steps: [
      { code: "M5-L1", title: "Understand the sequence before you map it", sourceLesson: "M5-L1", readings: ["M5-R1"], blocks: [], closesPilot: false },
      { code: "M5-L2", title: "Protect what works or try one small response", sourceLesson: "M5-L2", readings: ["M5-R2"], blocks: [] },
      {
        code: "M5-L3",
        title: "Check an impression and close Pilot 1",
        sourceLesson: "M5-L3",
        readings: ["M5-R3"],
        blocks: [],
        decision: true,
        closesPilot: true,
      },
    ],
  },
  {
    key: "module-6",
    slug: "check-reality-outside-yourself",
    order: 6,
    title: "Check Reality Outside Yourself",
    pilot: "optional_after",
    kind: "module",
    purpose: "Ask people and reality, not only your own head.",
    readings: [draftReading("M6-R1", "Draft reading: to be written from this module’s own lesson text")],
    steps: [
      { code: "M6-L1", title: "Start with a question, not a pitch", sourceLesson: "M6-L1", readings: ["M6-R1"], blocks: [] },
      { code: "M6-L2", title: "Gather and sort outside evidence", sourceLesson: "M6-L2", readings: [], blocks: [] },
      { code: "M6-L3", title: "Choose a branch and investigate", sourceLesson: "M6-L3", readings: [], blocks: [] },
      { code: "M6-L4", title: "Check fit and choose your next discovery decision", sourceLesson: "M6-L4", readings: [], blocks: [], decision: true },
    ],
  },
  {
    key: "module-7",
    slug: "name-do-notice-the-try",
    order: 7,
    title: "Name the Try, Do the Try, Notice What It Taught",
    pilot: "optional_after",
    kind: "module",
    purpose: "Name one bounded try, do it or plan it, and record what it taught.",
    readings: [draftReading("M7-R1", "Draft reading: to be written from this module’s own lesson text")],
    steps: [
      { code: "M7-L1", title: "Name the try", sourceLesson: "M7-L1", readings: ["M7-R1"], blocks: [] },
      {
        code: "M7-L2",
        title: "Do the try",
        sourceLesson: "M7-L2",
        readings: [],
        blocks: [
          {
            id: "M7-L2-b1",
            version: "1.0",
            type: "teaching",
            part: "lesson",
            title: "Ways to complete it",
            tag: TAG.VERBATIM,
            body:
              "Each counts the same when you record what happened, or why you did not attempt it:\n\n" +
              "• Attempt it\n" +
              "• Attempt it with support or an adaptation\n" +
              "• Plan only, if there is no safe chance to do it now\n" +
              "• Observe a demonstration\n\n" +
              "You do not need an ethical invitation, a customer, or a yes to finish. An ethical offer or invitation is one kind of try. It is not required.",
          },
          {
            id: "M7-L2-b2",
            version: "1.0",
            type: "scenario_choice",
            part: "activity",
            title: "How this try was completed",
            tag: TAG.VERBATIM,
            instruction: "Four ways, no more. Every one counts the same.",
            groups: [
              {
                id: "way",
                question: "How did this try get completed?",
                options: [
                  { id: "attempt", label: "Attempt it" },
                  { id: "with-support", label: "Attempt it with support or an adaptation" },
                  { id: "plan-only", label: "Plan only" },
                  { id: "observe", label: "Observe a demonstration" },
                ],
              },
            ],
            plain:
              "Four equal ways to complete the try: attempt it, attempt it with support or an adaptation, plan only, or observe a demonstration.",
          },
          {
            id: "M7-L2-b3",
            version: "1.0",
            type: "optional_reflection",
            part: "activity",
            title: "Write down",
            tag: TAG.VERBATIM,
            question: "What happened when you tried a small part of this, or tried your proposed response?",
            fields: [
              { id: "did", label: "What I did, or why I did not" },
              { id: "taught", label: "What it taught, even if the answer is not much yet" },
              { id: "unknown", label: "If I did not attempt it: why I could not, and what remains unknown" },
            ],
          },
          {
            id: "M7-L2-b4",
            version: "1.0",
            type: "teaching",
            part: "lesson",
            title: "Boundary",
            tag: TAG.VERBATIM,
            body:
              "Feedback and disappointment are support if they show up. They are not the lesson. Do not add a bigger try or start a second try in this same session because the first one felt thin. Stay inside the limit and the stop rule. No payment, public exposure, false scarcity, urgency tricks, or recruiting vulnerable people unless that was already approved.",
          },
        ],
      },
      { code: "M7-L3", title: "Notice what the try taught", sourceLesson: "M7-L3", readings: [], blocks: [], decision: true },
    ],
  },
  {
    key: "module-8",
    slug: "check-what-this-costs",
    order: 8,
    title: "Check What This Costs",
    pilot: "optional_after",
    kind: "module",
    purpose: "Count the real cost and set an affordability boundary.",
    readings: [draftReading("M8-R1", "Draft reading: to be written from this module’s own lesson text")],
    steps: [
      { code: "M8-L1", title: "Map what this try or next step actually cost", sourceLesson: "M8-L1", readings: ["M8-R1"], blocks: [] },
      { code: "M8-L2", title: "Count labour, name real constraints, set an affordability boundary", sourceLesson: "M8-L2", readings: [], blocks: [] },
      {
        code: "M8-L3",
        title: "Choose a financially honest path",
        sourceLesson: "M8-L3",
        readings: [],
        blocks: [
          {
            id: "M8-L3-b1",
            version: "1.0",
            type: "teaching",
            part: "lesson",
            title: "Financially honest paths",
            tag: TAG.VERBATIM,
            body:
              "Choosing paid work for income now is a financially honest, full-member path.\n\n" +
              "This is not financial advice. Crisis, debt, tax or benefits questions belong with a qualified counselor.",
          },
        ],
        decision: true,
      },
    ],
  },
  {
    key: "module-9",
    slug: "choose-a-direction-that-fits-capacity",
    order: 9,
    title: "Choose a Direction That Fits Capacity",
    pilot: "optional_after",
    kind: "module",
    purpose: "Choose a direction that fits the capacity you actually have.",
    readings: [draftReading("M9-R1", "Draft reading: to be written from this module’s own lesson text")],
    steps: [
      { code: "M9-L1", title: "Review the evidence and redefine success-now", sourceLesson: "M9-L1", readings: ["M9-R1"], blocks: [] },
      { code: "M9-L2", title: "Pick a direction card that fits your capacity", sourceLesson: "M9-L2", readings: [], blocks: [] },
      { code: "M9-L3", title: "Set the next decision for continuity", sourceLesson: "M9-L3", readings: [], blocks: [], decision: true },
    ],
  },
  {
    key: "module-10",
    slug: "build-the-tribe",
    order: 10,
    title: "Build the Tribe",
    pilot: "optional_after",
    kind: "module",
    purpose: "Say what a tribe is for, and choose your place in it.",
    readings: [draftReading("M10-R1", "Every exit will still belong")],
    steps: [
      { code: "M10-L1", title: "Who we are together", sourceLesson: "M10-L1", readings: ["M10-R1"], blocks: [] },
      { code: "M10-L2", title: "How we stay connected", sourceLesson: "M10-L2", readings: [], blocks: [] },
      {
        code: "M10-L3",
        title: "Choose your place in the tribe",
        sourceLesson: "M10-L3",
        readings: [],
        blocks: [
          {
            id: "M10-L3-b1",
            version: "1.0",
            type: "teaching",
            part: "lesson",
            title: "What exists today",
            tag: TAG.NEEDS_WORDING,
            body:
              "What exists today: no ongoing group, events, or follow-up are set up yet. Anything suggested here is an idea, not a service anyone has promised.",
          },
          {
            id: "M10-L3-b2",
            version: "1.0",
            type: "takeaway",
            part: "takeaway",
            title: "Closing line",
            tag: TAG.VERBATIM,
            body: "You’re still of this tribe if you want to be.",
          },
        ],
      },
    ],
  },
];