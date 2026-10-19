import React from "react";
import { Link } from "react-router-dom";
import PromptField from "./PromptField";
import { Chip, ChipGroup } from "./TryChips";
import { setAnswer, useAnswers, answerKey } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";

/**
 * "Notice without forcing an answer" (M1-L1).
 * The route pills above decide which questions show, per the build spec in the
 * lesson's internal notes. All wording below is taken from that spec or the
 * Module 1 preview blocks unless marked SUGGESTED.
 */

const OWN_ROUTES = ["Something that caught my attention", "A thread from my Life Map", "Use something I noticed", "Bring a Life Map thread", "Explore something unfamiliar", "Nothing draws me in yet"];
const EXAMPLE_ROUTES = ["The garden example", "I’m not sure yet", "I'm not sure yet"];

const SORT_CATEGORIES = [
  { id: "tells", label: "The example tells us this" },
  { id: "added", label: "Someone added this conclusion" },
];

const SORT_ITEMS = [
  { id: "s1", text: "They keep noticing community gardens.", explanation: "That’s in the example. It’s a starting point, not a commitment." },
  { id: "s2", text: "Gardening is their passion.", explanation: "That adds a conclusion. We don’t know which part interests them yet." },
  { id: "s3", text: "They aren’t sure what draws them in.", explanation: "The example tells us they’re unsure. An unknown is useful information too." },
  { id: "s4", text: "They should start a gardening business.", explanation: "That jumps from noticing to a destination they haven’t chosen." },
];

const DRAWING_IN = ["the gardening", "the food", "the people", "being outside"];
const STILL_UNCLEAR = "still unclear";
const FIND_OUT = ["which part matters most", "what it would be like to try", "how it might fit into their week"];
const POSSIBILITIES = ["Look again", "Find out about one part", "Ask a question", "Nothing for now"];

function readJson(answers, code, key, fallback) {
  try {
    const raw = (answers || {})[answerKey(code, key)];
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function useSaved(lesson, key, fallback) {
  const answers = useAnswers();
  const value = readJson(answers, lesson.code, key, fallback);
  const save = (next, journalLabel, journalText) => {
    setAnswer(lesson.code, key, JSON.stringify(next));
    saveAnswer({
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      promptKey: `${lesson.code}#${key}`,
      promptLabel: journalLabel,
      body: journalText,
    });
  };
  return [value, save];
}

function GardenSort({ lesson }) {
  const [picks, save] = useSaved(lesson, "garden-sort", {});
  const choose = (itemId, categoryId) => {
    const next = { ...picks, [itemId]: picks[itemId] === categoryId ? "" : categoryId };
    const text = SORT_ITEMS.filter((item) => next[item.id])
      .map((item) => `${item.text} → ${SORT_CATEGORIES.find((c) => c.id === next[item.id]).label}`)
      .join("\n");
    save(next, "Sort the garden example", text);
  };
  return (
    <section className="space-y-4" aria-label="Sort the garden example">
      <div>
        <p className="text-[16px] font-medium text-foreground">Sort the garden example</p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
          Tap a category for each statement: “The example tells us this” or “Someone added this conclusion.”
        </p>
      </div>
      {SORT_ITEMS.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <p className="text-[16px] text-foreground">{item.text}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SORT_CATEGORIES.map((category) => (
              <Chip key={category.id} active={picks[item.id] === category.id} onClick={() => choose(item.id, category.id)}>
                {category.label}
              </Chip>
            ))}
          </div>
          {picks[item.id] ? (
            <p role="status" className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {item.explanation}
            </p>
          ) : null}
        </div>
      ))}
      <p className="text-[14px] text-muted-foreground">No score or right/wrong marks. Just an explanation and a chance to look again.</p>
    </section>
  );
}

