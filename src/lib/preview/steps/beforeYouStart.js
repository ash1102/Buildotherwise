import { TAG } from "../tags";

/**
 * "Before you start" — what used to be Module 0. It keeps its ground rules,
 * rights and setup lessons, shown as its own section, unnumbered. The
 * Life Map is the next section, still before Module 1, so it is
 * not one of these steps. The reading and lesson text are rendered from the
 * existing records; the two verbatim lessons carry the owner's own wording.
 */
export const beforeYouStart = {
  key: "before-you-start",
  slug: "before-you-start",
  title: "Before you start",
  label: "Before you start",
  pilot: null,
  kind: "orientation",
  purpose: "The ground rules, your rights and your own setup, before any module.",
  /** The readings already stored in the app, shown exactly as they are. */
  readings: [
    { id: "BY-R1", title: "What this pilot is and isn't", tag: TAG.REUSED },
    { id: "BY-R2", title: "Rights, privacy, and separate consent", tag: TAG.REUSED },
    { id: "BY-R3", title: "Group Code (Builder's Code) and permission-based feedback", tag: TAG.REUSED },
    { id: "BY-R4", title: "Participation and Support Plan", tag: TAG.REUSED },
    { id: "BY-R5", title: "Your participation decision and handoff", tag: TAG.REUSED },
  ],
  steps: [
    {
      code: "BY-L1",
      title: "What this is (and isn't)",
      sourceLesson: "O.1",
      readings: ["BY-R1"],
      blocks: [],
    },
    {
      code: "BY-L2",
      title: "Your rights and privacy",
      sourceLesson: "O.2",
      readings: ["BY-R2"],
      /** This step carries its own wording, so the lesson record's earlier text is not printed under it. */
      ownWording: true,
      blocks: [
        {
          id: "BY-L2-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "What is not confirmed yet",
          tag: TAG.NEEDS_WORDING,
          body:
            "Not confirmed yet: the program’s privacy notice, concern route, and consent forms are still being set up. Staff should tell you that plainly instead of guessing. Nothing on this page is a consent form, and no one needs your addiction, legal, or medical history to let you in.",
        },
        {
          id: "BY-L2-b2",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "Five separate choices",
          tag: TAG.NEEDS_WORDING,
          instruction:
            "Each of these is its own choice. Answer any of them with yes, no, or not now, or skip the whole thing.",
          groups: [
            { id: "taking-part", question: "Taking part", options: ["Yes", "No", "Not now"] },
            { id: "evaluation", question: "Evaluation", options: ["Yes", "No", "Not now"] },
            { id: "recording", question: "Recording", options: ["Yes", "No", "Not now"] },
            { id: "story-use", question: "Story use", options: ["Yes", "No", "Not now"] },
            { id: "follow-up", question: "Follow-up", options: ["Yes", "No", "Not now"] },
          ],
          plain:
            "Five separate choices are offered here: taking part, evaluation, recording, story use, and follow-up. Each can be answered yes, no, or not now, and each can be left unanswered.",
        },
      ],
    },
    {
      code: "BY-L3",
      title: "Group Code and permission-based feedback",
      sourceLesson: "O.3",
      readings: ["BY-R3"],
      /**
       * This step carries its own wording, so neither the lesson record's earlier text nor the
       * reading holding the same words is printed under it. The reading stays in the library.
       */
      ownWording: true,
      hideReading: true,
      blocks: [
        {
          id: "BY-L3-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Group Code (also called the Builder’s Code)",
          tag: TAG.VERBATIM,
          body:
            "The working Group Code (also called the Builder’s Code) is a group agreement, not a loyalty pledge. You don’t have to call yourself a builder to use it:\n\n" +
            "• Ask before giving advice, challenging an interpretation, or sharing someone’s work.\n" +
            "• Respect “no,” “not now,” passing, and changing one’s mind.\n" +
            "• Speak about an action or piece of evidence; do not diagnose or assign an identity.\n" +
            "• Do not repeat someone’s personal story or record/photograph them without specific permission.\n" +
            "• Offer only support you can actually provide. No fixing, rescuing, policing, or private-life monitoring.\n" +
            "• Use the program’s concern route when a boundary is crossed.\n\n" +
            "Acknowledgment means the agreements were reviewed, not that someone surrendered rights. Majority preference cannot remove the right to pass or privacy protections.",
        },
        {
          id: "BY-L3-b2",
          version: "1.0",
          type: "example",
          part: "lesson",
          title: "The supply shelf",
          invented: true,
          tag: TAG.VERBATIM,
          body:
            "Someone has sketched a plan for organizing a shared supply shelf. A peer thinks a different layout would work better.\n\n" +
            "1. Peer asks: “Would you like a question, a suggestion, or no feedback right now?”\n" +
            "2. Participant chooses, including “no.” If no, peer responds: “Okay.” End the exchange without persuasion.\n" +
            "3. If a question is welcome: “What would you want someone to find first?” If a suggestion is welcome: “Would putting the most-used items nearest the front help?”\n" +
            "4. Participant can accept, reject, or revise the idea. Peer checks whether they understood the choice.\n" +
            "5. Debrief: “Who made the decision? What would pressure have looked like?”\n\n" +
            "Solo option: facilitator reads both roles; participant points to where permission was respected.",
        },
        {
          id: "BY-L3-b3",
          version: "1.0",
          type: "scenario_choice",
          part: "activity",
          title: "Practice one response",
          tag: TAG.VERBATIM,
          instruction:
            "Using the supply-shelf scenario, or observing: choose one response. No personal project is required.",
          groups: [
            {
              id: "response",
              question: "Your response in the scenario",
              options: ["A question is okay.", "I’d like a suggestion.", "No feedback right now."],
            },
          ],
          fields: [
            {
              id: "clarification",
              label: "One Code clarification you want discussed (optional)",
            },
          ],
          plain:
            "The practice offers three responses: a question is okay, a suggestion is welcome, or no feedback right now. You can also note one Code clarification you want discussed. Observing and passing are legitimate.",
        },
        {
          id: "BY-L3-b4",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Concern route",
          tag: TAG.NEEDS_WORDING,
          body:
            "The concern route must match the confirmed complaint or alternative contact once staff complete it. Until then, it is not yet confirmed. No contact is invented here.",
        },
      ],
    },
    {
      code: "BY-L4",
      title: "Participation and Support Plan",
      sourceLesson: "O.4",
      readings: ["BY-R4"],
      /**
       * This step carries its own wording, so neither the lesson record's earlier text nor the
       * reading holding the same words is printed under it. The reading stays in the library.
       */
      ownWording: true,
      hideReading: true,
      blocks: [
        {
          id: "BY-L4-b1",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "The Participation and Support Plan",
          tag: TAG.VERBATIM,
          body:
            "The Participation and Support Plan is short, private, and every line is optional:\n\n" +
            "• How I like to take part: aloud · in writing · privately · observing\n" +
            "• Access needs: reading or language support, hearing or vision, seating or mobility, breaks, schedule\n" +
            "• Technology limits: device, data, offline or paper options\n" +
            "• Life logistics: childcare, transportation, work shifts\n" +
            "• Support I’d want: none is a fine answer\n" +
            "• Where I’d raise a concern: the confirmed route (or “not yet confirmed”)\n" +
            "• Optional starting question: something you’re curious about. “I don’t know yet” is welcome.\n\n" +
            "We don’t ask for diagnoses, addiction, legal, or medical histories.",
        },
        {
          id: "BY-L4-b2",
          version: "1.0",
          type: "example",
          part: "lesson",
          title: "Example",
          invented: false,
          tag: TAG.VERBATIM,
          body:
            "“Writing privately. Paper handouts, please. Phone only, limited data. I work Saturdays. No extra support for now. Starting question: I don’t know yet.”",
        },
        {
          id: "BY-L4-b3",
          version: "1.0",
          type: "optional_reflection",
          part: "activity",
          title: "Fill in any lines you want",
          tag: TAG.VERBATIM,
          question: "Fill in any lines you want. Leave the rest blank. Private and pass routes count.",
          fields: [
            { id: "how-i-take-part", label: "How I like to take part" },
            { id: "access-needs", label: "Access needs" },
            { id: "technology-limits", label: "Technology limits" },
            { id: "life-logistics", label: "Life logistics" },
            { id: "support", label: "Support I’d want (none is a fine answer)" },
            { id: "concern", label: "Where I’d raise a concern" },
            { id: "starting-question", label: "Optional starting question" },
          ],
        },
        {
          id: "BY-L4-b4",
          version: "1.0",
          type: "teaching",
          part: "lesson",
          title: "Not a consent form",
          tag: TAG.VERBATIM,
          body:
            "This plan is not a consent form. Consent choices are a separate record completed later. You can update the plan anytime.",
        },
      ],
    },
    {
      // Oct 24, 2026: matches the live Getting Started step 3 (the learning agreement), merged Oct 23.
      code: "BY-L5",
      title: "Make this experience yours",
      sourceLesson: "O.5",
      readings: ["BY-R5"],
      ownWording: true,
      hideReading: true,
      blocks: [
        {
          id: "BY-L5-b1",
          version: "2.0",
          type: "teaching",
          part: "lesson",
          title: "Make this experience yours",
          tag: TAG.VERBATIM,
          body:
            "Entrepalooza isn’t about following someone else’s plan. It’s about exploring what matters to you, trying new things, and deciding what to do with what you discover.\n\nYou don’t need to know your destination yet.",
        },
        {
          id: "BY-L5-b2",
          version: "2.0",
          type: "teaching",
          part: "lesson",
          title: "This is yours",
          tag: TAG.PROPOSED,
          body: "This is yours. You can change your answers anytime. To pause or leave, email Start@buildotherwise.org. No reason needed.",
        },
        {
          id: "BY-L5-b3",
          version: "2.0",
          type: "scenario_choice",
          part: "activity",
          title: "Your learning agreement",
          tag: TAG.PROPOSED,
          instruction: "Pick one for each. No explanation needed.",
          groups: [
            {
              id: "why",
              question: "What brings you here?",
              options: [
                { id: "figure-out", label: "I’m trying to figure out what I want." },
                { id: "ready-change", label: "I’m ready for something to change." },
                { id: "ideas", label: "I have ideas I want to explore." },
                { id: "curious", label: "I’m curious. That’s all I know." },
                { id: "something-else", label: "Something else" },
              ],
            },
            {
              id: "approach",
              question: "How do you want to approach this?",
              options: [
                { id: "own-pace", label: "At my own pace." },
                { id: "small-step", label: "One small step at a time." },
                { id: "not-sure", label: "I’m not sure yet." },
              ],
            },
          ],
          plain:
            "Two picks. What brings you here: trying to figure out what I want, ready for something to change, ideas to explore, curious, or something else. How to approach it: at my own pace, one small step at a time, or not sure yet.",
        },
        {
          id: "BY-L5-b4",
          version: "2.0",
          type: "optional_reflection",
          part: "activity",
          title: "In your words",
          tag: TAG.PROPOSED,
          showWhen: { blockId: "BY-L5-b3", group: "why", in: ["something-else"] },
          question: "What brings you here, in your words?",
          fields: [{ id: "why-other", label: "Your words, no right answer..." }],
        },
        {
          id: "BY-L5-b5",
          version: "2.0",
          type: "optional_reflection",
          part: "activity",
          title: "Optional note",
          tag: TAG.VERBATIM,
          question: "Anything else you want to remember about why you’re starting? (Optional)",
          fields: [{ id: "note", label: "Your words, no right answer..." }],
        },
        {
          id: "BY-L5-b6",
          version: "2.0",
          type: "takeaway",
          part: "takeaway",
          title: "Your learning agreement",
          tag: TAG.VERBATIM,
          body: "I give myself permission to explore, question, experiment, change direction, and move at a pace that works for me.",
        },
      ],
    },
  ],
};