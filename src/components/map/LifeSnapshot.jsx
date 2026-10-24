import React, { useMemo, useState } from "react";
import { Check, CircleDot, Plus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { saveAnswer } from "@/lib/journal";
import { OPENER_LESSON_CODE } from "@/lib/lessonKind";
import { EPISODE_ENERGY_CHOICES } from "@/lib/mapEnergy";
import { MAP_PAUSE_TEXT, MAP_PICK_KEY, addLine, removeLine, saveEnergyMark } from "@/lib/lifeMap";

/**
 * A Snapshot of My Life Right Now (draft, on the life-snapshot branch for review).
 *
 * The short version of the Life Map. It writes into the same lifeMap store, with
 * the same section keys and question ids as the full map, so nothing saved before
 * is lost or moved, and the full map still opens every line written here.
 * The closing reflection uses lifeMapPick "one-thing", which the Module 1 to 2
 * bridge already reads. Nothing here interprets an answer.
 */
export const SNAPSHOT_BOXES = [
  {
    key: "doing",
    section: "placeless",
    questionId: "p2-placeless",
    shows: ["p2-placeless", ""],
    title: "What I spend time doing",
    hint: "Working, learning, scrolling, fixing things, caring for someone, anything.",
    energy: true,
  },
  {
    key: "around",
    section: "groups",
    questionId: "g-now",
    shows: ["g-now", ""],
    title: "Who I'm around",
    hint: "People, groups, or communities. You don't need to use names.",
    energy: true,
  },
  {
    key: "where",
    section: "places",
    questionId: "p1-places",
    shows: ["p1-places", ""],
    title: "Where I spend time",
    hint: "Home counts. Online spaces count too.",
    energy: true,
  },
  {
    key: "wanted",
    section: "barriers",
    questionId: "p4-rarely",
    // Every missing-area line except the access difficulties, which have their own box.
    showsAllExcept: ["p4-in-the-way"],
    title: "What I'd like but don't have",
    hint: "Something you'd like to do, have, or experience.",
  },
  {
    key: "access",
    section: "barriers",
    questionId: "p4-in-the-way",
    shows: ["p4-in-the-way"],
    title: "What makes things hard to reach",
    hint: "This is about access, not effort. Tap any that apply, or add your own.",
    chips: ["Money", "Transportation", "Time", "Childcare", "Tech or internet", "Paperwork", "Health", "Somewhere safe to be"],
    wide: true,
  },
];

const norm = (value) => String(value || "").trim().toLowerCase();

function linesFor(box, map) {
  const items = Array.isArray((map || {})[box.section]) ? map[box.section] : [];
  return items.filter((item) => {
    if (!String(item?.text || "").trim()) return false;
    const id = item.question_id || "";
    if (box.showsAllExcept) return !box.showsAllExcept.includes(id);
    return box.shows.includes(id);
  });
}

function energyFor(map, lineId) {
  return ((map || {}).energy || []).find((item) => item.question_id === "p3-energy" && (item.links || []).includes(lineId)) || null;
}

function EnergyTag({ map, line }) {
  const mark = energyFor(map, line.id);
  return (
    <select
      aria-label={`Energy after one recent time: ${line.text}`}
      value={mark?.energy_choice || ""}
      onChange={(event) => {
        const choice = event.target.value;
        if (!choice) {
          if (mark) removeLine("energy", mark.id);
          return;
        }
        saveEnergyMark(line.id, choice, mark?.energy_note || "");
      }}
      className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[13px] text-muted-foreground"
    >
      <option value="">Energy afterward? (optional)</option>
      {EPISODE_ENERGY_CHOICES.map((choice) => (
        <option key={choice.id} value={choice.id}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}

function SnapshotCard({ box, map }) {
  const [draft, setDraft] = useState("");
  const lines = linesFor(box, map);
  const taken = new Set(lines.map((line) => norm(line.text)));
  const chipSet = new Set((box.chips || []).map(norm));
  const ownLines = lines.filter((line) => !chipSet.has(norm(line.text)));

  const add = (text) => {
    const value = String(text || "").trim();
    if (!value || taken.has(norm(value))) return;
    addLine(box.section, {
      text: value,
      question_id: box.questionId,
      parent_choice: "standalone",
      branch_group: box.section === "barriers" ? "barriers" : "",
      source_label: "Life Snapshot",
    });
  };
  const submit = () => {
    add(draft);
    setDraft("");
  };

  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 ${box.wide ? "md:col-span-2" : ""}`}
      aria-label={box.title}
    >
      <h3 className="font-heading text-[19px] font-semibold leading-snug text-foreground">{box.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{box.hint}</p>

      {box.chips ? (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Common things that make access hard">
          {box.chips.map((chip) => {
            const on = taken.has(norm(chip));
            const line = on ? lines.find((item) => norm(item.text) === norm(chip)) : null;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={on}
                onClick={() => (on && line ? removeLine(box.section, line.id) : add(chip))}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition ${
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/60"
                }`}
              >
                {on ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {chip}
              </button>
            );
          })}
        </div>
      ) : null}

      {ownLines.length ? (
        <ul className="mt-4 space-y-2">
          {ownLines.map((line) => (
            <li key={line.id} className="rounded-xl bg-[hsl(var(--primary-wash))] px-3 py-2.5">
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1 break-words text-[15px] font-medium text-foreground">{line.text}</span>
                <button
                  type="button"
                  onClick={() => removeLine(box.section, line.id)}
                  aria-label={`Remove ${line.text}`}
                  className="-mr-1 rounded-full p-1 text-muted-faint hover:bg-background hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {box.energy ? <EnergyTag map={map} line={line} /> : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-4">
        <input
          aria-label={`Add to ${box.title}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder={box.chips ? "Something else…" : "Add something…"}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[16px] text-foreground placeholder:text-muted-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim()}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-[15px] font-medium text-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>
    </section>
  );
}

const REFLECT_FIELDS = [
  {
    id: "one-thing",
    label: "Is there anything here you'd like to understand better?",
    placeholder: "Maybe something surprising, repeated, or missing",
    helper: "Module 2 can start from this. It's not a commitment.",
  },
  {
    id: "more-less",
    label: "Is there anything here you'd want more of, or less of?",
    placeholder: "It's okay if nothing comes to mind yet.",
    helper: "",
  },
];

export default function LifeSnapshot({ map, onOpenFullMap }) {
  const [pick, setPick] = useStore(MAP_PICK_KEY, {});
  const [saved, setSaved] = useState(false);
  const values = pick || {};
  const paused = Boolean(values.nothing_yet);
  const total = useMemo(() => SNAPSHOT_BOXES.reduce((sum, box) => sum + linesFor(box, map).length, 0), [map]);

  const setField = (id, value) => {
    setSaved(false);
    setPick((current) => ({ ...(current || {}), [id]: value }));
  };
  const keepInJournal = (field) => {
    const body = String(values[field.id] || "").trim();
    if (!body || /^Fictional:/i.test(body)) return false;
    saveAnswer({
      lessonCode: OPENER_LESSON_CODE,
      lessonTitle: "Life Snapshot",
      promptKey: `${MAP_PICK_KEY}#${field.id}`,
      promptLabel: field.label,
      body,
    });
    return true;
  };
  const saveAll = () => {
    const kept = paused ? false : REFLECT_FIELDS.map(keepInJournal).some(Boolean);
    setSaved(kept || paused ? "saved" : "empty");
  };

  return (
    <div className="space-y-10">
      <div>
        <span className="inline-flex rounded-full bg-[hsl(var(--primary-wash))] px-3 py-1 text-[14px] font-medium text-primary">
          Life Map · 5–10 minutes
        </span>
        <h1 className="mt-4 font-heading text-[30px] font-bold leading-tight text-foreground sm:text-[40px]">
          A Snapshot of My Life Right Now
        </h1>
        <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-foreground">
          This isn't a map of everywhere you've been or everything you've done.
        </p>
        <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-foreground">
          It's a quick look at what has been part of your life recently. You can add as much or as little as you want, and come back to add more any time.
        </p>
      </div>

      <div className="rounded-[28px] bg-secondary p-3 sm:p-6">
        <div className="px-2 pb-5 pt-3 text-center">
          <CircleDot className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-2 font-heading text-[24px] font-bold text-foreground">My life right now</h2>
          <p className="mt-1 text-[16px] text-muted-foreground">Five parts of one picture</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {SNAPSHOT_BOXES.map((box) => (
            <SnapshotCard key={box.key} box={box} map={map} />
          ))}
        </div>
      </div>

      <section className="space-y-6 border-t border-border pt-8" aria-label="Look at your snapshot">
        <div>
          <h2 className="font-heading text-[28px] font-bold leading-tight text-foreground">Look at your snapshot</h2>
          {!total ? (
            <p className="mt-2 text-[15px] text-muted-foreground">You can answer now, or after you've added a few things.</p>
          ) : null}
        </div>

        {REFLECT_FIELDS.map((field) => (
          <div key={field.id} className={paused ? "opacity-50" : ""}>
            <label htmlFor={`snapshot-${field.id}`} className="block font-heading text-[20px] font-semibold leading-snug text-foreground">
              {field.label}
            </label>
            {field.helper ? <p className="mt-1 text-[14px] text-muted-foreground">{field.helper}</p> : null}
            <textarea
              id={`snapshot-${field.id}`}
              rows={3}
              disabled={paused}
              value={values[field.id] || ""}
              onChange={(event) => setField(field.id, event.target.value)}
              onBlur={() => keepInJournal(field)}
              placeholder={field.placeholder}
              className="mt-3 w-full resize-y rounded-2xl border border-border bg-card px-4 py-3 text-[17px] leading-relaxed text-foreground placeholder:text-muted-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        ))}

        <label className="flex items-start gap-3 text-[16px] text-foreground">
          <input
            type="checkbox"
            checked={paused}
            onChange={(event) => setField("nothing_yet", event.target.checked)}
            className="mt-1 h-5 w-5 accent-[hsl(var(--primary))]"
          />
          <span>{MAP_PAUSE_TEXT} That counts.</span>
        </label>

        <button
          type="button"
          onClick={saveAll}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[17px] font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          {saved === "saved" ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
          {saved === "saved" ? "Saved" : "Save my snapshot"}
        </button>
        <p className="text-center text-[13px] text-muted-faint" aria-live="polite">
          {saved === "saved"
            ? paused
              ? "Saved to your account. Your choice not to explore right now is kept."
              : "Saved to your account. Your reflection is in your journal too."
            : saved === "empty"
              ? "Your snapshot is saved. The reflection questions are empty, so nothing went to your journal. That’s fine."
              : "Your snapshot also saves as you go."}
        </p>
      </section>

      <div className="rounded-2xl border border-dashed border-border p-5">
        <p className="font-heading text-[18px] font-semibold text-foreground">Want more detail?</p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
          The full map is optional. It has follow-up questions, connections between entries, and a visual layout. Everything you add here shows up there too.
        </p>
        <button type="button" onClick={onOpenFullMap} className="mt-3 text-[15px] font-medium text-primary underline underline-offset-2">
          Open the full map
        </button>
      </div>
    </div>
  );
}
