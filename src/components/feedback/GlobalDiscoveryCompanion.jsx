import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase, USE_SUPABASE } from "@/api/supabaseCompat";
import { Button } from "@/components/ui/button";
import { useWorkbookGate } from "@/components/WorkbookGate";

const TOUR = [
{title:"Workbook modules",path:"/#workbook",detail:"Explore activities at your own pace. Modules 1–5 are open."},
{title:"Journal",path:"/journal",detail:"Your notes and reflections."},
{title:"Life Map",path:"/map",detail:"An optional way to notice connections."},
{title:"Discovery Record",path:"/record",detail:"Discoveries you choose to keep."},
{title:"Resources",path:"/program-library",detail:"Explore program materials."}
];
const SECTION_INTROS = {
  "/": "This is your program home. The workbook modules are here. You can explore activities at your own pace, revisit them, and choose what to try next. There is no required order or deadline.",
  "/journal": "This is your Journal. It's a private space to write down thoughts or observations as you go. You can use it however you like; nothing needs to become a formal discovery.",
  "/map": "This is your Life Map. It's an optional way to see connections among experiences, interests, and possibilities. It isn't a test or a fixed picture of who you are.",
  "/record": "Welcome to your Discovery Record. Workbook answers stay in the steps where you wrote them. This page is different: it holds only the discoveries you choose to carry forward. You can add one here or save one from Discovery on your dashboard, revisit it, change it, or try something related. Nothing is added automatically. Since you're looking around, you don't need to fill anything out. Ask me about any part of this page, or we can keep exploring.",
  "/program-library": "This is the Program Library, where you can browse supporting materials and resources. You can explore them when they are useful; you don't have to read everything before moving on."
};
const wantsTour = text => /show me around|give me a tour|tour of|where (do|should|can) i start|completely new|new here|how (do|does) (i|this) (start|work)/i.test(text);
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
  const gate = useWorkbookGate();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(() => localStorage.getItem("entrepalooza_companion_auto") === "off");
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (!isAuthenticated || !user?.id || gate.pending || !gate.finished) { setOpen(false); setTurns([]); setShowTour(false); return; }
    const key = "entrepalooza_companion_welcomed_" + user.id;
    if (!disabled && !sessionStorage.getItem(key)) {
      setOpen(true);
      sessionStorage.setItem(key, "yes");
    }

  }, [isAuthenticated, user?.id, disabled, gate.pending, gate.finished]);
  if (!USE_SUPABASE || !isAuthenticated || gate.pending || !gate.finished || pathname.startsWith("/preview") || pathname.startsWith("/getting-started")) return null;

  const visitSection = (item) => {
    setShowTour(true);
    setOpen(true);
    setTurns(prev => [...prev, { role: "model", text: SECTION_INTROS[item.path === "/#workbook" ? "/" : item.path] || "We’re here. Ask me about what you see, or we can continue the tour." }]);
  };

  const send = async (message) => {
    const text = String(message || "").trim();
    if (!text || busy) return;
    if (wantsTour(text)) setShowTour(true);
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
        body: JSON.stringify({ mode: "chat", module: pathname, prompt_context: "Current program location: " + pageName(pathname) + ". Getting Started is onboarding before the program, not part of this tour. Do not send participants back there. Program navigation: " + TOUR.map(t => t.title + " at " + t.path + ": " + t.detail).join("; ") + ". When asked for a tour, give a real spoken walkthrough: explain what Entrepalooza is, describe workbook modules, Journal, Life Map, Discovery Record, and Resources, and how they fit together. Explain before asking any question. Do not just list destinations, do not divert to personal reflection, and do not pretend to navigate. Links are optional supplements.", messages: next }),
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
          {showTour && <details className="rounded-lg border p-3 text-xs"><summary className="cursor-pointer font-semibold">Open a program section (optional)</summary><nav aria-label="Program links" className="mt-2 space-y-2">{TOUR.map(item => <Link key={item.path} to={item.path} onClick={() => visitSection(item)} className="block rounded border p-2 hover:bg-secondary"><strong className="block">{item.title}</strong><span className="block text-muted-foreground">{item.detail}</span></Link>)}</nav></details>}
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
            <button type="button" className="underline" onClick={() => { setTurns([]); setShowTour(false); setError(""); }}>Clear chat</button>
            <button type="button" className="underline" onClick={() => { const next = !disabled; setDisabled(next); localStorage.setItem("entrepalooza_companion_auto", next ? "off" : "on"); }}>{disabled ? "Enable welcome" : "Don't open automatically"}</button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Messages are sent to Gemini only when you submit. This chat isn't saved to your account.</p>
        </div>
      </section>}
  </aside>;
}
