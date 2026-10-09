import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useJournalEntries } from "@/lib/journal";
import { REFLECTION_AGENT, STARTER_PROMPTS, entryBlock, newConversationName } from "@/lib/reflection";
import DashedMotif from "@/components/workbook/DashedMotif";
import PrivacyNote from "@/components/workbook/PrivacyNote";
import BoundariesNote from "@/components/reflection/BoundariesNote";
import Composer from "@/components/reflection/Composer";
import ConversationPicker from "@/components/reflection/ConversationPicker";
import EntryPicker from "@/components/reflection/EntryPicker";
import MessageBubble from "@/components/reflection/MessageBubble";
import StarterPrompts from "@/components/reflection/StarterPrompts";

export default function JournalReflection() {
  const entries = useJournalEntries();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
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
      .finally(() => {
        if (active) setLoadingList(false);
      });
    return () => {
      active = false;
    };
  }, []);

  /** Opening a conversation subscribes first, so streamed replies arrive, then loads what is there. */
  useEffect(() => {
    if (!activeId) return;
    attach(activeId);
    base44.agents.getConversation(activeId).then((conversation) => {
      if (conversation) setMessages(conversation.messages || []);
    });
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
    if (!body || sending) return;
    setSending(true);
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
    } finally {
      setSending(false);
    }
  };

  const bringEntries = async () => {
    const chosen = entries.filter((entry) => selectedIds.includes(entry.id));
    if (!chosen.length) return;
    await send(`Here are the entries I choose to bring in.\n\n${entryBlock(chosen)}\n\nPlease reflect on these.`);
    setSelectedIds([]);
  };

  const toggleEntry = (entryId) =>
    setSelectedIds((current) => (current.includes(entryId) ? current.filter((id) => id !== entryId) : [...current, entryId]));

  const visible = messages.filter((message) => message.role !== "system");

  return (
    <div className="space-y-9">
      <header className="border-b border-natural pb-7">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div className="min-w-0">
            <p className="workbook-label">Conversation Journal Reflection</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Think it through, one entry at a time</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              A reflection partner for the entries you choose to share. It has no access to your journal and none to anyone
              else's — it works with what you bring into the conversation, and nothing more.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <PrivacyNote>
            Your journal stays in this browser. Only the entries you bring in below are sent into this conversation, so the
            agent can read them.
          </PrivacyNote>
        </div>
        {conversations.length ? (
          <div className="mt-6">
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
          <EntryPicker
            entries={entries}
            selectedIds={selectedIds}
            onToggle={toggleEntry}
            onBring={bringEntries}
            busy={sending}
          />
          <StarterPrompts prompts={STARTER_PROMPTS} onPick={setDraft} />
          <BoundariesNote />
        </section>

        <section className="min-w-0 lg:order-1">
          <div
            ref={threadRef}
            className="max-h-[60vh] space-y-4 overflow-y-auto rounded-lg border border-natural bg-white/60 p-4 sm:p-5"
          >
            {visible.length === 0 ? (
              <p className="px-4 py-12 text-center text-[14px] leading-relaxed text-ink-faint">
                {loadingList
                  ? "Opening your conversations…"
                  : "Nothing here yet. Bring an entry in, or write below to start."}
              </p>
            ) : (
              visible.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
          </div>
          <Composer value={draft} onChange={setDraft} onSend={() => send()} busy={sending} />
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
            Reflection is not therapy or treatment, and this agent does not diagnose or assess anyone. Your entries are
            still yours: nothing here is saved back into your journal.
          </p>
        </section>
      </div>
    </div>
  );
}