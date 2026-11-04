import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase, USE_SUPABASE } from "@/api/supabaseCompat";
import { Button } from "@/components/ui/button";

const welcome = "Welcome to Entrepalooza. I'm your AI Discovery Companion. I can show you around, explain activities, or talk through ideas with you. You decide how much help you want. Would you like a quick introduction, or would you rather explore on your own?";
const pageName = (path) => {
  if (path === "/") return "Program home";
  if (path.includes("getting-started")) return "Getting Started";
  if (path.startsWith("/lesson/")) return "Lesson " + decodeURIComponent(path.split("/").pop());
  if (path.startsWith("/module/")) return "Module " + decodeURIComponent(path.split("/").pop());
  if (path.startsWith("/record")) return "Discovery Record";
  if (path.startsWith("/journal")) return "Conversation Journal";
  if (path.startsWith("/map")) return "Life Map";
  if (path.startsWith("/program-library")) return "Resource Library";
  return path.replace(/^\//, "").replace(/-/g, " ") || "Entrepalooza";
};

export default function GlobalDiscoveryCompanion() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(() => localStorage.getItem("entrepalooza_companion_auto") === "off");
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) { setOpen(false); setTurns([]); setSeen(false); return; }
    const key = "entrepalooza_companion_welcomed_" + user.id;
    if (!disabled && !sessionStorage.getItem(key)) {
      setOpen(true);
      sessionStorage.setItem(key, "yes");
    }
    setSeen(true);
  }, [isAuthenticated, user?.id, disabled]);
  if (!USE_SUPABASE || !isAuthenticated || pathname.startsWith("/preview")) return null;

  const send = async (message) => {
    const text = String(message || "").trim();
    if (!text || busy) return;
    const next = [...turns, { role: "user", text }];
    setTurns(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Please sign in again.");
      const response = await fetch("/api/discoveryCompanion", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ mode: "chat", module: pathname, prompt_context: "Current program location: " + pageName(pathname), messages: next }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "The companion couldn't respond.");
      setTurns([...next, { role: "model", text: data.reply }]);
    } catch (e) {
      setError(e.message || "The companion isn't available.");
    } finally { setBusy(false); }
  };

  return <aside className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-50 sm:bottom-6 sm:right-6" aria-label="Discovery Companion">
    {!open ? <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg">Discovery Companion</button> :
      <section className="flex h-[min(70vh,560px)] w-[min(calc(100vw-1.5rem),390px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" aria-label="Discovery Companion conversation">
        <header className="flex items-center justify-between border-b p-3">
          <div><p className="font-semibold">Discovery Companion</p><p className="text-xs text-muted-foreground">AI facilitator · {pageName(pathname)}</p></div>
          <button type="button" onClick={() => setOpen(false)} className="rounded px-3 py-2 text-sm underline" aria-label="Minimize Discovery Companion">Minimize</button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
          <p><strong>Companion:</strong> {welcome}</p>
          {turns.map((t, i) => <p key={i} className="leading-relaxed"><strong>{t.role === "user" ? "You" : "Companion"}:</strong> {t.text}</p>)}
          {busy && <p role="status">Thinking…</p>}
          {error && <p role="alert" className="text-destructive">{error}</p>}
        </div>
        <div className="border-t p-3">
          {turns.length === 0 && <div className="mb-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => send("Can you show me around Entrepalooza?")} className="rounded-full border px-3 py-1.5 text-xs">Show me around</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border px-3 py-1.5 text-xs">I'll explore on my own</button>
          </div>}
          <form onSubmit={e => { e.preventDefault(); send(draft); }} className="flex gap-2">
            <label className="sr-only" htmlFor="global-companion-reply">Message the companion</label>
            <input id="global-companion-reply" className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Ask or share anything…" maxLength={4000} value={draft} onChange={e => setDraft(e.target.value)} />
            <Button type="submit" disabled={busy || !draft.trim()}>Send</Button>
          </form>
          <div className="mt-2 flex justify-between gap-3 text-xs">
            <button type="button" className="underline" onClick={() => { setTurns([]); setError(""); }}>Clear chat</button>
            <button type="button" className="underline" onClick={() => { const next = !disabled; setDisabled(next); localStorage.setItem("entrepalooza_companion_auto", next ? "off" : "on"); }}>{disabled ? "Enable welcome" : "Don't open automatically"}</button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Messages are sent to Gemini only when you submit. This chat isn't saved to your account.</p>
        </div>
      </section>}
  </aside>;
}
