import React, { useState } from "react";
import { useAnswers, answerKey, setAnswer } from "@/lib/workbook";
import { useStore } from "@/lib/store";
import { ASK_QUESTIONS, NEEDS, NEED_LABEL, NO_CONTACTS, WAY_KINDS, missingNeeds, waysFor } from "@/lib/discoveryWays";

export const OPTIONS = [
  {
    id: "repair", title: "Investigate a problem", field: "Automotive service technician",
    source: "https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm",
    fact: "Technicians identify problems with diagnostic equipment, test systems, document work, and explain repairs—not just replace parts.",
    prediction: "Which part of the job might take more attention than a first-time observer expects?",
    choices: ["Finding the cause before repairing", "Picking a favorite car", "Making the shop look attractive"],
    answer: 0,
    explanation: "The Bureau of Labor Statistics lists diagnosis, testing, documentation, and explaining repairs among technicians' duties. Real repair work combines investigation, practical skill, and communication.",
    task: "Look at a real repair explanation or demonstration. Identify the reported symptom, the test used, and the evidence for the conclusion. You do not need to work on a vehicle."
  },
  {
    id: "design", title: "Make information easier to understand", field: "Graphic designer",
    source: "https://www.bls.gov/ooh/arts-and-design/graphic-designers.htm",
    fact: "Designers organize words and visuals to communicate ideas, work with clients, and revise designs based on feedback.",
    prediction: "Which activity is part of the work beyond making an image look attractive?",
    choices: ["Never changing a design", "Understanding what someone needs to communicate", "Only drawing freehand"],
    answer: 1,
    explanation: "The Bureau of Labor Statistics describes meeting with clients, planning layouts, and revising designs. Design involves solving a communication problem, not just decoration.",
    task: "Choose a real flyer, label, or public notice near you. Cover its title and ask what information stands out first. Consider one change that would make the message easier to find. No design software needed."
  },
  {
    id: "services", title: "Help people find practical support", field: "Social and human service assistant",
    source: "https://www.bls.gov/ooh/community-and-social-service/social-and-human-service-assistants.htm",
    fact: "These workers research programs, coordinate services, help with paperwork, and follow up about whether support reaches people.",
    prediction: "Which task could be part of their everyday work?",
    choices: ["Finding out whether a service is actually available", "Making every decision for a client", "Avoiding paperwork entirely"],
    answer: 0,
    explanation: "The Bureau of Labor Statistics describes researching services, coordinating resources, and helping people complete applications. Accurate information and follow-through matter.",
    task: "Find one public information page for a local library or community service. Check whether it clearly states eligibility, how to apply or access it, and whom to contact. Don't submit personal information."
  },
{
  "id": "making",
  "title": "Make or sketch something",
  "field": "Making",
  "fact": "Choose an everyday object and sketch it from more than one angle. Notice which part of looking, drawing, or changing the sketch catches your attention.",
  "task": "Use paper and a pencil, or a drawing tool you already have. Sketch for a time you choose; a few minutes is enough to begin. You can watch a real drawing demonstration instead.",
  "materials": "Paper and pencil, or an existing drawing tool.",
  "access": "No purchase or specialist equipment needed. Watching shows you someone else’s process; drawing gives you information about your own experience."
},
{
  "id": "music",
  "title": "Explore rhythm or sound",
  "field": "Music and sound",
  "fact": "Listen closely to a short piece of music you can already access, then choose whether to explore its rhythm yourself.",
  "task": "Listen for one repeating pattern. If you want, tap or hum a short pattern and change one part. You can listen only, make sounds, or ask someone how they create a rhythm.",
  "materials": "A recording you can already access, or your voice and a surface you can tap.",
  "access": "No instrument or public performance required. Choose a volume and setting that work for you and others."
},
{
  "id": "nature",
  "title": "Look closely at something living",
  "field": "Nature",
  "fact": "Observe one plant or other living thing you can see from an accessible place. Attend to details before trying to identify it.",
  "task": "Choose a plant indoors, outside, or visible from a window. Sketch or describe three details and write one question. If that is not accessible, examine a real nature photograph or recording and note that you used an image.",
  "materials": "A view of a plant, a real image or recording, and optional paper or notes.",
  "access": "No travel or collecting required. A photograph offers different information from observing something directly."
},
{
  "id": "organizing",
  "title": "Make a small space easier to use",
  "field": "Organizing",
  "fact": "Explore how arranging objects or information changes the way you use a small space.",
  "task": "Choose a drawer, a few files, or a small collection you control. Notice how you find something, try one change if you want, and check what is easier, harder, or unchanged.",
  "materials": "A small collection of your own objects or files.",
  "access": "No storage products needed. You can sketch a possible arrangement rather than move anything."
},
{
  "id": "community",
  "title": "Explore something happening around you",
  "field": "Community activities",
  "fact": "Learn what people actually do in a community activity before deciding whether you want to take part.",
  "task": "Look at a public description of a library group, neighborhood activity, or volunteer opportunity. Identify the activity, access requirements, and one unanswered question. If appropriate and available, ask an organizer or observe a session.",
  "materials": "A public notice or information page, or a conversation with someone involved.",
  "access": "Check availability, cost, timing, and access before planning a visit. Reading about a group does not establish that you attended it."
},
{
  "id": "investigating",
  "title": "Investigate an everyday question",
  "field": "Investigating",
  "fact": "Choose a question about an ordinary object or process and look for information that could answer it.",
  "task": "Write a question about something you can safely observe. Look at it closely, consult an instruction guide, or ask someone how it works. Separate what you observed from what remains a possible explanation.",
  "materials": "An everyday object or process, and an available guide or person if needed.",
  "access": "No disassembly or repair required. You can investigate through observation, reading, or conversation."
}
,
{
  "id": "own",
  "title": "Something of my own",
  "field": "Something of my own",
  "fact": "A possibility you chose yourself, from Module 1 or from anything you’re curious about.",
  "task": "Find the smallest beginner version you can do with what you already have, or watch or ask someone who does it."
}
];

