import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useJournalEntries } from "@/lib/journal";
import { REFLECTION_AGENT, STARTER_PROMPTS, entryBlock, newConversationName } from "@/lib/reflection";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import BoundariesNote from "@/components/reflection/BoundariesNote";
import Composer from "@/components/reflection/Composer";
import ConversationPicker from "@/components/reflection/ConversationPicker";
import EntryPicker from "@/components/reflection/EntryPicker";
import MessageBubble from "@/components/reflection/MessageBubble";
import StarterPrompts from "@/components/reflection/StarterPrompts";

/**
 * The conversation part of the Conversation Journal. The reflection partner sees
 * only the entries the person brings in. Entries picked on the journal page
 * arrive already ticked, and nothing is sent until the person sends it.
 */
export default function JournalReflection() {
  const entries = useJournalEntries();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [selectedIds, setSelectedIds] = useState(() =>
    String(params.get("entries") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const threadRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const attach = (conversationId) => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = base44.agents.subscribeToConversation(conversationId, (data) =>
      setMessages(data.messages || [])
    );
  };

  useEffect(() => {
    let active = true;
    base44.agents
      .listConversations({ q: { agent_name: REFLECTION_AGENT }, sort: "-created_date", limit: 20 })
      .then((list) => {
        if (active) setConversations(list || []);
      })
      .catch(() => {
        if (active) setConversations([]);
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    attach(activeId);
    base44.agents
      .getConversation(activeId)
      .then((conversation) => {
        if (conversation) setMessages(conversation.messages || []);
      })
      .catch(() => setError("That conversation didn't open. Try again in a moment."));
  }, [activeId]);

  useEffect(
    () => () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    },
    []
  );

  useEffect(() => {
    const node = threadRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  const send = async (text) => {
    const body = (text ?? draft).trim();
    if (!body || sending) return false;
    setSending(true);
    setError("");
    try {
      let conversation = conversations.find((item) => item.id === activeId);
      if (!conversation) {
        conversation = await base44.agents.createConversation({
          agent_name: REFLECTION_AGENT,
          metadata: { name: newConversationName() },
        });
        setConversations((current) => [conversation, ...current]);
        setActiveId(conversation.id);
      }
      attach(conversation.id);
      await base44.agents.addMessage(conversation, { role: "user", content: body });
      setDraft("");
      const refreshed = await base44.agents.getConversation(conversation.id);
      if (refreshed) setMessages(refreshed.messages || []);
      return true;
    } catch {
      setError("That didn't send. Nothing was lost. Try again in a moment.");
      return false;
    } finally {
      setSending(false);
    }
  };

  const bringEntries = async () => {
    const chosen = entries.filter((entry) => selectedIds.includes(entry.id));
    if (!chosen.length) return;
    const sent = await send(`Here are the entries I choose to bring in.\n\n${entryBlock(chosen)}\n\nPlease reflect on these.`);
    if (sent) setSelectedIds([]);
  };

  const toggleEntry = (entryId) =>
    setSelectedIds((current) => (current.includes(entryId) ? current.filter((id) => id !== entryId) : [...current, entryId]));

  const visible = messages.filter((message) => message.role !== "system");

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <Link to="/journal" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent-ink underline underline-offset-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to your journal
        </Link>
        <p className="workbook-label mt-4">Conversation Journal</p>
        <h1 className="mt-2">Talk it through</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          An AI reflection partner for the entries you choose. It helps you look at what you wrote from another angle:
          what happened, what you think it means, and what is still open. It doesn’t decide anything for you.
        </p>
        <div className="mt-3 max-w-[68ch]">
          <PrivacyNote>
            Your journal stays on this device. Only the entries you bring in, and the messages you write here, are sent
            to the reflection partner. These conversations are kept in your Entrepalooza account.
          </PrivacyNote>
        </div>
        {conversations.length ? (
          <div className="mt-5">
            <ConversationPicker
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={() => {
                setActiveId(null);
                setMessages([]);
              }}
            />
          </div>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section className="space-y-6 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <EntryPicker entries={entries} selectedIds={selectedIds} onToggle={toggleEntry} onBring={bringEntries} busy={sending} />
          <StarterPrompts prompts={STARTER_PROMPTS} onPick={setDraft} />
          <BoundariesNote />
        </section>

        <section className="min-w-0 lg:order-1">
          <div ref={threadRef} className="max-h-[60vh] space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-4 sm:p-5">
            {visible.length === 0 ? (
              <p className="px-4 py-12 text-center text-[16px] leading-relaxed text-muted-faint">
                {loadingList
                  ? "Opening your conversations…"
                  : selectedIds.length
                    ? "Your picked entries are ticked on the right. Bring them in when you’re ready."
                    : "Nothing here yet. Bring an entry in, or write below to start."}
              </p>
            ) : (
              visible.map((message, index) => <MessageBubble key={message.id || index} message={message} />)
            )}
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-[15px] text-destructive">
              {error}
            </p>
          ) : null}
          <Composer value={draft} onChange={setDraft} onSend={() => send()} busy={sending} />
          <p className="mt-3 text-[14px] leading-relaxed text-muted-faint">
            This is reflection, not therapy or treatment. Nothing said here is saved into your journal unless you save it
            there yourself.
          </p>
        </section>
      </div>
    </div>
  );
}
