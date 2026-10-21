import test from "node:test";
import assert from "node:assert/strict";
import { WAYS, WAY_KINDS, NEEDS, missingNeeds, wayForRoute } from "./discoveryWays.js";

// Card ids in DiscoverySampler's OPTIONS.
const CARDS = ["repair", "design", "services", "making", "music", "nature", "organizing", "community", "investigating", "own"];
const NEED_IDS = new Set(NEEDS.map((n) => n.id));

test("every card has all four ways in, with known needs", () => {
  CARDS.forEach((id) => {
    WAY_KINDS.forEach((kind) => {
      const way = WAYS[id]?.[kind.id];
      assert.ok(way && way.text, `${id}.${kind.id}`);
      way.needs.forEach((need) => assert.ok(NEED_IDS.has(need), `${id}.${kind.id} need ${need}`));
    });
  });
});

test("nobody is locked out: each card has a way that needs nothing, besides 'not yet'", () => {
  CARDS.forEach((id) => {
    const open = ["try", "watch", "ask"].filter((k) => WAYS[id][k].needs.length === 0);
    assert.ok(open.length >= 1, id);
    assert.equal(WAYS[id].notYet.needs.length, 0, `${id} notYet`);
  });
});

test("routes map to ways, and missing needs are flagged", () => {
  assert.equal(wayForRoute("I couldn't access an opportunity yet"), "notYet");
  assert.equal(wayForRoute("I observed or spoke with someone"), "watch");
  assert.equal(wayForRoute("I tried something"), "try");
  assert.deepEqual(missingNeeds(WAYS.community.watch, ["internet"]), ["internet"]);
  assert.deepEqual(missingNeeds(WAYS.design.try, ["internet", "travel"]), []);
});
