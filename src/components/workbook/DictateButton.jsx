import React from "react";
import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
 * The short note is the default so the explanation is not repeated under every box.
 */
export default function DictateButton({ value, onText, getValue }) {
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
      setNote("Dictation isn’t available in this browser. You can keep typing.");
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
          ? "Microphone access is blocked. Your words are untouched. You can keep typing."
          : "Dictation stopped. What you wrote is still here; start it again or keep typing."
      );
      setListening(false);
    };
    next.onend = () => setListening(false);
    engine.current = next;
    base.current = (getValue ? getValue() : value) || "";
    spoken.current = "";
    setNote("");
    setListening(true);
    try {
      next.start();
    } catch (error) {
      setNote("Dictation couldn’t start. Nothing you wrote was changed. You can keep typing.");
      setListening(false);
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? "Stop dictating this answer" : "Dictate this answer"}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[14px] transition ${
          listening ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"
        }`}
      >
        {listening ? <Square className="h-3 w-3" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
        {listening ? "Stop dictation" : "Dictate"}
      </button>
      {listening ? (
        <span aria-live="polite" className="inline-flex items-center gap-1.5 text-[14px] text-accent-ink">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          Listening. Speak, then stop when you’re done.
        </span>
      ) : null}
      {note ? (
        <span aria-live="polite" className="text-[14px] leading-snug text-destructive">
          {note}
        </span>
      ) : null}
    </span>
  );
}