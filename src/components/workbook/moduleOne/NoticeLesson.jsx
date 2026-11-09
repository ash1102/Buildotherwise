import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import PromptField from "../PromptField";
import PrivacyNote from "../PrivacyNote";
import { useAnswers } from "@/lib/workbook";
import { useStore } from "@/lib/store";
import { MAP_PICK_KEY, exploreLines } from "@/lib/lifeMap";
import {
  CARRY_OPTIONS,
  ENCOUNTER_CARDS,
  NOTICE_OPTIONS,
  encounterValue,
  readAnswer,
  recordAnswer,
  selectedEncounterIds,
} from "@/lib/moduleOne";
import { EarlierAnswers, FinishControl, P, Panel, PartFlow, Quote, SingleChoice } from "./parts";
import DiscoveryGallery from "./DiscoveryGallery";

/** Where the Life Map's "back to your lesson" link should return to. */
const MAP_LINK = `/map?from=${encodeURIComponent("/lesson/M1-L1")}`;

function LifeMapInvite() {
  return (
    <Panel tone="note" label="Optional" title="Want another way to explore?">
      <P>
        Your Life Map helps you look at where your time and energy go, what matters to you, and what you might want to
        understand better.
      </P>
      <P>Come back to it whenever you notice a new connection.</P>
      <Link
        to={MAP_LINK}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-input bg-card px-4 text-[15px] font-medium text-foreground hover:bg-secondary"
      >
        <MapIcon className="h-4 w-4" aria-hidden="true" />
        Open my Life Map
      </Link>
      <p className="text-[14px] text-muted-faint">Your answers here stay saved while you’re there.</p>
    </Panel>
  );
}

