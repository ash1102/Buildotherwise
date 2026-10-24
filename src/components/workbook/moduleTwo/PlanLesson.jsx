import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { useAnswers, answerKey } from "@/lib/workbook";
import { useStore } from "@/lib/store";
import { MAP_PICK_KEY } from "@/lib/lifeMap";
import { BRIDGES, bridgeSources, readable } from "@/lib/moduleBridges";
import { selectedEncounterIds } from "@/lib/moduleOne";
import { possibilityById } from "@/lib/explorationGallery";
import {
  METHODS,
  METHOD_BY_ID,
  OBSTACLE_NONE,
  OBSTACLE_OPTIONS,
  START_MODES,
  WHEN_OPTIONS,
  joinMulti,
  planHasContent,
  planSentences,
  readKey,
  readPlan,
  recordM2,
  splitMulti,
  syncSummary,
} from "@/lib/moduleTwo";
import { FinishControl, MultiChoice, P, Panel, PartFlow, Quote, SingleChoice } from "../moduleOne/parts";
import ExplorationGallery from "./ExplorationGallery";
import { EarlierM2, PlanCard } from "./common";

const CODE = "M2-L1";
const EXPLORE_LABEL = "What will you explore?";
const STEP_LABEL = "What is one manageable step?";

function PartStart({ lesson, answers, onSetExplore }) {
  const [pick] = useStore(MAP_PICK_KEY, {});
  const mode = readKey(answers, CODE, "start-mode");
  const bridgeAnswer = readable((answers || {})[answerKey("BRIDGE-1-2", 0)]).trim();
  const earlier = [
    ...(bridgeAnswer ? [{ key: "bridge", label: "Your head start on Module 2", value: bridgeAnswer }] : []),
    ...bridgeSources(BRIDGES[1], answers, pick),
  ];
  const current = readKey(answers, CODE, 0);
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <P>Module 1 asked what catches your attention. Module 2 asks what a possibility is actually about, and how you could get a little closer to it.</P>
        <P>Anything you noticed earlier is a possible starting point, not a commitment. You don’t need to already know what interests you.</P>
      </div>
      {earlier.length ? (
        <Panel tone="yours" label="From Module 1">
          {earlier.map((item) => (
            <Quote key={item.key} label={item.label}>
              {item.value}
            </Quote>
          ))}
        </Panel>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          Nothing is saved from Module 1. That’s fine. The Exploration Gallery in the next part has plenty to look at.
        </p>
      )}
      <SingleChoice
        legend="How would you like to start?"
        options={START_MODES}
        value={mode}
        onChange={(next) => recordM2(CODE, lesson.title, "start-mode", next, "How I started Module 2")}
      />
      {mode === START_MODES[0] && earlier.length ? (
        <div className="space-y-2">
          <p className="text-[15px] text-muted-foreground">Tap one to use it as what you’ll explore. You can change the wording later.</p>
          {earlier.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={current === item.value}
              onClick={() => onSetExplore(item.value)}
              className={`block w-full rounded-lg border px-4 py-3 text-left text-[15px] ${
                current === item.value ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {item.value}
            </button>
          ))}
        </div>
      ) : null}
      {mode === START_MODES[0] && !earlier.length ? (
        <p className="text-[15px] text-muted-foreground">There’s nothing saved to bring forward. You can use your own idea, or browse the gallery next.</p>
      ) : null}
      {mode === START_MODES[1] ? <p className="text-[15px] text-muted-foreground">Continue to the Exploration Gallery to see what’s out there.</p> : null}
      {mode === START_MODES[2] ? (
        <PromptField key={`own-${current}`} lessonCode={CODE} lessonTitle={lesson.title} index={0} label={`${EXPLORE_LABEL} Your own words are enough.`} variant="inline" />
      ) : null}
      {mode === START_MODES[3] ? (
        <Panel tone="note">
          <P>That’s a fine place to start. Browse the gallery next. You don’t need to pick anything to keep going.</P>
        </Panel>
      ) : null}
      <PrivacyNote />
    </div>
  );
}

function PartGallery({ lesson, answers, onStart }) {
  const savedIds = splitMulti(readKey(answers, CODE, "saved-possibilities"));
  const startId = readKey(answers, CODE, "possibility");
  const start = possibilityById(startId);
  const noticed = selectedEncounterIds(readKey(answers, "M1-L1", "encounter"));
  const toggleSave = (id) => {
    const next = savedIds.includes(id) ? savedIds.filter((item) => item !== id) : [...savedIds, id];
    const titles = next.map((value) => possibilityById(value)?.title).filter(Boolean);
    recordM2(CODE, lesson.title, "saved-possibilities", joinMulti(next), "Possibilities I saved to look at again");
    return titles;
  };
  return (
    <div className="space-y-4">
      <P>
        Each area holds several specific possibilities. Open one to see what it involves, what you could explore, and
        ways to try it without money, special equipment, or contacts.
      </P>
      <p className="text-[15px] text-muted-foreground">
        You’re not expected to look at everything. Save anything you want to come back to, and choose one starting point
        when you’re ready, or write your own idea in the plan.
      </p>
      <ExplorationGallery noticed={noticed} savedIds={savedIds} startId={startId} onToggleSave={toggleSave} onStart={onStart} />
      <div aria-live="polite" className="space-y-1 text-[15px]">
        {start ? (
          <p className="text-foreground">
            Your starting point: <strong>{start.title}</strong>
          </p>
        ) : (
          <p className="text-muted-foreground">No starting point chosen yet. That’s fine.</p>
        )}
        {savedIds.length ? <p className="text-muted-foreground">Saved to look at again: {savedIds.length}</p> : null}
      </div>
    </div>
  );
}

function PartWays() {
  const [open, setOpen] = useState([]);
  const toggle = (id) => setOpen((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  return (
    <div className="space-y-5">
      <Panel tone="reading">
        {/* DRAFT (Claude), from the Module 2 instructions and the published M2-L1 reading. */}
        <P>Exploring something doesn’t mean doing the whole thing. You can learn a lot from a small piece of it.</P>
        <P>
          There are four ways to get closer to a possibility in the real world. Each gives you different information.
          Watching doesn’t tell you exactly what doing feels like. A conversation reflects one person’s experience. Doing
          one beginner task isn’t the same as doing the work every day. All four count.
        </P>
      </Panel>
      <p className="text-[15px] text-muted-foreground">Tap a card to see what it involves. You’ll choose one in your plan.</p>
      <ul className="grid gap-3 sm:grid-cols-2" role="list">
        {METHODS.map((method) => {
          const isOpen = open.includes(method.id);
          return (
            <li key={method.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(method.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${isOpen ? "border-accent-ink bg-card" : "border-border bg-card hover:bg-secondary"}`}
              >
                <span className="block font-heading text-[20px] font-semibold text-foreground">{method.label}</span>
                <span className="mt-1 block text-[15px] text-muted-foreground">{method.short}</span>
                {isOpen ? (
                  <span className="mt-3 block space-y-2">
                    <span className="block text-[15px] leading-relaxed text-foreground">{method.explain}</span>
                    <span className="block text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">For example</span>
                    {method.examples.map((example) => (
                      <span key={example} className="block text-[15px] leading-relaxed text-foreground">
                        · {example}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="mt-2 block text-[13px] font-medium text-accent-ink">Tap to see examples</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PartReading() {
  return (
    <Panel tone="reading">
      {/* DRAFT (Claude): built from the published reading "What Can a Small Try Actually Tell You?"
          and the four points in the Module 2 instructions. The original stays in the Library. */}
      <P>
        A description of an activity isn’t the activity itself. You can admire a kind of work and dislike its daily tasks.
        You can expect something to be boring and find that learning it changes your mind. What you predict and what you
        notice when you’re actually there aren’t always the same.
      </P>
      <P>
        That’s one reason interest can grow through experience. Getting closer to something gives you information you
        can’t get by imagining it.
      </P>
      <P>
        But one experience doesn’t settle whether something is right for you. A first try can’t establish lasting interest,
        ability, or the right direction. The setting, the instructions, the timing, and how familiar the task was all
        affect what happens.
      </P>
      <P>
        Whatever you notice is useful. Enjoyment, frustration, boredom, uncertainty, and surprise all tell you something.
        So does finding out that you’d want more information before deciding.
      </P>
      <P>
        Practical barriers matter too. If you can’t get to an opportunity because of time, money, transportation,
        caregiving, or access, that tells you about your circumstances, not about you. It isn’t a personal failure.
      </P>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Source: Entrepalooza Module 2 reading, “What Can a Small Try Actually Tell You?” On interest growing through
        experience, see the research connection in Module 1, Lesson 1 (Hidi &amp; Renninger, 2006). The small-try approach
        is an Entrepalooza design choice, not a tested program.
      </p>
      <Link to="/program-library" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
        Read the full reading in the Library
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Panel>
  );
}

function PartPlan({ lesson, answers, rev, onUseStep, onClearPossibility }) {
  const plan = readPlan(answers);
  const methodLabel = plan.method ? METHOD_BY_ID[plan.method].label : "";
  const obstacles = splitMulti(readKey(answers, CODE, "obstacles"));
  const examples = plan.possibility
    ? plan.possibility.tryIt.filter((way) => !plan.method || way.method === plan.method).map((way) => way.text)
    : plan.method
      ? METHOD_BY_ID[plan.method].examples
      : [];
  return (
    <div className="space-y-6">
      <P>Keep it small enough to fit your time, money, energy, and responsibilities. You can change any of this later.</P>
      {plan.possibility ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-secondary p-3 text-[15px]">
          <span className="text-foreground">
            From the gallery: <strong>{plan.category.title} · {plan.possibility.title}</strong>
          </span>
          <button type="button" onClick={onClearPossibility} className="min-h-[44px] text-[14px] text-muted-foreground underline underline-offset-2">
            Clear
          </button>
        </div>
      ) : null}
      <PromptField key={`explore-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index={0} label={EXPLORE_LABEL} variant="inline" />
      <SingleChoice
        legend="How will you explore it?"
        options={METHODS.map((method) => `${method.label}: ${method.short}`)}
        value={plan.method ? `${methodLabel}: ${METHOD_BY_ID[plan.method].short}` : ""}
        onChange={(next) => {
          const method = METHODS.find((item) => next.startsWith(`${item.label}:`));
          recordM2(CODE, lesson.title, "method", method ? method.id : "", "How I'll explore it");
        }}
      />
      <div className="space-y-3">
        <PromptField key={`step-${rev}`} lessonCode={CODE} lessonTitle={lesson.title} index={1} label={STEP_LABEL} variant="inline" />
        {examples.length ? (
          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer text-[15px] font-medium text-foreground">Need an idea? (optional)</summary>
            <ul className="mt-2 space-y-2">
              {examples.map((text) => (
                <li key={text} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="text-[15px] leading-relaxed text-foreground">{text}</span>
                  <button type="button" onClick={() => onUseStep(text)} className="min-h-[44px] shrink-0 self-start text-[14px] font-medium text-accent-ink underline underline-offset-2">
                    Use this
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
      <SingleChoice
        legend="When might you do it?"
        options={WHEN_OPTIONS}
        value={plan.when}
        onChange={(next) => recordM2(CODE, lesson.title, "when", next, "When I might do it")}
      />
      <MultiChoice
        legend="What might make this difficult?"
        hint="Pick any that fit. This is planning information, not a judgment."
        options={OBSTACLE_OPTIONS}
        values={obstacles}
        only={OBSTACLE_NONE}
        onChange={(next) => recordM2(CODE, lesson.title, "obstacles", joinMulti(next), "What might make it difficult")}
      />
      <PromptField
        lessonCode={CODE}
        lessonTitle={lesson.title}
        index="smaller"
        label="Is there a smaller or more accessible version? (optional)"
        variant="inline"
      />
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer text-[15px] font-medium text-foreground">See an example plan (optional)</summary>
        <dl className="mt-2 space-y-1.5 text-[15px] text-foreground">
          <div><dt className="inline text-muted-foreground">Area: </dt><dd className="inline">Human Behavior</dd></div>
          <div><dt className="inline text-muted-foreground">Possibility: </dt><dd className="inline">Explore how habits develop.</dd></div>
          <div><dt className="inline text-muted-foreground">How: </dt><dd className="inline">Investigate</dd></div>
          <div><dt className="inline text-muted-foreground">Small step: </dt><dd className="inline">Read about how habits form and observe one everyday routine.</dd></div>
        </dl>
        <p className="mt-2 text-[13px] text-muted-faint">An example only. Yours can look completely different.</p>
      </details>
    </div>
  );
}

function PartSummary({ lesson, answers }) {
  const plan = readPlan(answers);
  return (
    <div className="space-y-5">
      <PlanCard plan={plan} empty="Nothing planned yet. That’s fine. You can still go on to Lesson 2 and plan there, or come back here." />
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        To change anything, tap “Plan” above. This plan will be waiting in Lesson 2, so you won’t need to write it again.
      </p>
      <Panel tone="note">
        <P>A plan is a starting point, not a promise. If it changes, or doesn’t happen, that’s information too.</P>
      </Panel>
      <EarlierM2 code={CODE} answers={answers} />
      <FinishControl code={CODE} answers={answers} />
    </div>
  );
}

/** M2-L1 · Find something to try. */
export default function PlanLesson({ lesson }) {
  const answers = useAnswers();
  const [rev, setRev] = useState(0);
  const plan = readPlan(answers);

  // Keep the plain-sentence plan (used by the journal and the records page) in step with the choices.
  useEffect(() => {
    if (!planHasContent(plan) && !readKey(answers, CODE, "plan")) return;
    syncSummary(CODE, lesson.title, "plan", "My saved experiment plan", planSentences(plan), answers);
  }, [answers, lesson.title]); // eslint-disable-line react-hooks/exhaustive-deps

  const setExplore = (text) => {
    recordM2(CODE, lesson.title, 0, text, EXPLORE_LABEL);
    setRev((value) => value + 1);
  };

  /** Choosing a gallery possibility fills "What will you explore?" only if it's empty or still holds the last gallery title. */
  const choosePossibility = (id) => {
    const previous = possibilityById(readKey(answers, CODE, "possibility"));
    const next = possibilityById(id);
    recordM2(CODE, lesson.title, "possibility", next ? next.id : "", "My starting point from the Exploration Gallery");
    const explore = readKey(answers, CODE, 0);
    if (next && (!explore || (previous && explore === previous.title))) setExplore(next.title);
    if (!next && previous && explore === previous.title) setExplore("");
  };

  const useStep = (text) => {
    recordM2(CODE, lesson.title, 1, text, STEP_LABEL);
    setRev((value) => value + 1);
  };

  const parts = [
    { id: "start", short: "Start", title: "Bring forward a possibility", content: <PartStart lesson={lesson} answers={answers} onSetExplore={setExplore} /> },
    { id: "gallery", short: "Explore", title: "The Exploration Gallery", content: <PartGallery lesson={lesson} answers={answers} onStart={choosePossibility} /> },
    { id: "ways", short: "Ways", title: "What counts as trying something?", content: <PartWays /> },
    { id: "read", short: "Read", title: "A small try can teach you something", content: <PartReading /> },
    {
      id: "plan",
      short: "Plan",
      title: "Make a realistic plan",
      content: <PartPlan lesson={lesson} answers={answers} rev={rev} onUseStep={useStep} onClearPossibility={() => choosePossibility("")} />,
    },
    { id: "summary", short: "Your plan", title: "Your starting plan", content: <PartSummary lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
