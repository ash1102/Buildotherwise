import test from "node:test";
import assert from "node:assert/strict";
import { createSpeechSession, mergeFinals } from "./speechSession.js";

function fakeEngine() {
  const made = [];
  class Recognition {
    constructor() { made.push(this); }
    start() { this.onstart?.(); }
    stop() { this.onend?.(); }
    abort() {}
  }
  const results = (list) => ({ results: list.map(([text, isFinal]) => Object.assign([{ transcript: text }], { isFinal })) });
  return { Recognition, made, results };
}

function run({ mobile }) {
  const engine = fakeEngine();
  const heard = [];
  const states = [];
  const session = createSpeechSession({
    Recognition: engine.Recognition, mobile, inFrame: false,
    onText: (w) => heard.push(w), onState: (a) => states.push(a), onError: () => {},
    schedule: (fn) => { fn(); return 1; }, cancel: () => {},
  });
  return { engine, heard, states, session };
}

test("Android: cumulative finals are not repeated", () => {
  const { engine, heard, session } = run({ mobile: true });
  session.start();
  const r = engine.made[0];
  r.onresult(engine.results([["I went", true]]));
  r.onresult(engine.results([["I went", true], ["I went to the store", true]]));
  assert.equal(heard.join(" "), "I went to the store");
});

test("iPhone: preview words are kept when Stop is tapped", () => {
  const { engine, heard, session } = run({ mobile: true });
  session.start();
  engine.made[0].onresult(engine.results([["hello there", false]]));
  session.stop();
  assert.equal(heard.join(" "), "hello there");
});

test("Desktop: separate finals add up, no duplicates on repeat events", () => {
  const { engine, heard, session } = run({ mobile: false });
  session.start();
  const r = engine.made[0];
  r.onresult(engine.results([["one two", true]]));
  r.onresult(engine.results([["one two", true], ["three", true]]));
  r.onresult(engine.results([["one two", true], ["three", true]]));
  assert.equal(heard.join(" "), "one two three");
});

test("Phone does not auto-restart after the session ends", () => {
  const { engine, states, session } = run({ mobile: true });
  session.start();
  engine.made[0].onend();
  assert.equal(engine.made.length, 1);
  assert.equal(states.at(-1), false);
});

test("mergeFinals keeps genuinely new phrases", () => {
  assert.deepEqual(mergeFinals(["hi", "there"]), ["hi", "there"]);
  assert.deepEqual(mergeFinals(["hi", "hi there"]), ["hi", "there"]);
});
