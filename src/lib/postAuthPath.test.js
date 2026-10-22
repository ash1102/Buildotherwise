import assert from "node:assert/strict";
import test from "node:test";
import { GS_CODES, gettingStartedFinished } from "./gettingStartedProgress.js";
import { pathRequiresGettingStarted, postAuthDestination } from "./postAuthPath.js";

const lessons = GS_CODES.map((code) => ({ code, module_order: 0, title: code }));

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
  globalThis.window = {
    localStorage: storage,
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {},
  };
  return data;
}

test("home, modules, and workbook lessons are behind the gate", () => {
  assert.equal(pathRequiresGettingStarted("/"), true);
  assert.equal(pathRequiresGettingStarted("/?from=login"), true);
  assert.equal(pathRequiresGettingStarted("/module/find-something-worth-exploring"), true);
  assert.equal(pathRequiresGettingStarted("/lesson/M1-L1"), true);
  assert.equal(pathRequiresGettingStarted("/lesson/O.6"), true);
  assert.equal(pathRequiresGettingStarted("/lesson/O.1"), false);
  assert.equal(pathRequiresGettingStarted("/getting-started"), false);
  assert.equal(pathRequiresGettingStarted("/oauth/consent?ctx=abc"), false);
});

test("an unfinished non-admin leaves returnTo for the first open Getting Started step", () => {
  const user = { id: "participant-new", role: "user" };
  assert.equal(
    postAuthDestination({ user, returnTo: "/", lessons, answers: {}, states: {} }),
    "/lesson/O.1"
  );
  assert.equal(
    postAuthDestination({
      user,
      returnTo: "/module/find-something-worth-exploring",
      lessons,
      answers: { "O.1#0": "one thing" },
      states: {},
    }),
    "/lesson/O.2"
  );
  assert.equal(
    postAuthDestination({ user, returnTo: "/lesson/M1-L1", lessons, answers: {}, states: {} }),
    "/lesson/O.1"
  );
});

test("admins and finished participants keep returnTo, and other flows are left alone", () => {
  const done = Object.fromEntries(GS_CODES.map((code) => [`${code}#0`, "saved"]));
  assert.equal(gettingStartedFinished(lessons, done, {}), true);
  assert.equal(
    postAuthDestination({ user: { id: "admin-1", role: "admin" }, returnTo: "/", lessons, answers: {}, states: {} }),
    "/"
  );
  assert.equal(
    postAuthDestination({
      user: { id: "admin-1", role: "admin" },
      returnTo: "/module/find-something-worth-exploring",
      lessons,
      answers: {},
      states: {},
    }),
    "/module/find-something-worth-exploring"
  );
  assert.equal(
    postAuthDestination({ user: { id: "p", role: "user" }, returnTo: "/", lessons, answers: done, states: {} }),
    "/"
  );
  assert.equal(
    postAuthDestination({
      user: { id: "p", role: "user" },
      returnTo: "/oauth/consent?ctx=abc",
      lessons,
      answers: {},
      states: {},
    }),
    "/oauth/consent?ctx=abc"
  );
  assert.equal(
    postAuthDestination({ user: { id: "p", role: "user" }, returnTo: "/lesson/O.4", lessons, answers: {}, states: {} }),
    "/lesson/O.4"
  );
});

test("Getting Started progress is stored per account, not per browser", async () => {
  installMemoryStorage();
  const { setProgressUserId } = await import("./progressScope.js");
  const { readStore } = await import("./store.js");
  const { getAnswer, setAnswer, setLifeMap, setStepState } = await import("./workbook.js");
  const { addEntry, listEntries } = await import("./journal.js");

  setProgressUserId(null);
  for (const code of GS_CODES) {
    setAnswer(code, 0, "answered on this browser");
    setStepState(code, "Pass");
  }

  const browserAnswers = readStore("answers", {});
  assert.equal(gettingStartedFinished(lessons, browserAnswers, readStore("stepState", {})), true);

  setProgressUserId("participant-new");
  assert.equal(getAnswer("O.1", 0), "");
  assert.equal(gettingStartedFinished(lessons, readStore("answers::user::participant-new", {}), readStore("stepState::user::participant-new", {})), false);
  assert.equal(
    postAuthDestination({
      user: { id: "participant-new", role: "user" },
      returnTo: "/",
      lessons,
      answers: readStore("answers::user::participant-new", {}),
      states: readStore("stepState::user::participant-new", {}),
    }),
    "/lesson/O.1"
  );

  setAnswer("O.1", 0, "this account only");
  setLifeMap({ places: ["the gym"] });
  addEntry({ body: "a note from this browser", kind: "free" });
  setProgressUserId("participant-other");
  assert.equal(getAnswer("O.1", 0), "");
  setProgressUserId("participant-new");
  assert.equal(getAnswer("O.1", 0), "this account only");

  // The Life Map and journal now belong to the account too, so another account never sees them.
  setProgressUserId("participant-other");
  assert.deepEqual(readStore("lifeMap", {}), {});
  assert.equal(listEntries().some((entry) => entry.body === "a note from this browser"), false);
  setProgressUserId("participant-new");
  assert.deepEqual(readStore("lifeMap", {}), { places: ["the gym"] });
  assert.equal(listEntries().some((entry) => entry.body === "a note from this browser"), true);

  setProgressUserId(null);
  assert.equal(getAnswer("O.1", 0), "answered on this browser");
  // Logged out, the account's map and journal are not shown.
  assert.deepEqual(readStore("lifeMap", {}), {});
  assert.equal(listEntries().some((entry) => entry.body === "a note from this browser"), false);
  assert.deepEqual(readStore("lifeMap::user::participant-new", null), { places: ["the gym"] });
});