/** Saved answer slots for this activity. */
export const CARD_SLOT = 20;
export const WAY_SLOT = 21;
/** What someone doesn't have this week stays on this device only. */
const UNAVAILABLE_KEY = "module2Unavailable";

function readable(value) {
  try { const parsed = JSON.parse(value); return typeof parsed === "string" ? parsed : String(value || ""); }
  catch { return String(value || ""); }
}

/** The questions and places to find someone, for the Ask way. */
export function AskHelp() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md bg-secondary p-3">
        <p className="text-[14px] font-medium text-foreground">Questions that work for almost anything</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-foreground">
          {ASK_QUESTIONS.map((question) => <li key={question}>{question}</li>)}
        </ul>
      </div>
      <div className="rounded-md bg-secondary p-3">
        <p className="text-[14px] font-medium text-foreground">If you don’t know anyone to ask</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-foreground">
          {NO_CONTACTS.map((place) => <li key={place}>{place}</li>)}
        </ul>
        <p className="mt-2 text-[13px] text-muted-foreground">Share only what you want to. You don’t have to explain why you’re asking.</p>
      </div>
    </div>
  );
}

/** One way in: what to do, what it needs, and whether that fits this week. */
function WayButton({ kind, way, active, missing, onChoose }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onChoose}
      className={`flex h-full flex-col rounded-lg border p-3 text-left transition ${
        active ? "border-accent-ink bg-secondary" : "border-border bg-card hover:bg-secondary"
      } ${missing.length && !active ? "opacity-70" : ""}`}
    >
      <span className="text-[15px] font-semibold text-foreground">{kind.label}</span>
      <span className="mt-1 text-[14.5px] leading-relaxed text-foreground">{way.text}</span>
      {way.note ? <span className="mt-1 text-[13px] text-muted-foreground">{way.note}</span> : null}
      <span className="mt-2 flex flex-wrap gap-1.5 text-[12px]">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-foreground">Free</span>
        {way.needs.length ? (
          way.needs.map((need) => (
            <span
              key={need}
              className={`rounded-full px-2 py-0.5 ${missing.includes(need) ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
            >
              Needs {NEED_LABEL[need].toLowerCase()}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Nothing extra needed</span>
        )}
      </span>
      {missing.length ? (
        <span className="mt-1 text-[12.5px] text-muted-foreground">You said you don’t have this right now. Another way may fit better, or pick it anyway.</span>
      ) : null}
    </button>
  );
}

export default function DiscoverySampler({ route = "" }) {
  const answers = useAnswers();
  const saved = (answers || {})[answerKey("M2-L1", CARD_SLOT)];
  const savedWay = (answers || {})[answerKey("M2-L1", WAY_SLOT)] || "";
  const [selected, setSelected] = useState(() => saved || null);
  const [guesses, setGuesses] = useState({});
  const [seen, setSeen] = useState([]);
  const [unavailable, setUnavailable] = useStore(UNAVAILABLE_KEY, []);
  const following = /already curious/i.test(String(route || ""));
  const shownId = selected || (following ? "own" : null);
  const current = OPTIONS.find((option) => option.id === shownId);
  const ways = current ? waysFor(current.id) : null;
  const ownWords = readable((answers || {})[answerKey("M2-L1", 0)]).trim() || readable((answers || {})[answerKey("BRIDGE-1-2", 0)]).trim();

  const choose = (id) => {
    setSelected(id);
    setAnswer("M2-L1", CARD_SLOT, id);
    setSeen((previous) => previous.includes(id) ? previous : [...previous, id]);
  };
  const chooseWay = (id) => {
    if (current && current.id !== saved) choose(current.id);
    setAnswer("M2-L1", WAY_SLOT, savedWay === id ? "" : id);
  };
  const toggleNeed = (id) => setUnavailable((list) => {
    const current = Array.isArray(list) ? list : [];
    return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  });

  const ordered = [OPTIONS.find((option) => option.id === "own"), ...OPTIONS.filter((option) => option.id !== "own")];

  return (
    <section aria-label="Explore real possibilities" className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h3 className="text-[20px] font-semibold text-foreground">First, pick something to get closer to</h3>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
          Start with your own idea from Module 1, or browse one of these. Each one has four ways in: try it, watch someone,
          ask someone, or note what’s in the way. Every way here is free.
        </p>
      </div>

      <details className="rounded-lg border border-border p-3" open={Array.isArray(unavailable) && unavailable.length > 0}>
        <summary className="cursor-pointer text-[15px] font-medium text-foreground">
          Anything you don’t have this week? (optional)
        </summary>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Tick anything that isn’t available to you right now. Ways that need it get marked, so you can pick one that fits.
          This stays on this device and isn’t shared.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NEEDS.map((need) => {
            const off = Array.isArray(unavailable) && unavailable.includes(need.id);
            return (
              <button
                key={need.id}
                type="button"
                aria-pressed={off}
                onClick={() => toggleNeed(need.id)}
                className={`rounded-md border px-3 py-1.5 text-[14px] transition ${off ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"}`}
              >
                {off ? `No ${need.label.charAt(0).toLowerCase()}${need.label.slice(1)}` : need.label}
              </button>
            );
          })}
        </div>
      </details>

      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Pick a possibility">
        {ordered.map((option) => (
          <button key={option.id} type="button" aria-pressed={shownId === option.id}
            onClick={() => choose(option.id)}
            className={`rounded-lg border p-3 text-left text-[15px] font-medium transition ${shownId === option.id ? "border-accent-ink bg-secondary text-foreground" : "border-border bg-card text-foreground hover:bg-secondary"}`}>
            {option.title}
          </button>
        ))}
      </div>

      {current ? (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">Explore: {current.field}</p>
            {current.id === "own" ? (
              ownWords ? (
                <p className="mt-2 text-[16px] leading-relaxed text-foreground">You wrote: <strong>{ownWords}</strong></p>
              ) : (
                <p className="mt-2 text-[16px] leading-relaxed text-foreground">Use what you noticed in Module 1, or anything you’re curious about. Write it in the first box below.</p>
              )
            ) : (
              <p className="mt-2 text-[16px] leading-relaxed text-foreground">{current.fact}</p>
            )}
            {current.source ? <a href={current.source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-accent-ink underline underline-offset-2">
              Read the official Bureau of Labor Statistics occupation profile ↗
            </a> : null}
          </div>
          {current.choices ? <div>
            <p className="text-[16px] font-medium text-foreground">{current.prediction}</p>
            <div className="mt-2 grid gap-2">
              {current.choices.map((choice, index) => (
                <button key={choice} type="button" disabled={guesses[current.id] !== undefined}
                  onClick={() => setGuesses((old) => ({ ...old, [current.id]: index }))}
                  className={`rounded-md border border-input p-3 text-left text-[15px] ${guesses[current.id] === index ? "bg-secondary font-medium" : "bg-card hover:bg-secondary"} disabled:cursor-default`}>
                  {choice}
                </button>
              ))}
            </div>
            {guesses[current.id] !== undefined ? (
              <div role="status" className="mt-3 rounded-md bg-secondary p-3 text-[15px] leading-relaxed text-foreground">
                <p className="font-medium">{guesses[current.id] === current.answer ? "That's supported by the job description." : "Here's what the job description shows."}</p>
                <p className="mt-1">{current.explanation}</p>
              </div>
            ) : null}
          </div> : null}

          <div>
            <p className="text-[16px] font-medium text-foreground">How will you get close to it?</p>
            <p className="mt-1 text-[14px] text-muted-foreground">Pick the one that fits your week. You can change it later. Each gives you real information.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2" role="group" aria-label="Ways in">
              {WAY_KINDS.map((kind) => (
                <WayButton
                  key={kind.id}
                  kind={kind}
                  way={ways[kind.id]}
                  active={savedWay === kind.id && saved === current.id}
                  missing={missingNeeds(ways[kind.id], unavailable)}
                  onChoose={() => chooseWay(kind.id)}
                />
              ))}
            </div>
          </div>

          {savedWay === "ask" && saved === current.id ? <AskHelp /> : null}
          {savedWay === "notYet" && saved === current.id ? (
            <p className="rounded-md bg-secondary p-3 text-[15px] leading-relaxed text-foreground">
              Not being able to get to something yet is a real result. It tells you about conditions, not about you. In the next
              step you’ll note what’s in the way and the smallest version that doesn’t need it.
            </p>
          ) : null}
          <p className="text-[13px] text-muted-foreground">Picking a way records a plan, not something you’ve done. In the next step you’ll write what actually happened.</p>
        </div>
      ) : (
        <p className="text-[15px] text-muted-foreground">Pick a starting point, or write your own possibility in the boxes below.</p>
      )}
      {seen.length > 1 ? <p className="text-[14px] text-muted-foreground">Looked at {seen.length} starting points. Opening a card doesn’t mean you did its activity.</p> : null}
      <p className="text-[13px] text-muted-foreground">These are starting activities, not promises of local opportunities. Check times, costs, and access before planning a visit.</p>
    </section>
  );
}
