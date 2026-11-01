import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  QUESTIONS,
  STARTING_POINTS,
  NO_CHOICE_THOUGHT,
  PATH_FRAMING,
  anotherQuestionFor,
  firstQuestionFor,
  framingFor,
  groupQuestionsForPath,
  nextQuestionFor,
  questionsForPath,
  thoughtFor,
} from "./dashboardDiscovery.js";
import { cleanWelcomeReturn, rememberWelcomeReturn, takeWelcomeDestination } from "./welcomeReturn.js";

const read = (file) => readFileSync(file, "utf8");
const fakeStorage = () => {
  const map = new Map();
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), removeItem: (k) => map.delete(k), map };
};

test("the three starting points each lead to a real question, and all four approved questions exist", () => {
  assert.deepEqual(STARTING_POINTS.map((p) => p.label), [
    "Something keeps catching my attention.",
    "I want something different, but I don’t know what.",
    "I’m just looking around.",
  ]);
  for (const point of STARTING_POINTS) {
    assert.equal(point.order.length, 6);
    assert.equal(new Set(point.order).size, 6);
    point.order.forEach((id) => assert.ok(QUESTIONS[id], `${point.id} -> ${id}`));
    assert.ok(firstQuestionFor(point.id).text.length > 10);
  }
  assert.equal(new Set(STARTING_POINTS.map((p) => p.order[0])).size, 3, "each start opens on a different question");
});

test("each path frames its questions differently, keeps the original four follow-ups, and every question stays reachable", () => {
  for (const point of STARTING_POINTS) {
    const all = questionsForPath(point.id).map((q) => q.id);
    assert.equal(all.length, 6, `${point.id} shows all six`);
    for (const id of point.order) {
      const framed = framingFor(point.id, id);
      assert.ok(framed.followUp.length > 10, `${point.id}/${id} follow-up`);
      assert.ok(framed.experiment.length > 20, `${point.id}/${id} experiment`);
    }
  }
  const banned = /\b(your|a) (strength|talent|passion|gift)\b|business (opportunity|idea)|you(’re| are) (good|great|talented|gifted)|means you should/i;
  for (const path of Object.values(PATH_FRAMING)) {
    for (const entry of Object.values(path)) {
      if (entry.followUp) assert.doesNotMatch(entry.followUp, banned);
      if (entry.experiment) assert.doesNotMatch(entry.experiment, banned);
    }
  }
});

test("only three follow-ups are rewritten by path, the rest stay original, and experiments stay path-specific", () => {
  const rewritten = {
    "attention/overlooked": "What do you usually do when it catches your attention?",
    "different/change": "Which of these is closest to the change you’d want?",
    "looking/mild-curiosity": "What would you like to do with it, if anything?",
  };
  for (const point of STARTING_POINTS) {
    for (const id of point.order) {
      const key = `${point.id}/${id}`;
      const framed = framingFor(point.id, id);
      assert.equal(framed.followUp, rewritten[key] || QUESTIONS[id].followUp, `${key} follow-up`);
      const pathEntry = PATH_FRAMING[point.id][id];
      if (point.order[0] === id && point.id === "attention") {
        assert.equal(framed.experiment, QUESTIONS[id].experiment, `${key} opening question uses its own experiment`);
      } else {
        assert.ok(pathEntry && pathEntry.experiment, `${key} keeps a path experiment`);
        assert.equal(framed.experiment, pathEntry.experiment, `${key} experiment`);
      }
    }
  }
  assert.equal(Object.values(PATH_FRAMING).flatMap((p) => Object.values(p)).filter((e) => e.followUp).length, 3);
});

test("framingFor falls back per field, and to the question's own wording for unknown paths", () => {
  assert.equal(framingFor("attention", "lost-track").followUp, QUESTIONS["lost-track"].followUp);
  assert.equal(framingFor("nope", "self-taught").followUp, QUESTIONS["self-taught"].followUp);
  assert.equal(framingFor("nope", "self-taught").experiment, QUESTIONS["self-taught"].experiment);
  for (const point of STARTING_POINTS) {
    for (const id of point.order) {
      const framed = framingFor(point.id, id);
      assert.ok(framed.followUp && framed.experiment, `${point.id}/${id} never empty`);
    }
  }
});

