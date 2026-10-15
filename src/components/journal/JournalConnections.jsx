import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEntry, saveAnswer } from "@/lib/journal";
import {
  carriedQuestions,
  connectionAnswered,
  connectionPromptKey,
  decisionFollowUpKey,
  openThreads,
  recurringWords,
} from "@/lib/connections";

function AnswerBox({ label, onSave }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-[15px] font-medium text-accent-ink underline underline-offset-2"
      >
        {label}
      </button>
    );
  }
  return (
    <div className="mt-3 space-y-2">
      <Textarea
        rows={2}
        value={text}
        autoFocus
        onChange={(event) => setText(event.target.value)}
        placeholder="A few words are enough. Skipping is fine."
        className="min-h-[4rem] bg-card text-[16px] leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!text.trim()}
          onClick={() => {
            onSave(text.trim());
            setText("");
            setOpen(false);
          }}
          className="rounded-md"
        >
          Save to my journal
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-md">
          Not now
        </Button>
      </div>
    </div>
  );
}

function reflectHref(ids) {
  const list = ids.filter(Boolean);
  return list.length ? `/journal/reflect?entries=${encodeURIComponent(list.join(","))}` : "/journal/reflect";
}

/**
 * What the journal notices across entries: threads left open, words that keep
 * coming back, and questions being carried. Worked out in this browser only.
 * Every item is a question, never a conclusion.
 */
export default function JournalConnections({ entries }) {
  const threads = useMemo(() => openThreads(entries), [entries]);
  const recurring = useMemo(() => recurringWords(entries), [entries]);
  const questions = useMemo(() => carriedQuestions(entries).slice(0, 4), [entries]);
  const nothingYet = !threads.length && !recurring.length && !questions.length;

  return (
    <section aria-labelledby="connections-title" className="space-y-5 rounded-xl border border-border bg-secondary p-5 sm:p-6">
      <header>
        <p className="workbook-label">What your journal is noticing</p>
        <h2 id="connections-title" className="mt-1 text-[21px]">
          Connections across your answers
        </h2>
        <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Pulled from your own words, in this browser. These are things that might be worth a second look, not
          conclusions about you. Answer, skip, or ignore any of them.
        </p>
      </header>

      {nothingYet ? (
        <p className="rounded-lg border border-dashed border-input bg-card p-4 text-[16px] leading-relaxed text-muted-foreground">
          Nothing to connect yet. As you answer steps in the workbook, threads you leave open and words that come back
          will show up here.
        </p>
      ) : null}

      {threads.length ? (
        <div>
          <h3 className="text-[17px] font-semibold">Threads you left open</h3>
          <ul className="mt-3 space-y-3">
            {threads.map((thread) => (
              <li key={thread.lessonCode} className="rounded-lg border border-border bg-card p-4">
                <p className="text-[14px] text-muted-faint">
                  <Link to={`/lesson/${thread.lessonCode}`} className="font-medium text-accent-ink underline underline-offset-2">
                    {thread.lessonTitle}
                  </Link>{" "}
                  · you chose <strong className="font-semibold text-foreground">{thread.decision}</strong>
                </p>
                <p className="mt-1 text-[17px] leading-relaxed">{thread.question}</p>
                {thread.answered ? (
                  <p className="mt-2 text-[14px] text-accent-ink">You answered this. It is in your journal under that step.</p>
                ) : (
                  <AnswerBox
                    label="Answer this"
                    onSave={(body) =>
                      saveAnswer({
                        lessonCode: thread.lessonCode,
                        lessonTitle: thread.lessonTitle,
                        promptKey: decisionFollowUpKey(thread.lessonCode),
                        promptLabel: `After choosing ${thread.decision}`,
                        body,
                      })
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recurring.length ? (
        <div>
          <h3 className="text-[17px] font-semibold">Words that keep coming back</h3>
          <p className="mt-1 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">
            A word showing up more than once doesn’t prove it matters. It might just be a word you use.
          </p>
          <ul className="mt-3 space-y-3">
            {recurring.map((item) => {
              const answered = connectionAnswered(entries, item.word);
              return (
                <li key={item.word} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-[17px] leading-relaxed">
                    “<strong className="font-semibold">{item.word}</strong>” shows up in {item.places.length} places. Is
                    it the same thing each time, or something different?
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {item.places.slice(0, 4).map((place) => (
                      <li key={place.id} className="text-[14.5px] leading-relaxed text-muted-foreground">
                        {place.lessonCode ? (
                          <Link to={`/lesson/${place.lessonCode}`} className="font-medium text-accent-ink underline underline-offset-2">
                            {place.label}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">{place.label}</span>
                        )}
                        : {place.excerpt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4">
                    {answered ? (
                      <p className="mt-2 text-[14px] text-accent-ink">You wrote about this one.</p>
                    ) : (
                      <AnswerBox
                        label="Write about it"
                        onSave={(body) =>
                          addEntry({
                            kind: "free",
                            body,
                            prompt: connectionPromptKey(item.word),
                            prompt_label: `Connection: “${item.word}”`,
                          })
                        }
                      />
                    )}
                    <Link
                      to={reflectHref(item.places.map((place) => place.id))}
                      className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Talk these through
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {questions.length ? (
        <div>
          <h3 className="text-[17px] font-semibold">Questions you’re carrying</h3>
          <ul className="mt-3 space-y-2">
            {questions.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border bg-card p-4 text-[16px] leading-relaxed">
                {String(entry.body || "").replace(/^A question I[’']m carrying\s*/i, "") || entry.body}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[14px] text-muted-faint">Use “Follow up” on the entry below to add to one.</p>
        </div>
      ) : null}

      <div className="border-t border-border pt-4">
        <Link
          to="/journal/reflect"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Talk it through with the reflection partner
        </Link>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-muted-faint">
          An AI reflection partner. It only sees the entries you choose to bring in, and it does not diagnose, score, or
          tell you what to do.
        </p>
      </div>
    </section>
  );
}
