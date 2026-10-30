import { describe, it, expect } from "vitest";
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

describe("privacy wording", () => {
  it("makes no cross-device promise and no 'only you' claim", () => {
    for (const file of FILES) {
      const text = readFileSync(file, "utf8").replace(/\s+/g, " ");
      expect(text, file).not.toMatch(/any device|another device|follow you to/i);
      expect(text, file).not.toMatch(/only you can (open|see)|only your account can/i);
    }
  });

  it("keeps the explanation that Ashley can see what is stored", () => {
    const settings = readFileSync("src/pages/Settings.jsx", "utf8").replace(/\s+/g, " ");
    expect(settings).toMatch(/Ashley runs the app, so she can see what’s stored/);
    const records = readFileSync("src/components/records/RecordsPrivacyNotice.jsx", "utf8");
    expect(records).toMatch(/technical access to that database/);
  });
});