test("approved question and follow-up wording is exact", () => {
  assert.equal(QUESTIONS["self-taught"].text, "What’s something you’ve figured out how to do that nobody actually taught you?");
  assert.equal(QUESTIONS["self-taught"].followUp, "What got you started?");
  assert.equal(QUESTIONS.overlooked.text, "What’s a problem you notice that other people seem to overlook?");
  assert.equal(QUESTIONS.overlooked.followUp, "What do you usually do when you notice it?");
  assert.equal(QUESTIONS["lost-track"].text, "Have you ever gotten so caught up figuring something out that you completely lost track of time?");
  assert.equal(QUESTIONS["lost-track"].followUp, "How did you feel afterward?");
  assert.equal(QUESTIONS["mild-curiosity"].text, "What’s something you’re mildly curious about—not passionate about, not talented at, just curious about?");
  assert.equal(QUESTIONS["mild-curiosity"].followUp, "What would you like to do with that curiosity?");
});

test("every response choice gives a thought, and every question has an optional experiment", () => {
  for (const question of Object.values(QUESTIONS)) {
    assert.ok(question.options.length >= 3);
    assert.ok(question.experiment.length > 20);
    for (const option of question.options) {
      assert.ok(option.label && option.thought);
      assert.equal(thoughtFor(question.id, option.id), option.thought);
    }
    assert.equal(thoughtFor(question.id, null), NO_CHOICE_THOUGHT);
  }
  assert.equal(thoughtFor("nope", "nope"), NO_CHOICE_THOUGHT);
});

test("'another question' never repeats the one on screen and never runs dry", () => {
  for (const point of STARTING_POINTS) {
    let current = firstQuestionFor(point.id).id;
    const seen = [current];
    for (let i = 0; i < 12; i += 1) {
      const next = anotherQuestionFor(point.id, current, seen);
      assert.ok(next, "always another");
      assert.notEqual(next.id, current);
      if (!seen.includes(next.id)) seen.push(next.id);
      current = next.id;
    }
    assert.equal(nextQuestionFor(point.id, point.order, point.order[0]), null, "all seen: no 'next'");
  }
});

test("the copy never names a strength, talent, passion or business opportunity", () => {
  const banned = /\b(your|a) (strength|talent|passion|gift)\b|business (opportunity|idea)|you(’re| are) (good|great|talented|gifted)|means you should/i;
  for (const question of Object.values(QUESTIONS)) {
    assert.doesNotMatch(question.experiment, banned);
    question.options.forEach((option) => assert.doesNotMatch(option.thought, banned, option.id));
  }
});

