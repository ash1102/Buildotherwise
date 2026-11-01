import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FILES = [
  "src/components/Layout.jsx",
  "src/components/records/RecordsPrivacyNotice.jsx",
  "src/components/workbook/PrivacyNote.jsx",
  "src/lib/aspects.js",
  "src/pages/About.jsx",
  "src/pages/CurriculumHome.jsx",
  "src/pages/LifeMapPage.jsx",
  "src/pages/Login.jsx",
  "src/pages/Register.jsx",
  "src/pages/Settings.jsx",
  "src/pages/preview/PreviewNotes.jsx",
];

const flat = (file) => readFileSync(file, "utf8").replace(/\s+/g, " ");

test("no cross-device promise and no 'only you' claim in participant-facing copy", () => {
  for (const file of FILES) {
    const text = flat(file);
    assert.doesNotMatch(text, /any device|another device|follow you to/i, file);
    assert.doesNotMatch(text, /only you can (open|see)|only your account can/i, file);
  }
});

test("administrative access is still explained", () => {
  assert.match(flat("src/pages/Settings.jsx"), /Build Otherwise runs this app, so our team can see what’s stored on it/);
  assert.match(flat("src/components/records/RecordsPrivacyNotice.jsx"), /technical access to that database/);
});
