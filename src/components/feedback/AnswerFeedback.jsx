import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { MessageSquareText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const LINK_CLASS =
  "rounded underline decoration-natural underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

const MIN_CHARS = 10;

/**
 * "Get feedback" for one of the person's own answers or Discovery Record entries.
 * Nothing is sent unless they tap the button. Feedback is saved on their account and can be deleted.
 */
export default function AnswerFeedback({ sourceType, sourceKey, sourceLabel, lessonTitle, getText, className = "" }) {
  const { isAuthenticated, navigateToLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const rows = await base44.entities.AnswerFeedback.filter({ source_key: sourceKey }, "-created_date", 10);
      setItems(rows || []);
    } catch {
      setItems([]);
    }
  }, [sourceKey]);

  useEffect(() => {
    if (open && isAuthenticated && items === null) load();
  }, [open, isAuthenticated, items, load]);

  const request = async () => {
    const text = String(getText?.() || "").trim();
    if (text.length < MIN_CHARS) {
      setError("Write a little more first. A sentence is enough.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await base44.functions.invoke("answerFeedback", {
        source_type: sourceType,
        source_key: sourceKey,
        source_label: sourceLabel || "",
        lesson_title: lessonTitle || "",
        text,
      });
      const data = response?.data ?? response;
      if (data?.error) throw new Error(data.error);
      if (data?.feedback) setItems((prev) => [data.feedback, ...(prev || [])]);
    } catch (err) {
      const message = err?.response?.data?.error || err?.data?.error || err?.message;
      setError(message || "Feedback isn’t available right now. Your answer is unchanged.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await base44.entities.AnswerFeedback.delete(id);
      setItems((prev) => (prev || []).filter((item) => item.id !== id));
    } catch {
      setError("That feedback couldn’t be deleted. Try again.");
    }
  };

  const latest = items?.[0] || null;
  const currentText = String(getText?.() || "").trim();
  const isOlder = latest && latest.answer_snapshot && latest.answer_snapshot.trim() !== currentText;

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`${LINK_CLASS} inline-flex items-center gap-1.5 text-[12.5px] text-teal-deep hover:text-copper`}
      >
        <MessageSquareText className="h-3 w-3 shrink-0" aria-hidden="true" />
        {open ? "Hide feedback" : "Feedback"}
      </button>

      {open ? (
        <section className="mt-2 rounded-lg border border-natural bg-ivory/70 p-4 text-left">
          {!isAuthenticated ? (
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Feedback is saved with your account, so it needs you signed in.{" "}
              <button type="button" onClick={navigateToLogin} className={`${LINK_CLASS} text-teal-deep hover:text-copper`}>
                Sign in
              </button>
            </p>
          ) : (
            <>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                Optional. Tapping the button sends this answer to Claude (an AI made by Anthropic) for a short response:
                what you wrote, what stands out, and a question or two. No scores. The feedback is saved with your
                account, and you can delete it.
              </p>

              {latest ? (
                <div className="mt-3 space-y-2 border-t border-natural pt-3">
                  {isOlder ? (
                    <p className="text-[11.5px] text-ink-faint">This feedback was on an earlier version of your answer.</p>
                  ) : null}
                  {latest.summary ? (
                    <div>
                      <p className="workbook-label text-copper">What you wrote</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{latest.summary}</p>
                    </div>
                  ) : null}
                  {latest.observations?.length ? (
                    <div>
                      <p className="workbook-label text-copper">What stands out</p>
                      <ul className="mt-1 space-y-1 text-[13.5px] leading-relaxed text-ink-soft">
                        {latest.observations.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden="true" className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70" />
                            <span className="min-w-0">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {latest.questions?.length ? (
                    <div>
                      <p className="workbook-label text-copper">If you want to take it further</p>
                      <ul className="mt-1 space-y-1 text-[13.5px] leading-relaxed text-ink-soft">
                        {latest.questions.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink-faint">
                    <span>{moment(latest.created_date).format("D MMM YYYY, h:mm a")}</span>
                    <button
                      type="button"
                      onClick={() => remove(latest.id)}
                      className={`${LINK_CLASS} inline-flex items-center gap-1 hover:text-copper`}
                    >
                      <Trash2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      Delete this feedback
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={request}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-teal-deep/90"
                >
                  {busy ? "Getting feedback…" : latest ? "Get new feedback" : "Get feedback"}
                </Button>
                <span aria-live="polite" className="text-[12.5px] text-copper">
                  {error}
                </span>
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
