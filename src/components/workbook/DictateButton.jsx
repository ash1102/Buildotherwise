import React, { useEffect, useId, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { createSpeechSession } from "@/lib/speechSession";

const START_EVENT = "entrepalooza:dictation-start";

/** Each button belongs to a single field. Interim words are a preview, never a rewrite. */
export default function DictateButton({ onText, onBeforeStart, buttonRef = null, label = "this text box", disabled = false }) {
  const id = useId();
  const [listening, setListening] = useState(false);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const session = useRef(null);
  const latest = useRef({ onText, onBeforeStart });
  latest.current = { onText, onBeforeStart };

  useEffect(() => {
    const otherStarted = (event) => { if (event.detail !== id) session.current?.stop(); };
    const hide = () => { if (document.hidden) session.current?.stop(); };
    window.addEventListener(START_EVENT, otherStarted);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener(START_EVENT, otherStarted);
      document.removeEventListener("visibilitychange", hide);
      session.current?.dispose();
    };
  }, [id]);

  const start = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setNote("");
    latest.current.onBeforeStart?.();
    if (!Recognition) {
      setNote("Use the microphone on your keyboard to dictate into this box. This browser does not provide in-page dictation.");
      return;
    }
    window.dispatchEvent(new CustomEvent(START_EVENT, { detail: id }));
    session.current?.dispose();
    session.current = createSpeechSession({
      Recognition,
      language: navigator.language || "en-US",
      onText: (words) => latest.current.onText(words, ""),
      onState: (active, interim) => { setListening(active); setPreview(interim); },
      onError: setNote
    });
    session.current.start();
  };

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1">
      <button ref={buttonRef} type="button" disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={listening ? () => session.current?.stop() : start}
        aria-pressed={listening} aria-label={listening ? `Stop dictating ${label}` : `Dictate into ${label}`}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[14px] transition disabled:opacity-50 ${listening ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary"}`}>
        {listening ? <Square className="h-3 w-3" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
        {listening ? "Stop dictation" : "Dictate"}
      </button>
      {listening ? <span role="status" className="text-[14px] text-accent-ink">{preview || "Listening… Tap Stop when finished."}</span> : null}
      {note ? <span role="status" className="text-[14px] leading-snug text-muted-foreground">{note}</span> : null}
    </span>
  );
}
