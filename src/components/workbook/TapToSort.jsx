import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { setAnswer } from "@/lib/workbook";
import { saveAnswer } from "@/lib/journal";
import { EMPTY_SORT, SORT_BUCKETS, SORT_KEY, composeSort, mixCards, parseSortCards } from "@/lib/sortExample";
import { Chip } from "./TryChips";

const BUCKET_LABEL = Object.fromEntries(SORT_BUCKETS.map((bucket) => [bucket.id, bucket.label]));

/** Part one: sort the step's own example. Nothing here is scored or saved. */
function SortTheExample({ cards }) {
  const [placed, setPlaced] = useState({});
  const [revealed, setRevealed] = useState(false);
  const count = Object.keys(placed).length;

  const place = (cardId, bucketId) =>
    setPlaced((current) => (current[cardId] === bucketId ? omit(current, cardId) : { ...current, [cardId]: bucketId }));

  return (
    <div className="space-y-4">
      <div>
        <p className="workbook-label">Sort the example (optional)</p>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          These sentences come from the example above, shuffled. Tap where each one belongs. This is a reading aid, not a
          test. Nothing here is scored or saved.
        </p>
      </div>

      <ul className="space-y-3">
        {cards.map((card) => (
          <li key={card.id}>
            <fieldset className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <legend className="sr-only">{card.text}</legend>
              <p className="text-[16px] leading-relaxed text-foreground">{card.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SORT_BUCKETS.map((bucket) => (
                  <Chip key={bucket.id} active={placed[card.id] === bucket.id} onClick={() => place(card.id, bucket.id)}>
                    {bucket.label}
                  </Chip>
                ))}
              </div>
              {revealed && placed[card.id] ? (
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  You put it under “{BUCKET_LABEL[placed[card.id]]}.” The example labels it “{card.label}”
                  {card.bucket === placed[card.id] ? ", which sits in the same group." : ", which sits under “" + BUCKET_LABEL[card.bucket] + ".”"}
                </p>
              ) : null}
            </fieldset>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          disabled={!count}
          className="rounded-md border border-input bg-card px-3.5 py-2 text-[15px] text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {revealed ? "Hide the example's labels" : "Show how the example labels them"}
        </button>
        {!count ? <span className="text-[15px] text-muted-foreground">Sort at least one to compare.</span> : null}
        {count ? (
          <button
            type="button"
            onClick={() => {
              setPlaced({});
              setRevealed(false);
            }}
            className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Start over
          </button>
        ) : null}
      </div>
    </div>
  );
}

function omit(object, key) {
  const next = { ...object };
  delete next[key];
  return next;
}

/** Part two: the same three-way split, in the person's own words. This part saves. */
function SortYourOwn({ lesson }) {
  const [entries, setEntries] = useStore(SORT_KEY, {});
  const saved = entries[lesson.code] || null;
  const [draft, setDraft] = useState(() => (saved ? { ...EMPTY_SORT, ...saved } : EMPTY_SORT));
  const [editing, setEditing] = useState(!saved);
  const filled = Boolean(composeSort(draft));

  const save = () => {
    const text = composeSort(draft);
    setEntries((current) => ({
      ...current,
      [lesson.code]: { ...draft, text, saved_at: new Date().toISOString() },
    }));
    setAnswer(lesson.code, "sort", text);
    saveAnswer({
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      promptKey: `${lesson.code}#sort`,
      promptLabel: "What happened, what it might mean, what is still unknown",
      body: text,
    });
    setEditing(false);
  };

  if (!editing && saved) {
    return (
      <section className="rounded-xl border border-border bg-secondary p-4 sm:p-5" aria-label="Your sort">
        <p className="workbook-label">Your sort</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground">{saved.text}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Saved to your journal.</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 text-[15px] font-medium text-accent-ink underline underline-offset-2"
        >
          Change my sort
        </button>
      </section>
    );
  }

  const fields = [
    { id: "happened", label: "What did you actually observe or do?" },
    { id: "means", label: "What part is interpretation?" },
    { id: "unknown", label: "What is still unknown or unclear?" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="workbook-label">Sort your own</p>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          One line in any box is enough. “I don’t know yet” counts.
        </p>
      </div>

      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={`${lesson.code}-sort-${field.id}`} className="block text-[16px] font-medium leading-snug text-foreground">
            {field.label}
          </label>
          <Input
            id={`${lesson.code}-sort-${field.id}`}
            value={draft[field.id]}
            onChange={(event) => setDraft((current) => ({ ...current, [field.id]: event.target.value }))}
            placeholder="One line is enough."
            className="mt-2"
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!filled}
          className="rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save my sort
        </button>
        {!filled ? <span className="text-[15px] text-muted-foreground">Write one line to save.</span> : null}
        {saved ? (
          <button
            type="button"
            onClick={() => {
              setDraft({ ...EMPTY_SORT, ...saved });
              setEditing(false);
            }}
            className="text-[15px] font-medium text-accent-ink underline underline-offset-2"
          >
            Keep my saved sort
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function TapToSort({ lesson }) {
  const cards = useMemo(() => mixCards(parseSortCards(lesson.show)), [lesson.show]);

  return (
    <section className="space-y-8 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Sort what happened from what it might mean">
      {cards.length >= 3 ? <SortTheExample cards={cards} /> : null}
      <SortYourOwn lesson={lesson} />
    </section>
  );
}
