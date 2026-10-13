/**
 * The review sheet's own words: what changed, what is still missing, and what
 * was tested. Written for the reviewer, listed so nothing has to be asked twice.
 */
export const SCHEMA_CHANGES = [
  {
    item: "New entity: PreviewResponse",
    detail:
      "Stores preview work only: owner, section, module label, step code, step title, block ID, block version, block type, prompt label, the response itself, and a single carry-forward flag. No eligibility, diagnosis, recovery or monitoring fields.",
  },
  {
    item: "Access rules on PreviewResponse",
    detail:
      "Create, read, update and delete are all limited to the person who created the record. There is no staff read: the program team cannot see preview notes, whichever role they hold.",
  },
  {
    item: "Nothing else was changed",
    detail:
      "The Lesson, Module, LibraryResource, journal, Life Map and Feedback records were read, not altered. No learner record was edited, migrated or deleted, and no new lesson or map system was created.",
  },
  {
    item: "Proposed, not applied: a blocks field on Lesson",
    detail:
      "The interaction blocks currently live in the app's own preview content, versioned per block. If you approve them, the same block definitions move onto the Lesson records as a blocks field, using the stable IDs and versions shown here.",
  },
];

export const CONTENT_GAPS = [
  {
    item: "Readings needing your full text",
    detail:
      "Modules 1, 2, 3 and 5 are showing the shortened versions already stored in the library, each tagged “Needs full text from Ashley.”",
  },
  {
    item: "Module 2's exposure menu",
    detail:
      "The exposure menu is still a labelled placeholder, now shown inside the step as “not written yet”. It waits on the group, location and partners, and nothing has been invented to fill it.",
  },
  {
    item: "Readings not written yet",
    detail:
      "Module 10's reading is titled “Every exit will still belong” and marked as a draft. Before you start and Modules 6, 7, 8 and 9 have an empty draft slot rather than invented text.",
  },
  {
    item: "Module 4's swappable example",
    detail:
      "The dropped “twenty minutes” example is removed from Reading 1 when it renders, and the proposed “unclear meeting link” block sits in its place, tagged as not approved. Approving or replacing it needs no rebuild.",
  },
  {
    item: "Wording still needing your sign-off",
    detail:
      "The privacy note in Before you start, the concern-route line, and Module 10's “What exists today” note are all tagged “Needs Ashley’s wording.” The rights reminder that briefly opened Module 1's Notice step was removed, because the rights live in Before you start.",
  },
  {
    item: "One judgement call to confirm",
    detail:
      "Next Decisions appear on Modules 2 to 9 only, as the brief states. Module 1's patterns step carries a decision in the existing lesson record; the preview does not show one, so Module 1 has no decision at all.",
  },
  {
    item: "Footer wording",
    detail:
      "The pilot preview disclaimer sits on the preview pages. The live footer was left as it is, because changing it would change the published workbook rather than the review copy.",
  },
];

/** Kept out of the participant view entirely. */
export const FACILITATOR_NOTES = [
  { item: "Module 1, check-in", detail: "Here/pass check-in at the start of the step. No app field, and no required response." },
  {
    item: "How the module words work",
    detail:
      "Notice → Try → Reflect → Decide describes the module, not every lesson. Decide comes later in Module 1.",
  },
  { item: "Pass", detail: "Pass is a participation right, not an eighth decision. It is never recorded as a decision." },
];

export const TESTS = [
  { item: "Module 1 Life Map", detail: "Cards added and edited, marks toggled, connections made and removed, list view used as an equal route, example map loaded, answer saved and deleted again." },
  { item: "Notice step", detail: "Sort sorted and cleared with Look again, explanations announced, both entry routes reaching their own step 3, closing line and take-away in your words." },
  { item: "Patterns step", detail: "A pick on each invented person showing its explanation, mixed and unclear accepted, optional reflection saved." },
  {
    item: "Module 2 steps",
    detail:
      "The boundary card, the exposure-menu placeholder, the four ways in, the observation-and-interpretation sort and the outcome choice all render with their status tags. A way in was chosen, saved, read back from the account and deleted again. The lesson's own teaching and prompts still print unchanged.",
  },
  { item: "Saving and notes", detail: "Save, re-open, correct, delete and export checked against your own account only." },
  { item: "Not automatically verified", detail: "Screen reader announcements, keyboard-only completion, real-browser mobile tap, contrast, reduced motion, and shared-device behaviour still need testing by hand before this is called accessible or ready." },
];

export const NOT_DONE = [
  "Nothing was published, and no route in the live workbook was replaced.",
  "Nobody was enrolled, invited or assigned, and finishing Module 5 does not assign Module 6.",
  "The live Journal, Life Map, Discovery Map and Library pages keep working exactly as they did.",
  "No learner data was read, changed, exported or deleted.",
];