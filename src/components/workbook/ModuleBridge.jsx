import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { getAnswer, setAnswer, useAnswers, answerKey } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { useStore } from "@/lib/store";
import { MAP_PICK_KEY } from "@/lib/lifeMap";
import { bridgeCode, bridgeSources, readable } from "@/lib/moduleBridges";

/** The participant's earlier words, quoted back. Each links to the step it came from. */
function EarlierWords({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key} className="border-l-2 border-primary/40 pl-3">
          <p className="text-[13px] text-muted-foreground">
            {item.label}
            {item.code ? (
              <>
                {" · "}
                <Link to={`/lesson/${item.code}`} className="underline underline-offset-2 hover:text-foreground">
                  open that step
                </Link>
              </>
            ) : (
              <>
                {" · "}
                <Link to="/map" className="underline underline-offset-2 hover:text-foreground">
                  open the Life Map
                </Link>
              </>
            )}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">{item.value}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * End of a module: the participant's own earlier answers, then one short question.
 * The answer is saved like any step answer and shown again at the start of the next module.
 */
export function BridgeOut({ bridge, lesson }) {
  const answers = useAnswers();
  const [pick] = useStore(MAP_PICK_KEY, {});
  const code = bridgeCode(bridge);
  const [value, setValue] = useState(() => readable(getAnswer(code, 0)));
  useEffect(() => setValue(readable(getAnswer(code, 0))), [code]);
  const items = bridgeSources(bridge, answers, pick);

  const save = (next) => {
    setValue(next);
    setAnswer(code, 0, next);
  };
  const keepInJournal = () => {
    if (!value.trim()) return;
    saveAnswer({
      // Filed under the step the bridge sits on, so the journal links back to it.
      lessonCode: lesson?.code || code,
      lessonTitle: lesson?.title ? `${lesson.title} · Bridge to Module ${bridge.to}` : `Bridge to Module ${bridge.to}`,
      promptKey: answerKey(code, 0),
      promptLabel: bridge.question,
      body: value.trim(),
    });
  };

  return (
    <div className="space-y-4">
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-foreground">{bridge.intro}</p>
      {items.length ? (
        <EarlierWords items={items} />
      ) : (
        <p className="rounded-lg border border-dashed border-input p-3 text-[15px] text-muted-foreground">
          Nothing saved from earlier steps yet. That’s fine. You can answer from memory, or leave this for now.
        </p>
      )}
      <div>
        <label htmlFor={`${code}-answer`} className="block text-[16px] font-medium leading-snug text-foreground">
          {bridge.question}
        </label>
        {bridge.helper ? <p className="mt-1 text-[14px] text-muted-foreground">{bridge.helper}</p> : null}
        {bridge.chips ? (
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Quick start">
            {bridge.chips.map((chip) => {
              const active = value.trim().startsWith(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    const rest = value.replace(new RegExp(`^(${bridge.chips.join("|")}):?\\s*`), "");
                    save(active ? rest : `${chip}: ${rest}`);
                  }}
                  className={`rounded-md border px-3 py-1.5 text-[14px] transition ${
                    active ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        ) : null}
        <Textarea
          id={`${code}-answer`}
          rows={3}
          value={value}
          onChange={(event) => save(event.target.value)}
          onBlur={keepInJournal}
          placeholder="Optional."
          className="mt-2 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-[16px] leading-relaxed"
        />
        <p className="mt-1 text-[13px] text-muted-faint">
          Saved as you type. It will be waiting for you at the start of Module {bridge.to}.
        </p>
      </div>
    </div>
  );
}

/**
 * Start of a module: what the participant carried over. If the first question here
 * is still empty, they can choose to start from their bridge answer. Nothing is
 * copied unless they ask.
 */
export function BridgeIn({ bridge, lesson, onUsed }) {
  const answers = useAnswers();
  const [pick] = useStore(MAP_PICK_KEY, {});
  const code = bridgeCode(bridge);
  const carried = readable((answers || {})[answerKey(code, 0)]).trim();
  const items = bridgeSources(bridge, answers, pick);
  const target = bridge.target;
  const targetValue = target ? readable((answers || {})[answerKey(target.code, target.index)]).trim() : "";
  const [used, setUsed] = useState(false);

  const use = () => {
    setAnswer(target.code, target.index, carried);
    saveAnswer({
      lessonCode: target.code,
      lessonTitle: lesson?.title || "",
      promptKey: answerKey(target.code, target.index),
      promptLabel: target.label,
      body: carried,
    });
    setUsed(true);
    onUsed?.();
  };

  if (!carried && !items.length) {
    return (
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
        Nothing carried over from Module {bridge.from}. You can start here as you are.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {carried ? (
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-[14px] text-muted-foreground">Where you left Module {bridge.from}</p>
          <p className="mt-1 text-[14px] text-muted-foreground">{bridge.question}</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-[16px] font-medium leading-relaxed text-foreground">{carried}</p>
          {target ? (
            targetValue === carried || used ? (
              <p className="mt-3 text-[14px] text-accent-ink">This is now your starting answer below. Change it as much as you like.</p>
            ) : targetValue ? (
              <p className="mt-3 text-[14px] text-muted-foreground">
                You already answered “{target.label}” below, so nothing was changed.
              </p>
            ) : (
              <button
                type="button"
                onClick={use}
                className="mt-3 rounded-md bg-primary px-3.5 py-2 text-[14px] font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Start from this for “{target.label}”
              </button>
            )
          ) : null}
        </div>
      ) : null}
      {items.length ? (
        <details className="rounded-lg border border-border p-3" open={!carried}>
          <summary className="cursor-pointer text-[15px] font-medium text-foreground">
            What you wrote in earlier modules ({items.length})
          </summary>
          <div className="mt-3">
            <EarlierWords items={items} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
