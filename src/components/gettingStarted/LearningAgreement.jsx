import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { answerKey, setAnswer, useAnswers } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import {
  AGREEMENT_APPROACH,
  AGREEMENT_CODE,
  AGREEMENT_NOTE,
  AGREEMENT_PERMISSION,
  AGREEMENT_WHY,
  APPROACH_CHOICES,
  SOMETHING_ELSE,
  WHY_CHOICES,
  agreementText,
  readAgreement,
  splitWhy,
  whyText,
} from "@/lib/gettingStarted";

const LABELS = {
  [AGREEMENT_WHY]: "What brings you here?",
  [AGREEMENT_APPROACH]: "How do you want to approach this?",
  [AGREEMENT_NOTE]: "Anything else you want to remember about why you're starting?",
};

function Choices({ legend, options, value, onPick }) {
  return (
    <fieldset>
      <legend className="block text-[16px] font-medium leading-snug text-foreground">{legend}</legend>
      <p className="mt-1 text-[14px] text-muted-foreground">Pick one. No explanation needed.</p>
      <div className="mt-2 flex flex-col gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(active ? "" : option)}
              className={`rounded-md border px-3.5 py-2.5 text-left text-[15px] transition ${
                active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Getting Started step 3: the learning agreement. Every answer saves to the
 * participant's workbook as it changes and is copied into their journal, like
 * any other step. The copy button gives them their agreement as plain text.
 */
export default function LearningAgreement({ lessonTitle = "Make this experience yours" }) {
  const answers = useAnswers();
  const [copied, setCopied] = useState(false);
  const raw = (index) => String((answers || {})[answerKey(AGREEMENT_CODE, index)] || "");

  const record = (index, text) => {
    setAnswer(AGREEMENT_CODE, index, text);
    saveAnswer({
      lessonCode: AGREEMENT_CODE,
      lessonTitle,
      promptKey: `${AGREEMENT_CODE}#${index}`,
      promptLabel: LABELS[index],
      body: text,
    });
  };

  const { choice: whyChoice, other } = splitWhy(raw(AGREEMENT_WHY));
  const approach = raw(AGREEMENT_APPROACH).trim();
  const note = raw(AGREEMENT_NOTE);
  const text = agreementText(readAgreement(answers));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else to try */
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <Choices
          legend={LABELS[AGREEMENT_WHY]}
          options={WHY_CHOICES}
          value={whyChoice}
          onPick={(next) => record(AGREEMENT_WHY, whyText(next, other))}
        />
        {whyChoice === SOMETHING_ELSE ? (
          <div className="mt-3">
            <label htmlFor="agreement-why-other" className="block text-[14px] text-muted-foreground">
              In your words
            </label>
            <Textarea
              id="agreement-why-other"
              rows={2}
              value={other}
              onChange={(event) => record(AGREEMENT_WHY, whyText(SOMETHING_ELSE, event.target.value))}
              placeholder="Your words, no right answer..."
              className="mt-1 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-[16px] leading-relaxed"
            />
          </div>
        ) : null}
      </div>

      <Choices
        legend={LABELS[AGREEMENT_APPROACH]}
        options={APPROACH_CHOICES}
        value={approach}
        onPick={(next) => record(AGREEMENT_APPROACH, next)}
      />

      <div>
        <label htmlFor="agreement-note" className="block text-[16px] font-medium leading-snug text-foreground">
          {LABELS[AGREEMENT_NOTE]} <span className="font-normal text-muted-foreground">(Optional)</span>
        </label>
        <Textarea
          id="agreement-note"
          rows={2}
          value={note}
          onChange={(event) => record(AGREEMENT_NOTE, event.target.value)}
          placeholder="Your words, no right answer..."
          className="mt-2 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-[16px] leading-relaxed"
        />
      </div>

      <div className="rounded-xl border border-border bg-card px-4 py-4">
        <p className="text-[16px] font-semibold text-foreground">Your learning agreement</p>
        <p className="mt-2 text-[16px] leading-relaxed text-foreground">{AGREEMENT_PERMISSION}</p>
        <p className="mt-3 text-[13px] text-muted-faint">Saved to your workbook as you go. You can change it anytime.</p>
      </div>

      <button
        type="button"
        onClick={copy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-input bg-card px-4 py-3 text-[15px] font-medium text-foreground transition hover:bg-secondary"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? "Copied" : "Copy my agreement"}
      </button>
    </div>
  );
}