function ExampleQuestions({ lesson }) {
  const [picks, save] = useSaved(lesson, "garden-picks", { drawing: [], findOut: "" });
  const drawing = picks.drawing || [];
  const persist = (next) => {
    const lines = [];
    if (next.drawing.length) lines.push(`What might be drawing them in: ${next.drawing.join(", ")}.`);
    if (next.findOut) lines.push(`What they might want to find out: ${next.findOut}.`);
    save(next, "What might be drawing them in, and what might they want to find out?", lines.join("\n"));
  };
  const toggleDrawing = (option) => {
    let nextDrawing;
    if (option === STILL_UNCLEAR) nextDrawing = drawing.includes(STILL_UNCLEAR) ? [] : [STILL_UNCLEAR];
    else {
      const base = drawing.filter((item) => item !== STILL_UNCLEAR);
      nextDrawing = base.includes(option) ? base.filter((item) => item !== option) : [...base, option];
    }
    persist({ ...picks, drawing: nextDrawing });
  };
  return (
    <section className="space-y-5" aria-label="The example">
      <div>
        <p className="text-[17px] font-medium leading-snug text-foreground">
          What might be drawing them in, and what might they want to find out?
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">Either pick, or both, can be skipped.</p>
      </div>
      <ChipGroup label="What might be drawing them in?" hint="More than one is fine.">
        {[...DRAWING_IN, STILL_UNCLEAR].map((option) => (
          <Chip key={option} active={drawing.includes(option)} onClick={() => toggleDrawing(option)}>
            {option}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup label="What might they want to find out?">
        {FIND_OUT.map((option) => (
          <Chip
            key={option}
            active={picks.findOut === option}
            onClick={() => persist({ ...picks, drawing, findOut: picks.findOut === option ? "" : option })}
          >
            {option}
          </Chip>
        ))}
      </ChipGroup>
    </section>
  );
}

function LinkToMap() {
  return <Link to="/map" className="inline-block text-[15px] text-accent-ink underline underline-offset-2">Look back at your Life Map</Link>;
}

function OwnQuestions({ lesson, route }) {
  return (
    <section className="space-y-5" aria-label="Your own thread">
      <div>
        <p className="text-[17px] font-medium leading-snug text-foreground">
          What caught your attention, and what don’t you know yet?
        </p>
        <p className="mt-1 text-[15px] text-muted-foreground">Write privately, talk it through with someone you choose, or combine both. Take time to explain what you notice. “Nothing draws me in yet” is useful information too.</p>
      </div>
      <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index="time-energy" label="Looking at what takes up your time and energy, which things draw you in once you start, and which things do you mostly get through because they need doing?" route={route} variant="inline" />
      <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index="activity-parts" label="Within those activities, are there particular parts you pay more attention to?" route={route} variant="inline" />
      <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index="missing-experience" label="Is anything missing from your week that you’d like a chance to encounter?" route={route} variant="inline" />
      <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index="own-caught" label="What caught your attention" route={route} variant="inline" />
      <PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index="own-dont-know" label="What I don’t know yet" route={route} variant="inline" />
    </section>
  );
}

function Possibility({ lesson }) {
  const [picked, save] = useSaved(lesson, "possibility", "");
  return (
    <section className="space-y-3" aria-label="Leave with a possibility">
      <ChipGroup
        label="What might help you learn a little more?"
        hint="Any of these is a complete way to leave the step, including leaving without choosing."
      >
        {POSSIBILITIES.map((option) => (
          <Chip
            key={option}
            active={picked === option}
            onClick={() => {
              const next = picked === option ? "" : option;
              save(next, "What might help you learn a little more?", next);
            }}
          >
            {option}
          </Chip>
        ))}
      </ChipGroup>
    </section>
  );
}

export default function NoticeFlow({ lesson, route }) {
  const current = String(route || "").trim();
  const own = OWN_ROUTES.includes(current);
  const example = EXAMPLE_ROUTES.includes(current);
  const passed = /^pass$/i.test(current);

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="From your Life Map to exploration">
        <h3 className="text-[20px] font-semibold text-foreground">What can you do with your Life Map?</h3>
        <p className="text-[16px] leading-relaxed text-foreground">Your map shows where your time and energy go right now. Time spent on something may reflect interest, responsibility, necessity, habit, or a mixture. You decide what your answers mean.</p>
        <p className="text-[16px] leading-relaxed text-foreground">Look for parts that draw you in, things you mostly need to get through, and experiences you have not had access to. Something can matter to you and still take effort.</p>
        <p className="text-[16px] leading-relaxed text-foreground">If nothing draws you in yet, that is a real finding. Module 2 offers possibilities to encounter. Here, you are reflecting and gathering questions; you do not need to choose or try an activity yet.</p>
        <LinkToMap />
      </section>
      {!current ? (
        // SUGGESTED wording (Claude), not from the build spec.
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Pick how you want to start above and your questions will show here. You can begin with uncertainty, or skip to the last question.
        </p>
      ) : null}

      {example ? (
        <>
          <GardenSort lesson={lesson} />
          <ExampleQuestions lesson={lesson} />
        </>
      ) : null}

      {own ? (
        <>
          <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
            {/* SUGGESTED summary wording (Claude). Spec: garden example offered as an optional look. */}
            <summary className="cursor-pointer text-[16px] font-medium text-foreground">
              Look at the garden example first (optional)
            </summary>
            <div className="mt-4">
              <GardenSort lesson={lesson} />
            </div>
          </details>
          <OwnQuestions lesson={lesson} route={route} />
        </>
      ) : null}

      {passed ? (
        <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
          {/* SUGGESTED summary wording (Claude). */}
          <summary className="cursor-pointer text-[16px] font-medium text-foreground">Answer anyway (optional)</summary>
          <div className="mt-4">
            <OwnQuestions lesson={lesson} route={route} />
          </div>
        </details>
      ) : null}

      {!passed ? <Possibility lesson={lesson} /> : null}

      <div className="space-y-3 rounded-lg border border-border bg-secondary p-3 sm:p-4">
        <p className="text-[16px] leading-relaxed text-foreground">
          You can look again, learn a little more, ask a question, or leave it for now.
        </p>
        <p className="text-[16px] leading-relaxed text-foreground">
          <strong>The takeaway:</strong> Noticing gives you somewhere to begin. It doesn’t tell you who you are or what you
          have to do next.
        </p>
      </div>
    </div>
  );
}
