import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

const Engine =
  typeof window === "undefined" ? null : window.SpeechRecognition || window.webkitSpeechRecognition;

/** Puts a space between two pieces of text so dictation never runs words together. */
function join(head, tail) {
  if (!head) return tail;
  if (!tail) return head;
  return /[\s\n]$/.test(head) ? `${head}${tail}` : `${head} ${tail}`;
}

/**
 * Dictation for one answer field. Words are added to whatever is already written,
 * so nothing typed is lost and nothing is overwritten. Speech goes to the browser's
 * own speech service — this app records nothing, keeps no audio, and costs nothing.
 */
export default function DictateButton({ value, onText }) {
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const engine = useRef(null);
  const base = useRef("");
  const spoken = useRef("");

  useEffect(
    () => () => {
      if (engine.current) engine.current.stop();
    },
    []
  );

  const stop = () => {
    if (engine.current) engine.current.stop();
    setListening(false);
  };

  const start = () => {
    if (!Engine) {
      setNote("Dictation isn't available in this browser — you can keep typing.");
      return;
    }
    const next = new Engine();
    next.continuous = true;
    next.interimResults = true;
    next.lang = navigator.language || "en-US";
    next.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const words = (event.results[i][0].transcript || "").trim();
        if (event.results[i].isFinal) spoken.current = join(spoken.current, words);
        else interim = join(interim, words);
      }
      setNote("");
      onText(join(base.current, join(spoken.current, interim)));
    };
    next.onerror = (event) => {
      const blocked = event.error === "not-allowed" || event.error === "service-not-allowed";
      setNote(
        blocked
          ? "Microphone access is blocked. Your words are untouched — you can keep typing or ask for microphone access."
          : "Dictation stopped. What you wrote is still here; start it again or keep typing."
      );
      setListening(false);
    };
    next.onend = () => setListening(false);
    engine.current = next;
    base.current = value || "";
    spoken.current = "";
    setNote("");
    setListening(true);
    try {
      next.start();
    } catch (error) {
      setNote("Dictation couldn't start. Nothing you wrote was changed — you can keep typing.");
      setListening(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={listening ? stop : start}
          aria-pressed={listening}
          aria-label={listening ? "Stop dictating this answer" : "Dictate this answer"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition ${
            listening
              ? "border-accent-ink bg-accent text-accent-foreground"
              : "border-border bg-background text-primary hover:border-primary/50"
          }`}
        >
          {listening ? (
            <Square className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {listening ? "Stop dictation" : "Dictate"}
        </button>
        {listening ? (
          <span aria-live="polite" className="inline-flex items-center gap-1.5 text-[12px] text-accent-ink">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-ink" aria-hidden="true" />
            Listening — speak, then stop when you're done.
          </span>
        ) : null}
      </span>
      <span aria-live="polite" className={`text-[11.5px] leading-snug ${note ? "text-accent-ink" : "text-muted-faint"}`}>
        {note ||
          "Typing stays open either way. The words come from your browser's own speech service, which may process speech outside this app; no audio is recorded or stored here."}
      </span>
    </span>
  );
}