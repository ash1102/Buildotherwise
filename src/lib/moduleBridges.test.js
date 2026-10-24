import test from "node:test";
import assert from "node:assert/strict";
import { BRIDGES, bridgeIn, bridgeOut, bridgeSources } from "./moduleBridges.js";

// Prompt counts as stored on 2026-10-21 (Try boxes, then Reflect boxes, one numbering run).
// If a lesson's prompts change, re-check the bridge indexes against this.
const PROMPTS = {
  "M1-L1": { tries: 2, reflects: 0 },
  "M1-L3": { tries: 3, reflects: 2 }, // Oct 24: optional baseline question added at #4
  "M2-L2": { tries: 10, reflects: 4 },
  "M2-L3": { tries: 5, reflects: 6 },
  "M3-L1": { tries: 2, reflects: 2 },
  "M3-L3": { tries: 3, reflects: 3 },
  "M4-L1": { tries: 4, reflects: 2 },
  "M4-L3": { tries: 2, reflects: 4 },
  "M2-L1": { tries: 9, reflects: 1 },
};

// Slots written by app pieces rather than lesson prompt boxes.
// M1-L1's NoticeFlow saves named answers; its two numbered boxes are never shown.
const EXTRA = { "M1-L1": ["own-caught", "own-dont-know", "possibility"], "M2-L2": [30, 31, 32], "M4-L1": [20, 21] };

test("every bridge source and target points at a real answer slot", () => {
  Object.values(BRIDGES).forEach((bridge) => {
    [...bridge.sources.filter((s) => s.code), ...(bridge.target ? [bridge.target] : [])].forEach((slot) => {
      const shape = PROMPTS[slot.code];
      assert.ok(shape, `${slot.code} is known`);
      assert.ok(slot.index < shape.tries + shape.reflects || (EXTRA[slot.code] || []).includes(slot.index), `${slot.code}#${slot.index} exists`);
    });
  });
});

test("Module 1 bridge reads NoticeFlow's named answers, not the hidden numbered boxes", () => {
  const keys = BRIDGES[1].sources.filter((s) => s.code === "M1-L1").map((s) => s.index);
  assert.ok(keys.every((k) => typeof k === "string"), "no numbered M1-L1 slots");
  assert.equal(BRIDGES[3].sources[0].index, "own-caught");
});

test("bridges run 1→2→3→4→5 and nothing closes Module 5", () => {
  assert.deepEqual([1, 2, 3, 4].map((m) => bridgeOut(m).to), [2, 3, 4, 5]);
  assert.equal(bridgeIn(2).from, 1);
  assert.equal(bridgeOut(5), null);
  assert.equal(bridgeIn(1), null);
});

test("only saved, non-example answers are quoted back", () => {
  const answers = { "M1-L1#own-caught": "Fixing bikes", "M1-L1#own-dont-know": "  ", "M1-L3#1": JSON.stringify("How repair shops work") };
  const items = bridgeSources(BRIDGES[1], answers, { "one-thing": "Fictional: example" });
  assert.deepEqual(items.map((i) => i.value), ["Fixing bikes", "How repair shops work"]);
});
