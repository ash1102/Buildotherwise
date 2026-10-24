import assert from "node:assert/strict";
import test from "node:test";

function installMemoryStorage() {
  const data = new Map();
  const storage = {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage, dispatchEvent() {}, addEventListener() {}, removeEventListener() {} };
  globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
}

installMemoryStorage();
const { readStore, writeStore } = await import("./store.js");
const { MAP_PICK_KEY, MAP_PICK_FIELDS, exploreLines } = await import("./lifeMap.js");
const { BRIDGES, bridgeSources } = await import("./moduleBridges.js");
const { saveAnswer, listEntries } = await import("./journal.js");

// The snapshot's two reflection fields, the way LifeSnapshot writes them.
const setField = (id, value) => writeStore(MAP_PICK_KEY, { ...(readStore(MAP_PICK_KEY, {}) || {}), [id]: value });
const keepInJournal = (id, label) =>
  saveAnswer({ lessonCode: "O.6", lessonTitle: "Life Snapshot", promptKey: `${MAP_PICK_KEY}#${id}`, promptLabel: label, body: readStore(MAP_PICK_KEY, {})[id] });

test("the first reflection answer reaches the Module 1 to 2 bridge", () => {
  setField("one-thing", "Why I keep fixing other people's cars");
  const items = bridgeSources(BRIDGES[1], {}, readStore(MAP_PICK_KEY, {}));
  const fromMap = items.find((item) => item.key === "map:one-thing");
  assert.equal(fromMap?.value, "Why I keep fixing other people's cars");
  assert.equal(fromMap?.label, "From your Life Map");
});

test("the second reflection answer is a known field, so downloads and the full map show it", () => {
  setField("more-less", "More time outside");
  assert.ok(MAP_PICK_FIELDS.some((field) => field.id === "more-less"));
  assert.ok(exploreLines(readStore(MAP_PICK_KEY, {})).some((line) => line.text === "More time outside"));
});

test("saving puts each answer in the journal once, and saving again updates it instead of duplicating", () => {
  keepInJournal("one-thing", "Is there anything here you'd like to understand better?");
  keepInJournal("more-less", "Is there anything here you'd want more of, or less of?");
  setField("one-thing", "Why I keep fixing cars, and whether I'd want to do it for pay");
  keepInJournal("one-thing", "Is there anything here you'd like to understand better?");
  const entries = listEntries().filter((entry) => String(entry.prompt).startsWith("lifeMapPick#"));
  assert.equal(entries.length, 2);
  assert.equal(entries.find((entry) => entry.prompt === "lifeMapPick#one-thing").body, "Why I keep fixing cars, and whether I'd want to do it for pay");
});

test("choosing not to explore right now keeps the words but leaves the bridge empty", () => {
  setField("nothing_yet", true);
  const pick = readStore(MAP_PICK_KEY, {});
  assert.equal(bridgeSources(BRIDGES[1], {}, pick).length, 0);
  assert.equal(pick["one-thing"], "Why I keep fixing cars, and whether I'd want to do it for pay");
  setField("nothing_yet", false);
  assert.equal(bridgeSources(BRIDGES[1], {}, readStore(MAP_PICK_KEY, {})).length, 1);
});

test("both the reflection and the journal are kept in the account, not just on the device", async () => {
  const { SYNCED_KEYS } = await import("./store.js");
  assert.ok(SYNCED_KEYS.has("lifeMapPick"));
  assert.ok(SYNCED_KEYS.has("journal"));
});