test("discovery stores nothing: no storage, store, account or network calls in the prototype", () => {
  for (const file of ["src/components/discovery/DiscoveryStart.jsx", "src/lib/dashboardDiscovery.js"]) {
    assert.doesNotMatch(read(file), /localStorage|sessionStorage|useStore|writeStore|readStore|base44|entities|fetch\(|setItem|useWorkbook|useLifeMap/, file);
  }
  assert.match(read("src/components/discovery/DiscoveryStart.jsx"), /Nothing you choose or type here is saved/);
});

test("the dashboard keeps its routes and always offers the workbook", () => {
  const home = read("src/pages/CurriculumHome.jsx");
  for (const route of ['to="/journal"', 'to="/map"', 'to="/my-records"', "to={`/module/${module.slug}`}", 'to="/aspects"']) assert.ok(home.includes(route), route);
  assert.match(home, /Explore the Workbook/);
  assert.match(home, /onSkip=\{goToWorkbook\}/);
  assert.match(read("src/components/discovery/DiscoveryStart.jsx"), /Skip this and go to the workbook/);
});

test("welcome return: only a module or step path is kept, nothing external", () => {
  assert.equal(cleanWelcomeReturn("/module/check-reality-outside-yourself"), "/module/check-reality-outside-yourself");
  assert.equal(cleanWelcomeReturn("/lesson/3.2"), "/lesson/3.2");
  assert.equal(cleanWelcomeReturn("/lesson/3.2?x=1"), "/lesson/3.2?x=1");
  for (const bad of ["/", "", null, undefined, "/lesson/O.1", "/getting-started", "/module/getting-started", "/journal", "//evil.com", "/\\evil.com", "https://evil.com/lesson/3.2", "javascript:alert(1)"]) {
    assert.equal(cleanWelcomeReturn(bad), null, String(bad));
  }
});

test("welcome return: remembered once, used once, dashboard otherwise", () => {
  const storage = fakeStorage();
  assert.equal(takeWelcomeDestination(storage), "/");
  rememberWelcomeReturn("/module/some-module", storage);
  rememberWelcomeReturn("/journal", storage); // not a workbook path: ignored, does not erase the memory
  assert.equal(takeWelcomeDestination(storage), "/module/some-module");
  assert.equal(takeWelcomeDestination(storage), "/", "cleared after use");
  storage.setItem("ep.afterWelcome", "//evil.com");
  assert.equal(takeWelcomeDestination(storage), "/");
  assert.equal(takeWelcomeDestination(null), "/");
});

test("Let me in moves on only on a new tap, and the gate remembers the request", () => {
  const view = read("src/components/workbook/LessonView.jsx");
  assert.match(view, /onRouteChange\(on \? "Ready" : ""\);[\s\S]{0,200}if \(on\) navigate\(takeWelcomeDestination\(\)\)/);
  assert.match(read("src/components/WorkbookGate.jsx"), /rememberWelcomeReturn\(location\.pathname \+ location\.search\)/);
  assert.match(read("src/pages/LessonPage.jsx"), /GettingStartedRedirect/);
  assert.match(read("src/lib/destinationAfterAuth.js"), /rememberWelcomeReturn\(dest\)/);
});

test("the all-saved banner is gone, and per-module saved counts and the page heading are intact", () => {
  const home = read("src/pages/CurriculumHome.jsx");
  assert.doesNotMatch(home, /Every open step has something saved|saved-heading|See what you gathered/);
  assert.match(home, /moduleProgressLabel\(row\)/);
  assert.match(home, /moduleProgressDescription\(row\)/);
  assert.match(home, /usePacedProgress\(\{ modules, lessonsByOrder, answers, states \}\)/);
  assert.match(home, /headingLevel=\{started && next \? "h2" : "h1"\}/, "the page always keeps exactly one h1");
});

test("question navigation: one featured question, the full list only behind a collapsed control", () => {
  const view = read("src/components/discovery/DiscoveryStart.jsx");
  for (const label of ["Explore this one", "Show me another question", "Browse all questions"]) assert.ok(view.includes(label), label);
  assert.match(view, /const \[open, setOpen\] = useState\(false\)/, "starts collapsed");
  assert.match(view, /aria-expanded=\{open\}/);
  assert.match(view, /\{open \? \(\s*<div id=\{panelId\}/, "the list renders only when opened");
  assert.doesNotMatch(view, /OtherQuestions|Explore a different question/);
  assert.match(view, /Skip this and go to the workbook/);
  assert.match(view, /Start over/);
  for (const point of STARTING_POINTS) {
    const { closest, rest } = groupQuestionsForPath(point.id);
    assert.deepEqual([...closest, ...rest].map((q) => q.id), point.order, `${point.id}: all six, in path order`);
    assert.equal(closest.length, 3);
    assert.equal(rest.length, 3);
  }
});

test("colour: dashboard and discovery use the plum family, marigold stays on the primary-action button only", () => {
  const css = read("src/index.css");
  assert.match(css, /\.discovery-surface \{[^}]*--primary: 277 34\.3% 26\.9%/);
  assert.match(css, /\.dark \.dashboard-plum \{[^}]*--primary: 277 34\.3% 26\.9%[^}]*--card: 272\.7 24\.4% 17\.6%/);
  assert.doesNotMatch(css, /\.dark \.discovery-surface/, "no second, grayer plum for dark mode");
  const view = read("src/components/discovery/DiscoveryStart.jsx");
  const marigold = view.split("\n").filter((line) => line.includes("bg-primary-soft"));
  assert.equal(marigold.length, 1, "marigold appears once, in primaryButton");
  assert.match(marigold[0], /primaryButton|inline-flex/);
  assert.doesNotMatch(view, /peer-checked:bg-primary-soft/, "selected answers are plum, not marigold");
  assert.match(read("src/pages/CurriculumHome.jsx"), /className="dashboard-plum space-y-10"/);
});