/** Lines the participant already wrote in their Life Map. Only brought in when they tap one. */
function MapContext({ lesson, answers }) {
  const [pick] = useStore(MAP_PICK_KEY, {});
  const lines = exploreLines(pick).filter((line) => line.fieldId !== "nothing_yet");
  const chosen = readAnswer(answers, lesson.code, "map-context");
  if (!lines.length && !chosen) return null;
  return (
    <details className="rounded-xl border border-border bg-card p-4" open={Boolean(chosen)}>
      <summary className="cursor-pointer text-[16px] font-medium text-foreground">
        Bring in something from your Life Map (optional)
      </summary>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Tap one to keep it next to this lesson. It’s copied exactly as you wrote it, and nothing on your map changes.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {lines.map((line) => {
          const active = chosen === line.text;
          return (
            <button
              key={line.id}
              type="button"
              aria-pressed={active}
              onClick={() => recordAnswer(lesson, "map-context", active ? "" : line.text, "From my Life Map")}
              className={`rounded-lg border px-4 py-2.5 text-left text-[15px] ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {line.label ? <span className="block text-[13px] opacity-80">{line.label}</span> : null}
              {line.text}
            </button>
          );
        })}
        {chosen && !lines.some((line) => line.text === chosen) ? (
          <Quote label="Brought in earlier from your Life Map">{chosen}</Quote>
        ) : null}
      </div>
    </details>
  );
}

function PartNotice({ lesson, answers }) {
  const route = readAnswer(answers, lesson.code, "notice-route");
  const option = NOTICE_OPTIONS.find((item) => item.label === route);
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <P>You can start with something current, familiar, or unfamiliar—or with nothing that comes to mind.</P>
        <P>
          A question, a problem, something you already know, or a new possibility can all be starting points. You do not
          need to enjoy something for it to be worth exploring.
        </P>

      </div>
      <SingleChoice
        legend="What feels closest to something you’ve noticed?"
        options={NOTICE_OPTIONS.map((item) => item.label)}
        value={route}
        onChange={(next) => recordAnswer(lesson, "notice-route", next, "What feels closest to something you've noticed?")}
      />
      {option?.prompt ? (
        <div aria-live="polite">
          <PromptField
            lessonCode={lesson.code}
            lessonTitle={lesson.title}
            index="notice-text"
            label={`${option.prompt} (optional)`}
            variant="inline"
          />
        </div>
      ) : null}

      <MapContext lesson={lesson} answers={answers} />
      <PrivacyNote />
      <LifeMapInvite />
    </div>
  );
}

function PartEncounter({ lesson, answers }) {
  const selectedIds = selectedEncounterIds(readAnswer(answers, lesson.code, "encounter"));
  const several = selectedIds.length > 1;
  // Same journal prompt key as before, so the existing journal entry is updated, never duplicated.
  const toggle = (id) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id];
    recordAnswer(lesson, "encounter", encounterValue(next), "Possibilities that caught my attention (not established interests)");
  };
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <P>Sometimes you don’t know whether something interests you until you encounter it.</P>
        <P>Take a look at these possibilities. You don’t have to choose one for your future. Just notice your reaction.</P>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Look at as many or as few as you like. Tap any that catch your attention: one, several, or none.
        </p>
      </div>
      <DiscoveryGallery selectedIds={selectedIds} onToggle={toggle} />
      {ENCOUNTER_CARDS.filter(card => selectedIds.includes(card.id)).map(card => (
        <details key={card.id} className="rounded-xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-[16px] font-medium">Explore {card.title} now (optional)</summary>
          <p className="mt-3 text-[15px] leading-relaxed">{card.description}</p>
          {card.id === "behavior" ? <div className="mt-3 space-y-3 rounded-lg bg-secondary p-3">
            <p className="text-[15px] font-medium">Try a human behavior thought experiment</p>
            <P>Two people get the same feedback. One feels encouraged, the other feels dismissed. What might account for the difference?</P>
            <p className="text-[14px] text-muted-foreground">Try imagining two explanations. What information would you need before making a judgment? You do not need to decide who is right.</p>
          </div> : null}
          <p className="mt-2 text-[15px] text-muted-foreground">What would you want to understand, watch, ask, or try to learn more about this possibility?</p>
          <div className="mt-3"><PromptField lessonCode={lesson.code} lessonTitle={lesson.title} index={"explore-" + card.id} label="My question or small experiment (optional)" variant="inline" /></div>

        </details>
      ))}
      {selectedIds.length ? (
        <div aria-live="polite">
          <Panel tone="note">
            {several ? (
              <>
                <P>A moment ago, these were just possibilities among many.</P>
                <P>
                  Did you select them because they seemed interesting, because you already knew something about them,
                  because they raised a question—or for another reason?
                </P>
                <P>You don’t need to decide whether you like them. You’ve encountered something you can now investigate.</P>
              </>
            ) : (
              <>
                <P>A moment ago, this was just one possibility among many.</P>
                <P>
                  Did you select it because it seemed interesting, because you already knew something about it, because it
                  raised a question—or for another reason?
                </P>
                <P>You don’t need to decide whether you like it. You’ve encountered something you can now investigate.</P>
              </>
            )}
          </Panel>
        </div>
      ) : (
        <p className="text-[15px] text-muted-foreground">You don’t need to select anything. Looking counts.</p>
      )}
      <p className="text-[14px] text-muted-faint">You can investigate a possibility here, or explore more in Module 2.</p>
    </div>
  );
}

function PartReading() {
  return (
    <div className="space-y-4">
      <Panel tone="reading">
        <P>Some things become interesting only after you encounter them, get access, or learn how they work.</P>
        <P>Curiosity can grow, change, fade, or stay small. Sometimes an unexpected encounter is what starts it.</P>
        <P>Hidi and Renninger describe one possible path for interest to develop—not a path everyone follows.</P>
      </Panel>
      <details className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <summary className="cursor-pointer text-[16px] font-medium text-foreground">Research and reading (optional)</summary>
        <div className="mt-3 space-y-3">
          <P>
            Their four-phase model describes triggered situational interest, maintained situational interest, emerging
            individual interest, and well-developed individual interest. The phases describe possibilities, not a
            prediction about any one person.
          </P>
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Hidi, S., &amp; Renninger, K. A. (2006). The four-phase model of interest development.{" "}
            <em>Educational Psychologist, 41</em>(2), 111–127.
          </p>
          <Link to="/program-library" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
            Read “How Interests Begin” in the Library
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </details>
    </div>
  );
}

function PartLook({ lesson, answers }) {
  const route = readAnswer(answers, lesson.code, "notice-route");
  const text = readAnswer(answers, lesson.code, "notice-text");
  const map = readAnswer(answers, lesson.code, "map-context");
  const encounterIds = selectedEncounterIds(readAnswer(answers, lesson.code, "encounter"));
  const encounterCards = ENCOUNTER_CARDS.filter((card) => encounterIds.includes(card.id));
  const anything = text || map || encounterCards.length || route;
  const nothingYet = route === NOTICE_OPTIONS.find((item) => item.id === "nothing-yet")?.label;
  const savedConnection = readAnswer(answers, lesson.code, "connection");
  const savedNote = readAnswer(answers, lesson.code, "stood-out");
  const showNote = (!savedConnection && !nothingYet) || (savedConnection && savedNote);
  return (
    <div className="space-y-5">
      {anything ? (
        <div className="space-y-4">
          {text || route ? (
            <Panel tone="yours" label="What you noticed">
              {route ? <p className="text-[14px] text-muted-foreground">{route}</p> : null}
              {text ? <Quote>{text}</Quote> : <p className="text-[15px] text-muted-foreground">You didn’t write anything here. That’s fine.</p>}
            </Panel>
          ) : null}
          {map ? (
            <Panel tone="yours" label="From your Life Map">
              <Quote>{map}</Quote>
            </Panel>
          ) : null}
          {encounterCards.length ? (
            <Panel tone="yours" label={encounterCards.length > 1 ? "Possibilities you selected" : "A possibility you selected"}>
              <ul className="space-y-1">
                {encounterCards.map((card) => (
                  <li key={card.id} className="text-[16px] font-medium text-foreground">{card.title}</li>
                ))}
              </ul>
              <p className="text-[14px] text-muted-foreground">
                Selecting something isn’t the same as being interested in it. Only you decide what it means.
              </p>
            </Panel>
          ) : null}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          Nothing is saved from earlier in this lesson. You can go back, answer from memory below, or leave it.
        </p>
      )}
      {encounterCards.length && (text || map) ? (
        <Panel tone="note" title="Could there be a connection?">
          <P>
            You noticed something in your experience and selected {encounterCards.map((card) => card.title).join(", ")}. They
            might connect, or they might not. You decide.
          </P>
          <PromptField
            lessonCode={lesson.code}
            lessonTitle={lesson.title}
            index="connection"
            label="A connection or question worth exploring (optional)"
            variant="inline"
          />
        </Panel>
      ) : null}
      {savedConnection ? (
        <Panel tone="note" title="You have a thought worth keeping">
          <P>
            You’ve already put something into words. You don’t need to answer another question about it. You can carry it
            forward, keep exploring, or change your mind.
          </P>
        </Panel>
      ) : nothingYet ? (
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          You already said nothing comes to mind. That is a complete answer; continue, go back, or leave this open.
        </p>
      ) : null}
      {showNote ? (
        <PromptField
          lessonCode={lesson.code}
          lessonTitle={lesson.title}
          index="stood-out"
          label="What, if anything, would you like to note here? (optional)"
          variant="inline"
        />
      ) : null}
    </div>
  );
}

function PartKeep({ lesson, answers }) {
  const choice = readAnswer(answers, lesson.code, "carry-choice");
  return (
    <div className="space-y-6">
      <SingleChoice
        legend="What do you want to carry into Module 2?"
        hint="Your choice is saved as you tap. You can change it later."
        options={CARRY_OPTIONS}
        value={choice}
        onChange={(next) => recordAnswer(lesson, "carry-choice", next, "What I want to carry into Module 2")}
      />
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        What you chose, and anything you wrote in this lesson, will be waiting at the start of Module 2. You can change it
        there.
      </p>
      <Panel tone="note">
        <P>
          <strong>The takeaway:</strong> Noticing gives you somewhere to begin. It doesn’t tell you who you are or what you
          have to do next.
        </P>
      </Panel>
      {readAnswer(answers, lesson.code, "connection") ? <Panel tone="yours" label="A connection or question you saved"><Quote>{readAnswer(answers, lesson.code, "connection")}</Quote></Panel> : null}
      {ENCOUNTER_CARDS.filter(card => readAnswer(answers, lesson.code, "explore-" + card.id)).map(card => (
        <Panel key={card.id} tone="yours" label={"Explored: " + card.title}>
          <Quote>{readAnswer(answers, lesson.code, "explore-" + card.id)}</Quote>
        </Panel>
      ))}
      <EarlierAnswers code={lesson.code} answers={answers} />
      <FinishControl code={lesson.code} answers={answers} />
    </div>
  );
}

/** M1-L1 · Notice what draws your attention. */
export default function NoticeLesson({ lesson }) {
  const answers = useAnswers();
  const parts = [
    { id: "notice", short: "Notice", title: "What catches your attention?", content: <PartNotice lesson={lesson} answers={answers} /> },
    { id: "encounter", short: "Discover", title: "Something you might never have considered", content: <PartEncounter lesson={lesson} answers={answers} /> },
    { id: "reading", short: "Read", title: "How interests begin", content: <PartReading /> },
    { id: "look", short: "Look", title: "Look at what caught your attention", content: <PartLook lesson={lesson} answers={answers} /> },
    { id: "keep", short: "Keep", title: "Keep one possibility or question", content: <PartKeep lesson={lesson} answers={answers} /> },
  ];
  return <PartFlow lessonCode={lesson.code} parts={parts} />;
}
