import React, { useState } from "react";
import { useAnswers, answerKey, setAnswer } from "@/lib/workbook";

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
  }
];

export default function DiscoverySampler() {
  const answers = useAnswers();
  const saved = (answers || {})[answerKey("M2-L1", 20)];
  const [selected, setSelected] = useState(() => saved || null);
  const [guesses, setGuesses] = useState({});
  const [seen, setSeen] = useState([]);
  const current = OPTIONS.find((option) => option.id === selected);
  const choose = (id) => {
    setSelected(id);
    setAnswer("M2-L1", 20, id);
    setSeen((previous) => previous.includes(id) ? previous : [...previous, id]);
  };

  return (
    <section aria-label="Explore real possibilities" className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h3 className="text-[20px] font-semibold text-foreground">First, encounter something real</h3>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
          You don't need an interest in mind. Explore one of three kinds of work, make a prediction, and try a small observation task. These are starter encounters, not career recommendations or tests of your personality.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Pick a possibility">
        {OPTIONS.map((option) => (
          <button key={option.id} type="button" aria-pressed={selected === option.id}
            onClick={() => choose(option.id)}
            className={`rounded-lg border p-3 text-left text-[15px] font-medium transition ${selected === option.id ? "border-accent-ink bg-secondary text-foreground" : "border-border bg-card text-foreground hover:bg-secondary"}`}>
            {option.title}
          </button>
        ))}
      </div>
      {current ? (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">Real work: {current.field}</p>
            <p className="mt-2 text-[16px] leading-relaxed text-foreground">{current.fact}</p>
            <a href={current.source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-accent-ink underline underline-offset-2">
              Read the official Bureau of Labor Statistics occupation profile ↗
            </a>
          </div>
          <div>
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
          </div>
          <div>
            <p className="text-[15px] font-medium text-foreground">A small observation you could try</p>
            <p className="mt-1 text-[15px] leading-relaxed text-foreground">{current.task}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">You may simply explore the source today and return for the observation later. No journal entry or public post is required.</p>
          </div>
        </div>
      ) : (
        <p className="text-[15px] text-muted-foreground">Choose any one to begin. You can switch or explore all three.</p>
      )}
      {seen.length > 1 ? <p className="text-[14px] text-muted-foreground">Explored {seen.length} different possibilities. Notice what the actual work has in common or how it differs.</p> : null}
      <p className="text-[13px] text-muted-foreground">Prototype: three curated starting points. A broader, verified discovery library is still to be developed.</p>
    </section>
  );
}
