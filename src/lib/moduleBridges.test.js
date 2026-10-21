import test from "node:test";
import assert from "node:assert/strict";
import { BRIDGES, bridgeIn, bridgeOut, bridgeSources } from "./moduleBridges.js";

// Prompt counts as stored on 2026-10-21 (Try boxes, then Reflect boxes, one numbering run).
// If a lesson's prompts change, re-check the bridge indexes against this.
const PROMPTS = {
  "M1-L1": { tries: 2, reflects: 0 },
  "M1-L3": { tries: 3, reflects: 1 },
  "M2-L2": { tries: 10, reflects: 4 },
  "M2-L3": { tries: 5, reflects: 6 },
  "M3-L1": { tries: 2, reflects: 2 },
  "M3-L3": { tries: 3, reflects: 3 },
  "M4-L1": { tries: 4, reflects: 2 },
  "M4-L3": { tries: 2, reflects: 4 },
  "M2-L1": { tries: 9, reflects: 1 },
};

test("every bridge source and target points at a real answer slot", () => {
  Object.values(BRIDGES).forEach((bridge) => {
    [...bridge.sources.filter((s) => s.code), ...(bridge.target ? [bridge.target] : [])].forEach((slot) => {
      const shape = PROMPTS[slot.code];
      assert.ok(shape, `${slot.code} is known`);
      assert.ok(slot.index < shape.tries + shape.reflects, `${slot.code}#${slot.index} exists`);
    });
  });
});

test("bridges run 1→2→3→4→5 and nothing closes Module 5", () => {
  assert.deepEqual([1, 2, 3, 4].map((m) => bridgeOut(m).to), [2, 3, 4, 5]);
  assert.equal(bridgeIn(2).from, 1);
  assert.equal(bridgeOut(5), null);
  assert.equal(bridgeIn(1), null);
});

test("only saved, non-example answers are quoted back", () => {
  const answers = { "M1-L1#0": "Fixing bikes", "M1-L1#1": "  ", "M1-L3#1": JSON.stringify("How repair shops work") };
  const items = bridgeSources(BRIDGES[1], answers, { "one-thing": "Fictional: example" });
  assert.deepEqual(items.map((i) => i.value), ["Fixing bikes", "How repair shops work"]);
});
