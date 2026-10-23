import React, { useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    placeholder: "Add something you do",
    energy: true,
  },
  {
    key: "around",
    section: "groups",
    questionId: "g-now",
    shows: ["g-now", ""],
    title: "Who I'm around",
    hint: "People, groups, or communities. A role or label is enough. No names needed.",
    placeholder: "Add a person, group, or community",
    energy: true,
  },
  {
    key: "where",
    section: "places",
    questionId: "p1-places",
    shows: ["p1-places", ""],
    title: "Where I spend time",
    hint: "Home counts. Online spaces count too.",
    placeholder: "Add a place",
    energy: true,
  },
  {
    key: "wanted",
    section: "barriers",
    questionId: "p4-rarely",
    // Every missing-area line except the access difficulties, which have their own box.
    showsAllExcept: ["p4-in-the-way"],
    title: "Something I'd like but don't have right now",
    hint: "Something you'd like to do, have, or experience. Leave it empty if nothing comes to mind.",
    placeholder: "Add something you'd like",
  },
  {
    key: "access",
    section: "barriers",
    questionId: "p4-in-the-way",
    shows: ["p4-in-the-way"],
    title: "What makes things hard to reach",
    hint: "This is about access, not effort. Tap any that apply, or add your own.",
    placeholder: "Add something else",
    chips: ["Money", "Transportation", "Time", "Childcare", "Tech or internet", "Paperwork", "Health", "Somewhere safe to be"],
  },
];

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
      className="max-w-[9.5rem] rounded-md border border-border bg-background px-2 py-1 text-[13px] text-muted-foreground"
    >
      <option value="">Energy? (optional)</option>
      {EPISODE_ENERGY_CHOICES.map((choice) => (
        <option key={choice.id} value={choice.id}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}

function SnapshotBox({ box, map }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const lines = linesFor(box, map);
  const taken = new Set(lines.map((line) => String(line.text).trim().toLowerCase()));

  const add = (text) => {
    const value = String(text || "").trim();
    if (!value || taken.has(value.toLowerCase())) return;
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
    <section className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4" aria-label={box.title}>
      <h3 className="text-[17px] font-semibold leading-snug text-foreground">{box.title}</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{box.hint}</p>

      {box.chips ? (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Common things that make access hard">
          {box.chips.map((chip) => {
            const on = taken.has(chip.toLowerCase());
            const line = on ? lines.find((item) => String(item.text).trim().toLowerCase() === chip.toLowerCase()) : null;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={on}
                onClick={() => (on && line ? removeLine(box.section, line.id) : add(chip))}
                className={`rounded-full border px-3 py-1.5 text-[14px] transition ${
                  on ? "border-accent-ink bg-accent-ink text-primary-foreground" : "border-input bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      ) : null}

      {lines.filter((line) => !(box.chips || []).some((chip) => chip.toLowerCase() === String(line.text).trim().toLowerCase())).length ? (
        <ul className="mt-3 space-y-2">
          {lines
            .filter((line) => !(box.chips || []).some((chip) => chip.toLowerCase() === String(line.text).trim().toLowerCase()))
            .map((line) => (
              <li key={line.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <span className="min-w-0 flex-1 break-words text-[15px] text-foreground">{line.text}</span>
                {box.energy ? <EnergyTag map={map} line={line} /> : null}
                <button
                  type="button"
                  onClick={() => removeLine(box.section, line.id)}
                  aria-label={`Remove ${line.text}`}
                  className="rounded-full p-1 text-muted-faint hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
        </ul>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Input
          ref={inputRef}
          aria-label={box.placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder={box.placeholder}
          className="min-w-0 flex-1 border-border bg-background text-[15px]"
        />
        <Button type="button" onClick={submit} disabled={!draft.trim()} className="shrink-0 rounded-full" aria-label={`Add to ${box.title}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

const REFLECT_FIELDS = [
  {
    id: "one-thing",
    label: "Is there one thing here you might want to understand better?",
    helper: "This is what Module 2 can start from. It’s not a commitment.",
  },
  {
    id: "more-less",
    label: "Is there anything here you’d want more of, or less of?",
    helper: "",
  },
];

export default function LifeSnapshot({ map, onOpenFullMap }) {
  const [pick, setPick] = useStore(MAP_PICK_KEY, {});
  const values = pick || {};
  const paused = Boolean(values.nothing_yet);
  const total = useMemo(
    () => SNAPSHOT_BOXES.reduce((sum, box) => sum + linesFor(box, map).length, 0),
    [map]
  );

  const setField = (id, value) => setPick((current) => ({ ...(current || {}), [id]: value }));
  const keepInJournal = (field) => {
    const body = String(values[field.id] || "").trim();
    if (!body || /^Fictional:/i.test(body)) return;
    saveAnswer({
      lessonCode: OPENER_LESSON_CODE,
      lessonTitle: "Life Snapshot",
      promptKey: `${MAP_PICK_KEY}#${field.id}`,
      promptLabel: field.label,
      body,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="workbook-label">About 5 to 10 minutes</p>
        <h2 className="mt-2 font-heading text-2xl sm:text-3xl">A snapshot of my life right now</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          This isn’t a map of everywhere you’ve been or everything you’ve done. It’s a quick look at what has been part of your life recently.
          Add as much or as little as you want, and come back to add more any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SNAPSHOT_BOXES.map((box) => (
          <SnapshotBox key={box.key} box={box} map={map} />
        ))}
      </div>

      <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5" aria-label="Look at your snapshot">
        <div>
          <h2 className="text-[20px] font-semibold text-foreground">Look at your snapshot</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {total ? "Is anything here surprising, repeated, or missing?" : "You can do this now or after you’ve added a few things."} It’s okay if nothing comes to mind yet.
          </p>
        </div>

        {REFLECT_FIELDS.map((field) => (
          <div key={field.id} className={paused ? "opacity-50" : ""}>
            <label htmlFor={`snapshot-${field.id}`} className="block text-[16px] font-medium leading-snug text-foreground">
              {field.label}
            </label>
            {field.helper ? <p className="mt-1 text-[14px] text-muted-foreground">{field.helper}</p> : null}
            <Textarea
              id={`snapshot-${field.id}`}
              rows={2}
              disabled={paused}
              value={values[field.id] || ""}
              onChange={(event) => setField(field.id, event.target.value)}
              onBlur={() => keepInJournal(field)}
              placeholder="Optional."
              className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[16px] leading-relaxed"
            />
          </div>
        ))}

        <label className="flex items-start gap-2 text-[15px] text-foreground">
          <input
            type="checkbox"
            checked={paused}
            onChange={(event) => setField("nothing_yet", event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>{MAP_PAUSE_TEXT} That counts.</span>
        </label>

        <p className="text-[13px] text-muted-faint">Saved as you type, to your account. Your reflection also goes into your journal.</p>
      </section>

      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="text-[15px] text-foreground">Want more detail?</p>
        <p className="mt-1 text-[14px] text-muted-foreground">
          The full map is optional. It has follow-up questions, connections between entries, and a visual layout. Everything you add here shows up there too.
        </p>
        <button type="button" onClick={onOpenFullMap} className="mt-2 text-[15px] text-accent-ink underline underline-offset-2">
          Open the full map
        </button>
      </div>
    </div>
  );
}
