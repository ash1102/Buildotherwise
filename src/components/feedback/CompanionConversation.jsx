import React, { useEffect, useRef, useState } from "react";
import { createSpeechSession } from "@/lib/speechSession";
import { supabase } from "@/api/supabaseCompat";
import { Button } from "@/components/ui/button";

export default function CompanionConversation({ lessonCode = "", question = "", getAnswer = () => "" }) {
  const [turns, setTurns] = useState([]);
  const speech = useRef(null);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  useEffect(() => () => speech.current?.dispose(), []);
  const toggleDictation = () => {
    if (listening) { speech.current?.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setSpeechError("Speech recognition is not available here. Try your keyboard microphone."); return; }
    setSpeechError("");
    speech.current?.dispose();
    speech.current = createSpeechSession({ Recognition, onText: words => setDraft(prev => (prev.trimEnd() ? prev.trimEnd() + " " : "") + words), onState: setListening, onError: setSpeechError });
    speech.current.start();
  };
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const send = async (initial = false) => {
    const text = initial ? "I want to explore this workbook response. Question: " + question + "\nMy answer: " + getAnswer() : draft.trim();
    if (!text || busy) return;
    const next = [...turns, { role: "user", text }];
    speech.current?.stop();
    setTurns(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sign in to use the companion.");
      const res = await fetch("/api/discoveryCompanion", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ mode: "chat", module: lessonCode, prompt_context: question, messages: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "The companion is unavailable.");
      setTurns([...next, { role: "model", text: data.reply }]);
    } catch (e) {
      setError(e.message || "The companion is unavailable.");
    } finally {
      setBusy(false);
    }
  };
  return <div className="mt-3 space-y-3 border-t pt-3">
    <p className="text-sm">Optional conversation. Your workbook answer stays unchanged. This chat is not saved.</p>
    {!turns.length ? <Button type="button" size="sm" disabled={busy} onClick={() => send(true)}>Start conversation</Button> : <>
      <div aria-live="polite" className="space-y-2">{turns.map((turn, i) => <p key={i} className="text-sm"><strong>{turn.role === "user" ? "You" : "Companion"}:</strong> {turn.text}</p>)}</div>
      <form onSubmit={e => { e.preventDefault(); send(); }}>
        <label className="block text-sm">Your reply<textarea className="mt-1 w-full rounded border p-2" rows={2} maxLength={4000} value={draft} onChange={e => setDraft(e.target.value)} /></label>
        <button type="button" className="mr-2 rounded border px-3 py-2 text-sm" onClick={toggleDictation} aria-pressed={listening}>{listening ? "Stop dictation" : "🎤 Dictate"}</button>
        <Button type="submit" size="sm" disabled={busy || !draft.trim()}>Send</Button>
      </form>
      <button type="button" className="text-sm underline" onClick={() => { setTurns([]); setError(""); }}>Clear conversation</button>
    </>}
    {speechError && <p role="alert" className="text-sm text-destructive">{speechError}</p>}
    {busy && <p role="status">Thinking…</p>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
