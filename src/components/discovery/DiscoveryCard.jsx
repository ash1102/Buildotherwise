import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { contextRows, removeDiscovery, reviseDecision, updateDiscovery } from "@/lib/discoveries";
import DiscoveryForm from "./DiscoveryForm";
import DecisionChips from "./DecisionChips";
import AnswerFeedback from "@/components/feedback/AnswerFeedback";

/** The entry as one block of text, in the participant's own words, for feedback. */
function entryText(entry, rows) {
  return [
    entry.title ? `Title: ${entry.title}` : null,
    entry.body ? `What I noticed: ${entry.body}` : null,
    ...rows.map((row) => `${row.label}: ${row.value}`),
    entry.decision ? `Next decision: ${entry.decision}` : null,
    entry.decision_note ? `Decision note: ${entry.decision_note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const LINK_CLASS =
  "rounded underline decoration-natural underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

/** One discovery entry, in the participant's own words, with edit and delete. */
export default function DiscoveryCard({ entry }) {
  const [mode, setMode] = useState("view");
  const [note, setNote] = useState("");
  const [nextDecision, setNextDecision] = useState(entry.decision || "");

  const rows = contextRows(entry.context);
  const source = entry.source || null;
  const earlier = [...(entry.decision_updates || [])].reverse();

  if (mode === "edit") {
    return (
      <DiscoveryForm
        initial={{ title: entry.title, body: entry.body, context: entry.context }}
        showDecision={false}
        submitLabel="Save changes"
        onSubmit={(values) => {
          updateDiscovery(entry.id, {
            title: values.title,
            body: values.body,
            context: values.context,
          });
          setMode("view");
        }}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <article className="rounded-lg border border-natural bg-card p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-heading text-[17px] leading-snug text-ink">
          {entry.title || moment(entry.created_date).format("D MMMM YYYY")}
        </h3>
        {entry.title ? (
          <time className="text-[11px] text-ink-faint" dateTime={entry.created_date}>
            Added {moment(entry.created_date).format("D MMM YYYY")}
          </time>
        ) : null}
      </header>

      {entry.body ? (
        <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-soft">{entry.body}</p>
      ) : null}

      {rows.length ? (
        <dl className="mt-3 space-y-2 border-t border-natural pt-3">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-[12px] text-ink-faint">{row.label}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {source && (source.label || source.lesson_title || source.question_text) ? (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-teal-deep">
          <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
          From{" "}
          {source.lesson_code ? (
            <Link className={`${LINK_CLASS} hover:text-copper`} to={`/lesson/${source.lesson_code}`}>
              {source.lesson_title || source.label || source.lesson_code}
            </Link>
          ) : (
            <span>{source.lesson_title || source.label || source.question_text}</span>
          )}
          {source.date ? (
            <span className="text-ink-faint">· {moment(source.date).format("D MMM YYYY")}</span>
          ) : null}
        </p>
      ) : null}

      {entry.decision ? (
        <p className="mt-3 flex flex-wrap items-baseline gap-2 text-[13.5px]">
          <span className="workbook-label text-copper">Next decision</span>
          <span className="font-medium text-ink">{entry.decision}</span>
          {entry.decision_date ? (
            <span className="text-[11.5px] text-ink-faint">{moment(entry.decision_date).format("D MMM YYYY")}</span>
          ) : null}
        </p>
      ) : null}

      {entry.decision_note ? (
        <p className="mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">{entry.decision_note}</p>
      ) : null}

      {earlier.length ? (
        <ul className="mt-2 space-y-1 text-[11.5px] text-ink-faint">
          {earlier.map((item) => (
            <li key={item.id}>
              Earlier: {item.decision} · {moment(item.date).format("D MMM YYYY")}
              {item.note ? `, ${item.note}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={`${LINK_CLASS} inline-flex items-center gap-1.5 text-teal-deep hover:text-copper`}
        >
          <Pencil className="h-3 w-3 shrink-0" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          aria-expanded={mode === "revisit"}
          onClick={() => setMode(mode === "revisit" ? "view" : "revisit")}
          className={`${LINK_CLASS} text-teal-deep hover:text-copper`}
        >
          Revisit this decision
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "delete" ? "view" : "delete")}
          className={`${LINK_CLASS} inline-flex items-center gap-1.5 text-ink-faint hover:text-copper`}
        >
          <Trash2 className="h-3 w-3 shrink-0" aria-hidden="true" />
          Delete
        </button>
      </div>

      <AnswerFeedback
        className="mt-3"
        sourceType="discovery_record"
        sourceKey={`discovery:${entry.id}`}
        sourceLabel={entry.title || "Discovery Record entry"}
        lessonTitle={source?.lesson_title || ""}
        getText={() => entryText(entry, rows)}
      />

      {mode === "revisit" ? (
        <section className="mt-3 rounded-lg border border-natural bg-ivory/70 p-4">
          <p className="workbook-label text-copper">Where this stands now</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Choosing here adds a dated update. The earlier decision stays on the entry. Nothing is erased.
          </p>
          <DecisionChips className="mt-3" value={nextDecision} onChange={setNextDecision} />
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Anything you want kept with this update (optional)."
            className="mt-3 min-h-[3.5rem] resize-y border-natural bg-card text-[13.5px] leading-relaxed"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!nextDecision}
              onClick={() => {
                reviseDecision(entry.id, nextDecision, note.trim());
                setNote("");
                setMode("view");
              }}
              className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
            >
              Save update
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMode("view")}
              className="rounded-full border-natural bg-card"
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

      {mode === "delete" ? (
        <section className="mt-3 rounded-lg border border-copper/40 bg-copper-wash/50 p-4">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Delete this entry? This removes only this Discovery Record entry. Your journal entry and the step response it
            came from stay exactly as they are.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => removeDiscovery(entry.id)}
              className="rounded-full bg-copper text-ivory hover:bg-copper/90"
            >
              Delete this entry
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMode("view")}
              className="rounded-full border-natural bg-card"
            >
              Keep it
            </Button>
          </div>
        </section>
      ) : null}
    </article>
  );
}