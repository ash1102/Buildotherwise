import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";

const QUESTIONS = [
  {
    key: "brought",
    label: "What brought you here?",
    choices: ["A change at work", "A question I cannot put down", "Plain curiosity", "I would rather not say yet"],
  },
  {
    key: "pace",
    label: "How much do you want to take on at once?",
    choices: ["One short sitting", "A little each week", "Not sure yet"],
  },
  {
    key: "avoid",
    label: "Anything you would rather not do?",
    choices: ["Write much", "Talk to other people", "Decide anything yet", "Nothing comes to mind"],
  },
];

export default function OnboardingSteps() {
  const [answers, setAnswers] = useStore("aspect.onboarding", {});
  const [step, setStep] = useState(0);

  const chosen = Object.keys(answers).length === QUESTIONS.length;
  const question = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const choose = (key, value) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setStep((current) => Math.min(current + 1, QUESTIONS.length - 1));
  };

  if (chosen) {
    return (
      <div>
        <p className="font-heading text-xl text-ink">That is the shape of Getting Started.</p>
        <dl className="mt-4 space-y-2 text-[14px] leading-relaxed text-ink-soft">
          {QUESTIONS.map((item) => (
            <div key={item.key} className="flex flex-wrap gap-x-2">
              <dt className="text-ink-faint">{item.label}</dt>
              <dd className="text-ink">{answers[item.key]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">
          In the real sequence, these answers decide what you are offered next — including nothing at all, if that is
          what you asked for.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link
            to="/module/getting-started"
            className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-5 py-2.5 text-[14px] text-ivory transition hover:bg-teal-deep/90"
          >
            Start Getting Started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
            className="inline-flex items-center gap-2 text-[13px] text-ink-faint transition hover:text-copper"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Answer them again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {QUESTIONS.map((item, index) => (
          <span
            key={item.key}
            className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-teal-deep" : "bg-natural"}`}
          />
        ))}
      </div>

      <p className="mt-4 workbook-label">
        Question {step + 1} of {QUESTIONS.length}
      </p>
      <h3 className="mt-2 font-heading text-xl">{question.label}</h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {question.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => choose(question.key, choice)}
            className={`rounded-full border px-4 py-2 text-[13.5px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
              answers[question.key] === choice
                ? "border-teal-deep bg-teal-deep-wash text-teal-deep"
                : "border-natural bg-white text-ink-soft hover:border-teal-deep/50 hover:text-teal-deep"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      {step > 0 ? (
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          className="mt-5 text-[13px] text-ink-faint transition hover:text-teal-deep"
        >
          Back a question
        </button>
      ) : null}
    </div>
  );
}